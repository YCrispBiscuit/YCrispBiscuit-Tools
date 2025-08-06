<template>
  <div class="floating-windows-container">
    <div
      v-for="window in windows"
      :key="window.id"
      :class="['floating-window', { minimized: window.minimized, maximized: window.maximized }]"
      :style="windowStyle(window)"
      @mousedown="bringToFront(window.id)"
    >
    <!-- 窗口标题栏 -->
    <div
      class="window-header"
      @mousedown="startDrag(window.id, $event)"
    >
      <span class="window-title">{{ window.title }}</span>
      <div class="window-controls">
        <button
          class="control-btn minimize"
          @click="toggleMinimize(window.id)"
          title="最小化"
        >
          −
        </button>
        <button
          class="control-btn maximize"
          @click="toggleMaximize(window.id)"
          title="最大化"
        >
          □
        </button>
        <button
          class="control-btn close"
          @click="closeWindow(window.id)"
          title="关闭"
        >
          ×
        </button>
      </div>
    </div>

    <!-- 窗口内容 -->
    <div v-if="!window.minimized" class="window-content">
      <component
        :is="getComponent(window.component)"
        v-bind="window.props"
      />
    </div>

    <!-- 调整大小手柄 -->
    <div
      v-if="!window.minimized && !window.maximized"
      class="resize-handle"
      @mousedown="startResize(window.id, $event)"
    ></div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import type { FloatingWindow } from './types'

interface Props {
  windows: FloatingWindow[]
}

interface Emits {
  (e: 'window-close', windowId: string): void
  (e: 'window-dock', windowId: string): void
  (e: 'window-update', window: FloatingWindow): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 拖拽状态
const dragState = ref<{
  isDragging: boolean
  windowId: string | null
  startX: number
  startY: number
  startWindowX: number
  startWindowY: number
}>({
  isDragging: false,
  windowId: null,
  startX: 0,
  startY: 0,
  startWindowX: 0,
  startWindowY: 0
})

// 调整大小状态
const resizeState = ref<{
  isResizing: boolean
  windowId: string | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}>({
  isResizing: false,
  windowId: null,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0
})

// z-index 管理
const maxZIndex = ref(1000)

// 计算窗口样式
const windowStyle = (window: FloatingWindow) => {
  if (window.maximized) {
    return {
      left: '0px',
      top: '0px',
      width: '100vw',
      height: '100vh',
      zIndex: window.zIndex || 1000
    }
  }

  return {
    left: window.x + 'px',
    top: window.y + 'px',
    width: window.width + 'px',
    height: window.height + 'px',
    zIndex: window.zIndex || 1000
  }
}

// 动态加载组件
const getComponent = (componentName: string) => {
  return defineAsyncComponent(() => {
    switch (componentName) {
      case 'Chat':
        return import('../RightContent/Chat/index.vue') as any
      case 'UserInfo':
        return import('../RightContent/UserInfo/index.vue') as any
      case 'FileManager':
        return import('../RightContent/FileManager/index.vue') as any
      case 'NotificationPanel':
        return import('../RightContent/NotificationPanel/index.vue') as any
      case 'Calendar':
        return import('../RightContent/Calendar/index.vue') as any
      case 'Notes':
        return import('../RightContent/Notes/index.vue') as any
      default:
        return Promise.resolve({
          name: 'UnknownComponent',
          template: `<div class="unknown-component">未知组件: ${componentName}</div>`
        }) as any
    }
  })
}

// 置于顶层
const bringToFront = (windowId: string) => {
  const window = props.windows.find(w => w.id === windowId)
  if (window) {
    maxZIndex.value += 1
    const updatedWindow = { ...window, zIndex: maxZIndex.value }
    emit('window-update', updatedWindow)
  }
}

// 开始拖拽
const startDrag = (windowId: string, event: MouseEvent) => {
  const window = props.windows.find(w => w.id === windowId)
  if (!window || window.maximized) return

  dragState.value = {
    isDragging: true,
    windowId,
    startX: event.clientX,
    startY: event.clientY,
    startWindowX: window.x,
    startWindowY: window.y
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  event.preventDefault()
}

// 处理拖拽
const handleDrag = (event: MouseEvent) => {
  if (!dragState.value.isDragging || !dragState.value.windowId) return

  const dx = event.clientX - dragState.value.startX
  const dy = event.clientY - dragState.value.startY

  const window = props.windows.find(w => w.id === dragState.value.windowId)
  if (window) {
    const updatedWindow = {
      ...window,
      x: Math.max(0, dragState.value.startWindowX + dx),
      y: Math.max(0, dragState.value.startWindowY + dy)
    }
    emit('window-update', updatedWindow)
  }
}

// 停止拖拽
const stopDrag = () => {
  dragState.value.isDragging = false
  dragState.value.windowId = null
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 开始调整大小
const startResize = (windowId: string, event: MouseEvent) => {
  const window = props.windows.find(w => w.id === windowId)
  if (!window) return

  resizeState.value = {
    isResizing: true,
    windowId,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: window.width,
    startHeight: window.height
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
  event.stopPropagation()
}

// 处理调整大小
const handleResize = (event: MouseEvent) => {
  if (!resizeState.value.isResizing || !resizeState.value.windowId) return

  const dx = event.clientX - resizeState.value.startX
  const dy = event.clientY - resizeState.value.startY

  const window = props.windows.find(w => w.id === resizeState.value.windowId)
  if (window) {
    const updatedWindow = {
      ...window,
      width: Math.max(200, resizeState.value.startWidth + dx),
      height: Math.max(150, resizeState.value.startHeight + dy)
    }
    emit('window-update', updatedWindow)
  }
}

// 停止调整大小
const stopResize = () => {
  resizeState.value.isResizing = false
  resizeState.value.windowId = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 切换最小化
const toggleMinimize = (windowId: string) => {
  const window = props.windows.find(w => w.id === windowId)
  if (window) {
    const updatedWindow = { ...window, minimized: !window.minimized }
    emit('window-update', updatedWindow)
  }
}

// 切换最大化
const toggleMaximize = (windowId: string) => {
  const window = props.windows.find(w => w.id === windowId)
  if (window) {
    const updatedWindow = { ...window, maximized: !window.maximized }
    emit('window-update', updatedWindow)
  }
}

// 关闭窗口
const closeWindow = (windowId: string) => {
  emit('window-close', windowId)
}
</script>

<style scoped>
.floating-windows-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;  /* 容器本身不接收鼠标事件 */
  z-index: 100;  /* 确保在工作区之上，但不要太高 */
}

.floating-window {
  position: fixed;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  min-width: 200px;
  min-height: 150px;
  pointer-events: auto;  /* 窗口本身接收鼠标事件 */
}

.floating-window.minimized {
  height: auto !important;
}

.floating-window.maximized {
  border-radius: 0;
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-color-tertiary);
  border-bottom: 1px solid var(--border-color);
  cursor: move;
  user-select: none;
}

.window-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color);
}

.window-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 2px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.control-btn.minimize {
  background: var(--color-warning);
  color: var(--text-color);
}

.control-btn.maximize {
  background: var(--color-success);
  color: var(--text-color);
}

.control-btn.close {
  background: var(--color-error);
  color: var(--text-color);
}

.control-btn:hover {
  opacity: 0.8;
}

.window-content {
  height: calc(100% - 41px);
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: se-resize;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 40%,
    var(--resize-handle-color, #666) 40%,
    var(--border-color) 40%,
    var(--border-color) 50%,
    var(--border-color) 90%
    var(--resize-handle-color, #666) 90%
  );
}

.unknown-component {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-color-secondary);
  font-style: italic;
}
</style>
