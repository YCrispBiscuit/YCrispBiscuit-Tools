<template>
  <div class="room-list">
    <div class="room-list-header">
      <h4>房间列表</h4>
      <button @click="refreshRooms" class="refresh-btn" :disabled="loading">
        {{ loading ? '刷新中...' : '刷新' }}
      </button>
    </div>
    
    <div class="rooms-container">
      <div 
        v-for="room in props.rooms" 
        :key="room.roomId" 
        class="room-item"
        :class="{ active: currentRoomId === room.roomId }"
        @click="selectRoom(room.roomId)"
      >
        <div class="room-info">
          <strong class="room-name">{{ room.name }}</strong>
          <span class="room-id">{{ room.roomId }}</span>
          <p v-if="room.topic" class="room-topic">{{ room.topic }}</p>
        </div>
        <div class="room-meta">
          <span v-if="room.encrypted" class="encrypted-badge">🔒 加密</span>
          <span class="last-activity">{{ formatTime(room.lastActivity) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 加入房间 -->
    <div class="join-room-section">
      <input 
        v-model="newRoomId" 
        placeholder="输入房间ID或别名 (如: #room:matrix.org)" 
        @keyup.enter="joinRoom"
      />
      <button @click="joinRoom" :disabled="!newRoomId.trim() || joining">
        {{ joining ? '加入中...' : '加入房间' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MatrixRoom } from '../../../types'

// Props
interface Props {
  currentRoomId?: string
  rooms: any[] // 接收外部传入的房间列表
}
const props = withDefaults(defineProps<Props>(), {
  currentRoomId: '',
  rooms: () => []
})

// Emits
const emit = defineEmits<{
  selectRoom: [roomId: string]
  joinRoom: [roomId: string]
  refreshRooms: []
}>()

// 状态
const newRoomId = ref('')
const loading = ref(false)
const joining = ref(false)

// 选择房间
const selectRoom = (roomId: string) => {
  emit('selectRoom', roomId)
}

// 加入房间
const joinRoom = async () => {
  if (!newRoomId.value.trim()) return
  
  joining.value = true
  try {
    emit('joinRoom', newRoomId.value)
    newRoomId.value = ''
  } finally {
    joining.value = false
  }
}

// 刷新房间列表
const refreshRooms = () => {
  loading.value = true
  emit('refreshRooms')
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  refreshRooms()
})
</script>

<style scoped>
/* Discord风格房间列表 */
.room-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2f3136;
}

.room-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 12px;
  border-bottom: 1px solid #40444b;
}

.room-list-header h4 {
  margin: 0;
  color: #96989d;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.refresh-btn {
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid #40444b;
  border-radius: 3px;
  color: #96989d;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #40444b;
  color: #dcddde;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rooms-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.room-item {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-item:hover {
  background-color: #40444b;
}

.room-item.active {
  background-color: #5865f2;
}

.room-item.active .room-name {
  color: #fff !important;
}

.room-item::before {
  content: '#';
  color: #72767d;
  font-weight: 600;
  font-size: 16px;
  line-height: 1;
}

.room-item.active::before {
  color: #fff;
}

.room-info {
  flex: 1;
  min-width: 150px; /* 你希望的最小宽度 */
}

.room-name {
  display: block;
  color: #96989d;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-item:hover .room-name:not(.active) {
  color: #dcddde;
}

.room-id {
  font-size: 11px;
  color: #72767d;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-topic {
  font-size: 11px;
  color: #72767d;
  margin: 2px 0 0 0;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 0;
  

  max-width: 80px; /* 或你希望的最大宽度 */
  min-width: 0;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.encrypted-badge {
  font-size: 10px;
  color: #faa61a;
  background-color: rgba(250, 166, 26, 0.1);
  padding: 2px 4px;
  border-radius: 8px;
  border: 1px solid rgba(250, 166, 26, 0.2);
}

.last-activity {
  font-size: 10px;
  color: #72767d;
}

.join-room-section {
  padding: 16px 12px;
  border-top: 1px solid #40444b;
  background-color: #36393f;
}

.join-room-section input {
  width: 100%;
  padding: 8px 12px;
  background-color: #40444b;
  border: 1px solid #40444b;
  border-radius: 4px;
  color: #dcddde;
  font-size: 14px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.join-room-section input:focus {
  outline: none;
  border-color: #5865f2;
  background-color: #36393f;
}

.join-room-section input::placeholder {
  color: #72767d;
}

.join-room-section button {
  width: 100%;
  padding: 8px 12px;
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.join-room-section button:hover:not(:disabled) {
  background-color: #4752c4;
}

.join-room-section button:disabled {
  background-color: #4f545c;
  cursor: not-allowed;
}

/* 滚动条样式 */
.rooms-container::-webkit-scrollbar {
  width: 6px;
}

.rooms-container::-webkit-scrollbar-track {
  background: transparent;
}

.rooms-container::-webkit-scrollbar-thumb {
  background: #202225;
  border-radius: 3px;
}

.rooms-container::-webkit-scrollbar-thumb:hover {
  background: #40444b;
}
</style>
