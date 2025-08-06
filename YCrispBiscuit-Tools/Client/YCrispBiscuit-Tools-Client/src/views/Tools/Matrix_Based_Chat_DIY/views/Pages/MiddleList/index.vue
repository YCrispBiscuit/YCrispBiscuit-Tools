<template>
  <div class="middle-list-container">
    <!-- 头部组件 -->
    <Header :user-id="userId" />
    
    <!-- 房间列表内容 -->
    <div class="list-content">
      <RoomList 
        :current-room-id="currentRoomId"
        :rooms="rooms"
        @select-room="$emit('select-room', $event)"
        @join-room="$emit('join-room', $event)" 
        @refresh-rooms="$emit('refresh-rooms')" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './Header'
import RoomList from '../../../components/Room/RoomList'

interface Props {
  userId: string
  currentRoomId: string
  rooms: any[] // 房间列表数据
}

defineProps<Props>()

defineEmits<{
  'select-room': [roomId: string]
  'join-room': [roomIdOrAlias: string]
  'refresh-rooms': []
}>()
</script>

<style scoped>
.middle-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-secondary);
}

.list-content {
  flex: 1;
  overflow-y: auto;
}
</style>
