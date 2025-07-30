<template>
  <div class="message-input-area">
    <div class="message-input">
      <input 
        :value="message" 
        @input="$emit('update:message', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('send-message')" 
        placeholder="输入消息..."
        :disabled="sending" 
      />
      <button 
        @click="$emit('send-message')" 
        :disabled="!message.trim() || sending"
        class="send-button"
      >
        {{ sending ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
  sending: boolean
}

defineProps<Props>()

defineEmits<{
  'update:message': [value: string]
  'send-message': []
}>()
</script>

<style scoped>
.message-input-area {
  padding: 16px;
  background-color: #36393f;
  border-top: 1px solid #40444b;
  flex-shrink: 0;
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
</style>
