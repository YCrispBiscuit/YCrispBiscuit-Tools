<template>
  <div class="detached-window">
    <!-- 窗口标题栏 -->
    <div class="window-title-bar">
      <div class="title-bar-content">
        <span class="window-title">{{ windowTitle }}</span>
        <div class="title-bar-controls">
          <button 
            class="control-button minimize"
            @click="minimizeWindow"
            title="最小化"
          >
            −
          </button>
          <button 
            class="control-button close"
            @click="closeWindow"
            title="关闭"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="window-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载选项卡内容...</p>
      </div>
      
      <div v-else-if="errorMessage" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p>{{ errorMessage }}</p>
        <button @click="retryLoad" class="retry-button">重试</button>
      </div>

      <div v-else-if="tabComponent" class="tab-content">
        <component 
          :is="tabComponent"
          v-bind="tabProps"
          :is-detached="true"
          :window-id="windowId"
        />
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>等待内容加载</h3>
        <p>正在准备选项卡内容...</p>
      </div>
    </div>

    <!-- 拖拽回收区域提示 -->
    <div 
      v-if="showDragDropHint" 
      class="drag-drop-hint"
    >
      <div class="hint-content">
        <span class="hint-icon">↩️</span>
        <span class="hint-text">将此窗口拖拽回主窗口以重新集成</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, defineAsyncComponent, nextTick } from 'vue'
import type { TabItem } from './WorkspaceManager/types'
import type { WindowMessage } from './WorkspaceManager/WindowManager'

// 状态管理
const isLoading = ref(true)
const errorMessage = ref('')
const currentTab = ref<TabItem | null>(null)
const windowId = ref('')
const parentOrigin = ref('')
const userState = ref<any>(null)
const showDragDropHint = ref(false)

// 计算属性
const windowTitle = computed(() => {
  if (currentTab.value) {
    return `${currentTab.value.title} - Matrix Chat`
  }
  return 'Matrix Chat - 分离窗口'
})

const tabProps = computed(() => {
  if (!currentTab.value) return {}
  
  return {
    ...currentTab.value.props,
    // 传递用户状态到组件
    ...(userState.value || {}),
    // 标识这是分离窗口
    isDetached: true,
    windowId: windowId.value
  }
})

// 组件映射 - 与主窗口保持一致
const componentMap = {
  Chat: defineAsyncComponent(() => import('./RightContent/Chat/index.vue')),
  FileManager: defineAsyncComponent(() => import('./RightContent/FileManager/index.vue')),
  Calendar: defineAsyncComponent(() => import('./RightContent/Calendar/index.vue')),
  Notes: defineAsyncComponent(() => import('./RightContent/Notes/index.vue')),
  UserInfo: defineAsyncComponent(() => import('./RightContent/UserInfo/index.vue')),
  NotificationPanel: defineAsyncComponent(() => import('./RightContent/NotificationPanel/index.vue'))
}

const tabComponent = computed(() => {
  if (!currentTab.value) return null
  
  const componentName = currentTab.value.component as keyof typeof componentMap
  return componentMap[componentName] || null
})

// 窗口控制方法
const minimizeWindow = () => {
  window.blur()
}

const closeWindow = () => {
  // 通知父窗口关闭
  sendMessageToParent({
    type: 'TAB_CLOSE',
    windowId: windowId.value,
    tabId: currentTab.value?.id
  })
  
  // 关闭窗口
  window.close()
}

const retryLoad = () => {
  errorMessage.value = ''
  isLoading.value = true
  
  // 首先尝试重新发送WINDOW_READY消息
  sendMessageToParent({
    type: 'WINDOW_READY',
    windowId: windowId.value
  })
  
  // 如果3秒后还没收到回应，尝试从URL参数直接初始化
  setTimeout(() => {
    if (isLoading.value && !currentTab.value) {
      console.log('🔄 尝试备用初始化方式')
      tryFallbackInitialization()
    }
  }, 3000)
}

// 备用初始化方式 - 从URL参数和localStorage恢复基本状态
const tryFallbackInitialization = () => {
  try {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
    const tabId = urlParams.get('tabId') || ''
    
    if (!tabId) {
      throw new Error('无法从URL获取tabId')
    }
    
    // 从tabId推断组件类型
    let componentType = 'Chat' // 默认
    if (tabId.includes('FileManager')) componentType = 'FileManager'
    else if (tabId.includes('Calendar')) componentType = 'Calendar'
    else if (tabId.includes('Notes')) componentType = 'Notes'
    else if (tabId.includes('UserInfo')) componentType = 'UserInfo'
    else if (tabId.includes('NotificationPanel')) componentType = 'NotificationPanel'
    
    // 创建基本的tab对象
    const basicTab: TabItem = {
      id: tabId,
      title: getComponentDisplayName(componentType),
      component: componentType,
      props: {},
      closeable: true
    }
    
    // 设置基本状态
    currentTab.value = basicTab
    windowId.value = urlParams.get('windowId') || ''
    parentOrigin.value = window.location.origin
    
    // 尝试恢复用户状态
    restoreMatrixState({
      matrix: {
        accessToken: localStorage.getItem('matrix_access_token'),
        userId: localStorage.getItem('matrix_user_id'),
        deviceId: localStorage.getItem('matrix_device_id'),
        baseUrl: localStorage.getItem('matrix_base_url')
      }
    })
    
    document.title = windowTitle.value
    isLoading.value = false
    
    console.log('✅ 备用初始化成功:', basicTab.title)
  } catch (error) {
    console.error('备用初始化失败:', error)
    errorMessage.value = '初始化失败，请关闭窗口重试'
    isLoading.value = false
  }
}

// 获取组件显示名称
const getComponentDisplayName = (componentType: string): string => {
  const nameMap: Record<string, string> = {
    'Chat': '聊天',
    'FileManager': '文件管理',
    'Calendar': '日历',
    'Notes': '笔记',
    'UserInfo': '用户信息',
    'NotificationPanel': '通知'
  }
  return nameMap[componentType] || componentType
}

// 消息通信
const sendMessageToParent = (message: WindowMessage) => {
  // 如果parentOrigin未设置，使用当前页面的origin
  const targetOrigin = parentOrigin.value || window.location.origin
  
  if (!window.opener) {
    console.warn('没有父窗口引用，无法发送消息')
    return
  }
  
  try {
    console.log(`📤 发送消息到父窗口:`, message, `目标域: ${targetOrigin}`)
    window.opener.postMessage(message, targetOrigin)
  } catch (error) {
    console.error('发送消息到父窗口失败:', error)
  }
}

// 处理来自父窗口的消息
const handleMessage = (event: MessageEvent) => {
  // 安全检查
  if (!parentOrigin.value && event.origin === window.location.origin) {
    parentOrigin.value = event.origin
  } else if (event.origin !== parentOrigin.value) {
    console.warn('收到来自未知来源的消息:', event.origin)
    return
  }

  const message: WindowMessage = event.data
  
  switch (message.type) {
    case 'INIT_TAB':
      handleInitTab(message.data)
      break
      
    case 'TAB_STATE_SYNC':
      handleTabStateSync(message.data)
      break
      
    default:
      console.log('收到未处理的消息:', message)
  }
}

// 处理选项卡初始化
const handleInitTab = (data: any) => {
  try {
    if (!data || !data.tab) {
      throw new Error('缺少选项卡数据')
    }
    
    currentTab.value = data.tab
    windowId.value = data.windowId || ''
    parentOrigin.value = data.parentOrigin || window.location.origin
    userState.value = data.userState
    
    // 恢复Matrix登录状态
    restoreMatrixState(data.userState)
    
    // 更新窗口标题
    document.title = windowTitle.value
    
    isLoading.value = false
    
    console.log('✅ 分离窗口初始化成功:', currentTab.value?.title)
  } catch (error: any) {
    console.error('初始化分离窗口失败:', error)
    errorMessage.value = `初始化失败: ${error?.message || '未知错误'}`
    isLoading.value = false
  }
}

// 恢复Matrix登录状态
const restoreMatrixState = (userStateData: any) => {
  if (!userStateData) {
    console.warn('没有用户状态数据可恢复')
    return
  }
  
  try {
    // 恢复localStorage中的Matrix状态
    if (userStateData.matrix) {
      const { accessToken, userId, deviceId, baseUrl } = userStateData.matrix
      
      if (accessToken && userId) {
        localStorage.setItem('matrix_access_token', accessToken)
        localStorage.setItem('matrix_user_id', userId)
        
        if (deviceId) localStorage.setItem('matrix_device_id', deviceId)
        if (baseUrl) localStorage.setItem('matrix_base_url', baseUrl)
        
        console.log('✅ 已恢复Matrix登录状态:', { userId, hasToken: !!accessToken })
      }
    }
    
    // 恢复sessionStorage
    if (userStateData.session) {
      sessionStorage.setItem('matrix_session', JSON.stringify(userStateData.session))
    }
    
    // 恢复全局Matrix客户端状态（如果需要）
    if (userStateData.matrixClient && typeof window !== 'undefined') {
      (window as any).__MATRIX_CLIENT_STATE__ = userStateData.matrixClient
      console.log('✅ 已设置全局Matrix客户端状态')
    }
    
    console.log('🔄 Matrix状态恢复完成')
  } catch (error) {
    console.error('恢复Matrix状态失败:', error)
  }
}

// 处理状态同步
const handleTabStateSync = (data: any) => {
  if (data && currentTab.value) {
    // 更新选项卡属性
    currentTab.value.props = { ...currentTab.value.props, ...data.props }
    userState.value = { ...userState.value, ...data.userState }
  }
}

// 设置拖拽提示
const setupDragDropHint = () => {
  let dragDropTimer: number | null = null
  
  const showHint = () => {
    showDragDropHint.value = true
    if (dragDropTimer) {
      clearTimeout(dragDropTimer)
    }
    dragDropTimer = setTimeout(() => {
      showDragDropHint.value = false
    }, 3000)
  }
  
  // 监听键盘快捷键显示提示
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'h') {
      event.preventDefault()
      showHint()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    if (dragDropTimer) {
      clearTimeout(dragDropTimer)
    }
  }
}

// 从URL参数获取初始信息
const initFromUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  windowId.value = urlParams.get('windowId') || ''
  const tabId = urlParams.get('tabId') || ''
  
  console.log(`🔍 初始化分离窗口: windowId=${windowId.value}, tabId=${tabId}`)
  
  if (!windowId.value || !tabId) {
    errorMessage.value = '无效的窗口参数'
    isLoading.value = false
    return
  }
  
  // 设置父窗口来源（使用当前页面的origin）
  parentOrigin.value = window.location.origin
  
  // 立即通知父窗口准备就绪 - 多次尝试确保送达
  const sendReadyMessage = () => {
    const readyMessage = {
      type: 'WINDOW_READY' as const,
      windowId: windowId.value,
      tabId
    }
    
    console.log(`📡 发送准备就绪消息:`, readyMessage)
    sendMessageToParent(readyMessage)
  }
  
  // 立即发送一次
  sendReadyMessage()
  
  // 100ms后再发送一次（防止父窗口错过）
  setTimeout(sendReadyMessage, 100)
  
  // 500ms后再发送一次（防止初始化顺序问题）
  setTimeout(sendReadyMessage, 500)
}

// 生命周期
onMounted(() => {
  console.log('🚀 分离窗口挂载完成')
  
  // 设置消息监听
  window.addEventListener('message', handleMessage)
  
  // 设置拖拽提示
  const cleanupDragHint = setupDragDropHint()
  
  // 等待DOM完全准备好后再初始化
  nextTick(() => {
    console.log('📋 DOM准备完成，开始初始化')
    // 从URL参数初始化
    initFromUrlParams()
    
    // 5秒后如果还没有收到初始化数据，显示重试按钮
    setTimeout(() => {
      if (isLoading.value && !currentTab.value) {
        console.warn('⚠️ 5秒内未收到初始化数据，可能存在通信问题')
        errorMessage.value = '窗口初始化超时，请点击重试或检查主窗口状态'
        isLoading.value = false
      }
    }, 5000)
  })
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('message', handleMessage)
    cleanupDragHint()
    console.log('🗑️ 分离窗口卸载')
  })
})

// 处理窗口关闭
onUnmounted(() => {
  console.log('🗑️ 分离窗口卸载')
})
</script>

<style scoped>
.detached-window {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  overflow: hidden;
}

/* 窗口标题栏 */
.window-title-bar {
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  padding: 0;
  -webkit-app-region: drag;
  user-select: none;
  min-height: 32px;
  flex-shrink: 0;
}

.title-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 12px;
}

.window-title {
  font-size: 14px;
  font-weight: 500;
  color: #e0e0e0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-bar-controls {
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;
}

.control-button {
  width: 28px;
  height: 20px;
  background: transparent;
  border: none;
  color: #c0c0c0;
  cursor: pointer;
  border-radius: 2px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.control-button.close:hover {
  background: #e74c3c;
  color: white;
}

/* 主内容区域 */
.window-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 加载状态 */
.loading-state,
.error-state,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #444;
  border-top: 3px solid #007acc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.error-state h3,
.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #e0e0e0;
}

.error-state p,
.empty-state p {
  margin: 0;
  color: #999;
  font-size: 14px;
  line-height: 1.4;
}

.retry-button {
  background: #007acc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background: #005a9e;
}

/* 拖拽提示 */
.drag-drop-hint {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 122, 204, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.hint-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-icon {
  font-size: 16px;
}

.hint-text {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .window-title-bar {
    min-height: 40px;
  }
  
  .title-bar-content {
    height: 40px;
    padding: 0 8px;
  }
  
  .control-button {
    width: 32px;
    height: 24px;
  }
  
  .loading-state,
  .error-state,
  .empty-state {
    padding: 20px 16px;
  }
}
</style>
