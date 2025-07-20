

import { ref } from 'vue';

export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const lastMessage = ref<any>(null);

  function connect(onMessage: (data: any) => void) {
    console.log('[WebSocket] 🔌 尝试连接到:', url)
    ws.value = new WebSocket(url);
    
    ws.value.onopen = () => {
      console.log('[WebSocket] ✅ 连接成功！服务器已接受连接')
      isConnected.value = true;
    };
    
    ws.value.onmessage = (event) => {
      console.log('[WebSocket] 📨 收到消息:', event.data)
      const data = JSON.parse(event.data);
      lastMessage.value = data;
      onMessage(data);
    };
    
    ws.value.onclose = (event) => {
      console.log('[WebSocket] 🔌 连接关闭:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      })
      isConnected.value = false;
    };
    
    ws.value.onerror = (error) => {
      console.error('[WebSocket] ❌ 连接错误:', error)
      console.error('[WebSocket] 🔍 这通常意味着服务器不可达或拒绝连接')
      isConnected.value = false;
    };
  }

  function send(data: any) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data));
    }
  }

  function close() {
    ws.value?.close();
    isConnected.value = false;
  }

  return { ws, isConnected, lastMessage, connect, send, close };
}
