<template>
  <div>
    <div v-if="!loggedIn">
      <Login_Chat />
    </div>
    <div v-else>
      <h3>Matrix 聊天已连接！</h3>
      <p>用户ID: {{ userId }}</p>
      
      <!-- 房间列表 -->
      <div class="rooms-section">
        <h4>房间列表</h4>
        <div class="rooms-list">
          <div 
            v-for="room in rooms" 
            :key="room.roomId" 
            class="room-item"
            :class="{ active: currentRoomId === room.roomId }"
            @click="selectRoom(room.roomId)"
          >
            <strong>{{ room.name }}</strong>
            <span class="room-id">{{ room.roomId }}</span>
            <span v-if="room.encrypted" class="encrypted-badge">🔒 加密</span>
          </div>
        </div>
        
        <!-- 加入房间 -->
        <div class="join-room">
          <input v-model="newRoomId" placeholder="输入房间ID或别名 (如: #room:matrix.org)" />
          <button @click="joinRoom">加入房间</button>
        </div>
      </div>

      <!-- 当前房间聊天 -->
      <div v-if="currentRoomId" class="chat-section">
        <h4>当前房间: {{ getCurrentRoomName() }}</h4>
        <div class="messages">
          <div v-for="msg in currentRoomMessages" :key="msg.eventId" class="message">
            <strong>{{ msg.sender }}:</strong> {{ msg.content }}
            <span class="time">{{ formatTime(msg.timestamp) }}</span>
            <span v-if="msg.encrypted" class="encrypted-indicator" title="加密消息">🔒</span>
          </div>
        </div>
        <div class="input-area">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="输入消息..." />
          <button @click="sendMessage">发送</button>
        </div>
      </div>
      
      <div v-else class="no-room">
        <p>请选择一个房间开始聊天</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Login_Chat from './Login'
import * as sdk from "matrix-js-sdk";

// 响应式状态
const loggedIn = ref(false)
const userId = ref('')
const messages = ref<any[]>([])
const newMessage = ref('')
const rooms = ref<any[]>([])
const currentRoomId = ref('')
const newRoomId = ref('')
let authedClient: any = null

// 计算属性：当前房间的消息
const currentRoomMessages = computed(() => {
  return messages.value.filter(msg => msg.roomId === currentRoomId.value)
})

// 1. 创建客户端实例（不带 token）
const client = sdk.createClient({ baseUrl: "https://matrix.org" });

// 2. 登录（推荐用 loginRequest 方法，参数结构符合最新类型定义）
const initializeClient = async () => {
  try {
    const res = await client.loginRequest({
      type: "m.login.password",
      identifier: {
        type: "m.id.user",
        user: "@ycrispbiscuit01:matrix.org" // 使用完整的用户名格式
      },
      password: "@Gyf20021109"
    });
    
    // 登录成功，res.access_token 可用于后续操作
    loggedIn.value = true
    userId.value = res.user_id
    
    // 3. 用 token 创建新 client 实例
    authedClient = sdk.createClient({
      baseUrl: "https://matrix.org",
      accessToken: res.access_token,
      userId: res.user_id,
      useAuthorizationHeader: true
    });

    // 尝试初始化加密（如果方法存在）
    try {
      if (typeof authedClient.initCrypto === 'function') {
        await authedClient.initCrypto();
        console.log("加密初始化成功");
      } else if (typeof authedClient.initRustCrypto === 'function') {
        await authedClient.initRustCrypto();
        console.log("Rust加密初始化成功");
      } else {
        console.log("跳过加密初始化 - 使用基础客户端模式");
      }
    } catch (cryptoErr) {
      console.warn("加密初始化失败，继续使用非加密模式：", cryptoErr);
    }

    // 4. 启动同步
    authedClient.startClient();

    // 5. 监听消息
    authedClient.on("Room.timeline" as any, (event: any, room: any) => {
      if (event.getType() === "m.room.message") {
        const content = event.getContent()
        
        // 检测消息是否加密
        let isEncrypted = false
        try {
          isEncrypted = event.isEncrypted && event.isEncrypted()
        } catch (e) {
          // 兼容性检测
          isEncrypted = event.getType() === 'm.room.encrypted'
        }
        
        messages.value.push({
          eventId: event.getId(),
          sender: event.getSender(),
          content: content.body,
          roomId: room.roomId,
          timestamp: event.getTs(),
          encrypted: isEncrypted
        })
        console.log("收到消息：", content.body);
      }
    });

    // 6. 监听房间状态变化
    authedClient.on("Room" as any, () => {
      updateRoomsList()
    });

    // 初始同步完成后获取房间列表
    authedClient.on("sync" as any, (state: string) => {
      if (state === "PREPARED") {
        updateRoomsList()
      }
    });

  } catch (err) {
    console.error("登录失败：", err)
  }
};

// 初始化客户端
initializeClient();

// 更新房间列表
const updateRoomsList = () => {
  if (!authedClient) return
  const matrixRooms = authedClient.getRooms()
  rooms.value = matrixRooms.map((room: any) => {
    // 尝试检测房间是否加密
    let encrypted = false
    try {
      encrypted = room.hasEncryptionStateEvent && room.hasEncryptionStateEvent()
    } catch (e) {
      // 如果方法不存在，尝试其他方式检测
      encrypted = room.getEncryptionTargetMembers ? true : false
    }
    
    return {
      roomId: room.roomId,
      name: room.name || room.roomId,
      lastActivity: room.getLastActiveTimestamp(),
      encrypted: encrypted
    }
  }).sort((a: any, b: any) => b.lastActivity - a.lastActivity)
}

// 选择房间
const selectRoom = (roomId: string) => {
  currentRoomId.value = roomId
  console.log("选择房间：", roomId)
  
  // 获取房间历史消息
  if (authedClient) {
    try {
      const room = authedClient.getRoom(roomId)
      if (room) {
        const timeline = room.getLiveTimeline()
        const events = timeline.getEvents()
        
        // 过滤并处理历史消息
        const roomMessages = events
          .filter((event: any) => event.getType() === 'm.room.message')
          .map((event: any) => {
            let isEncrypted = false
            try {
              isEncrypted = event.isEncrypted && event.isEncrypted()
            } catch (e) {
              isEncrypted = event.getType() === 'm.room.encrypted'
            }
            
            return {
              eventId: event.getId(),
              sender: event.getSender(),
              content: event.getContent().body,
              roomId: roomId,
              timestamp: event.getTs(),
              encrypted: isEncrypted
            }
          })
          .sort((a: any, b: any) => a.timestamp - b.timestamp)
        
        // 清除当前消息并添加房间历史消息
        messages.value = messages.value.filter(msg => msg.roomId !== roomId)
        messages.value.push(...roomMessages)
        
        console.log(`已加载房间 ${roomId} 的 ${roomMessages.length} 条历史消息`)
      }
    } catch (error) {
      console.error('获取房间历史消息失败:', error)
    }
  }
}

// 加入房间
const joinRoom = async () => {
  if (!newRoomId.value.trim() || !authedClient) return
  
  try {
    await authedClient.joinRoom(newRoomId.value)
    console.log("成功加入房间：", newRoomId.value)
    newRoomId.value = ''
    updateRoomsList()
  } catch (err) {
    console.error("加入房间失败：", err)
    alert("加入房间失败，请检查房间ID是否正确")
  }
}

// 发送消息函数
const sendMessage = async () => {
  if (!newMessage.value.trim() || !authedClient || !currentRoomId.value) return
  
  try {
    await authedClient.sendTextMessage(currentRoomId.value, newMessage.value)
    console.log("消息发送成功：", newMessage.value)
    newMessage.value = ''
  } catch (err: any) {
    console.error("发送消息失败：", err)
    
    // 检查是否是加密相关错误
    const errorMsg = err.message || err.toString()
    if (errorMsg.includes('encryption') || errorMsg.includes('crypto')) {
      alert("此房间启用了端到端加密。当前使用基础模式，可能无法在加密房间发送消息。建议使用 Element 等完整客户端。")
    } else if (errorMsg.includes('M_FORBIDDEN')) {
      alert("没有权限发送消息到此房间")
    } else if (errorMsg.includes('M_LIMIT_EXCEEDED')) {
      alert("发送消息过于频繁，请稍后再试")
    } else {
      alert(`发送消息失败: ${errorMsg}`)
    }
  }
}

// 获取当前房间名称
const getCurrentRoomName = () => {
  const room = rooms.value.find(r => r.roomId === currentRoomId.value)
  return room ? room.name : currentRoomId.value
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

</script>

<style scoped>
.rooms-section {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}

.rooms-list {
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.room-item {
  padding: 8px 12px;
  border: 1px solid #eee;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.room-item:hover {
  background-color: #f5f5f5;
}

.room-item.active {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.room-id {
  font-size: 12px;
  color: #666;
  display: block;
}

.encrypted-badge {
  font-size: 10px;
  color: #ff9800;
  background-color: #fff3e0;
  padding: 2px 6px;
  border-radius: 12px;
  margin-top: 4px;
  display: inline-block;
}

.join-room {
  display: flex;
  gap: 10px;
}

.join-room input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.join-room button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-section {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}

.messages {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fafafa;
}

.message {
  margin-bottom: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.message:last-child {
  border-bottom: none;
}

.time {
  font-size: 11px;
  color: #999;
  margin-left: 10px;
}

.encrypted-indicator {
  font-size: 12px;
  margin-left: 5px;
  color: #4caf50;
}

.input-area {
  display: flex;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-area button {
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.no-room {
  text-align: center;
  color: #666;
  padding: 40px;
}
</style>
