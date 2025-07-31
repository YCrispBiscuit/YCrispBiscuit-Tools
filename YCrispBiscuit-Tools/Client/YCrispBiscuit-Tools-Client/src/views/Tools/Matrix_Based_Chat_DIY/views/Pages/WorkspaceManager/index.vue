<template>
  <div class="workspace-manager">
    <!-- 功能抽屉 -->
    <FunctionDrawer
      v-model:open="drawerOpen"
      :available-functions="availableFunctions"
      @function-click="handleFunctionClick"
    />

    <!-- 主工作区 -->
    <div class="main-workspace">
      <!-- 工作区网格布局 -->
      <WorkspaceGrid
        ref="workspaceGridRef"
        :initial-layout="validatedLayout"
        @layout-changed="handleLayoutChanged"
        @tab-detach="handleTabDetach"
      />

      <!-- 浮动窗口层 -->
      <FloatingWindow
        :windows="floatingWindows"
        @window-close="handleWindowClose"
        @window-dock="handleWindowDock"
        @window-update="handleWindowUpdate"
      />
    </div>

    <!-- 抽屉切换按钮 -->
    <button
      class="drawer-toggle"
      @click="drawerOpen = !drawerOpen"
      :class="{ active: drawerOpen }"
    >
      <span class="toggle-icon">☰</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import FunctionDrawer from './FunctionDrawer.vue'
import FloatingWindow from './FloatingWindow.vue'
import WorkspaceGrid from './WorkspaceGrid.vue'
import type { GridLayoutItem, FloatingWindow as FloatingWindowType, PanelFunction } from './types'

// 状态管理
const drawerOpen = ref(false)
const workspaceGridRef = ref<InstanceType<typeof WorkspaceGrid> | null>(null)

// 可用功能列表
const availableFunctions = ref<PanelFunction[]>([
  {
    id: 'chat',
    name: '聊天',
    icon: '💬',
    description: 'Matrix 聊天功能',
    component: 'Chat',
    category: 'communication'
  },
  
  {
    id: 'file-manager',
    name: '文件管理',
    icon: '📁',
    description: '文件管理功能',
    component: 'FileManager',
    category: 'productivity'
  },
  {
    id: 'calendar',
    name: '日历',
    icon: '📅',
    description: '日程管理',
    component: 'Calendar',
    category: 'productivity'
  },
  {
    id: 'notes',
    name: '笔记',
    icon: '📝',
    description: '笔记编辑',
    component: 'Notes',
    category: 'productivity'
  },
  
  
  
  {
    id: 'user-info',
    name: '用户信息',
    icon: '👤',
    description: '用户信息面板',
    component: 'UserInfo',
    category: 'system'
  },
  {
    id: 'notification-panel',
    name: '通知',
    icon: '🔔',
    description: '通知中心',
    component: 'NotificationPanel',
    category: 'system'
  }
])
const savedLayout = ref<GridLayoutItem[] | null>(null)
const floatingWindows = ref<FloatingWindowType[]>([])
const saveLayoutTimer = ref<number | null>(null)
const lastSavedLayoutString = ref<string>('')

// 验证并格式化布局配置
const validatedLayout = computed(() => {
  if (!savedLayout.value || !Array.isArray(savedLayout.value)) {
    return null
  }
  
  // 验证布局格式
  const isValid = savedLayout.value.every(item => 
    typeof item === 'object' &&
    typeof item.i === 'string' &&
    typeof item.x === 'number' &&
    typeof item.y === 'number' &&
    typeof item.w === 'number' &&
    typeof item.h === 'number'
  )
  
  if (isValid) {
    console.log('WorkspaceManager: 使用有效的保存布局')
    return savedLayout.value
  }
  
  console.warn('WorkspaceManager: 保存的布局格式无效，将使用默认布局')
  return null
})

// 从本地存储加载布局
const loadSavedLayout = () => {
  try {
    const saved = localStorage.getItem('matrixWorkspaceLayout')
    if (saved) {
      const parsedLayout = JSON.parse(saved)
      console.log('WorkspaceManager: 从 localStorage 加载布局:', parsedLayout)
      savedLayout.value = parsedLayout
      
      // 更新最后保存的布局字符串，防止重复保存
      lastSavedLayoutString.value = saved
    } else {
      console.log('WorkspaceManager: localStorage 中没有保存的布局')
    }
  } catch (error) {
    console.error('WorkspaceManager: 加载保存的布局失败:', error)
    savedLayout.value = null
  }
}

// 保存当前布局
const saveCurrentLayout = async () => {
  try {
    if (workspaceGridRef.value) {
      const layout = workspaceGridRef.value.getCurrentLayout()
      if (layout && Array.isArray(layout) && layout.length > 0) {
        localStorage.setItem('matrixWorkspaceLayout', JSON.stringify(layout))
        console.log('WorkspaceManager: 布局已保存到 localStorage', layout.length, '个面板')
      }
    }
  } catch (error) {
    console.error('WorkspaceManager: 保存布局失败:', error)
  }
}

// 处理功能点击
const handleFunctionClick = async (func: PanelFunction) => {
  console.log('点击功能:', func)
  if (workspaceGridRef.value) {
    await nextTick()
    workspaceGridRef.value.addPanel(func.id, func.component, func.name, {})
  }
}

// 处理选项卡分离
const handleTabDetach = (panelId: string, tabId: string) => {
  // 创建浮动窗口
  const newWindow: FloatingWindowType = {
    id: `floating-${tabId}-${Date.now()}`,
    title: tabId,
    component: tabId,
    x: 100,
    y: 100,
    width: 400,
    height: 300,
    props: {}
  }
  floatingWindows.value.push(newWindow)
}

// 处理布局变化
const handleLayoutChanged = (layout: GridLayoutItem[]) => {
  // 防止无限循环：检查布局是否真的发生了变化
  if (!layout || layout.length === 0) {
    console.log('布局为空，跳过保存')
    return
  }
  
  // 生成当前布局的字符串表示
  const currentLayoutString = JSON.stringify(layout)
  
  // 如果布局内容没有变化，跳过保存
  if (currentLayoutString === lastSavedLayoutString.value) {
    console.log('布局内容未变化，跳过保存')
    return
  }
  
  console.log('布局已更改:', layout)
  
  // 更新最后保存的布局字符串
  lastSavedLayoutString.value = currentLayoutString
  
  // 防抖保存布局，避免频繁保存
  if (saveLayoutTimer.value) {
    clearTimeout(saveLayoutTimer.value)
  }
  saveLayoutTimer.value = setTimeout(() => {
    saveCurrentLayout()
  }, 500) // 增加到500ms防抖
}

// 处理浮动窗口关闭
const handleWindowClose = (windowId: string) => {
  floatingWindows.value = floatingWindows.value.filter(w => w.id !== windowId)
}

// 处理窗口停靠
const handleWindowDock = (windowId: string) => {
  const window = floatingWindows.value.find(w => w.id === windowId)
  if (window && workspaceGridRef.value) {
    // 将浮动窗口添加到网格布局
    workspaceGridRef.value.addPanel(window.id, window.component, window.title, window.props)
    // 移除浮动窗口
    handleWindowClose(windowId)
  }
}

// 处理浮动窗口更新
const handleWindowUpdate = (updatedWindow: FloatingWindowType) => {
  const index = floatingWindows.value.findIndex(w => w.id === updatedWindow.id)
  if (index !== -1) {
    floatingWindows.value[index] = updatedWindow
  }
}

// 键盘快捷键
const handleKeyboard = (event: KeyboardEvent) => {
  // Ctrl + S: 保存布局
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    saveCurrentLayout()
  }
  
  // Ctrl + D: 切换抽屉
  if (event.ctrlKey && event.key === 'd') {
    event.preventDefault()
    drawerOpen.value = !drawerOpen.value
  }
}

// 生命周期
onMounted(() => {
  loadSavedLayout()
  
  // 监听键盘事件
  document.addEventListener('keydown', handleKeyboard)
  
  // 在页面卸载时保存布局
  window.addEventListener('beforeunload', saveCurrentLayout)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
  window.removeEventListener('beforeunload', saveCurrentLayout)
  
  // 清理定时器
  if (saveLayoutTimer.value) {
    clearTimeout(saveLayoutTimer.value)
  }
})

// 暴露方法供外部使用
defineExpose({
  saveCurrentLayout,
  loadSavedLayout
})
</script>

<style scoped>
.workspace-manager {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #1e1e1e;
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-workspace {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 抽屉切换按钮 */
.drawer-toggle {
  position: fixed;
  left: 10px;
  top: 10px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(45, 45, 45, 0.9);
  color: #e0e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.drawer-toggle:hover {
  background: rgba(55, 55, 55, 0.9);
  transform: scale(1.05);
}

.drawer-toggle.active {
  background: rgba(0, 122, 255, 0.8);
  color: #fff;
}

.toggle-icon {
  font-size: 18px;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.drawer-toggle.active .toggle-icon {
  transform: rotate(90deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .drawer-toggle {
    width: 36px;
    height: 36px;
    left: 8px;
    top: 8px;
  }
  
  .toggle-icon {
    font-size: 16px;
  }
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.workspace-manager {
  animation: slideIn 0.3s ease-out;
}

/* 滚动条样式 */
:deep(.workspace-manager *::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.workspace-manager *::-webkit-scrollbar-track) {
  background: rgba(45, 45, 45, 0.3);
  border-radius: 4px;
}

:deep(.workspace-manager *::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: background 0.2s ease;
}

:deep(.workspace-manager *::-webkit-scrollbar-thumb:hover) {
  background: rgba(255, 255, 255, 0.3);
}
</style>
