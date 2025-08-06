<template>
  <div class="chat-view">
    <!-- 聊天头部 -->
    <ChatHeader 
      :room-name="roomName?.value || ''"
      :room-id="currentRoomId?.value || ''"
    />

    <!-- 消息区域 -->
    <MessageArea :messages="messages || []" :current-user-id="currentUserId?.value || ''" />

    <!-- 输入区域 -->
    <InputArea 
      :sending="currentSending"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import ChatHeader from './ChatHeader/index.vue'
import MessageArea from './MessageArea/index.vue'
import InputArea from './InputArea/index.vue'

// 注入聊天上下文
const chatContext = inject('chatContext') as any

if (!chatContext) {
  console.error('chatContext not found! Make sure the parent component provides it.')
}

// 从上下文中解构出需要的数据
const {
  currentRoomId,
  roomName,
  sending,
  messages,
  currentUserId,
  sendMessage
} = chatContext || {}

// 创建计算属性确保响应式更新
const currentSending = computed(() => sending?.value || false)

// 处理发送消息（接收来自InputArea的消息内容）
const handleSendMessage = async (messageContent: string) => {
  if (sendMessage) {
    await sendMessage(messageContent)
  }
}
</script>

<style scoped>
.chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
