<template>
  <div class="middle-list-container">
    <!-- 头部组件 -->
    <Header :user-id="userId" />
    
    <!-- 房间列表内容 -->
    <div class="list-content">
      <slot name="room-list">
        <!-- RoomList 组件会被插入这里 -->
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './Header'

interface Props {
  userId: string
}

defineProps<Props>()
</script>

<style scoped>
.middle-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2f3136;
}

.list-content {
  flex: 1;
  overflow-y: auto;
}
</style>
