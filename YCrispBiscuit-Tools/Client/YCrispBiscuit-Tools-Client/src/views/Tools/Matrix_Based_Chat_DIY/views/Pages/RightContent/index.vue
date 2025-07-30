<template>
  <div class="right-content-container">
    <!-- 根据当前功能显示不同内容 -->
    <div v-if="currentRoomId" class="content-area">
      <!-- 聊天功能组件 -->
      <Chat 
        :room-name="roomName"
        :room-id="currentRoomId"
        :message="message"
        :sending="sending"
        :messages="messages"
        :current-user-id="currentUserId"
        @update:message="$emit('update:message', $event)"
        @send-message="$emit('send-message')"
      />
    </div>

    <!-- 未选择房间时的欢迎页面 -->
    <div v-else class="welcome-content">
      <div class="welcome-message">
        <h2>欢迎使用 Matrix 聊天</h2>
        <p>选择一个频道开始聊天，或者加入新的频道</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chat from './Chat/index.vue'
import type { MatrixMessage } from '../../../types'

interface Props {
  currentRoomId: string
  roomName: string
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
.right-content-container {
  flex: 1;
  background-color: #36393f;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-message {
  text-align: center;
  max-width: 400px;
}

.welcome-message h2 {
  margin: 0 0 16px 0;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.welcome-message p {
  margin: 0;
  color: #96989d;
  font-size: 16px;
  line-height: 1.5;
}
</style>
