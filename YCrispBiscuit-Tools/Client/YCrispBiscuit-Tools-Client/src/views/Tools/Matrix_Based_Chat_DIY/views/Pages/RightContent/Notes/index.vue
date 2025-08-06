<template>
  <div class="notes-panel">
    <div class="notes-header">
      <h3>笔记</h3>
      <div class="notes-actions">
        <button @click="createNewNote" class="new-note-btn">新建笔记</button>
        <button @click="toggleSearch" class="search-btn">🔍</button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div v-if="showSearch" class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索笔记..."
        @input="performSearch"
      >
      <button @click="clearSearch" class="clear-search-btn">✕</button>
    </div>

    <!-- 笔记分类 -->
    <div class="notes-categories">
      <button 
        v-for="category in categories" 
        :key="category.value"
        :class="{ active: selectedCategory === category.value }"
        @click="selectedCategory = category.value"
      >
        {{ category.label }}
        <span class="count">{{ category.count }}</span>
      </button>
    </div>

    <div class="notes-content">
      <!-- 笔记列表 -->
      <div class="notes-list" :class="{ collapsed: selectedNote }">
        <div v-if="filteredNotes.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">
            {{ searchQuery ? '没有找到匹配的笔记' : '暂无笔记' }}
          </div>
        </div>
        
        <div 
          v-for="note in filteredNotes" 
          :key="note.id"
          :class="['note-item', { active: selectedNote?.id === note.id }]"
          @click="selectNote(note)"
        >
          <div class="note-title">{{ note.title || '无标题' }}</div>
          <div class="note-preview">{{ getPreview(note.content) }}</div>
          <div class="note-meta">
            <span class="note-category" :class="`category-${note.category}`">
              {{ getCategoryLabel(note.category) }}
            </span>
            <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 笔记编辑器 -->
      <div v-if="selectedNote" class="note-editor">
        <div class="editor-header">
          <input 
            type="text" 
            v-model="selectedNote.title" 
            placeholder="笔记标题..."
            class="note-title-input"
            @input="saveNote"
          >
          <div class="editor-actions">
            <select v-model="selectedNote.category" @change="saveNote">
              <option value="personal">个人</option>
              <option value="work">工作</option>
              <option value="study">学习</option>
              <option value="project">项目</option>
            </select>
            <button @click="deleteCurrentNote" class="delete-btn">删除</button>
            <button @click="closeEditor" class="close-btn">✕</button>
          </div>
        </div>

        <div class="editor-toolbar">
          <button @click="insertText('**粗体**')" title="粗体">B</button>
          <button @click="insertText('*斜体*')" title="斜体">I</button>
          <button @click="insertText('~~删除线~~')" title="删除线">S</button>
          <button @click="insertText('`代码`')" title="代码">Code</button>
          <button @click="insertText('# ')" title="标题">H1</button>
          <button @click="insertText('## ')" title="二级标题">H2</button>
          <button @click="insertText('- ')" title="无序列表">•</button>
          <button @click="insertText('1. ')" title="有序列表">1.</button>
          <button @click="insertText('[链接](url)')" title="链接">🔗</button>
        </div>

        <div class="editor-content">
          <textarea 
            ref="editor"
            v-model="selectedNote.content" 
            placeholder="开始写笔记..."
            @input="saveNote"
            @keydown="handleKeydown"
          ></textarea>
          
          <div class="preview-panel" v-if="showPreview">
            <div class="preview-content" v-html="renderMarkdown(selectedNote.content)"></div>
          </div>
        </div>

        <div class="editor-footer">
          <div class="editor-stats">
            字数: {{ selectedNote.content.length }} | 
            更新: {{ formatDate(selectedNote.updatedAt) }}
          </div>
          <div class="editor-controls">
            <button @click="togglePreview" class="preview-btn">
              {{ showPreview ? '隐藏预览' : '显示预览' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, inject } from 'vue'

interface Note {
  id: string
  title: string
  content: string
  category: 'personal' | 'work' | 'study' | 'project'
  createdAt: number
  updatedAt: number
  tags: string[]
}

const chatContext = inject('chatContext') as any

const notes = ref<Note[]>([])
const selectedNote = ref<Note | null>(null)
const searchQuery = ref('')
const showSearch = ref(false)
const selectedCategory = ref<string>('all')
const showPreview = ref(false)
const editor = ref<HTMLTextAreaElement>()

const categories = computed(() => [
  {
    label: '全部',
    value: 'all',
    count: notes.value.length
  },
  {
    label: '个人',
    value: 'personal',
    count: notes.value.filter(n => n.category === 'personal').length
  },
  {
    label: '工作',
    value: 'work',
    count: notes.value.filter(n => n.category === 'work').length
  },
  {
    label: '学习',
    value: 'study',
    count: notes.value.filter(n => n.category === 'study').length
  },
  {
    label: '项目',
    value: 'project',
    count: notes.value.filter(n => n.category === 'project').length
  }
])

const filteredNotes = computed(() => {
  let filtered = notes.value

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(note => note.category === selectedCategory.value)
  }

  // 按搜索词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 按更新时间排序
  return filtered.sort((a, b) => b.updatedAt - a.updatedAt)
})

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labels = {
    personal: '个人',
    work: '工作',
    study: '学习',
    project: '项目'
  }
  return labels[category as keyof typeof labels] || category
}

// 获取笔记预览
const getPreview = (content: string) => {
  return content.replace(/[#*`~\[\]()]/g, '').substring(0, 100) + (content.length > 100 ? '...' : '')
}

// 格式化日期
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp

  if (diff < 60 * 1000) {
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 创建新笔记
const createNewNote = () => {
  const newNote: Note = {
    id: Date.now().toString(),
    title: '',
    content: '',
    category: 'personal',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: []
  }
  
  notes.value.unshift(newNote)
  selectedNote.value = newNote
  saveNotesToStorage()
  
  nextTick(() => {
    editor.value?.focus()
  })
}

// 选择笔记
const selectNote = (note: Note) => {
  selectedNote.value = note
}

// 保存笔记
const saveNote = () => {
  if (selectedNote.value) {
    selectedNote.value.updatedAt = Date.now()
    saveNotesToStorage()
  }
}

// 删除当前笔记
const deleteCurrentNote = () => {
  if (selectedNote.value && confirm('确定要删除这条笔记吗？')) {
    const index = notes.value.findIndex(n => n.id === selectedNote.value!.id)
    if (index > -1) {
      notes.value.splice(index, 1)
      selectedNote.value = null
      saveNotesToStorage()
    }
  }
}

// 关闭编辑器
const closeEditor = () => {
  selectedNote.value = null
}

// 切换搜索
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    clearSearch()
  }
}

// 执行搜索
const performSearch = () => {
  // 搜索逻辑在 computed 中处理
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
}

// 切换预览
const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// 插入文本
const insertText = (text: string) => {
  if (editor.value && selectedNote.value) {
    const start = editor.value.selectionStart
    const end = editor.value.selectionEnd
    const content = selectedNote.value.content
    
    selectedNote.value.content = content.substring(0, start) + text + content.substring(end)
    saveNote()
    
    nextTick(() => {
      editor.value!.focus()
      editor.value!.setSelectionRange(start + text.length, start + text.length)
    })
  }
}

// 处理键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 's':
        event.preventDefault()
        saveNote()
        break
      case 'n':
        event.preventDefault()
        createNewNote()
        break
      case 'f':
        event.preventDefault()
        toggleSearch()
        break
    }
  }
  
  // Tab 键插入缩进
  if (event.key === 'Tab') {
    event.preventDefault()
    insertText('  ')
  }
}

// 渲染 Markdown（简单实现）
const renderMarkdown = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
}

// 保存到本地存储
const saveNotesToStorage = () => {
  localStorage.setItem('notes', JSON.stringify(notes.value))
}

// 从本地存储加载
const loadNotesFromStorage = () => {
  const savedNotes = localStorage.getItem('notes')
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes)
  }
}

// 初始化
onMounted(() => {
  loadNotesFromStorage()
  
  // 如果没有笔记，创建示例笔记
  if (notes.value.length === 0) {
    notes.value = [
      {
        id: '1',
        title: '欢迎使用笔记',
        content: `# 欢迎使用笔记功能

这是一个功能丰富的笔记应用，支持：

- **Markdown** 语法
- 分类管理
- 搜索功能
- 实时保存

## 快捷键

- Ctrl+S: 保存
- Ctrl+N: 新建笔记
- Ctrl+F: 搜索
- Tab: 插入缩进

开始记录你的想法吧！`,
        category: 'personal',
        createdAt: Date.now() - 60 * 60 * 1000,
        updatedAt: Date.now() - 60 * 60 * 1000,
        tags: ['欢迎', '教程']
      }
    ]
    saveNotesToStorage()
  }
})

// 暴露方法给父组件
defineExpose({
  createNote: (content?: string, title?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: title || '',
      content: content || '',
      category: 'personal',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: []
    }
    
    notes.value.unshift(newNote)
    selectedNote.value = newNote
    saveNotesToStorage()
    return newNote
  },
  searchNotes: (query: string) => {
    searchQuery.value = query
    showSearch.value = true
  }
})
</script>

<style scoped>
.notes-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color);
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-color-secondary);
  border-bottom: 1px solid var(--border-color);
}

.notes-header h3 {
  margin: 0;
  color: var(--text-color);
}

.notes-actions {
  display: flex;
  gap: 8px;
}

.new-note-btn, .search-btn {
  padding: 8px 12px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--color-primary);
  cursor: pointer;
}

.new-note-btn {
  background: var(--color-primary);
  color: var(--text-color);
}

.search-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #ddd;
}

.search-bar input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.clear-search-btn {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.notes-categories {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: var(--bg-color-secondary); 
  border-bottom: 1px solid var(--border-color); 
  overflow-x: auto;
}

.notes-categories button {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--bg-color-secondary);
  cursor: pointer;
  white-space: nowrap;
  color: var(--text-color-secondary);
}

.notes-categories button.active {
  background: var(--color-primary);
  color: var(--text-color);
  border-color: var(--color-primary);
}

.count {
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.notes-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.notes-list {
  width: 300px;
  border-right: 1px solid var(--border-color); 
  overflow-y: auto;
  background: var(--bg-color-secondary);
  transition: width 0.3s ease;
}

.notes-list.collapsed {
  width: 250px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.note-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s ease;
}

.note-item:hover {
 background: var(--bg-color);
}

.note-item.active {
  background: var(--color-primary-bg);
  border-left: 4px solid var(--color-primary);
}

.note-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-preview {
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.note-category {
  padding: 2px 6px;
  border-radius: 10px;
  color: white;
}

.category-personal {
  background: var(--color-secondary);
}

.category-work {
  background: var(--color-primary);
}

.category-study {
  background: var(--color-success);
}

.category-project {
  background: var(--color-warning);
  color: var(--text-color);
}

.note-date {
  color: var(--text-color-tertiary);
}

.note-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-header {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
  align-items: center;
}

.note-title-input {
  flex: 1;
  padding: 8px;
 border: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
  color: var(--text-color);
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
}

.editor-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.editor-actions select {
  padding: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
  color: var(--text-color);
  border-radius: 4px;
}

.delete-btn, .close-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-error);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--color-error);
  cursor: pointer;
}

.close-btn {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.editor-toolbar button {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color-secondary);
  color: var(--text-color);
  cursor: pointer;
  font-weight: bold;
  white-space: nowrap;
}

.editor-toolbar button:hover {
  background: var(--bg-color-hover);
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-content textarea {
  width: 100%;
  border: none;
  outline: none;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;

  background: var(--bg-color-secondary);
  color: var(--text-color);
}

.preview-panel {
  width: 50%;
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
}

.preview-content {
  padding: 16px;
  line-height: 1.6;
  background: var(--bg-color-secondary);
  color: var(--text-color);
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.preview-content code {
  background: var(--bg-color);
  color: var(--text-color);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.preview-content a {
  color: var(--color-primary);
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
}

.editor-stats {
  color: var(--text-color-secondary);
}

.preview-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
 background: var(--bg-color-secondary);
  color: var(--text-color);
  cursor: pointer;
  font-size: 12px;
}
</style>
