<template>
  <div class="messages-container">
    <MessageItem 
      v-for="msg in messages" 
      :key="msg.eventId" 
      :event-id="msg.eventId"
      :sender="msg.sender" 
      :content="msg.content" 
      :timestamp="msg.timestamp"
      :encrypted="msg.encrypted" 
      :current-user-id="currentUserId"
      :message-type="msg.messageType"
      :message-info="getMessageInfo(msg)"
    />
  </div>
</template>

<script setup lang="ts">
import MessageItem from '../../../../../components/Message/MessageItem/index.vue'
import type { MatrixMessage } from '../../../../../types'

interface Props {
  messages: MatrixMessage[]
  currentUserId: string
}

defineProps<Props>()

// 根据消息类型解析消息信息
const getMessageInfo = (message: MatrixMessage) => {
  console.log('🔍 MessageArea getMessageInfo:', {
    eventId: message.eventId,
    messageType: message.messageType,
    content: message.content,
    messageInfo: message.messageInfo
  })
  
  // 如果消息已经有额外的信息，直接返回
  if (message.messageInfo) {
    console.log('✅ 使用现有的messageInfo:', message.messageInfo)
    return message.messageInfo
  }

  // 根据消息类型解析内容
  const messageInfo: any = {}

  if (message.messageType === 'm.image') {
    // 解析图片消息
    const imageMatch = message.content.match(/!\[(.*?)\]\((.*?)\)/)
    if (imageMatch) {
      messageInfo.alt = imageMatch[1] || '图片'
      messageInfo.url = imageMatch[2]
    } else {
      // 尝试直接作为URL
      const urlPattern = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp|svg)/i
      const urlMatch = message.content.match(urlPattern)
      if (urlMatch) {
        messageInfo.url = urlMatch[0]
        messageInfo.alt = '图片'
      }
    }
  } else if (['m.file', 'm.audio', 'm.video'].includes(message.messageType || '')) {
    // 解析文件消息
    const linkMatch = message.content.match(/\[(.*?)\]\((.*?)\)/)
    if (linkMatch) {
      messageInfo.filename = linkMatch[1]
      messageInfo.url = linkMatch[2]
    } else {
      // 尝试从内容中提取URL和文件名
      const urlPattern = /https?:\/\/[^\s]+/
      const urlMatch = message.content.match(urlPattern)
      if (urlMatch) {
        messageInfo.url = urlMatch[0]
        // 从URL中提取文件名
        try {
          const url = new URL(urlMatch[0])
          const pathParts = url.pathname.split('/')
          messageInfo.filename = pathParts[pathParts.length - 1] || '未知文件'
        } catch {
          messageInfo.filename = '未知文件'
        }
      } else {
        messageInfo.filename = message.content || '未知文件'
      }
    }
    
    // 可以在这里添加更多的文件信息解析逻辑
    // 比如从文件名推断mimetype等
  }

  console.log('📦 解析后的messageInfo:', messageInfo)
  return messageInfo
}
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--bg-color-secondary);
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--scrollbar-track-bg);
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-bg);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover-bg);
}
</style>
