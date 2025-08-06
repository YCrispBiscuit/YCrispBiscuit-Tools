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
        <p>{{ content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  eventId: string
  sender: string
  content: string
  timestamp: number
  encrypted: boolean
  currentUserId?: string
}

const props = defineProps<Props>()

// 是否为自己的消息
const isOwnMessage = computed(() => {
  return props.currentUserId && props.sender === props.currentUserId
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
