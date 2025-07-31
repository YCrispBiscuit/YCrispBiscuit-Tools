// 功能面板定义
export interface PanelFunction {
  id: string
  name: string
  icon: string
  description: string
  component: string
  category: 'communication' | 'productivity' | 'system'
}

// Vue Grid Layout 项目定义
export interface GridLayoutItem {
  i: string          // 唯一标识符
  x: number          // x 坐标
  y: number          // y 坐标
  w: number          // 宽度 (网格单位)
  h: number          // 高度 (网格单位)
  static?: boolean   // 是否静态 (不可拖拽/缩放)
  tabs?: TabItem[]   // 选项卡列表
  activeTab?: string // 当前激活的选项卡
}

// 选项卡定义
export interface TabItem {
  id: string
  title: string
  component: string
  props?: Record<string, any>
  closeable?: boolean
}

// 浮动窗口定义
export interface FloatingWindow {
  id: string
  title: string
  component: string
  props?: Record<string, any>
  x: number
  y: number
  width: number
  height: number
  minimized?: boolean
  maximized?: boolean
}

// 拖拽检测区域
export interface DropZone {
  id: string
  type: 'empty' | 'existing'
  zone?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  gridPosition?: { x: number; y: number; w: number; h: number }
  targetId?: string
}

// 面板属性 (传递给各个功能组件的 props)
export interface PanelProps {
  currentRoomId?: string
  roomName?: string
  message?: string
  sending?: boolean
  messages?: any[]
  currentUserId?: string
}
