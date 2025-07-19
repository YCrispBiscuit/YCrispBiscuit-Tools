<template>
    <div class="agent-json-container">
        <!-- 顶部工具栏 -->
        <div class="json-toolbar">
            <div class="toolbar-left">
                <h3 class="json-title">JSON 源码编辑器</h3>
                <span class="json-subtitle">直接编辑团队配置的JSON数据</span>
            </div>
            <div class="toolbar-right">
                <button class="export-btn" @click="exportJson" title="导出JSON文件">
                    💾 导出
                </button>
            </div>
        </div>

        <!-- JSON编辑区域 -->
        <div class="json-editor-container">
            <div class="json-panel">
                <!-- 状态指示器 -->
                <div class="json-status" :class="statusClass">
                    <span class="status-icon">{{ statusIcon }}</span>
                    <span class="status-text">{{ statusText }}</span>
                    <span v-if="jsonError" class="error-details">{{ jsonError }}</span>
                </div>

                <!-- JSON文本编辑器 -->
                <textarea 
                    v-model="jsonText" 
                    @input="onJsonInput" 
                    @keydown="onKeyDown"
                    @click="updateCursorPositionFromEvent"
                    @keyup="updateCursorPositionFromEvent"
                    @select="updateCursorPositionFromEvent"
                    spellcheck="false"
                    class="json-textarea"
                    placeholder="在此输入或粘贴JSON配置..."
                    :class="{ 'has-error': hasError }"
                />

                <!-- 底部工具区 -->
                <div class="json-footer">
                    <div class="editor-info">
                        <span class="char-count">字符数: {{ characterCount }}</span>
                        <span class="line-count">行数: {{ lineCount }}</span>
                        <span class="cursor-position">位置: {{ cursorPosition }}</span>
                    </div>
                    <div class="editor-actions">
                        <!-- 移除所有操作按钮，只保留导出功能 -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue'

// 注入父组件传递的数据
const teamData = inject<any>('teamData')
const recordChange = inject<any>('recordChange')

// JSON编辑器状态
const jsonText = ref('')
const hasError = ref(false)
const jsonError = ref('')
const cursorPosition = ref('1:1')

// 编辑器统计信息
const characterCount = computed(() => jsonText.value.length)
const lineCount = computed(() => jsonText.value.split('\n').length)

// 状态指示器
const statusClass = computed(() => {
    if (hasError.value) return 'status-error'
    if (jsonText.value.trim() === '') return 'status-empty'
    return 'status-valid'
})

const statusIcon = computed(() => {
    if (hasError.value) return '❌'
    if (jsonText.value.trim() === '') return '📝'
    return '✅'
})

const statusText = computed(() => {
    if (hasError.value) return 'JSON语法错误'
    if (jsonText.value.trim() === '') return '请输入JSON内容'
    return 'JSON格式正确'
})

// 初始化JSON内容
function initializeJson() {
    if (teamData?.value) {
        try {
            jsonText.value = JSON.stringify(teamData.value, null, 2)
        } catch (error) {
            console.error('初始化JSON失败:', error)
            jsonText.value = '{\n  "config": {\n    "participants": [],\n    "termination_condition": null\n  }\n}'
        }
    } else {
        // 默认空结构
        jsonText.value = '{\n  "config": {\n    "participants": [],\n    "termination_condition": null\n  }\n}'
    }
}

// 监听teamData变化，同步到JSON编辑器
watch(() => teamData?.value, (newData) => {
    if (newData && !hasError.value) {
        try {
            const currentJson = JSON.stringify(newData, null, 2)
            if (currentJson !== jsonText.value) {
                jsonText.value = currentJson
            }
        } catch (error) {
            console.error('同步teamData到JSON失败:', error)
        }
    }
}, { deep: true })

// JSON输入处理
function onJsonInput() {
    validateJsonSyntax()
    
    // 如果JSON有效，同步到teamData
    if (!hasError.value && jsonText.value.trim()) {
        try {
            const parsedData = JSON.parse(jsonText.value)
            if (teamData?.value) {
                Object.assign(teamData.value, parsedData)
                
                // 记录变化
                if (recordChange) {
                    recordChange('json_edit', parsedData, 'json_manual_edit')
                }
            }
        } catch (error) {
            // 解析失败时不更新teamData
        }
    }
}

// 验证JSON语法
function validateJsonSyntax() {
    hasError.value = false
    jsonError.value = ''
    
    if (!jsonText.value.trim()) {
        return true // 空内容视为有效
    }
    
    try {
        JSON.parse(jsonText.value)
        return true
    } catch (error: any) {
        hasError.value = true
        jsonError.value = error.message
        return false
    }
}

// 格式化JSON
function formatJson() {
    try {
        const parsed = JSON.parse(jsonText.value)
        jsonText.value = JSON.stringify(parsed, null, 2)
        hasError.value = false
        jsonError.value = ''
    } catch (error: any) {
        hasError.value = true
        jsonError.value = '无法格式化: ' + error.message
    }
}

// 导出JSON文件
function exportJson() {
    try {
        // 验证JSON格式
        const parsed = JSON.parse(jsonText.value)
        
        const blob = new Blob([JSON.stringify(parsed, null, 2)], { 
            type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'agent-team-config.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    } catch (error: any) {
        alert('导出失败: JSON格式错误 - ' + error.message)
    }
}

// 键盘事件处理
function onKeyDown(event: KeyboardEvent) {
    // Ctrl+S 保存/格式化
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        formatJson()
    }
    
    // Tab键缩进
    if (event.key === 'Tab') {
        event.preventDefault()
        const textarea = event.target as HTMLTextAreaElement
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        
        if (event.shiftKey) {
            // Shift+Tab 减少缩进
            const lineStart = jsonText.value.lastIndexOf('\n', start - 1) + 1
            const line = jsonText.value.slice(lineStart, end)
            if (line.startsWith('  ')) {
                jsonText.value = jsonText.value.slice(0, lineStart) + 
                               line.slice(2) + 
                               jsonText.value.slice(end)
                textarea.setSelectionRange(start - 2, end - 2)
            }
        } else {
            // Tab 增加缩进
            jsonText.value = jsonText.value.slice(0, start) + 
                           '  ' + 
                           jsonText.value.slice(end)
            textarea.setSelectionRange(start + 2, end + 2)
        }
    }
    
    // 更新光标位置
    updateCursorPosition(event.target as HTMLTextAreaElement)
}

// 更新光标位置显示
function updateCursorPosition(textarea: HTMLTextAreaElement) {
    const text = textarea.value
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = text.slice(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    const line = lines.length
    const column = lines[lines.length - 1].length + 1
    cursorPosition.value = `${line}:${column}`
}

// 从事件更新光标位置
function updateCursorPositionFromEvent(event: Event) {
    const textarea = event.target as HTMLTextAreaElement
    updateCursorPosition(textarea)
}

// 组件挂载时初始化
onMounted(() => {
    initializeJson()
})
</script>

<style scoped>
.agent-json-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f5f5f5;
}

/* 顶部工具栏 */
.json-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.json-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.json-subtitle {
    font-size: 13px;
    color: #666;
}

.toolbar-right {
    display: flex;
    gap: 12px;
}

.format-btn,
.export-btn {
    padding: 8px 16px;
    background: #409eff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.format-btn:hover,
.export-btn:hover {
    background: #66b1ff;
}

.export-btn {
    background: #e6a23c;
}

.export-btn:hover {
    background: #ebb563;
}

/* JSON编辑区域 */
.json-editor-container {
    flex: 1;
    padding: 20px;
    overflow: hidden;
    max-height: 80vh; /* 限制最大高度为75%视口高度 */
}

.json-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: calc(80vh - 40px); /* 减去padding */
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* 状态指示器 */
.json-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
    font-weight: 500;
}

.status-valid {
    background: #f0f9ff;
    color: #16a34a;
}

.status-error {
    background: #fef2f2;
    color: #dc2626;
}

.status-empty {
    background: #fafafa;
    color: #666;
}

.status-icon {
    font-size: 16px;
}

.error-details {
    font-size: 12px;
    font-weight: normal;
    opacity: 0.8;
    margin-left: 8px;
}

/* JSON文本编辑器 */
.json-textarea {
    flex: 1;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: 20px;
    font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    background: #fafafa;
    tab-size: 2;
    white-space: pre;
    overflow-wrap: normal;
    overflow-x: auto;
    transition: background 0.2s;
}

.json-textarea:focus {
    background: #fff;
}

.json-textarea.has-error {
    background: #fef7f7;
}

.json-textarea::placeholder {
    color: #999;
    font-style: italic;
}

/* 底部工具区 */
.json-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f8f9fa;
    border-top: 1px solid #e0e0e0;
    font-size: 12px;
    color: #666;
}

.editor-info {
    display: flex;
    gap: 16px;
}

.editor-actions {
    display: flex;
    gap: 8px;
}

.clear-btn,
.reset-btn {
    padding: 4px 12px;
    background: #f5f5f5;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
}

.clear-btn:hover {
    background: #fee;
    color: #e74c3c;
    border-color: #e74c3c;
}

.reset-btn:hover {
    background: #e6f7ff;
    color: #409eff;
    border-color: #409eff;
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .json-editor-container {
        padding: 16px;
        max-height: 80vh;
    }
    
    .json-panel {
        max-height: calc(80vh - 32px);
    }
}

@media (max-width: 768px) {
    .json-toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        padding: 12px 16px;
    }

    .toolbar-left {
        text-align: center;
    }

    .toolbar-right {
        justify-content: center;
    }

    .format-btn,
    .export-btn {
        flex: 1;
        padding: 10px;
        font-size: 13px;
    }

    .json-editor-container {
        padding: 12px;
        max-height: 75vh;
    }

    .json-panel {
        max-height: calc(75vh - 24px);
    }

    .json-textarea {
        padding: 16px;
        font-size: 13px;
        line-height: 1.5;
    }

    .json-footer {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
        padding: 10px 12px;
    }

    .editor-info {
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
    }

    .editor-actions {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .agent-json-container {
        height: 100vh;
        overflow: hidden;
    }

    .json-toolbar {
        padding: 10px 12px;
        gap: 8px;
    }

    .json-title {
        font-size: 16px;
    }

    .json-subtitle {
        font-size: 12px;
    }

    .export-btn {
        padding: 8px 12px;
        font-size: 12px;
    }

    .json-editor-container {
        padding: 8px;
        max-height: 70vh;
    }

    .json-panel {
        max-height: calc(70vh - 16px);
    }

    .json-status {
        padding: 8px 12px;
        font-size: 12px;
        flex-wrap: wrap;
        gap: 4px;
    }

    .error-details {
        width: 100%;
        margin-left: 0;
        margin-top: 4px;
    }

    .json-textarea {
        padding: 12px;
        font-size: 12px;
        line-height: 1.4;
    }

    .json-footer {
        padding: 8px 10px;
        font-size: 11px;
    }

    .editor-info {
        gap: 8px;
        font-size: 11px;
    }
}

/* 滚动条样式 */
.json-textarea::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.json-textarea::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.json-textarea::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.json-textarea::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
