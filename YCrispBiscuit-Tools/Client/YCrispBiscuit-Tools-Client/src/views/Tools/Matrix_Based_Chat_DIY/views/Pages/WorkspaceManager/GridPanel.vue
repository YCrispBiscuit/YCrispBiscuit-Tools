<template>
  <div 
    class="grid-panel"
    :style="panelStyle"
    :data-panel-id="panel.i"
    @mousedown="handleMouseDown"
  >
    <!-- 面板头部 -->
    <div class="panel-header" ref="headerRef">
      <!-- 选项卡 -->
      <div class="tabs-container">
        <div
          v-for="tab in panel.tabs"
          :key="tab.id"
          class="tab"
          :class="{ active: tab.id === panel.activeTab }"
          @click="activateTab(tab.id)"
          @mousedown.stop="handleTabMouseDown(tab, $event)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <button
            v-if="tab.closeable !== false"
            class="tab-close"
            @click.stop="closeTab(tab.id)"
          >
            ×
          </button>
          <button
            class="tab-detach"
            @click.stop="detachTab(tab.id)"
            title="分离为浮动窗口"
          >
            ⧉
          </button>
        </div>
      </div>

      <!-- 面板控制按钮 -->
      <div class="panel-controls">
        <button class="control-btn" @click="deletePanel" title="关闭面板">
          ×
        </button>
      </div>
    </div>

    <!-- 面板内容 -->
    <div class="panel-content">
      <component 
        v-if="activeTabComponent"
        :is="activeTabComponent"
        v-bind="activeTabProps"
      />
      <div v-else class="no-content">
        <p>未找到组件: {{ activeTab?.component }}</p>
      </div>
    </div>

    <!-- 调整大小手柄 -->
    <div 
      class="resize-handle resize-right"
      @mousedown.stop="startResize('right', $event)"
    ></div>
    <div 
      class="resize-handle resize-bottom"
      @mousedown.stop="startResize('bottom', $event)"
    ></div>
    <div 
      class="resize-handle resize-corner"
      @mousedown.stop="startResize('corner', $event)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import type { GridLayoutItem, TabItem } from './types'

interface Props {
  panel: GridLayoutItem
  gridCols: number
  gridRows: number
  cellWidth: number
  cellHeight: number
}

interface Emits {
  (e: 'move', panelId: string, x: number, y: number): void
  (e: 'resize', panelId: string, w: number, h: number): void
  (e: 'tab-close', panelId: string, tabId: string): void
  (e: 'tab-detach', panelId: string, tabId: string): void
  (e: 'tab-activate', panelId: string, tabId: string): void
  (e: 'tab-drag-start', panelId: string, tabId: string, tab: TabItem): void
  (e: 'delete', panelId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 组件引用
const headerRef = ref<HTMLElement>()

// 面板状态管理
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, panelX: 0, panelY: 0 })
const isResizing = ref(false)
const resizeStart = ref({ x: 0, y: 0, w: 0, h: 0 })
const resizeDirection = ref<'right' | 'bottom' | 'corner'>('corner')

// 组件映射
const componentMap = {

    Chat: defineAsyncComponent(() => import('../RightContent/Chat/index.vue')),
  
  
  FileManager: defineAsyncComponent(() => import('../RightContent/FileManager/index.vue')),
  Calendar: defineAsyncComponent(() => import('../RightContent/Calendar/index.vue')),
  Notes: defineAsyncComponent(() => import('../RightContent/Notes/index.vue')),


  
  
  
}

// 计算样式
const panelStyle = computed(() => ({
  left: `${props.panel.x * props.cellWidth}px`,
  top: `${props.panel.y * props.cellHeight}px`,
  width: `${props.panel.w * props.cellWidth}px`,
  height: `${props.panel.h * props.cellHeight}px`,
  zIndex: isDragging.value ? 1000 : 1
}))

// 当前活动选项卡
const activeTab = computed(() => 
  props.panel.tabs?.find(tab => tab.id === props.panel.activeTab)
)

const activeTabComponent = computed(() => {
  if (activeTab.value) {
    return componentMap[activeTab.value.component as keyof typeof componentMap]
  }
  return null
})

const activeTabProps = computed(() => activeTab.value?.props || {})

// 激活选项卡
const activateTab = (tabId: string) => {
  emit('tab-activate', props.panel.i, tabId)
}

// 关闭选项卡
const closeTab = (tabId: string) => {
  emit('tab-close', props.panel.i, tabId)
}

// 分离选项卡
const detachTab = (tabId: string) => {
  emit('tab-detach', props.panel.i, tabId)
}

// 删除面板
const deletePanel = () => {
  emit('delete', props.panel.i)
}

// 选项卡拖拽相关方法
const handleTabMouseDown = (tab: TabItem, event: MouseEvent) => {
  // 防止面板拖拽被触发
  event.stopPropagation()
  
  // 立即触发拖拽开始（简化逻辑）
  emit('tab-drag-start', props.panel.i, tab.id, tab)
}

// 处理鼠标按下（开始拖拽面板）
const handleMouseDown = (event: MouseEvent) => {
  // 只有点击头部时才开始拖拽
  if (!headerRef.value?.contains(event.target as Node)) {
    return
  }

  event.preventDefault()
  isDragging.value = true
  
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    panelX: props.panel.x,
    panelY: props.panel.y
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.userSelect = 'none'
}

// 处理鼠标移动（拖拽中）
const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = event.clientX - dragStart.value.x
    const deltaY = event.clientY - dragStart.value.y
    
    // 使用更细粒度的移动计算，减少跳跃感
    // 设置最小移动阈值，只有移动足够距离才更新位置
    const minMoveThreshold = props.cellWidth * 0.5  // 移动半个网格才更新
    
    if (Math.abs(deltaX) >= minMoveThreshold || Math.abs(deltaY) >= minMoveThreshold) {
      const newX = dragStart.value.panelX + Math.round(deltaX / props.cellWidth)
      const newY = dragStart.value.panelY + Math.round(deltaY / props.cellHeight)
      
      // 确保新位置有效且与当前位置不同
      const clampedX = Math.max(0, Math.min(newX, props.gridCols - props.panel.w))
      const clampedY = Math.max(0, Math.min(newY, props.gridRows - props.panel.h))
      
      if (clampedX !== props.panel.x || clampedY !== props.panel.y) {
        emit('move', props.panel.i, clampedX, clampedY)
      }
    }
  } else if (isResizing.value) {
    const deltaX = event.clientX - resizeStart.value.x
    const deltaY = event.clientY - resizeStart.value.y
    
    let newW = resizeStart.value.w
    let newH = resizeStart.value.h
    
    if (resizeDirection.value === 'right' || resizeDirection.value === 'corner') {
      newW = resizeStart.value.w + Math.round(deltaX / props.cellWidth)
    }
    if (resizeDirection.value === 'bottom' || resizeDirection.value === 'corner') {
      newH = resizeStart.value.h + Math.round(deltaY / props.cellHeight)
    }
    
    // 确保尺寸在合理范围内
    newW = Math.max(2, Math.min(newW, props.gridCols - props.panel.x))
    newH = Math.max(2, Math.min(newH, props.gridRows - props.panel.y))
    
    if (newW !== props.panel.w || newH !== props.panel.h) {
      emit('resize', props.panel.i, newW, newH)
    }
  }
}

// 处理鼠标释放（结束拖拽/调整大小）
const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
  
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.body.style.userSelect = ''
}

// 开始调整大小
const startResize = (direction: 'right' | 'bottom' | 'corner', event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  isResizing.value = true
  resizeDirection.value = direction
  
  resizeStart.value = {
    x: event.clientX,
    y: event.clientY,
    w: props.panel.w,
    h: props.panel.h
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.userSelect = 'none'
}
</script>

<style scoped>
.grid-panel {
  position: absolute;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.grid-panel:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.panel-header {
  background: #3c3c3c;
  border-bottom: 1px solid #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: 32px;
  cursor: move;
  user-select: none;
}

.tabs-container {
  display: flex;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: transparent;
  border-right: 1px solid #444;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 0;
}

.tab:hover {
  background: #484848;
}

.tab.active {
  background: #007acc;
  color: white;
}

.tab-title {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close,
.tab-detach {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.tab-close:hover,
.tab-detach:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.panel-controls {
  display: flex;
  padding: 4px;
}

.control-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #ff4444;
  color: white;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  background: #1e1e1e;
}

.no-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-size: 14px;
}

/* 调整大小手柄 */
.resize-handle {
  position: absolute;
  background: transparent;
  transition: background 0.2s ease;
}

.resize-handle:hover {
  background: #007acc;
}

.resize-right {
  right: 0;
  top: 8px;
  bottom: 8px;
  width: 4px;
  cursor: ew-resize;
}

.resize-bottom {
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 4px;
  cursor: ns-resize;
}

.resize-corner {
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  cursor: nw-resize;
}

.resize-corner::after {
  content: '';
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-bottom: 6px solid #666;
}

.resize-corner:hover::after {
  border-bottom-color: #007acc;
}
</style>
