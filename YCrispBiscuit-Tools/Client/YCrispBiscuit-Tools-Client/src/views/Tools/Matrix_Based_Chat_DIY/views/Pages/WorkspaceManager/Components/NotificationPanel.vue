<template>
  <div class="notification-panel-component">
    <div class="np-header">
      <h3>🔔 通知</h3>
    </div>
    <div class="np-content">
      <div class="notification-list">
        <div class="notification-item unread">
          <div class="notification-icon">💬</div>
          <div class="notification-content">
            <div class="notification-title">新消息</div>
            <div class="notification-text">您有一条新的聊天消息</div>
            <div class="notification-time">5 分钟前</div>
          </div>
        </div>
        
        <div class="notification-item">
          <div class="notification-icon">📁</div>
          <div class="notification-content">
            <div class="notification-title">文件上传完成</div>
            <div class="notification-text">document.pdf 上传成功</div>
            <div class="notification-time">1 小时前</div>
          </div>
        </div>
        
        <div class="notification-item">
          <div class="notification-icon">👤</div>
          <div class="notification-content">
            <div class="notification-title">用户加入</div>
            <div class="notification-text">新用户 @alice 加入了房间</div>
            <div class="notification-time">2 小时前</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 通知面板组件的基本实现
</script>

<style scoped>
.notification-panel-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #fff;
}

.np-header {
  padding: 10px;
  border-bottom: 1px solid #333;
}

.np-header h3 {
  margin: 0;
  font-size: 16px;
}

.np-content {
  flex: 1;
  overflow-y: auto;
}

.notification-list {
  padding: 10px;
}

.notification-item {
  display: flex;
  padding: 12px;
  margin-bottom: 8px;
  background: #2d2d2d;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background: #333;
}

.notification-item.unread {
  border-left: 3px solid #007acc;
  background: #2a2a3a;
}

.notification-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.notification-text {
  color: #ccc;
  font-size: 14px;
  margin-bottom: 4px;
}

.notification-time {
  color: #888;
  font-size: 12px;
}
</style>
