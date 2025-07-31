<template>
  <div class="user-info-panel">
    <div class="panel-header">
      <h3>用户信息</h3>
    </div>
    
    <div class="user-details">
      <div class="user-avatar">
        <div class="avatar-placeholder">
          {{ userInitials }}
        </div>
      </div>
      
      <div class="user-basic-info">
        <h4 class="user-id">{{ currentUserId }}</h4>
        <p class="user-status">在线</p>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-label">已加入房间</span>
          <span class="stat-value">{{ roomCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">发送消息</span>
          <span class="stat-value">{{ messageCount }}</span>
        </div>
      </div>
      
      <div class="user-actions">
        <button class="action-btn" @click="editProfile">编辑资料</button>
        <button class="action-btn secondary" @click="changeStatus">更改状态</button>
        <button class="action-btn danger" @click="logout">登出</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'

// 注入聊天上下文
const chatContext = inject('chatContext') as any

// 本地状态
const roomCount = ref(0)
const messageCount = ref(0)

// 从上下文获取用户信息
const currentUserId = computed(() => chatContext?.currentUserId?.value || '')

// 计算用户首字母
const userInitials = computed(() => {
  const userId = currentUserId.value
  if (!userId) return '?'
  const name = userId.split(':')[0].replace('@', '')
  return name.charAt(0).toUpperCase()
})

// 方法
const editProfile = () => {
  alert('编辑资料功能待实现')
}

const changeStatus = () => {
  alert('更改状态功能待实现')
}

const logout = () => {
  if (chatContext?.logout) {
    chatContext.logout()
  }
}
</script>

<style scoped>
.user-info-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #2f3136;
  color: #dcddde;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #40444b;
  background: #36393f;
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.user-details {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #5865f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.user-basic-info {
  text-align: center;
}

.user-id {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.user-status {
  margin: 0;
  color: #43b581;
  font-size: 14px;
}

.user-stats {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #40444b;
  border-radius: 6px;
}

.stat-label {
  color: #b9bbbe;
  font-size: 14px;
}

.stat-value {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
}

.user-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.action-btn {
  background: #5865f2;
  color: white;
}

.action-btn:hover {
  background: #4752c4;
}

.action-btn.secondary {
  background: #4f545c;
  color: #dcddde;
}

.action-btn.secondary:hover {
  background: #5d6269;
}

.action-btn.danger {
  background: #ed4245;
  color: white;
}

.action-btn.danger:hover {
  background: #c73e41;
}
</style>
