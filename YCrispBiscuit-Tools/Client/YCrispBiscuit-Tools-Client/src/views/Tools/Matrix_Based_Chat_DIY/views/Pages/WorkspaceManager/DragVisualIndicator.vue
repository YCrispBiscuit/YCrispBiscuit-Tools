<template>
  <div class="drag-overlay" v-if="dragState.isDragging">
    <!-- 放置区域指示器 -->
    <div
      v-for="zone in dragState.availableDropZones"
      :key="zone.id"
      :class="[
        'drop-zone-indicator',
        `drop-zone-${zone.type}`,
        `drop-zone-${zone.position}`,
        { 'active': currentDropZone?.id === zone.id }
      ]"
      :style="getDropZoneStyle(zone)"
    >
      <div class="drop-zone-content">
        <div class="drop-zone-icon">
          {{ getDropZoneIcon(zone) }}
        </div>
        <div class="drop-zone-text">
          {{ getDropZoneText(zone) }}
        </div>
      </div>
    </div>

    <!-- 拖拽预览 -->
    <div
      v-if="dragPreview"
      class="drag-preview"
      :style="dragPreviewStyle"
    >
      <div class="drag-preview-content">
        <span class="drag-preview-icon">📋</span>
        <span class="drag-preview-text">{{ dragPreview.title }}</span>
      </div>
    </div>

    <!-- 分割预览线 -->
    <div
      v-if="currentDropZone?.type === 'split'"
      class="split-preview-line"
      :style="getSplitPreviewStyle(currentDropZone)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DragState, DropZone } from './DragDropManager'

interface Props {
  dragState: DragState
  currentDropZone?: DropZone
  dragPreview?: {
    title: string
    x: number
    y: number
  } | null
}

const props = defineProps<Props>()

// 计算拖拽预览样式
const dragPreviewStyle = computed(() => {
  if (!props.dragPreview) return {}
  
  return {
    left: props.dragPreview.x + 'px',
    top: props.dragPreview.y + 'px',
    transform: 'translate(-50%, -50%)'
  }
})

// 获取放置区域样式
const getDropZoneStyle = (zone: DropZone) => {
  const rect = zone.rect
  return {
    left: rect.left + 'px',
    top: rect.top + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px'
  }
}

// 获取放置区域图标
const getDropZoneIcon = (zone: DropZone): string => {
  switch (zone.type) {
    case 'split':
      switch (zone.position) {
        case 'top': return '⬆️'
        case 'bottom': return '⬇️'
        case 'left': return '⬅️'
        case 'right': return '➡️'
        default: return '📐'
      }
    case 'merge':
      return '📋'
    case 'replace':
      return '✨'
    default:
      return '📍'
  }
}

// 获取放置区域文本
const getDropZoneText = (zone: DropZone): string => {
  switch (zone.type) {
    case 'split':
      return `分割${zone.position === 'top' || zone.position === 'bottom' ? '水平' : '垂直'}`
    case 'merge':
      return '添加选项卡'
    case 'replace':
      return '新建面板'
    default:
      return '放置区域'
  }
}

// 获取分割预览线样式
const getSplitPreviewStyle = (zone: DropZone) => {
  const rect = zone.rect
  
  switch (zone.position) {
    case 'top':
      return {
        left: rect.left + 'px',
        top: (rect.top + rect.height / 2) + 'px',
        width: rect.width + 'px',
        height: '2px'
      }
    case 'bottom':
      return {
        left: rect.left + 'px',
        top: (rect.top + rect.height / 2) + 'px',
        width: rect.width + 'px',
        height: '2px'
      }
    case 'left':
      return {
        left: (rect.left + rect.width / 2) + 'px',
        top: rect.top + 'px',
        width: '2px',
        height: rect.height + 'px'
      }
    case 'right':
      return {
        left: (rect.left + rect.width / 2) + 'px',
        top: rect.top + 'px',
        width: '2px',
        height: rect.height + 'px'
      }
    default:
      return {}
  }
}
</script>

<style scoped>
.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

/* 放置区域指示器 */
.drop-zone-indicator {
  position: absolute;
  border: 2px dashed transparent;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.drop-zone-indicator.drop-zone-split {
  background: rgba(74, 144, 226, 0.1);
  border-color: #4a90e2;
}

.drop-zone-indicator.drop-zone-merge {
  background: rgba(82, 196, 26, 0.1);
  border-color: #52c41a;
}

.drop-zone-indicator.drop-zone-replace {
  background: rgba(250, 173, 20, 0.1);
  border-color: #faad14;
}

.drop-zone-indicator.active {
  opacity: 1;
  border-style: solid;
  border-width: 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  pointer-events: none;
}

.drop-zone-indicator.active .drop-zone-content {
  color: #333;
}

.drop-zone-icon {
  font-size: 16px;
}

.drop-zone-text {
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

/* 拖拽预览 */
.drag-preview {
  position: absolute;
  pointer-events: none;
  z-index: 10000;
}

.drag-preview-content {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.drag-preview-icon {
  font-size: 14px;
}

/* 分割预览线 */
.split-preview-line {
  position: absolute;
  background: #4a90e2;
  z-index: 9998;
  box-shadow: 0 0 6px rgba(74, 144, 226, 0.5);
  animation: glow 1s infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 6px rgba(74, 144, 226, 0.5);
  }
  to {
    box-shadow: 0 0 12px rgba(74, 144, 226, 0.8);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .drop-zone-content {
    font-size: 10px;
  }
  
  .drop-zone-icon {
    font-size: 14px;
  }
  
  .drop-zone-text {
    font-size: 9px;
  }
}
</style>
