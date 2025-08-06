<template>
  <div class="discord-user-card">
    <div class="user-card-main">
      <div class="user-avatar-large">
        <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" alt="avatar" />
        <img v-else  class="avatar-img" alt="default avatar" />
      </div>
      <div class="user-info-block">
        <div class="user-display">{{ displayName }}</div>
        <div class="user-id">{{ userId }}</div>
        <div class="user-status online">在线</div>
        <div class="user-stats-row">
          <div class="stat-item">
            <span class="stat-label">房间数</span>
            <span class="stat-value">{{ roomCount }}</span>
          </div>
          
        </div>
      </div>
    </div>
    <div class="user-actions-bar">
      <button class="logout-btn" @click="logout">退出登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watchEffect, onMounted } from 'vue'
import { roomService } from '../../../../services/matrix/rooms'


const chatContext = inject('chatContext') as any

const userId = computed(() => chatContext?.currentUserId?.value || '')
const displayName = computed(() => chatContext?.currentUser?.displayName || userId.value)
const avatarUrl = computed(() => chatContext?.currentUser?.avatarUrl || '')
const roomCount = ref(0)


function getRoomsRaw() {
  let rooms = chatContext?.rooms
  if (!rooms) return []
  // 兼容 ref
  if (rooms.value) rooms = rooms.value
  // 兼容 reactive 对象
  if (Array.isArray(rooms)) return rooms
  if (typeof rooms === 'object') return Object.values(rooms)
  return []
}

function updateStats() {
  const roomsArr = roomService.获取房间列表()
  roomCount.value = roomsArr.length
}

onMounted(updateStats)
watchEffect(() => {
  updateStats()
})

const logout = () => {
  if (chatContext?.logout) chatContext.logout()
}
</script>

<style scoped>
.discord-user-card {
  background: var(--bg-color-secondary);
  color: var(--text-color);
  border-radius: 16px;
  box-shadow: 0 4px 32px 0 var(--shadow-color, #00000033);
  max-width: 1020px;
  margin: 48px auto 0 auto;
  padding: 40px 40px 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.user-card-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 32px;
  width: 100%;
}
.user-avatar-large {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: var(--bg-color-tertiary);
  box-shadow: 0 2px 12px var(--shadow-color, #00000033);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.user-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-start;
  margin-top: 8px;
}
.user-display {
 color: var(--text-color);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.user-id {
  font-size: 15px;
  color: var(--text-color-secondary);
  margin-bottom: 2px;
}
.user-status {
  font-size: 14px;
  color: var(--color-success);
  margin-bottom: 10px;
}
.user-stats-row {
  display: flex;
  gap: 40px;
  margin-top: 12px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 14px;
}
.stat-label {
  color: var(--text-color-secondary);
  margin-bottom: 2px;
}
.stat-value {
  color: var(--text-color);
  font-weight: bold;
  font-size: 18px;
}
.user-actions-bar {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
}
.logout-btn {
  padding: 12px 40px;
  border: none;
  border-radius: 10px;
 background: var(--color-error);
  color: var(--text-color);
  box-shadow: 0 2px 8px var(--shadow-color, #00000022);
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
 
}
.logout-btn:hover {
  background: var(--color-error-hover);
}
</style>