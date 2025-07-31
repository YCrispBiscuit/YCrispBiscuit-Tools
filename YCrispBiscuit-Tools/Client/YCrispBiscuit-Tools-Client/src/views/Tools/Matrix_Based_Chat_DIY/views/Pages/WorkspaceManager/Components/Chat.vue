<template>
  <div class="chat-component">
    <div class="chat-header">
      <h3>💬 聊天</h3>
    </div>
    <div class="chat-content">
      <div class="message-list">
        <div class="message">
          <strong>系统:</strong> 欢迎使用 Matrix 聊天功能
        </div>
        <div class="message">
          <strong>用户:</strong> 这是一个测试消息
        </div>
      </div>
      <div class="message-input">
        <input type="text" placeholder="输入消息..." />
        <button>发送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 聊天组件的基本实现
</script>

<style scoped>
.chat-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #fff;
}

.chat-header {
  padding: 10px;
  border-bottom: 1px solid #333;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-list {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.message {
  margin-bottom: 8px;
  padding: 8px;
  background: #2d2d2d;
  border-radius: 4px;
}

.message-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #333;
}

.message-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #2d2d2d;
  color: #fff;
  margin-right: 8px;
}

.message-input button {
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input button:hover {
  background: #005a9e;
}
</style>
