<template>
  <div class="user-panel">
    <button class="user-center-btn" @click="emit('userInfo')" title="个人中心">
      <span class="user-center-label">个人中心</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  userInitials: string
}

defineProps<Props>()
const emit = defineEmits(['userInfo'])
</script>

<style scoped>
.user-panel {
  padding: 8px;
  background-color: var(--bg-color-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-center-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}
.user-center-btn:hover {
  background: var(--bg-color-secondary);
}
.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  font-size: 14px;
  font-weight: bold;
}
.user-center-label {
  color: var(--text-color);
  font-size: 15px;
  font-weight: 500;
}
</style>
