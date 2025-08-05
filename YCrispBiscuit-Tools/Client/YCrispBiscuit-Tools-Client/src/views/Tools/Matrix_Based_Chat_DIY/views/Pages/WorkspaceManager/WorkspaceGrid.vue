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
        :data-panel-id="panel.i"
        @move="handlePanelMove"
        @resize="handlePanelResize"
        @tab-close="handleTabClose"
        @tab-detach="handleTabDetach"
        @tab-activate="handleTabActivate"
        @delete="handlePanelDelete"
        @tab-drag-start="handleTabDragStart"
        @panel-focus="handlePanelFocus"
      />
    </div>

    <!-- 拖拽视觉指示器 -->
    <DragVisualIndicator
      :drag-state="dragManager?.getDragState() || defaultDragState"
      :current-drop-zone="dragManager?.getCurrentDropZone()"
      :drag-preview="dragPreview"
    />

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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import GridPanel from './GridPanel.vue'
import DragVisualIndicator from './DragVisualIndicator.vue'
import { DragDropManager } from './DragDropManager'
import { windowManager } from './WindowManager'
import type { GridLayoutItem, DragState, DropZone, TabItem } from './types'

interface Props {
  initialLayout?: GridLayoutItem[] | null
}

interface Emits {
  (e: 'layout-changed', layout: GridLayoutItem[]): void
  (e: 'tab-detach', panelId: string, tabId: string): void
  (e: 'panel-focus', panelId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 状态管理
const gridContainer = ref<HTMLElement>()
const layout = ref<GridLayoutItem[]>([])

// 响应式断点和网格配置
const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  large: 1920
}

// 根据屏幕尺寸动态计算网格参数
const getGridConfig = (width: number) => {
  if (width <= breakpoints.mobile) {
    // 移动端：较少列数，较大单元格
    return {
      cols: Math.max(8, Math.floor(width / 80)),
      minCellWidth: 60,
      minCellHeight: 50
    }
  } else if (width <= breakpoints.tablet) {
    // 平板端：中等列数
    return {
      cols: Math.max(16, Math.floor(width / 60)),
      minCellWidth: 50,
      minCellHeight: 40
    }
  } else if (width <= breakpoints.desktop) {
    // 桌面端：标准配置
    return {
      cols: Math.max(24, Math.floor(width / 50)),
      minCellWidth: 40,
      minCellHeight: 30
    }
  } else if (width <= breakpoints.large) {
    // 大屏：更多列数
    return {
      cols: Math.max(36, Math.floor(width / 45)),
      minCellWidth: 35,
      minCellHeight: 25
    }
  } else {
    // 超大屏：最大密度
    return {
      cols: Math.max(48, Math.floor(width / 40)),
      minCellWidth: 30,
      minCellHeight: 20
    }
  }
}

const minCellWidth = ref(40)
const minCellHeight = ref(30)
const gridCols = ref(24)  // 响应式列数
const gridRows = 32  // 行数保持不变

// 计算网格单元尺寸
const cellWidth = ref(minCellWidth)
const cellHeight = ref(minCellHeight)

// 组件是否已经初始化完成
const isInitialized = ref(false)

// 拖拽相关状态
const dragManager = ref<DragDropManager | null>(null)
const dragPreview = ref<{ title: string; x: number; y: number } | null>(null)
const browserTopIndicator = ref(false) // 浏览器顶部指示器

// 默认拖拽状态
const defaultDragState: DragState = {
  isDragging: false,
  dragType: 'tab',
  sourceData: {},
  availableDropZones: []
}

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
    const oldCols = gridCols.value
    
    // 使用响应式配置
    const config = getGridConfig(rect.width)
    
    gridCols.value = config.cols
    minCellWidth.value = config.minCellWidth
    minCellHeight.value = config.minCellHeight
    
    // 计算实际单元格尺寸
    cellWidth.value = rect.width / config.cols
    cellHeight.value = Math.max(config.minCellHeight, Math.floor(rect.height / gridRows))
    
    if (oldCols !== config.cols) {
      console.log(`WorkspaceGrid: 响应式调整 - 宽度: ${rect.width}px, 列数: ${oldCols} -> ${config.cols}, 单元格: ${cellWidth.value.toFixed(1)}x${cellHeight.value}px`)
    }
  }
}

// 处理面板移动
const handlePanelMove = (panelId: string, newX: number, newY: number) => {
  const panel = layout.value.find(p => p.i === panelId)
  if (panel) {
    // 边界检查：确保面板完全在网格内
    panel.x = Math.max(0, Math.min(newX, Math.max(0, gridCols.value - panel.w)))
    panel.y = Math.max(0, Math.min(newY, Math.max(0, gridRows - panel.h)))
    console.log(`面板 ${panelId} 移动到 (${panel.x}, ${panel.y})，网格尺寸: ${gridCols.value} x ${gridRows}`)
    emitLayoutChange()
  }
}

// 处理面板调整大小
const handlePanelResize = (panelId: string, newW: number, newH: number) => {
  const panel = layout.value.find(p => p.i === panelId)
  if (panel) {
    panel.w = Math.max(2, Math.min(newW, gridCols.value - panel.x)) // 保持原逻辑，防止超出
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

// 处理面板聚焦（置顶）
const handlePanelFocus = (panelId: string) => {
  console.log(`WorkspaceGrid: 面板 ${panelId} 请求置顶`)
  emit('panel-focus', panelId)
}

// 处理面板删除
const handlePanelDelete = (panelId: string) => {
  layout.value = layout.value.filter(p => p.i !== panelId)
  emitLayoutChange()
}

// 在指定位置添加面板
const addPanelAtPosition = (id: string, component: string, title: string, props: any, x: number, y: number) => {
  console.log('正在添加面板:', { id, component, title, x, y })
  
  // 响应式面板尺寸
  const getPanelSize = () => {
    const cols = gridCols.value
    if (cols <= 16) {
      // 移动端：较大的相对尺寸
      return { width: Math.floor(cols * 0.8), height: 8 }
    } else if (cols <= 24) {
      // 平板端：中等尺寸
      return { width: Math.floor(cols * 0.6), height: 10 }
    } else if (cols <= 36) {
      // 桌面端：标准尺寸
      return { width: Math.floor(cols * 0.5), height: 12 }
    } else {
      // 大屏：相对较小的尺寸
      return { width: Math.floor(cols * 0.4), height: 12 }
    }
  }
  
  const panelSize = getPanelSize()
  const panelWidth = panelSize.width
  const panelHeight = panelSize.height
  
  const newPanel: GridLayoutItem = {
    i: `${id}-${Date.now()}`,
    x: Math.max(0, Math.min(x, Math.max(0, gridCols.value - panelWidth))),  // 动态计算右边界
    y: Math.max(0, Math.min(y, gridRows - panelHeight)),   // 动态计算下边界
    w: panelWidth,  // 响应式宽度
    h: panelHeight/0.5,   // 响应式高度
    tabs: [{
      id: `${component}-${Date.now()}`,
      title,
      component,
      props,
      closeable: true
    }],
    activeTab: `${component}-${Date.now()}`,
    zIndex: 1
  }
  
  layout.value.push(newPanel)
  console.log(`面板已添加 ${panelWidth}x${panelHeight}，当前布局:`, layout.value.length, '个面板')
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
    for (let col = 0; col < gridCols.value - 17; col++) {  // 调整搜索范围（从11改为17）
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

// 更新面板Z-index
const updatePanelZIndex = (panelId: string, zIndex: number) => {
  const panel = layout.value.find(p => p.i === panelId)
  if (panel) {
    panel.zIndex = zIndex
    console.log(`WorkspaceGrid: 更新面板 ${panelId} Z-index 为 ${zIndex}`)
  }
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

// 拖拽相关方法
const handleTabDragStart = (panelId: string, tabId: string, tab: TabItem) => {
  console.log('🎯 开始标签页拖拽:', { panelId, tabId, tab })
  
  if (!dragManager.value) {
    console.log('🔧 初始化拖拽管理器')
    initializeDragManager()
  }
  
  dragManager.value?.startDrag('tab', {
    panelId,
    tabId,
    tab
  })
  
  console.log('✅ 拖拽已开始')
  
  // 初始化拖拽预览
  dragPreview.value = {
    title: tab.title,
    x: 0,
    y: 0
  }
  
  // 设置浏览器顶部检测回调
  if (dragManager.value) {
    dragManager.value.setBrowserTopCallback((isNearTop: boolean) => {
      browserTopIndicator.value = isNearTop
      // 更新鼠标样式提供视觉反馈
      document.body.style.cursor = isNearTop ? 'copy' : 'grabbing'
      console.log(isNearTop ? '💡 接近浏览器顶部 - 可释放创建新窗口' : '📍 离开浏览器顶部区域')
    })
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (dragManager.value?.isDragging() && gridContainer.value) {
    const rect = gridContainer.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    // 更新拖拽位置
    dragManager.value.updateDragPosition(mouseX, mouseY, rect)
    
    // 更新拖拽预览位置
    if (dragPreview.value) {
      dragPreview.value.x = mouseX
      dragPreview.value.y = mouseY
    }
  }
}

const handleMouseUp = async () => {
  if (dragManager.value?.isDragging()) {
    const { dropZone, sourceData, isNearBrowserTop } = dragManager.value.endDrag()
    
    console.log('🖱️ 鼠标释放, dropZone:', dropZone, 'sourceData:', sourceData, 'isNearBrowserTop:', isNearBrowserTop)
    
    // 检查是否在浏览器顶部释放
    if (isNearBrowserTop && sourceData?.tab) {
      try {
        console.log(`🚀 在浏览器顶部释放选项卡，创建新窗口: ${sourceData.tab.title}`)
        
        // 获取当前面板的位置信息
        const panelElement = document.querySelector(`[data-panel-id="${sourceData.panelId}"]`)
        const panelRect = panelElement?.getBoundingClientRect()
        
        // 创建新窗口
        await windowManager.createDetachedWindow(sourceData.tab, panelRect)
        
        // 从当前面板移除这个选项卡
        if (sourceData.panelId && sourceData.tabId) {
          handleTabClose(sourceData.panelId, sourceData.tabId)
        }
        
        console.log(`✅ 成功将选项卡 "${sourceData.tab.title}" 分离到新窗口`)
      } catch (error) {
        console.error('创建分离窗口失败:', error)
        // TODO: 显示错误提示给用户
      }
    } else if (dropZone) {
      handleDrop(dropZone, sourceData)
    } else {
      console.log('❌ 没有有效的放置区域')
    }
    
    // 清理状态
    dragPreview.value = null
    browserTopIndicator.value = false
    document.body.style.cursor = 'default' // 重置鼠标样式
  }
}

// 处理放置操作
const handleDrop = (dropZone: DropZone, sourceData?: any) => {
  // 如果没有传入 sourceData，尝试从拖拽状态获取
  if (!sourceData) {
    const dragState = dragManager.value?.getDragState()
    sourceData = dragState?.sourceData
  }
  
  if (!sourceData) {
    console.log('❌ 没有拖拽状态')
    return
  }
  
  console.log('🎯 执行放置操作:', {
    dropZone: dropZone.type,
    position: dropZone.position,
    targetPanelId: dropZone.targetPanelId,
    sourceData
  })
  
  switch (dropZone.type) {
    case 'split':
      console.log('🔀 执行分割放置')
      handleSplitDrop(dropZone, sourceData)
      break
    case 'merge':
      console.log('🔗 执行合并放置')
      handleMergeDrop(dropZone, sourceData)
      break
    case 'replace':
      console.log('🔄 执行替换放置')
      handleReplaceDrop(dropZone, sourceData)
      break
  }
}

// 处理分割放置
const handleSplitDrop = (dropZone: DropZone, sourceData: any) => {
  console.log('🔀 开始分割放置:', { dropZone, sourceData })
  
  if (!dropZone.targetPanelId || !sourceData.tab) {
    console.log('❌ 分割放置失败: 缺少目标面板ID或选项卡数据')
    return
  }
  
  const targetPanel = layout.value.find(p => p.i === dropZone.targetPanelId)
  if (!targetPanel) {
    console.log('❌ 分割放置失败: 找不到目标面板')
    return
  }
  
  console.log('✅ 找到目标面板:', targetPanel)
  
  // 创建新面板
  const newPanel: GridLayoutItem = {
    i: `panel-${Date.now()}`,
    x: targetPanel.x,
    y: targetPanel.y,
    w: targetPanel.w,
    h: targetPanel.h,
    tabs: [{
      id: sourceData.tab.id,
      title: sourceData.tab.title,
      component: sourceData.tab.component,
      props: sourceData.tab.props || {},
      closeable: sourceData.tab.closeable !== false
    }],
    activeTab: sourceData.tab.id
  }
  
  // 根据分割位置调整面板大小和位置
  switch (dropZone.position) {
    case 'top':
      targetPanel.y += Math.floor(targetPanel.h / 2)
      targetPanel.h = Math.floor(targetPanel.h / 2)
      newPanel.h = Math.floor(newPanel.h / 2)
      break
    case 'bottom':
      newPanel.y += Math.floor(targetPanel.h / 2)
      newPanel.h = Math.floor(newPanel.h / 2)
      targetPanel.h = Math.floor(targetPanel.h / 2)
      break
    case 'left':
      targetPanel.x += Math.floor(targetPanel.w / 2)
      targetPanel.w = Math.floor(targetPanel.w / 2)
      newPanel.w = Math.floor(newPanel.w / 2)
      break
    case 'right':
      newPanel.x += Math.floor(targetPanel.w / 2)
      newPanel.w = Math.floor(newPanel.w / 2)
      targetPanel.w = Math.floor(targetPanel.w / 2)
      break
  }
  
  layout.value.push(newPanel)
  
  // 从原面板中移除选项卡
  if (sourceData.panelId && sourceData.tabId) {
    handleTabClose(sourceData.panelId, sourceData.tabId)
  }
  
  emitLayoutChange()
}

// 处理合并放置
const handleMergeDrop = (dropZone: DropZone, sourceData: any) => {
  console.log('🔗 开始合并放置:', { dropZone, sourceData })
  console.log('📋 检查数据:', {
    hasTargetPanelId: !!dropZone.targetPanelId,
    targetPanelId: dropZone.targetPanelId,
    hasSourceTab: !!sourceData.tab,
    sourceData: sourceData,
    sourceDataKeys: Object.keys(sourceData)
  })
  
  if (!dropZone.targetPanelId || !sourceData.tab) {
    console.log('❌ 合并放置失败: 缺少目标面板ID或选项卡数据')
    return
  }
  
  const targetPanel = layout.value.find(p => p.i === dropZone.targetPanelId)
  if (!targetPanel || !targetPanel.tabs) {
    console.log('❌ 合并放置失败: 找不到目标面板或目标面板没有选项卡')
    return
  }
  
  console.log('✅ 找到目标面板:', targetPanel)
  
  // 检查是否已存在相同的选项卡
  const tabExists = targetPanel.tabs.some(tab => tab.id === sourceData.tab.id)
  if (!tabExists) {
    targetPanel.tabs.push({
      id: sourceData.tab.id,
      title: sourceData.tab.title,
      component: sourceData.tab.component,
      props: sourceData.tab.props || {},
      closeable: sourceData.tab.closeable !== false
    })
    targetPanel.activeTab = sourceData.tab.id
  }
  
  // 从原面板中移除选项卡
  if (sourceData.panelId && sourceData.tabId) {
    handleTabClose(sourceData.panelId, sourceData.tabId)
  }
  
  emitLayoutChange()
}

// 处理替换放置
const handleReplaceDrop = (dropZone: DropZone, sourceData: any) => {
  if (!sourceData.tab) return
  
  // 在空白区域创建新面板
  const newPanel: GridLayoutItem = {
    i: `panel-${Date.now()}`,
    x: Math.max(0, Math.min(Math.floor(dropZone.rect.left / cellWidth.value), gridCols.value - 12)),
    y: Math.max(0, Math.min(Math.floor(dropZone.rect.top / cellHeight.value), gridRows - 8)),
    w: 12,
    h: 8,
    tabs: [{
      id: sourceData.tab.id,
      title: sourceData.tab.title,
      component: sourceData.tab.component,
      props: sourceData.tab.props || {},
      closeable: sourceData.tab.closeable !== false
    }],
    activeTab: sourceData.tab.id
  }
  
  layout.value.push(newPanel)
  
  // 从原面板中移除选项卡
  if (sourceData.panelId && sourceData.tabId) {
    handleTabClose(sourceData.panelId, sourceData.tabId)
  }
  
  emitLayoutChange()
}

// 初始化拖拽管理器
const initializeDragManager = () => {
  dragManager.value = new DragDropManager({
    onDragStart: (state) => {
      console.log('拖拽开始:', state)
    },
    onDragMove: () => {
      // console.log('拖拽移动:', state)
    },
    onDragEnd: (dropZone) => {
      console.log('拖拽结束:', dropZone)
      // 注意：这里不调用 handleDrop，在 handleMouseUp 中统一处理
    },
    onDropZoneChange: (dropZone) => {
      console.log('放置区域变化:', dropZone)
    }
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
  
  // 添加ResizeObserver来监听容器尺寸变化
  if (gridContainer.value) {
    const resizeObserver = new ResizeObserver(() => {
      calculateGridSize()
    })
    resizeObserver.observe(gridContainer.value)
    
    // 在组件卸载时清理
    onUnmounted(() => {
      resizeObserver.disconnect()
    })
  }
  
  // 添加全局鼠标事件监听，支持拖拽
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
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
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// 暴露公共方法
defineExpose({
  addPanel,
  getCurrentLayout,
  updatePanelZIndex
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
