<template>
    <div class="matrix-chat-app">
        <div class="discord-layout">



            <!-- 左侧功能列表 (类似Discord服务器列表) -->
            <div class="function-sidebar">
                <div class="function-list">
                    <div 
                        class="function-item" 
                        :class="{ active: currentFunction === 'rooms' }"
                        @click="switchFunction('rooms')"
                        title="频道列表"
                    >
                        <span class="function-icon">💬</span>
                    </div>
                    <!-- 更多功能可以在这里添加 -->
                    <div 
                        class="function-item" 
                        :class="{ active: currentFunction === 'calendar' }"
                        @click="switchFunction('calendar')"
                        title="日历工具"
                    >
                        <span class="function-icon">📅</span>
                    </div>
                    <div 
                        class="function-item" 
                        :class="{ active: currentFunction === 'notes' }"
                        @click="switchFunction('notes')"
                        title="笔记工具"
                    >
                        <span class="function-icon">📝</span>
                    </div>
                    <div 
                        class="function-item" 
                        :class="{ active: currentFunction === 'files' }"
                        @click="switchFunction('files')"
                        title="文件管理"
                    >
                        <span class="function-icon">📁</span>
                    </div>
                </div>
                
                <!-- 用户信息区域 -->
                <div class="user-panel">
                    <div class="user-avatar">
                        <span>{{ getUserInitials() }}</span>
                    </div>
                    <div class="user-controls">
                        <button @click="handleLogout" class="logout-btn" title="登出">
                            <span>🚪</span>
                        </button>
                    </div>
                </div>
            </div>





            <!-- 中间频道/功能区域 -->
            <div class="channel-sidebar" :style="{ width: channelSidebarWidth + 'px' }">
                <!-- 频道列表视图 -->
                <div v-if="currentFunction === 'rooms'" class="channels-view">
                    <div class="channels-header">
                        <h3>Matrix 频道</h3>
                        <span class="user-id">{{ props.userId }}</span>
                    </div>
                    
                    <RoomList 
                        ref="roomListRef" 
                        :current-room-id="currentRoomId" 
                        @select-room="handleSelectRoom"
                        @join-room="handleJoinRoom" 
                        @refresh-rooms="handleRefreshRooms" 
                    />
                </div>

                <!-- 其他功能视图占位 -->
                <div v-else-if="currentFunction === 'calendar'" class="function-view">
                    <div class="function-header">
                        <h3>📅 日历工具</h3>
                    </div>
                    <div class="function-content">
                        <p>日历功能开发中...</p>
                    </div>
                </div>

                <div v-else-if="currentFunction === 'notes'" class="function-view">
                    <div class="function-header">
                        <h3>📝 笔记工具</h3>
                    </div>
                    <div class="function-content">
                        <p>笔记功能开发中...</p>
                    </div>
                </div>

                <div v-else-if="currentFunction === 'files'" class="function-view">
                    <div class="function-header">
                        <h3>📁 文件管理</h3>
                    </div>
                    <div class="function-content">
                        <p>文件管理功能开发中...</p>
                    </div>
                </div>
            </div>





            <!-- 第一个拖拽分隔条 -->
            <div 
                class="resizer" 
                @mousedown="startResize($event, 'channel')"
                title="拖拽调整频道区域宽度"
            ></div>

            <!-- 右侧主聊天区域 -->
            <div class="main-chat-area">
                <div v-if="currentFunction === 'rooms' && currentRoomId" class="chat-view">
                    <div class="chat-header">
                        <h4># {{ getCurrentRoomName() }}</h4>
                        <div class="chat-controls">
                            <span class="room-id">{{ currentRoomId }}</span>
                        </div>
                    </div>

                    <div class="messages-container">
                        <MessageItem 
                            v-for="msg in currentRoomMessages" 
                            :key="msg.eventId" 
                            :event-id="msg.eventId"
                            :sender="msg.sender" 
                            :content="msg.content" 
                            :timestamp="msg.timestamp"
                            :encrypted="msg.encrypted" 
                            :current-user-id="props.userId"
                        />
                    </div>

                    <div class="message-input-area">
                        <div class="message-input">
                            <input 
                                v-model="newMessage" 
                                @keyup.enter="handleSendMessage" 
                                placeholder="输入消息..."
                                :disabled="sending" 
                            />
                            <button 
                                @click="handleSendMessage" 
                                :disabled="!newMessage.trim() || sending"
                                class="send-button"
                            >
                                {{ sending ? '发送中...' : '发送' }}
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else-if="currentFunction === 'rooms'" class="no-room-selected">
                    <div class="welcome-message">
                        <h2>欢迎使用 Matrix 聊天</h2>
                        <p>选择一个频道开始聊天，或者加入新的频道</p>
                    </div>
                </div>

                <div v-else class="function-main-area">
                    <div class="function-placeholder">
                        <h2>{{ getFunctionTitle() }}</h2>
                        <p>此功能区域可以用来开发你的办公工具</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RoomList from '../../components/Room/RoomList'
import MessageItem from '../../components/Message/MessageItem'
import { matrixClient } from '../../services/matrix/client'
import { roomService } from '../../services/matrix/rooms'
import { messageService } from '../../services/matrix/messages'
import type { MatrixMessage, MatrixRoom } from '../../types'

/**
 * Chat页面组件
 * 负责聊天界面的展示和交互，需要在已登录状态下使用
 */

// 组件引用
const roomListRef = ref()

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

// Discord风格布局状态
const currentFunction = ref<'rooms' | 'calendar' | 'notes' | 'files'>('rooms')

// 拖拽调整宽度相关状态
const channelSidebarWidth = ref(240) // 频道区域默认宽度
const isResizing = ref(false)
const resizeType = ref<'channel' | null>(null)

// 计算属性：当前房间的消息
const currentRoomMessages = computed(() => {
    return messages.value.filter(msg => msg.roomId === currentRoomId.value)
})

// 处理登出
const handleLogout = () => {
    matrixClient.用户登出()
    emit('logout')
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
const handleSelectRoom = (roomId: string) => {
    currentRoomId.value = roomId

    // 加载房间历史消息
    const roomMessages = messageService.获取房间历史消息(roomId)

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

    // 更新房间列表组件
    if (roomListRef.value) {
        roomListRef.value.updateRooms(newRooms)
    }
}

// 处理发送消息
const handleSendMessage = async () => {
    if (!newMessage.value.trim() || !currentRoomId.value) return

    sending.value = true
    try {
        await messageService.发送文本消息(currentRoomId.value, newMessage.value)
        console.log("消息发送成功：", newMessage.value)
        newMessage.value = ''
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

// Discord布局相关方法
const switchFunction = (functionName: 'rooms' | 'calendar' | 'notes' | 'files') => {
    currentFunction.value = functionName
    console.log(`切换到功能: ${functionName}`)
}

const getUserInitials = () => {
    const name = props.userId.split(':')[0].replace('@', '')
    return name.charAt(0).toUpperCase()
}

const getFunctionTitle = () => {
    const titles = {
        rooms: '💬 频道聊天',
        calendar: '📅 日历工具', 
        notes: '📝 笔记工具',
        files: '📁 文件管理'
    }
    return titles[currentFunction.value] || '未知功能'
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
        const functionSidebarWidth = 72
        const newWidth = event.clientX - functionSidebarWidth
        
        // 限制最小和最大宽度
        const minWidth = 180
        const maxWidth = 400
        
        channelSidebarWidth.value = Math.max(minWidth, Math.min(maxWidth, newWidth))
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

// 组件挂载时初始化
onMounted(() => {
    initializeChat()
})
</script>

<style scoped>
/* Discord风格布局 */
.matrix-chat-app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #36393f;
    color: #dcddde;
}

.discord-layout {
    display: flex;
    height: 100vh;
}

/* 左侧功能栏 (类似Discord服务器列表) */
.function-sidebar {
    width: 72px;
    background-color: #202225;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px 0;
    border-right: 1px solid #40444b;
}

.function-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}

.function-item {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background-color: #36393f;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
}

.function-item:hover {
    border-radius: 16px;
    background-color: #5865f2;
}

.function-item.active {
    border-radius: 16px;
    background-color: #5865f2;
}

.function-item.active::before {
    content: '';
    position: absolute;
    left: -12px;
    width: 4px;
    height: 20px;
    background-color: #fff;
    border-radius: 0 4px 4px 0;
}

.function-icon {
    font-size: 20px;
}

.user-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #5865f2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: white;
}

.user-controls {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.logout-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #ed4245;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.logout-btn:hover {
    background-color: #c23e41;
}

/* 中间频道/功能区域 */
.channel-sidebar {
    width: 240px;
    background-color: #2f3136;
    border-right: 1px solid #40444b;
    display: flex;
    flex-direction: column;
}

/* 拖拽分隔条样式 */
.resizer {
    width: 4px;
    background-color: #40444b;
    cursor: col-resize;
    position: relative;
    transition: background-color 0.2s ease;
}

.resizer:hover {
    background-color: #5865f2;
}

.resizer:active {
    background-color: #4752c4;
}

.channels-view,
.function-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.channels-header,
.function-header {
    padding: 16px;
    border-bottom: 1px solid #40444b;
    background-color: #36393f;
}

.channels-header h3,
.function-header h3 {
    margin: 0 0 8px 0;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
}

.user-id {
    font-size: 12px;
    color: #96989d;
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
    background-color: #36393f;
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
    border-bottom: 1px solid #40444b;
    background-color: #36393f;
}

.chat-header h4 {
    margin: 0;
    color: #fff;
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
    color: #96989d;
}

.messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background-color: #36393f;
}

.message-input-area {
    padding: 16px;
    background-color: #36393f;
}

.message-input {
    display: flex;
    gap: 8px;
    background-color: #40444b;
    border-radius: 8px;
    padding: 12px;
}

.message-input input {
    flex: 1;
    background: transparent;
    border: none;
    color: #dcddde;
    font-size: 14px;
    outline: none;
}

.message-input input::placeholder {
    color: #96989d;
}

.send-button {
    padding: 8px 16px;
    background-color: #5865f2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s ease;
}

.send-button:hover:not(:disabled) {
    background-color: #4752c4;
}

.send-button:disabled {
    background-color: #4f545c;
    cursor: not-allowed;
}

.no-room-selected,
.function-main-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.welcome-message,
.function-placeholder {
    max-width: 400px;
}

.welcome-message h2,
.function-placeholder h2 {
    margin: 0 0 16px 0;
    color: #fff;
    font-size: 24px;
    font-weight: 600;
}

.welcome-message p,
.function-placeholder p {
    margin: 0;
    color: #96989d;
    font-size: 16px;
    line-height: 1.5;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
    width: 8px;
}

.messages-container::-webkit-scrollbar-track {
    background: #2f3136;
}

.messages-container::-webkit-scrollbar-thumb {
    background: #202225;
    border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
    background: #40444b;
}
</style>
