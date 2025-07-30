<template>
  <div class="user-panel">
    <div class="user-avatar">
      <span>{{ userInitials }}</span>
    </div>
    <div class="user-controls">
      <button @click="$emit('logout')" class="logout-btn" title="登出">
        <span>🚪</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  userInitials: string
}

defineProps<Props>()

defineEmits<{
  logout: []
}>()
</script>

<style scoped>
.user-panel {
  padding: 8px;
  background-color: #292b2f;
  border-top: 1px solid #36393f;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: #7289da;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  background-color: #677bc4;
  border-radius: 16px;
}

.user-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  align-items: center;
}

.logout-btn {
  width: 32px;
  height: 32px;
  background-color: #ed4245;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
}

.logout-btn:hover {
  background-color: #c23e41;
}
</style>
