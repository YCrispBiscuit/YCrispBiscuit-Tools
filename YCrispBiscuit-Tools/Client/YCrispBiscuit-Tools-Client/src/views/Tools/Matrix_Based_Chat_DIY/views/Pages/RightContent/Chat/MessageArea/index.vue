<template>
  <div class="messages-container">
    <MessageItem 
      v-for="msg in messages" 
      :key="msg.eventId" 
      :event-id="msg.eventId"
      :sender="msg.sender" 
      :content="msg.content" 
      :timestamp="msg.timestamp"
      :encrypted="msg.encrypted" 
      :current-user-id="currentUserId"
    />
  </div>
</template>

<script setup lang="ts">
import MessageItem from '../../../../../components/Message/MessageItem/index.vue'
import type { MatrixMessage } from '../../../../../types'

interface Props {
  messages: MatrixMessage[]
  currentUserId: string
}

defineProps<Props>()
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #36393f;
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
