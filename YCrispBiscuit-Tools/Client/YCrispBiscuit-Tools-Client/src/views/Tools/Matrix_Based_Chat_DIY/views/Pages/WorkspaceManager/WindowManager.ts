import type { TabItem } from './types'

// 窗口间通信消息类型
export interface WindowMessage {
  type: 'INIT_TAB' | 'TAB_STATE_SYNC' | 'WINDOW_READY' | 'TAB_CLOSE' | 'TAB_UPDATE'
  data?: any
  tabId?: string
  windowId?: string
}

// 分离窗口信息
export interface DetachedWindowInfo {
  id: string
  window: Window
  tabId: string
  tab: TabItem
  url: string
  isReady: boolean
}

export class WindowManager {
  private static instance: WindowManager
  private detachedWindows = new Map<string, DetachedWindowInfo>()
  private messageHandlers = new Map<string, (message: WindowMessage) => void>()
  private windowReadyPromises = new Map<string, Promise<void>>()

  constructor() {
    this.setupMessageListener()
  }

  static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager()
    }
    return WindowManager.instance
  }

  // 创建分离的窗口
  async createDetachedWindow(tab: TabItem, sourceWindowRect?: DOMRect): Promise<string> {
    const windowId = `detached-${tab.id}-${Date.now()}`
    
    // 计算新窗口位置和尺寸
    const windowConfig = this.calculateWindowPosition(sourceWindowRect)
    
    // 构建窗口URL - 使用hash路由避免刷新问题
    const baseUrl = window.location.origin + window.location.pathname
    const windowUrl = `${baseUrl}#/matrix-chat-detached?windowId=${windowId}&tabId=${tab.id}`
    
    // 打开新窗口 - 添加更多兼容性选项
    const windowFeatures = [
      `width=${windowConfig.width}`,
      `height=${windowConfig.height}`,
      `left=${windowConfig.left}`,
      `top=${windowConfig.top}`,
      'scrollbars=yes',
      'resizable=yes',
      'status=yes',
      'toolbar=no',
      'menubar=no',
      'location=no'
    ].join(',')
    
    console.log('🚀 尝试创建窗口:', windowUrl)
    const newWindow = window.open(windowUrl, windowId, windowFeatures)

    if (!newWindow) {
      // 尝试简化方式打开
      const fallbackWindow = window.open(windowUrl, windowId)
      if (!fallbackWindow) {
        throw new Error('无法创建新窗口，请检查浏览器是否阻止了弹出窗口，或尝试手动允许弹出窗口')
      }
      console.log('✅ 使用备用方式创建窗口')
    }

    const finalWindow = newWindow || window.open(windowUrl, windowId)
    if (!finalWindow) {
      throw new Error('无法创建新窗口，请允许此网站的弹出窗口')
    }

    // 创建窗口信息
    const windowInfo: DetachedWindowInfo = {
      id: windowId,
      window: finalWindow,
      tabId: tab.id,
      tab: { ...tab },
      url: windowUrl,
      isReady: false
    }

    this.detachedWindows.set(windowId, windowInfo)

    // 等待窗口准备就绪 - 增加超时时间并改进检测逻辑
    try {
      await this.waitForWindowReady(windowId, finalWindow)
    } catch (error) {
      console.warn(`窗口初始化超时，尝试强制发送初始化数据: ${error}`)
      // 即使超时也继续，可能窗口已经准备好但消息丢失了
    }

    // 发送初始化数据 - 无论是否收到WINDOW_READY都发送
    // 确保数据可以被序列化
    const serializableTab = this.makeSerializable(tab)
    const serializableUserState = this.makeSerializable(this.getCurrentUserState())
    
    const initData: WindowMessage = {
      type: 'INIT_TAB',
      data: {
        tab: serializableTab,
        windowId: windowId,
        parentOrigin: window.location.origin,
        userState: serializableUserState
      }
    }

    this.sendMessageToWindow(windowId, initData)

    // 延迟再发送一次，确保新窗口能收到
    setTimeout(() => {
      this.sendMessageToWindow(windowId, initData)
    }, 1000)

    console.log(`✅ 成功创建分离窗口: ${windowId}`)
    return windowId
  }

  // 计算新窗口的位置和尺寸
  private calculateWindowPosition(sourceRect?: DOMRect) {
    const defaultWidth = 1000
    const defaultHeight = 700
    const offset = 50

    if (sourceRect) {
      return {
        width: Math.max(defaultWidth, sourceRect.width),
        height: Math.max(defaultHeight, sourceRect.height),
        left: sourceRect.left + offset,
        top: sourceRect.top + offset
      }
    }

    // 默认居中显示
    const screenWidth = window.screen.availWidth
    const screenHeight = window.screen.availHeight
    
    return {
      width: defaultWidth,
      height: defaultHeight,
      left: Math.max(0, (screenWidth - defaultWidth) / 2),
      top: Math.max(0, (screenHeight - defaultHeight) / 2)
    }
  }

  // 等待窗口准备就绪
  private waitForWindowReady(windowId: string, windowRef: Window): Promise<void> {
    if (this.windowReadyPromises.has(windowId)) {
      return this.windowReadyPromises.get(windowId)!
    }

    const promise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`窗口 ${windowId} 初始化超时`))
      }, 20000) // 增加到20秒超时

      let readyReceived = false

      // 监听窗口准备就绪消息
      const readyHandler = (message: WindowMessage) => {
        if (message.type === 'WINDOW_READY' && message.windowId === windowId && !readyReceived) {
          readyReceived = true
          clearTimeout(timeout)
          const windowInfo = this.detachedWindows.get(windowId)
          if (windowInfo) {
            windowInfo.isReady = true
          }
          console.log(`✅ 窗口 ${windowId} 准备就绪`)
          resolve()
        }
      }

      this.messageHandlers.set(`ready-${windowId}`, readyHandler)

      // 改进的就绪检测 - 只检查一次文档状态
      let documentChecked = false
      const checkReady = (attempts = 0) => {
        if (readyReceived) return
        
        if (windowRef.closed) {
          clearTimeout(timeout)
          reject(new Error(`窗口 ${windowId} 被提前关闭`))
          return
        }

        try {
          // 只在第一次检测到文档完成时记录
          if (!documentChecked && windowRef.document && windowRef.document.readyState === 'complete') {
            console.log(`📄 窗口 ${windowId} 文档加载完成，等待Vue应用初始化...`)
            documentChecked = true
          }
          
          // 继续检测
          if (attempts < 200) { // 最多检测20秒
            setTimeout(() => checkReady(attempts + 1), 100)
          }
        } catch (error) {
          // 跨域访问错误是正常的，继续等待
          if (attempts < 200) {
            setTimeout(() => checkReady(attempts + 1), 100)
          }
        }
      }

      // 立即开始检测，但给窗口一些时间加载
      setTimeout(() => checkReady(), 500)
    })

    this.windowReadyPromises.set(windowId, promise)
    return promise
  }

  // 发送消息到指定窗口
  sendMessageToWindow(windowId: string, message: WindowMessage) {
    const windowInfo = this.detachedWindows.get(windowId)
    if (!windowInfo || windowInfo.window.closed) {
      console.warn(`窗口 ${windowId} 不存在或已关闭`)
      return false
    }

    try {
      windowInfo.window.postMessage({
        ...message,
        windowId
      }, window.location.origin)
      return true
    } catch (error) {
      console.error(`发送消息到窗口 ${windowId} 失败:`, error)
      return false
    }
  }

  // 关闭分离窗口
  closeDetachedWindow(windowId: string) {
    const windowInfo = this.detachedWindows.get(windowId)
    if (windowInfo) {
      if (!windowInfo.window.closed) {
        windowInfo.window.close()
      }
      this.detachedWindows.delete(windowId)
      this.messageHandlers.delete(`ready-${windowId}`)
      this.windowReadyPromises.delete(windowId)
      console.log(`🗑️ 已关闭分离窗口: ${windowId}`)
    }
  }

  // 获取当前用户状态（需要根据实际情况实现）
  private getCurrentUserState() {
    try {
      // 尝试从各种可能的状态管理中获取用户状态
      const userState: any = {}
      
      // 1. 从localStorage获取Matrix相关状态
      const matrixDeviceId = localStorage.getItem('matrix_device_id')
      const matrixAccessToken = localStorage.getItem('matrix_access_token')
      const matrixUserId = localStorage.getItem('matrix_user_id')
      const matrixBaseUrl = localStorage.getItem('matrix_base_url')
      
      if (matrixAccessToken && matrixUserId) {
        userState.matrix = {
          accessToken: matrixAccessToken,
          userId: matrixUserId,
          deviceId: matrixDeviceId,
          baseUrl: matrixBaseUrl || 'https://matrix.org'
        }
        console.log('📊 已获取Matrix登录状态:', { userId: matrixUserId, hasToken: !!matrixAccessToken })
      }
      
      // 2. 从sessionStorage获取会话状态
      const sessionData = sessionStorage.getItem('matrix_session')
      if (sessionData) {
        try {
          userState.session = JSON.parse(sessionData)
        } catch (e) {
          console.warn('解析会话数据失败:', e)
        }
      }
      
      // 3. 尝试从可能的全局状态获取
      if (typeof window !== 'undefined') {
        // 检查是否有全局的Matrix客户端实例
        const globalMatrix = (window as any).matrixClient || (window as any).__MATRIX_CLIENT__
        if (globalMatrix && globalMatrix.getAccessToken) {
          userState.matrixClient = {
            accessToken: globalMatrix.getAccessToken(),
            userId: globalMatrix.getUserId(),
            deviceId: globalMatrix.getDeviceId(),
            baseUrl: globalMatrix.getBaseUrl()
          }
          console.log('📊 从全局Matrix客户端获取状态')
        }
      }
      
      // 4. 添加当前页面状态
      userState.currentPage = {
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }
      
      console.log('📋 获取到的完整用户状态:', userState)
      return userState
      
    } catch (error) {
      console.error('获取用户状态失败:', error)
      return {
        error: '无法获取用户状态',
        timestamp: Date.now()
      }
    }
  }

  // 设置消息监听器
  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      // 验证消息来源
      if (event.origin !== window.location.origin) {
        return
      }

      const message: WindowMessage = event.data
      console.log(`📥 主窗口收到消息:`, message)
      
      // 处理通用消息
      this.messageHandlers.forEach((handler) => {
        handler(message)
      })

      // 处理特定类型的消息
      switch (message.type) {
        case 'WINDOW_READY':
          console.log(`✅ 收到窗口准备就绪消息: ${message.windowId}`)
          // 窗口准备就绪的处理在 waitForWindowReady 中
          break
        
        case 'TAB_CLOSE':
          if (message.windowId) {
            this.closeDetachedWindow(message.windowId)
          }
          break
        
        default:
          console.log('收到未处理的窗口消息:', message)
      }
    })

    // 监听窗口关闭事件
    window.addEventListener('beforeunload', () => {
      // 关闭所有分离窗口
      this.detachedWindows.forEach((windowInfo) => {
        if (!windowInfo.window.closed) {
          windowInfo.window.close()
        }
      })
    })
  }

  // 获取所有分离窗口信息
  getDetachedWindows(): DetachedWindowInfo[] {
    return Array.from(this.detachedWindows.values())
  }

  // 检查窗口是否存在
  hasWindow(windowId: string): boolean {
    const windowInfo = this.detachedWindows.get(windowId)
    return windowInfo !== undefined && !windowInfo.window.closed
  }

  // 确保对象可以被序列化（移除Proxy和不可序列化的属性）
  private makeSerializable(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }
    
    try {
      // 先尝试JSON序列化/反序列化来清理对象
      return JSON.parse(JSON.stringify(obj))
    } catch (error) {
      console.warn('对象序列化失败，使用简化版本:', error)
      
      // 如果失败，手动创建简化版本
      if (typeof obj === 'object') {
        const simplified: any = {}
        for (const key in obj) {
          try {
            const value = obj[key]
            if (typeof value === 'function') {
              // 跳过函数
              continue
            } else if (typeof value === 'object' && value !== null) {
              // 递归处理对象
              simplified[key] = this.makeSerializable(value)
            } else {
              // 基本类型直接复制
              simplified[key] = value
            }
          } catch (e) {
            // 如果某个属性无法访问，跳过
            console.warn(`跳过属性 ${key}:`, e)
          }
        }
        return simplified
      }
      
      return obj
    }
  }
}

// 导出单例实例
export const windowManager = WindowManager.getInstance()
