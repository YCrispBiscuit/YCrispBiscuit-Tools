

import { ref } from 'vue';

export function useWebSocket(url: string) {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const lastMessage = ref<any>(null);

  function connect(onMessage: (data: any) => void) {
    ws.value = new WebSocket(url);
    ws.value.onopen = () => {
      isConnected.value = true;
    };
    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      lastMessage.value = data;
      onMessage(data);
    };
    ws.value.onclose = () => {
      isConnected.value = false;
    };
    ws.value.onerror = () => {
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
