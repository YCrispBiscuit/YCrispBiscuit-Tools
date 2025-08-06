<template>
  <div class="chat-header">
    <h4># {{ roomName }}</h4>
    <div class="chat-controls">
      <span class="room-id">{{ roomId }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  roomName: string
  roomId: string
}

defineProps<Props>()
</script>

<style scoped>
.chat-header {
  background-color: var(--bg-color-secondary);
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
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
</style>
