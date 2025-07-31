<template>
  <div 
    class="workspace-grid" 
    ref="gridContainer"
  >
    <!-- 网格容器 -->
    <div class="grid-container">
      <!-- 网格项目 -->
      <GridPanel
        v-for="panel in layout"
        :key="panel.i"
        :panel="panel"
        :grid-cols="gridCols"
        :grid-rows="gridRows"
        :cell-width="cellWidth"
        :cell-height="cellHeight"
        @move="handlePanelMove"
        @resize="handlePanelResize"
        @tab-close="handleTabClose"
        @tab-detach="handleTabDetach"
        @tab-activate="handleTabActivate"
        @delete="handlePanelDelete"
      />
    </div>

    <!-- 空状态提示 -->
    <div v-if="layout.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📋</div>
        <h3>工作区为空</h3>
        <p>点击左侧抽屉功能面板将其添加到此处开始工作</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import GridPanel from './GridPanel.vue'
import type { GridLayoutItem, TabItem } from './types'

interface Props {
  initialLayout?: GridLayoutItem[] | null
}

interface Emits {
  (e: 'layout-changed', layout: GridLayoutItem[]): void
  (e: 'tab-detach', panelId: string, tabId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 状态管理
const gridContainer = ref<HTMLElement>()
const layout = ref<GridLayoutItem[]>([])
const gridCols = 48  // 增加到48列，使网格更密
const gridRows = 32  // 增加到32行，使网格更密

// 计算网格单元尺寸
const cellWidth = ref(20)  // 设置固定最小尺寸
const cellHeight = ref(20) // 设置固定最小尺寸

// 组件是否已经初始化完成
const isInitialized = ref(false)

// 初始化默认布局
const initializeDefaultLayout = () => {
  if (!layout.value.length) {
    // 创建默认的聊天面板
    const defaultPanel: GridLayoutItem = {
      i: 'default-chat',
      x: 0,
      y: 0,
      w: 24,  // 调整为新网格系统下的宽度（原来12格 → 现在24格）
      h: 16,  // 调整为新网格系统下的高度（原来8格 → 现在16格）
      tabs: [{
        id: 'chat-1',
        title: '聊天',
        component: 'Chat',
        props: {},
        closeable: false
      }],
      activeTab: 'chat-1'
    }
    layout.value = [defaultPanel]
    
    // 只有在组件初始化完成后才发出布局变化事件
    if (isInitialized.value) {
      emitLayoutChange()
    }
  }
}

// 监听初始布局变化
watch(() => props.initialLayout, (newLayout) => {
  if (newLayout && Array.isArray(newLayout) && newLayout.length > 0) {
    layout.value = [...newLayout]
    console.log('WorkspaceGrid: 使用初始布局', newLayout.length, '个面板')
  } else {
    initializeDefaultLayout()
  }
}, { immediate: true })

// 计算网格尺寸
const calculateGridSize = () => {
  if (gridContainer.value) {
    const rect = gridContainer.value.getBoundingClientRect()
    console.log('WorkspaceGrid: 计算网格尺寸', { width: rect.width, height: rect.height })
    
    // 确保单元格尺寸不会太小
    const newCellWidth = Math.max(15, Math.floor(rect.width / gridCols))
    const newCellHeight = Math.max(15, Math.floor(rect.height / gridRows))
    
    cellWidth.value = newCellWidth
    cellHeight.value = newCellHeight
    console.log('WorkspaceGrid: 单元格尺寸', { cellWidth: cellWidth.value, cellHeight: cellHeight.value })
  }
}

// 处理面板移动
const handlePanelMove = (panelId: string, newX: number, newY: number) => {
  const panel = layout.value.find(p => p.i === panelId)
  if (panel) {
    panel.x = Math.max(0, Math.min(newX, gridCols - panel.w))
    panel.y = Math.max(0, Math.min(newY, gridRows - panel.h))
    emitLayoutChange()
  }
}

// 处理面板调整大小
const handlePanelResize = (panelId: string, newW: number, newH: number) => {
  const panel = layout.value.find(p => p.i === panelId)
  if (panel) {
    panel.w = Math.max(2, Math.min(newW, gridCols - panel.x))
    panel.h = Math.max(2, Math.min(newH, gridRows - panel.y))
    emitLayoutChange()
  }
}

// 处理选项卡激活
const handleTabActivate = (panelId: string, tabId: string) => {
  const panel = layout.value.find(p => p.i === panelId)
  if (panel) {
    panel.activeTab = tabId
    emitLayoutChange()
  }
}

// 处理选项卡关闭
const handleTabClose = (panelId: string, tabId: string) => {
  const panel = layout.value.find(p => p.i === panelId)
  if (panel && panel.tabs) {
    panel.tabs = panel.tabs.filter(tab => tab.id !== tabId)
    
    // 如果关闭的是当前活动选项卡，切换到第一个可用选项卡
    if (panel.activeTab === tabId && panel.tabs.length > 0) {
      panel.activeTab = panel.tabs[0].id
    }
    
    // 如果没有选项卡了，删除整个面板
    if (panel.tabs.length === 0) {
      handlePanelDelete(panelId)
    } else {
      emitLayoutChange()
    }
  }
}

// 处理选项卡分离
const handleTabDetach = (panelId: string, tabId: string) => {
  emit('tab-detach', panelId, tabId)
  handleTabClose(panelId, tabId)
}

// 处理面板删除
const handlePanelDelete = (panelId: string) => {
  layout.value = layout.value.filter(p => p.i !== panelId)
  emitLayoutChange()
}

// 在指定位置添加面板
const addPanelAtPosition = (id: string, component: string, title: string, props: any, x: number, y: number) => {
  console.log('正在添加面板:', { id, component, title, x, y })
  
  const newPanel: GridLayoutItem = {
    i: `${id}-${Date.now()}`,
    x: Math.max(0, Math.min(x, gridCols - 18)),  // 调整边界检查以适应更大的面板
    y: Math.max(0, Math.min(y, gridRows - 12)),   // 调整边界检查以适应更大的面板
    w: 18,  // 增大默认宽度（从12格增加到18格）
    h: 12,   // 增大默认高度（从8格增加到12格）
    tabs: [{
      id: `${component}-${Date.now()}`,
      title,
      component,
      props,
      closeable: true
    }],
    activeTab: `${component}-${Date.now()}`
  }
  
  layout.value.push(newPanel)
  console.log('面板已添加，当前布局:', layout.value.length, '个面板')
  emitLayoutChange()
}

// 公共方法：添加面板
const addPanel = (id: string, component: string, title: string, props: any = {}) => {
  // 检查是否已存在相同组件的面板，如果存在则作为新选项卡添加
  const existingPanel = layout.value.find(panel => 
    panel.tabs?.some(tab => tab.component === component)
  )
  
  if (existingPanel && existingPanel.tabs) {
    // 检查是否已经有相同的选项卡
    const tabExists = existingPanel.tabs.some(tab => tab.component === component)
    if (!tabExists) {
      const newTabId = `${component}-${Date.now()}`
      existingPanel.tabs.push({
        id: newTabId,
        title,
        component,
        props,
        closeable: true
      })
      existingPanel.activeTab = newTabId
      console.log(`已将 ${title} 添加为选项卡到现有面板`)
      emitLayoutChange()
    } else {
      console.log(`选项卡 ${title} 已存在`)
    }
    return
  }
  
  // 寻找合适的位置创建新面板
  let x = 0, y = 0
  for (let row = 0; row < gridRows - 11; row++) {  // 调整搜索范围（从7改为11）
    for (let col = 0; col < gridCols - 17; col++) {  // 调整搜索范围（从11改为17）
      if (isPositionAvailable(col, row, 18, 12)) {  // 调整检查尺寸（从12,8改为18,12）
        x = col
        y = row
        break
      }
    }
    if (x !== 0 || y !== 0) break
  }
  
  addPanelAtPosition(id, component, title, props, x, y)
}

// 检查位置是否可用
const isPositionAvailable = (x: number, y: number, w: number, h: number): boolean => {
  return !layout.value.some(panel => {
    const panelRight = panel.x + panel.w
    const panelBottom = panel.y + panel.h
    const newRight = x + w
    const newBottom = y + h
    
    return !(x >= panelRight || newRight <= panel.x || y >= panelBottom || newBottom <= panel.y)
  })
}

// 获取当前布局
const getCurrentLayout = () => {
  return [...layout.value]
}

// 发出布局变化事件
const emitLayoutChange = () => {
  // 只有在组件初始化完成后才发出事件
  if (!isInitialized.value) {
    return
  }
  
  nextTick(() => {
    emit('layout-changed', getCurrentLayout())
  })
}

// 监听窗口大小变化
const handleResize = () => {
  calculateGridSize()
}

// 生命周期
onMounted(() => {
  calculateGridSize()
  window.addEventListener('resize', handleResize)
  
  // 标记组件初始化完成
  nextTick(() => {
    isInitialized.value = true
    
    // 如果此时有默认布局但还没有发出事件，现在发出
    if (layout.value.length > 0) {
      emitLayoutChange()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露公共方法
defineExpose({
  addPanel,
  getCurrentLayout
})
</script>

<style scoped>
.workspace-grid {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  overflow: hidden;
  z-index: 10;
}

.grid-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 25px 25px;  /* 调整网格背景以匹配更小的单元格 */
  z-index: 11;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #888;
  pointer-events: none;
}

.empty-content {
  max-width: 300px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.empty-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.7;
}
</style>
