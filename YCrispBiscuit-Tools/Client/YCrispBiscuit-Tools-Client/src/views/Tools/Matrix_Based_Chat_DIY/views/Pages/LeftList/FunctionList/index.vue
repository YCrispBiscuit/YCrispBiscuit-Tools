<template>
  <div class="function-list">
    <div 
      class="function-item active"
      title="频道列表"
    >
      <span class="function-icon">💬</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 功能列表组件 - 负责显示左侧的功能按钮列表
</script>

<style scoped>
.function-list {
  flex: 1;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  overflow-y: auto;
}

.function-item {
  width: 48px;
  height: 48px;
  background-color: #36393f;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.function-item:hover {
  background-color: #7289da;
  border-radius: 16px;
}

.function-item.active {
  background-color: #7289da;
  border-radius: 16px;
}

.function-item.active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 40px;
  background-color: #ffffff;
  border-radius: 0 2px 2px 0;
}

.function-icon {
  font-size: 20px;
  user-select: none;
}

/* 滚动条样式 */
.function-list::-webkit-scrollbar {
  width: 6px;
}

.function-list::-webkit-scrollbar-track {
  background: transparent;
}

.function-list::-webkit-scrollbar-thumb {
  background: #36393f;
  border-radius: 3px;
}

.function-list::-webkit-scrollbar-thumb:hover {
  background: #40444b;
}
</style>
