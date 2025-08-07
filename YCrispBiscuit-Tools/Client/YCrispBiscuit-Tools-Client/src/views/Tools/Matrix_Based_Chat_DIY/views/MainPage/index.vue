<template>
    <div class="matrix-chat-app">
        <div class="discord-layout">
            <!-- 左侧功能列表组件 -->
            <div class="function-sidebar" :style="{ width: functionSidebarWidth }">
                <LeftList :user-initials="getUserInitials()" :current-function="currentFunction"
                    @userInfo="handleUserInfo" @function-change="handleFunctionChange" />
            </div>

            <!-- 拖拽分隔条 (只在频道列表展开时显示) -->
            <div  class="resizer" 
                title=""></div>

            <!-- 中间频道/功能区域组件 -->
            <div v-if="currentFunctionNeedsMiddleList" class="channel-sidebar" :style="{ width: channelSidebarWidth }">
                <MiddleList :user-id="props.userId" :current-room-id="currentRoomId" :rooms="rooms"
                    @select-room="handleSelectRoom" @join-room="handleJoinRoom" @refresh-rooms="handleRefreshRooms" />
            </div>

            <!-- 拖拽分隔条 (只在频道列表展开时显示) -->
            <div v-if="shouldShowMiddleList" class="resizer" @mousedown="startResize($event, 'channel')"
                title="拖拽调整频道区域宽度"></div>

            <!-- 右侧主内容区域组件 -->
            <div class="main-chat-area">
                <WorkspaceManager v-if="currentFunction === 'rooms'" />
                <UserInfo v-else-if="currentFunction === 'userInfo'" :user-id="props.userId" @logout="handleLogout" />
            </div>
        </div>




        
        <!-- 悬浮的侧边栏切换按钮 (绝对定位，不占用布局空间) -->
        <div class="floating-toggles">
            <!-- 功能栏切换按钮 (红色) -->
            <div class="floating-toggle function-toggle" @click="toggleFunctionSidebar"
                :style="getFunctionToggleStyle()">
                <span>{{ isFunctionSidebarCollapsed ? '▶' : '◀' }}</span>
            </div>

            <!-- 频道列表切换按钮 (绿色) -->
            <div v-if="shouldShowChannelToggle()" class="floating-toggle channel-toggle" @click="toggleChannelSidebar"
                :style="getChannelToggleStyle()">
                <span>{{ isChannelSidebarCollapsed ? '▶' : '◀' }}</span>
            </div>
        </div>

        <!-- 主题切换悬浮按钮 -->
        <div class="theme-toggle-btn" @click="toggleTheme">
            <span v-if="theme==='light'">L</span>
            <span v-else>D</span>
        </div>
        <!-- 设备验证弹窗 -->
        <DeviceVerification ref="deviceVerificationRef" />
    </div>
</template>

<script setup lang="ts">




import { ref, computed, onMounted, provide } from 'vue'
import LeftList from '../Pages/LeftList'
import MiddleList from '../Pages/MiddleList'
import WorkspaceManager from '../Pages/WorkspaceManager'
import DeviceVerification from '../../components/DeviceVerification'
import { matrixClient } from '../../services/matrix/client'
import { roomService } from '../../services/matrix/rooms'
import { messageService } from '../../services/matrix/messages'
import type { MatrixMessage, MatrixRoom } from '../../types'

import UserInfo from '../../views/Pages/RightContent/UserInfo'






// 主题切换逻辑

const theme = ref('light');
function setTheme(t: 'light' | 'dark') {
  theme.value = t;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}
function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light');
}
onMounted(() => {
  const saved = localStorage.getItem('theme');
  setTheme(saved === 'dark' ? 'dark' : 'light');
});
















/**
 * Chat页面组件
 * 负责聊天界面的展示和交互，需要在已登录状态下使用
 */

// 状态管理 - 接收父级传递的用户信息
const props = defineProps<{
    userId: string
}>()

// 发出事件 - 通知父级需要登出
const emit = defineEmits<{
    logout: []
}>()


// 聊天状态
const currentRoomId = ref('')
const newMessage = ref('')
const sending = ref(false)
const messages = ref<MatrixMessage[]>([])
const rooms = ref<MatrixRoom[]>([])

// 处理个人中心按钮点击
const handleUserInfo = () => {
    currentFunction.value = 'userInfo';
};

// 设备验证弹窗组件引用
const deviceVerificationRef = ref<InstanceType<typeof DeviceVerification> | null>(null)

// Discord布局状态
const currentFunction = ref<'rooms' | 'userInfo'>('rooms')

// 定义哪些功能需要显示中间列表
const functionsNeedingMiddleList = ['rooms'] // 只有聊天功能需要房间列表

// 拖拽调整宽度相关状态
const channelSidebarBaseWidth = ref(240) // 频道区域基础宽度
const isResizing = ref(false)
const resizeType = ref<'channel' | null>(null)

// 侧边栏折叠状态
const isFunctionSidebarCollapsed = ref(false) // 功能侧边栏折叠状态
const isChannelSidebarCollapsed = ref(false)  // 频道侧边栏折叠状态

// 计算属性：动态宽度
const functionSidebarWidth = computed(() => {
    return isFunctionSidebarCollapsed.value ? '0px' : '72px'
})

// 计算属性：是否当前功能需要中间列表
const currentFunctionNeedsMiddleList = computed(() => {
    return functionsNeedingMiddleList.includes(currentFunction.value)
})

// 计算属性：中间列表是否应该显示
const shouldShowMiddleList = computed(() => {
    return currentFunctionNeedsMiddleList.value && !isChannelSidebarCollapsed.value
})

const channelSidebarWidth = computed(() => {
    // 如果当前功能不需要中间列表，强制宽度为0
    if (!currentFunctionNeedsMiddleList.value) {
        return '0px'
    }
    return isChannelSidebarCollapsed.value ? '0px' : channelSidebarBaseWidth.value + 'px'
})

// 计算属性：当前房间的消息
const currentRoomMessages = computed(() => {
    return messages.value.filter(msg => msg.roomId === currentRoomId.value)
})

// 处理功能切换
const handleFunctionChange = (newFunction: 'rooms' | 'userInfo') => {
    currentFunction.value = newFunction
    console.log(`切换到功能: ${newFunction}`)

    // 如果切换到不需要中间列表的功能，自动收起频道侧边栏
    if (!functionsNeedingMiddleList.includes(newFunction)) {
        isChannelSidebarCollapsed.value = true
        console.log('当前功能不需要频道列表，已自动收起')
    }
}

// 处理登出
const handleLogout = () => {
    // 退出但保留用户名，清除访问令牌
    matrixClient.用户登出(true)  // true表示保留用户名
    emit('logout')
}

// 打开设备验证弹窗
const openDeviceVerification = () => {
    console.log('打开设备验证弹窗')
    if (deviceVerificationRef.value) {
        deviceVerificationRef.value.openVerification()
    }
}

// 初始化聊天页面
const initializeChat = async () => {
    try {
        // 设置消息监听
        messageService.设置消息监听器((message: MatrixMessage) => {
            messages.value.push(message)
        })

        // 获取房间列表
        handleRefreshRooms()

        console.log('聊天页面初始化完成')
    } catch (err: any) {
        console.error('聊天页面初始化失败：', err)
    }
}

// 处理选择房间
const handleSelectRoom = async (roomId: string) => {
    currentRoomId.value = roomId

    // 加载房间历史消息
    const roomMessages = await messageService.获取房间历史消息(roomId)

    // 清除当前房间的旧消息，添加历史消息
    messages.value = messages.value.filter(msg => msg.roomId !== roomId)
    messages.value.push(...roomMessages)

    console.log(`已加载房间 ${roomId} 的 ${roomMessages.length} 条历史消息`)
}

// 处理加入房间
const handleJoinRoom = async (roomIdOrAlias: string) => {
    try {
        await roomService.加入房间(roomIdOrAlias)
        console.log("成功加入房间：", roomIdOrAlias)
        handleRefreshRooms()
    } catch (err: any) {
        console.error("加入房间失败：", err)
        alert("加入房间失败，请检查房间ID是否正确")
    }
}

// 处理刷新房间列表
const handleRefreshRooms = () => {
    const newRooms = roomService.获取房间列表()
    rooms.value = newRooms
}

// 处理发送消息
const handleSendMessage = async (messageContent?: string) => {
    // 如果传入了消息内容，使用传入的；否则使用当前的 newMessage
    const messageToSend = messageContent || newMessage.value.trim()
    
    if (!messageToSend || !currentRoomId.value) return

    sending.value = true
    try {
        await messageService.发送文本消息(currentRoomId.value, messageToSend)
        console.log("消息发送成功：", messageToSend)
        
        // 如果使用的是 newMessage，清空它；如果是传入的参数，不需要清空（InputArea会自己清空）
        if (!messageContent) {
            newMessage.value = ''
        }
    } catch (err: any) {
        console.error("发送消息失败：", err)
        alert(err.message || "发送消息失败")
    } finally {
        sending.value = false
    }
}

// 获取当前房间名称
const getCurrentRoomName = () => {
    const room = rooms.value.find(r => r.roomId === currentRoomId.value)
    return room ? room.name : currentRoomId.value
}

const getUserInitials = () => {
    const name = props.userId.split(':')[0].replace('@', '')
    return name.charAt(0).toUpperCase()
}

// 拖拽调整大小相关方法
const startResize = (event: MouseEvent, type: 'channel') => {
    event.preventDefault()
    isResizing.value = true
    resizeType.value = type

    // 添加全局鼠标事件监听
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)

    // 添加选择禁用样式，防止拖拽时选中文本
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
}

const handleResize = (event: MouseEvent) => {
    if (!isResizing.value || !resizeType.value) return

    if (resizeType.value === 'channel') {
        // 计算新的宽度（相对于功能栏右侧）
        const functionSidebarWidthPx = isFunctionSidebarCollapsed.value ? 0 : 72
        const newWidth = event.clientX - functionSidebarWidthPx

        // 限制最小和最大宽度
        const minWidth = 180
        const maxWidth = 400

        channelSidebarBaseWidth.value = Math.max(minWidth, Math.min(maxWidth, newWidth))
    }
}

const stopResize = () => {
    isResizing.value = false
    resizeType.value = null

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)

    // 恢复样式
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
}

// 侧边栏折叠切换方法
const toggleFunctionSidebar = () => {
    isFunctionSidebarCollapsed.value = !isFunctionSidebarCollapsed.value
    console.log(`功能侧边栏${isFunctionSidebarCollapsed.value ? '已收起' : '已展开'}`)
}

const toggleChannelSidebar = () => {
    isChannelSidebarCollapsed.value = !isChannelSidebarCollapsed.value
    console.log(`频道侧边栏${isChannelSidebarCollapsed.value ? '已收起' : '已展开'}`)

    // 当频道侧边栏收起时，清除当前选择的房间（可选）
    if (isChannelSidebarCollapsed.value) {
        // currentRoomId.value = '' // 如果希望收起时清除选择，取消注释这行
    }
}

// 按钮样式计算方法（包含位置和圆角）
const getFunctionToggleStyle = () => {
    const position = getFunctionTogglePosition()
    const borderRadius = isFunctionSidebarCollapsed.value
        ? '0 12px 12px 0'  // 收起状态：右半圆（向右突出）
        : '12px 0 0 12px'  // 展开状态：左半圆（向左突出）

    return {
        ...position,
        borderRadius,
        // 添加CSS变量来控制悬停方向
        '--hover-direction': isFunctionSidebarCollapsed.value ? '2px' : '-2px'
    }
}

const getChannelToggleStyle = () => {
    const position = getChannelTogglePosition()
    let borderRadius
    let hoverDirection

    if (isChannelSidebarCollapsed.value) {
        if (isFunctionSidebarCollapsed.value) {
            // 都收起：不显示，但设置默认样式
            borderRadius = '0 12px 12px 0'
            hoverDirection = '2px'
        } else {
            // 红色展开，绿色收起：向右突出
            borderRadius = '0 12px 12px 0'
            hoverDirection = '2px'
        }
    } else {
        // 绿色展开：向左突出
        borderRadius = '12px 0 0 12px'
        hoverDirection = '-2px'
    }

    return {
        ...position,
        borderRadius,
        '--hover-direction': hoverDirection
    }
}

// 原有的位置计算方法保留
const getFunctionTogglePosition = () => {
    if (isFunctionSidebarCollapsed.value) {
        // 红色收起状态：贴着浏览器最左侧
        return { left: '0px' }
    } else {
        // 红色展开状态：在区域1内，贴着1与2的交界处但在交界处左侧
        const functionWidth = 72 // 功能栏固定宽度
        return { left: `${functionWidth - 24}px` } // 24px是按钮宽度
    }
}

const getChannelTogglePosition = () => {
    const functionWidth = isFunctionSidebarCollapsed.value ? 0 : 72 // 功能栏固定宽度
    const channelWidth = isChannelSidebarCollapsed.value ? 0 : channelSidebarBaseWidth.value

    if (isChannelSidebarCollapsed.value) {
        if (isFunctionSidebarCollapsed.value) {
            // 红绿都收起：不显示绿色按钮（通过shouldShowChannelToggle控制）
            return { left: '0px' }
        } else {
            // 红色未收起但绿色收起：绿色在区域3内，贴着1与3交界处但在交界处右侧
            return { left: `${functionWidth}px` }
        }
    } else {
        // 绿色展开状态：在区域2内，贴着2与3的交界处但在交界处左侧
        return { left: `${functionWidth + channelWidth - 24}px` } // 24px是按钮宽度
    }
}

const shouldShowChannelToggle = () => {
    // 当前功能不需要中间列表时，不显示绿色按钮
    if (!currentFunctionNeedsMiddleList.value) {
        return false
    }
    // 当红绿都收起时，隐藏绿色按钮
    return !(isFunctionSidebarCollapsed.value && isChannelSidebarCollapsed.value)
}

// 组件挂载时初始化
onMounted(() => {
    initializeChat()

    // 监听Matrix重新登录事件
    const handleMatrixRelogin = (event: any) => {
        const reason = event.detail?.reason || '需要重新登录'
        console.log('🔄 MainPage收到重新登录请求:', reason)
        
        // 直接触发登出，回到登录页面
        handleLogout()
    }
    window.addEventListener('matrix:needRelogin', handleMatrixRelogin)

    // 添加快捷键测试设备验证弹窗（Ctrl+R）
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault()
            openDeviceVerification()
        }
    }
    document.addEventListener('keydown', handleKeydown)

    // 清理函数
    const cleanup = () => {
        document.removeEventListener('keydown', handleKeydown)
        window.removeEventListener('matrix:needRelogin', handleMatrixRelogin)
    }

    // 返回清理函数给onUnmounted使用
    return cleanup
})

// 提供聊天上下文给所有子组件
provide('chatContext', {
    // 状态数据 - 直接提供refs，避免不必要的computed包装
    currentRoomId: currentRoomId,
    roomName: computed(() => getCurrentRoomName()),
    message: newMessage,
    sending: sending,
    messages: currentRoomMessages,
    currentUserId: computed(() => props.userId),

    // 方法
    sendMessage: handleSendMessage,
    logout: handleLogout  // 添加logout方法到context中
})
</script>

<style scoped>
/* 主题切换按钮样式 */
.theme-toggle-btn {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 9999;
  width: 48px;
  height: 48px;
  background: var(--bg-color-secondary);
  color: var(--text-color);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  border: 2px solid var(--border-color);
  transition: background 0.3s, color 0.3s;
}
.theme-toggle-btn:hover {
  background: var(--color-primary);
  color: #fff;
}





/* Discord风格布局 */
.matrix-chat-app {
    height: 100vh;
    display: flex;
    flex-direction: column;
     background-color: var(--bg-color-secondary);
    color: var(--text-color);
}

.discord-layout {
    display: flex;
    height: 100vh;
}

/* 左侧功能栏 - 只保留布局相关样式 */
.function-sidebar {
    transition: width 0.3s ease;
    overflow: hidden;
    position: relative;
    z-index: 3;
    min-width: 0;
    /* 允许完全收缩 */
}

/* 悬浮切换按钮容器 */
.floating-toggles {
    position: fixed;
    top: 0;
    left: 3.5px;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* 让容器不阻挡鼠标事件 */
    z-index: 1000;
}

/* 单个悬浮按钮 */
.floating-toggle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 48px;
    background-color: rgba(88, 101, 242, 0.9);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    /* 圆角由JavaScript动态设置 */
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 600;
    user-select: none;
    pointer-events: auto;
    /* 恢复按钮的鼠标事件 */
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
}

/* 移除悬浮动画效果 */
/* .floating-toggle:hover {
    width: 32px;
    background-color: rgba(71, 82, 196, 0.95);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
    transform: translateY(-50%) translateX(var(--hover-direction, 2px));
} */

/* 功能栏按钮样式 */
.floating-toggle.function-toggle {
    background-color: rgba(124, 124, 124, 0.9);
}

/* 移除红色按钮悬浮效果 */
/* .floating-toggle.function-toggle:hover {
    background-color: rgba(194, 62, 65, 0.95);
} */

/* 频道列表按钮样式 */
.floating-toggle.channel-toggle {
    background-color: rgba(124, 124, 124, 0.9);
}

/* 移除绿色按钮悬浮效果 */
/* .floating-toggle.channel-toggle:hover {
    background-color: rgba(59, 165, 93, 0.95);
} */

.logout-btn:hover {
    background-color: #c23e41;
}

/* 中间频道/功能区域 */
.channel-sidebar {
   background-color: var(--bg-color-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    overflow: hidden;
    position: relative;
    z-index: 2;
    min-width: 0;
    /* 允许完全收缩 */
}

/* 拖拽分隔条样式 */
.resizer {
    width: 4px;
    background-color: var(--color-secondary);
    cursor: col-resize;
    position: relative;
    transition: background-color 0.2s ease;
}

.resizer:hover {
    background-color: var(--color-secondary);
}

.resizer:active {
    background-color: var(--color-secondary);
}

.channels-view,
.function-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.channels-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-color-secondary);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.header-content {
    flex: 1;
}

.function-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-color-secondary);
}

.channels-header h3,
.function-header h3 {
    margin: 0 0 8px 0;
    color: var(--text-color);
    font-size: 16px;
    font-weight: 600;
}

.user-id {
    font-size: 12px;
    color: var(--text-color-secondary);
}

.function-content {
    flex: 1;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

/* 右侧主聊天区域 */
.main-chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color-secondary);
    position: relative;
}

.chat-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chat-header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-color-secondary);
}

.chat-header h4 {
    margin: 0;
    color: var(--text-color);
    font-size: 16px;
    font-weight: 600;
}

.chat-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.room-id {
    font-size: 12px;
    color: var(--text-color-secondary);
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
   background-color: var(--bg-color-secondary);
}

.message-input-area {
    padding: 16px;
     background-color: var(--bg-color-secondary);
}

.message-input {
    display: flex;
    gap: 8px;
    background-color: var(--border-color);
    border-radius: 8px;
    padding: 12px;
}

.message-input input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-color);
    font-size: 14px;
    outline: none;
}

.message-input input::placeholder {
    color: var(--text-color-secondary);
}

.send-button {
    padding: 8px 16px;
    background-color: var(--color-primary);
    color: var(--text-color);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s ease;
}

.send-button:hover:not(:disabled) {
     background-color: var(--color-primary-hover, #4752c4);
}

.send-button:disabled {
    background-color: var(--color-secondary, #4f545c);
    cursor: not-allowed;
}

.no-room-selected {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.welcome-message {
    max-width: 400px;
}

.welcome-message h2 {
    margin: 0 0 16px 0;
    color: var(--text-color);
    font-size: 24px;
    font-weight: 600;
}

.welcome-message p {
    margin: 0;
    color: var(--text-color-secondary);
    font-size: 16px;
    line-height: 1.5;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
    width: 8px;
}

.messages-container::-webkit-scrollbar-track {
    background: var(--bg-color-secondary);
}

.messages-container::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb-bg, #202225);
    border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
     background: var(--scrollbar-thumb-hover-bg, #40444b);
}
</style>
