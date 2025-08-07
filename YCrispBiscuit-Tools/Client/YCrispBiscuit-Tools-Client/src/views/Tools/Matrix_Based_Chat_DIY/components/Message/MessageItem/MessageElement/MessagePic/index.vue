<template>
  <div class="message-pic">
    <div v-if="decryptedImageUrl || imageUrl" class="image-container">
      <img 
        :src="decryptedImageUrl || imageUrl" 
        :alt="altText"
        :title="altText"
        class="message-image"
        @click="openImagePreview"
        @error="handleImageError"
        @load="handleImageLoad"
        :loading="loading ? 'eager' : 'lazy'"
      />
      <div v-if="loading" class="image-loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-if="error" class="image-error">
        <span class="error-icon">🖼️</span>
        <span>图片加载失败</span>
        <button @click="retryLoad" class="retry-btn">重试</button>
      </div>
    </div>
    
    <!-- 图片信息展示 -->
    <div v-if="showImageInfo" class="image-info">
      <span class="image-alt">{{ altText }}</span>
      <span v-if="imageSize" class="image-size">{{ formatFileSize(imageSize) }}</span>
    </div>

    <!-- 如果没有图片URL但有内容，显示内容 -->
    <div v-if="!imageUrl && content" class="fallback-content">
      <p>{{ content }}</p>
    </div>

    <!-- 图片预览模态框 -->
    <Teleport to="body">
      <div v-if="showPreview" class="image-preview-modal" @click="closeImagePreview">
        <div class="preview-container">
          <img :src="decryptedImageUrl || imageUrl" :alt="altText" class="preview-image" />
          <button class="close-btn" @click="closeImagePreview">&times;</button>
          <div class="preview-info">
            <p>{{ altText }}</p>
            <p v-if="imageSize">大小: {{ formatFileSize(imageSize) }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Attachment, EncryptedAttachment } from '@matrix-org/matrix-sdk-crypto-wasm'
import { matrixClient } from '../../../../../services/matrix/client'

interface Props {
  content: string
  imageUrl?: string
  altText?: string
  imageSize?: number
  showImageInfo?: boolean
  mxcUrl?: string
  encryptionInfo?: any
  messageInfo?: {
    mimetype?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  altText: '图片',
  showImageInfo: false
})

const loading = ref(true)
const error = ref(false)
const showPreview = ref(false)
const decryptedImageUrl = ref<string | null>(null);

// 解密并加载图片
const decryptAndLoadImage = async () => {
  // 如果已经有解密后的URL，则不再执行
  if (decryptedImageUrl.value) return;

  // 如果不是加密图片，则按原流程处理
  if (!props.encryptionInfo || !props.mxcUrl) {
    if (!props.imageUrl) {
      loading.value = false;
      error.value = true;
    }
    return;
  }

  loading.value = true;
  error.value = false;

  try {
    const client = matrixClient.getAuthedClient();
    if (!client) throw new Error('Matrix客户端未认证');

    const httpUrl = client.mxcUrlToHttp(props.mxcUrl, null, null, null, true);
    if (!httpUrl) throw new Error('无法将MXC URL转换为HTTP URL');

    const response = await fetch(httpUrl);
    if (!response.ok) throw new Error(`图片下载失败: ${response.statusText}`);
    const encryptedData = await response.arrayBuffer();

    const mediaEncryptionInfo = JSON.stringify(props.encryptionInfo);
    const encryptedAttachment = new EncryptedAttachment(new Uint8Array(encryptedData), mediaEncryptionInfo);
    const decryptedData = Attachment.decrypt(encryptedAttachment);

    const blob = new Blob([decryptedData], { type: props.messageInfo?.mimetype || 'image/jpeg' });
    decryptedImageUrl.value = URL.createObjectURL(blob);

  } catch (err) {
    console.error('解密图片失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 处理图片加载成功
const handleImageLoad = () => {
  loading.value = false
  error.value = false
}

// 处理图片加载失败
const handleImageError = () => {
  loading.value = false
  error.value = true
}

// 重试加载图片
const retryLoad = () => {
  loading.value = true
  error.value = false
  // 强制重新加载图片
  const img = document.querySelector('.message-image') as HTMLImageElement
  if (img) {
    img.src = img.src
  }
}

// 打开图片预览
const openImagePreview = () => {
  if (!error.value && props.imageUrl) {
    showPreview.value = true
    // 防止背景滚动
    document.body.style.overflow = 'hidden'
  }
}

// 关闭图片预览
const closeImagePreview = () => {
  showPreview.value = false
  document.body.style.overflow = 'auto'
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

onMounted(() => {
  // 如果没有图片URL，直接标记为加载完成
  if (!props.imageUrl && !props.mxcUrl) {
    loading.value = false
  }
  decryptAndLoadImage();
})

// 监听ESC键关闭预览
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showPreview.value) {
    closeImagePreview()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  decryptAndLoadImage();
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // 确保在组件销毁时恢复滚动
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.message-pic {
  max-width: 100%;
  margin: 4px 0;
}

.image-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.message-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid var(--color-primary, #1890ff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: var(--bg-color-secondary, #f8f9fa);
  border: 1px dashed var(--border-color, #d9d9d9);
  border-radius: 8px;
  color: var(--text-color-secondary, #666);
}

.error-icon {
  font-size: 32px;
}

.retry-btn {
  padding: 6px 12px;
  background: var(--color-primary, #1890ff);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.retry-btn:hover {
  background: var(--color-primary-hover, #40a9ff);
}

.image-info {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-color-secondary, #666);
}

.image-alt {
  font-style: italic;
}

.image-size {
  font-weight: 500;
}

.fallback-content p {
  margin: 0;
  color: var(--text-color, #333);
  font-size: 16px;
  line-height: 1.375;
}

/* 图片预览模态框 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000001;
  backdrop-filter: blur(4px);
}

.preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 32px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preview-info {
  margin-top: 16px;
  text-align: center;
  color: white;
}

.preview-info p {
  margin: 4px 0;
  font-size: 14px;
}

.preview-info p:first-child {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-image {
    max-height: 300px;
  }
  
  .preview-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .preview-image {
    max-height: 75vh;
  }
  
  .close-btn {
    top: -35px;
    font-size: 28px;
    width: 35px;
    height: 35px;
  }
}
</style>
