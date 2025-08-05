import type { TabItem } from './types'

// 拖拽放置区域类型
export interface DropZone {
  id: string
  type: 'split' | 'merge' | 'replace'
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  targetPanelId?: string
  rect: DOMRect
  splitRatio?: number
}

// 拖拽状态
export interface DragState {
  isDragging: boolean
  dragType: 'tab' | 'panel'
  sourceData: {
    panelId?: string
    tabId?: string
    tab?: TabItem
  }
  currentDropZone?: DropZone
  availableDropZones: DropZone[]
}

export class DragDropManager {
  private dragState: DragState = {
    isDragging: false,
    dragType: 'tab',
    sourceData: {},
    availableDropZones: []
  }

  private callbacks: {
    onDragStart?: (state: DragState) => void
    onDragMove?: (state: DragState) => void
    onDragEnd?: (dropZone?: DropZone) => void
    onDropZoneChange?: (dropZone?: DropZone) => void
    onBrowserTopDetect?: (isNearTop: boolean) => void
  } = {}

  private browserTopThreshold = 50 // 浏览器顶部检测阈值（像素）
  private isNearBrowserTop = false

  constructor(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks
  }

  // 设置浏览器顶部检测回调
  setBrowserTopCallback(callback: (isNearTop: boolean) => void) {
    this.callbacks.onBrowserTopDetect = callback
  }

  // 开始拖拽
  startDrag(type: 'tab' | 'panel', sourceData: DragState['sourceData']) {
    this.dragState = {
      isDragging: true,
      dragType: type,
      sourceData,
      availableDropZones: []
    }
    
    this.callbacks.onDragStart?.(this.dragState)
  }

  // 更新拖拽位置并检测放置区域
  updateDragPosition(mouseX: number, mouseY: number, containerRect: DOMRect) {
    if (!this.dragState.isDragging) return

    // 检测是否接近浏览器顶部
    this.checkBrowserTopProximity(mouseY)

    // 计算所有可用的放置区域
    this.calculateDropZones(containerRect)
    
    // 检测当前鼠标位置对应的放置区域
    const currentDropZone = this.detectDropZone(mouseX, mouseY)
    
    if (currentDropZone?.id !== this.dragState.currentDropZone?.id) {
      this.dragState.currentDropZone = currentDropZone
      this.callbacks.onDropZoneChange?.(currentDropZone)
    }

    this.callbacks.onDragMove?.(this.dragState)
  }

  // 检测是否接近浏览器顶部
  private checkBrowserTopProximity(mouseY: number) {
    const wasNearTop = this.isNearBrowserTop
    this.isNearBrowserTop = mouseY <= this.browserTopThreshold
    
    // 只有状态变化时才触发回调
    if (wasNearTop !== this.isNearBrowserTop) {
      this.callbacks.onBrowserTopDetect?.(this.isNearBrowserTop)
    }
  }

  // 获取是否接近浏览器顶部
  getIsNearBrowserTop(): boolean {
    return this.isNearBrowserTop
  }

  // 结束拖拽
  endDrag(): { dropZone: DropZone | undefined, sourceData: any, isNearBrowserTop: boolean } {
    const dropZone = this.dragState.currentDropZone
    const sourceData = this.dragState.sourceData
    const wasNearBrowserTop = this.isNearBrowserTop
    
    this.dragState = {
      isDragging: false,
      dragType: 'tab',
      sourceData: {},
      availableDropZones: []
    }

    // 重置浏览器顶部状态
    this.isNearBrowserTop = false

    this.callbacks.onDragEnd?.(dropZone)
    return { dropZone, sourceData, isNearBrowserTop: wasNearBrowserTop }
  }

  // 计算所有可用的放置区域
  private calculateDropZones(containerRect: DOMRect) {
    const dropZones: DropZone[] = []
    
    // 获取所有现有面板
    const panels = document.querySelectorAll('.grid-panel')
    
    panels.forEach((panel, index) => {
      const panelRect = panel.getBoundingClientRect()
      const panelId = panel.getAttribute('data-panel-id') || `panel-${index}`
      
      // 计算面板的分割区域（上下左右）
      const splitHeight = 30 // 分割检测区域高度
      const splitWidth = 30  // 分割检测区域宽度
      
      // 上方分割区域
      dropZones.push({
        id: `${panelId}-split-top`,
        type: 'split',
        position: 'top',
        targetPanelId: panelId,
        rect: new DOMRect(
          panelRect.left - containerRect.left,
          panelRect.top - containerRect.top,
          panelRect.width,
          splitHeight
        ),
        splitRatio: 0.5
      })
      
      // 下方分割区域
      dropZones.push({
        id: `${panelId}-split-bottom`,
        type: 'split',
        position: 'bottom',
        targetPanelId: panelId,
        rect: new DOMRect(
          panelRect.left - containerRect.left,
          panelRect.bottom - splitHeight - containerRect.top,
          panelRect.width,
          splitHeight
        ),
        splitRatio: 0.5
      })
      
      // 左侧分割区域
      dropZones.push({
        id: `${panelId}-split-left`,
        type: 'split',
        position: 'left',
        targetPanelId: panelId,
        rect: new DOMRect(
          panelRect.left - containerRect.left,
          panelRect.top - containerRect.top,
          splitWidth,
          panelRect.height
        ),
        splitRatio: 0.5
      })
      
      // 右侧分割区域
      dropZones.push({
        id: `${panelId}-split-right`,
        type: 'split',
        position: 'right',
        targetPanelId: panelId,
        rect: new DOMRect(
          panelRect.right - splitWidth - containerRect.left,
          panelRect.top - containerRect.top,
          splitWidth,
          panelRect.height
        ),
        splitRatio: 0.5
      })
      
      // 中心合并区域（用于添加选项卡到现有面板）
      dropZones.push({
        id: `${panelId}-merge-center`,
        type: 'merge',
        position: 'center',
        targetPanelId: panelId,
        rect: new DOMRect(
          panelRect.left + splitWidth - containerRect.left,
          panelRect.top + splitHeight - containerRect.top,
          panelRect.width - splitWidth * 2,
          panelRect.height - splitHeight * 2
        )
      })
    })

    // 添加空白区域的放置选项
    this.addEmptyAreaDropZones(dropZones, containerRect)
    
    this.dragState.availableDropZones = dropZones
  }

  // 添加空白区域的放置选项
  private addEmptyAreaDropZones(dropZones: DropZone[], containerRect: DOMRect) {
    // 简化版：在容器右下角添加新面板区域
    const emptyAreaSize = 200
    
    dropZones.push({
      id: 'empty-area-new',
      type: 'replace',
      position: 'center',
      rect: new DOMRect(
        containerRect.width - emptyAreaSize,
        containerRect.height - emptyAreaSize,
        emptyAreaSize,
        emptyAreaSize
      )
    })
  }

  // 检测当前鼠标位置对应的放置区域
  private detectDropZone(mouseX: number, mouseY: number): DropZone | undefined {
    return this.dragState.availableDropZones.find(zone => {
      const rect = zone.rect
      return mouseX >= rect.left && 
             mouseX <= rect.left + rect.width &&
             mouseY >= rect.top && 
             mouseY <= rect.top + rect.height
    })
  }

  // 获取当前拖拽状态
  getDragState(): DragState {
    return { ...this.dragState }
  }

  // 获取当前放置区域
  getCurrentDropZone(): DropZone | undefined {
    return this.dragState.currentDropZone
  }

  // 检查是否正在拖拽
  isDragging(): boolean {
    return this.dragState.isDragging
  }
}
