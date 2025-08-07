<template>
  <div class="message-item" :class="{ 'own-message': isOwnMessage }">
    <div class="message-avatar">
      <div class="avatar">{{ getInitials(sender) }}</div>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="sender-name">{{ getSenderName(sender) }}</span>
        <span class="message-time">{{ formatTime(timestamp) }}</span>
        <span v-if="encrypted" class="encrypted-indicator" title="加密消息">🔒</span>
      </div>
      <div class="message-body">
        <!-- 根据消息类型渲染不同的组件 -->
        <MessageMarkdown 
          v-if="messageType === 'm.text' && isMarkdownContent"
          :content="content"
          :stream-mode="isStreamMode"
          :think-mode="isThinkMode"
        />
        <MessagePic 
          v-else-if="messageType === 'm.image'"
          :content="content"
          :image-url="imageUrl"
          :alt-text="altText"
          :image-size="imageSize"
          :show-image-info="true"
          :mxc-url="mxcUrl"
          :encryption-info="messageInfo?.encryptionInfo"
          :message-info="messageInfo"
        />
        <MessageFile 
          v-else-if="messageType === 'm.file'"
          :content="content"
          :file-url="fileUrl"
          :file-name="fileName"
          :file-size="fileSize"
          :mxc-url="mxcUrl"
          :encryption-info="messageInfo?.encryptionInfo"
          @download-encrypted="downloadAndDecryptFile"
        />
        <MessageFile 
          v-else-if="messageType === 'm.audio'"
          :content="content"
          :file-url="fileUrl"
          :file-name="fileName"
          :file-size="fileSize"
          :mxc-url="mxcUrl"
          :is-audio="true"
          :encryption-info="messageInfo?.encryptionInfo"
          @download-encrypted="downloadAndDecryptFile"
        />
        <MessageFile 
          v-else-if="messageType === 'm.video'"
          :content="content"
          :file-url="fileUrl"
          :file-name="fileName"
          :file-size="fileSize"
          :mxc-url="mxcUrl"
          :is-video="true"
          :encryption-info="messageInfo?.encryptionInfo"
          @download-encrypted="downloadAndDecryptFile"
        />
        <!-- 纯文本消息 -->
        <div v-else class="text-message">
          <p>{{ content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Attachment, EncryptedAttachment } from '@matrix-org/matrix-sdk-crypto-wasm'
import MessageMarkdown from './MessageElement/MessageMarkdown/Markdown.vue'
import MessagePic from './MessageElement/MessagePic/index.vue'
import MessageFile from './MessageElement/MessageFile/index.vue'
import { matrixClient } from '../../../services/matrix/client';
import type { Matrix消息类型 } from '../../../types/matrix'

// Props
interface Props {
  eventId: string
  sender: string
  content: string
  timestamp: number
  encrypted: boolean
  currentUserId?: string
  messageType?: Matrix消息类型
  messageInfo?: any // 用于传递额外的消息信息，如文件信息、图片信息等
}

const props = withDefaults(defineProps<Props>(), {
  messageType: 'm.text'
})

// 下载并解密文件
const downloadAndDecryptFile = async () => {
  if (!props.messageInfo?.encryptionInfo || !props.messageInfo?.mxcUrl) {
    // 这里可以添加用户提示
    return;
  }

  try {
    const client = matrixClient.getAuthedClient();
    if (!client) {
      throw new Error('Matrix客户端未认证');
    }

    // 1. 将 mxc:// URL 转换为可下载的 HTTP URL
    const httpUrl = client.mxcUrlToHttp(props.messageInfo.mxcUrl, null, null, null, true);
    if (!httpUrl) {
      throw new Error('无法将MXC URL转换为HTTP URL');
    }

    // 2. 获取加密的文件内容
    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(`文件下载失败: ${response.statusText}`);
    }
    const encryptedData = await response.arrayBuffer();

    // 3. 解密文件内容
    const mediaEncryptionInfo = JSON.stringify(props.messageInfo.encryptionInfo);
    const encryptedAttachment = new EncryptedAttachment(new Uint8Array(encryptedData), mediaEncryptionInfo);
    const decryptedData = Attachment.decrypt(encryptedAttachment);

    // 4. 创建 Blob 并触发浏览器下载
    const blob = new Blob([decryptedData], { type: props.messageInfo.mimetype || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = props.messageInfo.filename || 'decrypted-file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('解密和下载文件时出错:', error);
    // 在这里向用户显示错误消息
  }
};

// 是否为自己的消息
const isOwnMessage = computed(() => {
  return props.currentUserId && props.sender === props.currentUserId
})

// 判断是否为Markdown内容
const isMarkdownContent = computed(() => {
  if (props.messageType !== 'm.text') return false
  
  const content = props.content
  // 检查是否包含Markdown语法
  const markdownPatterns = [
    /#{1,6}\s/,           // 标题
    /\*\*.*\*\*/,         // 粗体
    /\*.*\*/,             // 斜体
    /`.*`/,               // 行内代码
    /```[\s\S]*?```/,     // 代码块
    /^\s*[-*+]\s/m,       // 无序列表
    /^\s*\d+\.\s/m,       // 有序列表
    /^\s*>\s/m,           // 引用
    /!\[.*\]\(.*\)/,      // 图片
    /\[.*\]\(.*\)/,       // 链接
    /^\s*\|.*\|/m,        // 表格
    /^\s*-{3,}\s*$/m      // 分割线
  ]
  
  return markdownPatterns.some(pattern => pattern.test(content))
})

// 解析图片信息
const imageUrl = computed(() => {
  if (props.messageType !== 'm.image') return ''
  
  // 如果messageInfo中有url，使用它
  if (props.messageInfo?.url) {
    return props.messageInfo.url
  }
  
  // 否则尝试从content中解析
  const imageMatch = props.content.match(/!\[.*?\]\((.*?)\)/)
  return imageMatch ? imageMatch[1] : ''
})

const altText = computed(() => {
  if (props.messageType !== 'm.image') return ''
  
  if (props.messageInfo?.alt) {
    return props.messageInfo.alt
  }
  
  const altMatch = props.content.match(/!\[(.*?)\]/)
  return altMatch ? altMatch[1] : '图片'
})

// 解析文件信息
const fileUrl = computed(() => {
  if (!['m.file', 'm.audio', 'm.video'].includes(props.messageType!)) return ''
  
  if (props.messageInfo?.url) {
    return props.messageInfo.url
  }
  
  // 尝试从content中解析文件链接
  const urlMatch = props.content.match(/https?:\/\/[^\s]+/)
  if (urlMatch) {
    return urlMatch[0]
  }
  
  return ''
})

const fileName = computed(() => {
  if (!['m.file', 'm.audio', 'm.video'].includes(props.messageType!)) return ''
  
  if (props.messageInfo?.filename) {
    return props.messageInfo.filename
  }
  
  // 从fileUrl中提取文件名
  if (fileUrl.value) {
    try {
      const url = new URL(fileUrl.value)
      const pathParts = url.pathname.split('/')
      return pathParts[pathParts.length - 1] || '未知文件'
    } catch {
      return '未知文件'
    }
  }
  
  return props.content || '未知文件'
})

const fileSize = computed(() => {
  if (!['m.file', 'm.audio', 'm.video'].includes(props.messageType!)) return undefined
  
  if (props.messageInfo?.size) {
    return props.messageInfo.size
  }
  
  return undefined
})

// 获取原始mxc URL用于下载
const mxcUrl = computed(() => {
  if (!['m.file', 'm.audio', 'm.video', 'm.image'].includes(props.messageType!)) return ''
  
  // 从messageInfo中获取原始的mxc URL
  if (props.messageInfo?.mxcUrl) {
    return props.messageInfo.mxcUrl
  }
  
  // 如果没有存储mxc URL，尝试从当前的HTTP URL反推
  if (fileUrl.value && fileUrl.value.includes('/_matrix/media/')) {
    const matches = fileUrl.value.match(/\/_matrix\/media\/v3\/download\/([^\/]+)\/(.+)/)
    if (matches) {
      return `mxc://${matches[1]}/${matches[2]}`
    }
  }
  
  return ''
})

// 判断是否为流式模式（可以根据发送者或消息特征判断）
const isStreamMode = computed(() => {
  // 这里可以根据具体需求来判断是否需要流式渲染
  // 比如来自AI助手的消息可以启用流式渲染
  return false // 暂时禁用，可以根据需要开启
})

// 判断是否为Think模式
const isThinkMode = computed(() => {
  if (props.messageType !== 'm.text') return false
  return /<think>[\s\S]*?<\/think>/i.test(props.content)
})

// 解析图片大小
const imageSize = computed(() => {
  if (props.messageType !== 'm.image') return undefined
  return props.messageInfo?.size
})

// 获取发送者姓名（去掉服务器部分）
const getSenderName = (sender: string) => {
  return sender.split(':')[0].replace('@', '')
}

// 获取头像首字母
const getInitials = (sender: string) => {
  const name = getSenderName(sender)
  return name.charAt(0).toUpperCase()
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Discord风格消息样式 */
.message-item {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
}

.message-item:hover {
  background-color: rgba(79, 84, 92, 0.08);
}

.message-item.own-message {
  flex-direction: row;
}

.message-item.own-message .message-content {
  text-align: left;
}

.message-item.own-message .message-body {
  background-color: var(--color-primary);
  color: var(--text-color);
}

.message-avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.sender-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 16px;
  cursor: pointer;
}

.sender-name:hover {
  text-decoration: underline;
}

.message-time {
  font-size: 12px;
  color: var(--text-color-secondary);
  font-weight: 400;
}

.encrypted-indicator {
  font-size: 12px;
  color: var(--color-success);
  margin-left: 4px;
}

.message-body {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  max-width: none;
}

.message-body p {
  margin: 0;
  word-wrap: break-word;
  font-size: 16px;
  line-height: 1.375;
  color: var(--text-color);
}

/* 纯文本消息样式 */
.text-message p {
  margin: 0;
  word-wrap: break-word;
  font-size: 16px;
  line-height: 1.375;
  color: var(--text-color);
}

/* 链接样式 */
.message-body a {
  color: var(--color-primary);
  text-decoration: none;
}

.message-body a:hover {
  text-decoration: underline;
}

/* 代码块样式 */
.message-body code {
  background-color: var(--code-bg);
  color: var(--text-color);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.message-body pre {
  background-color: var(--code-bg);
  color: var(--text-color);
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid var(--border-color);
  margin: 8px 0;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
}

/* 引用样式 */
.message-body blockquote {
  border-left: 4px solid var(--border-color);
  margin: 8px 0;
  padding-left: 12px;
  color: var(--text-color-secondary);
}

/* Emoji样式 */
.message-body .emoji {
  width: 22px;
  height: 22px;
  vertical-align: middle;
}

/* 提及样式 */
.message-body .mention {
  background-color: var(--color-primary-bg, rgba(88,101,242,0.15));
  color: var(--color-primary-text, #5865f2);
  padding: 0 2px;
  border-radius: 3px;
  font-weight: 500;
}

.message-body .mention:hover {
  background-color: var(--color-primary);
  color: var(--text-color);
}
</style>
