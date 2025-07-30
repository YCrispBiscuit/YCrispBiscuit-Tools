<template>
  <div class="chat-view">
    <!-- 聊天头部 -->
    <ChatHeader 
      :room-name="roomName"
      :room-id="roomId"
    />

    <!-- 消息区域 -->
    <MessageArea :messages="messages" :current-user-id="currentUserId" />

    <!-- 输入区域 -->
    <InputArea 
      :message="message"
      :sending="sending"
      @update:message="$emit('update:message', $event)"
      @send-message="$emit('send-message')"
    />
  </div>
</template>

<script setup lang="ts">
import ChatHeader from './ChatHeader/index.vue'
import MessageArea from './MessageArea/index.vue'
import InputArea from './InputArea/index.vue'
import type { MatrixMessage } from '../../../../types'

interface Props {
  roomName: string
  roomId: string
  message: string
  sending: boolean
  messages: MatrixMessage[]
  currentUserId: string
}

defineProps<Props>()

defineEmits<{
  'update:message': [value: string]
  'send-message': []
}>()
</script>

<style scoped>
.chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
