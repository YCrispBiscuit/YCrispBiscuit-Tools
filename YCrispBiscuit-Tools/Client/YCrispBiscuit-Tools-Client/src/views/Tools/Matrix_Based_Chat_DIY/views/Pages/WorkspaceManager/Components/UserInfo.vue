<template>
  <div class="user-info-component">
    <div class="ui-header">
      <h3>👤 用户信息</h3>
    </div>
    <div class="ui-content">
      <div class="user-avatar">
        <div class="avatar-circle">YC</div>
      </div>
      <div class="user-details">
        <div class="detail-item">
          <label>用户名:</label>
          <span>@ycb:chat.zy-jn.org.cn</span>
        </div>
        <div class="detail-item">
          <label>显示名:</label>
          <span>YCrispBiscuit</span>
        </div>
        <div class="detail-item">
          <label>状态:</label>
          <span class="status online">在线</span>
        </div>
        <div class="detail-item">
          <label>加入时间:</label>
          <span>2024-01-01</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 用户信息组件的基本实现
</script>

<style scoped>
.user-info-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #fff;
}

.ui-header {
  padding: 10px;
  border-bottom: 1px solid #333;
}

.ui-header h3 {
  margin: 0;
  font-size: 16px;
}

.ui-content {
  flex: 1;
  padding: 20px;
}

.user-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #007acc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.detail-item label {
  font-weight: bold;
  color: #ccc;
}

.status.online {
  color: #4caf50;
}
</style>
