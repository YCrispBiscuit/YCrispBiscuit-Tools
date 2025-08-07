<template>
  <div class="message-file">
    <div class="file-container">
      <!-- 文件图标和信息 -->
      <div class="file-header">
        <div class="file-icon">
          <!-- 统一使用默认图标 -->
          <span class="icon default-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </span>
        </div>
        
        <div class="file-info">
          <div class="file-name" :title="fileName">{{ fileName }}</div>
          <div class="file-details">
            <span v-if="fileSize" class="file-size">{{ formatFileSize(fileSize) }}</span>
            <span v-if="fileName" class="file-type">{{ getFileTypeDisplay(fileName) }}</span>
          </div>
        </div>
        
        <div class="file-actions">
          <button 
            v-if="fileUrl" 
            @click="downloadFile" 
            class="download-btn"
            :disabled="downloading"
            title="下载文件"
          >
            <span v-if="downloading" class="loading-spinner"></span>
            <span v-else>⬇️</span>
          </button>
          
          <!-- 如果没有URL，显示一个禁用的下载按钮 -->
          <button 
            v-else
            class="download-btn disabled"
            disabled
            title="文件暂不可下载"
          >
            🚫
          </button>
          
          <button 
            v-if="fileUrl && (isAudio || isVideo)" 
            @click="togglePreview"
            class="preview-btn"
            :disabled="decrypting"
            :title="isAudio ? '播放音频' : '播放视频'"
          >
            <span v-if="decrypting" class="loading-spinner"></span>
            <span v-else>
              <svg v-if="!showPreview" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </span>
          </button>
        </div>
      </div>

      <!-- 音频/视频预览 -->
      <div v-if="showPreview && (isAudio || isVideo)" class="media-preview">
        <audio 
          v-if="isAudio" 
          :src="mediaSourceUrl" 
          controls 
          class="audio-player"
          @error="handleMediaError"
        />
        <video 
          v-else-if="isVideo" 
          :src="mediaSourceUrl" 
          controls 
          class="video-player"
          @error="handleMediaError"
        />
        <div v-if="mediaError" class="media-error">
          <span>媒体文件无法播放</span>
          <button @click="retryMedia" class="retry-btn">重试</button>
        </div>
      </div>

      <!-- 文件内容预览（对于某些文本文件） -->
      <div v-if="showTextPreview && textContent" class="text-preview">
        <pre>{{ textContent }}</pre>
        <button @click="showTextPreview = false" class="collapse-btn">收起</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Attachment, EncryptedAttachment } from '@matrix-org/matrix-sdk-crypto-wasm'
import { matrixClient } from '../../../../../services/matrix/client'


interface Props {
  content: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  isAudio?: boolean
  isVideo?: boolean
  // 添加原始mxc URL用于下载
  mxcUrl?: string
  // 添加加密信息用于解密文件
  encryptionInfo?: any
}

const props = withDefaults(defineProps<Props>(), {
  fileName: '未知文件',
  isAudio: false,
  isVideo: false
})

const emit = defineEmits(['download-encrypted']);

const downloading = ref(false)
const decrypting = ref(false) // 新增：解密状态
const showPreview = ref(false)
const mediaError = ref(false)
const showTextPreview = ref(false)
const textContent = ref('')
const decryptedMediaUrl = ref<string | null>(null) // 新增：存储解密后的媒体URL

// 新增：计算媒体源URL
const mediaSourceUrl = computed(() => {
  if (props.encryptionInfo && decryptedMediaUrl.value) {
    return decryptedMediaUrl.value;
  }
  return props.fileUrl;
});

// 获取文件类型显示名称
const getFileTypeDisplay = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toUpperCase();
  if (extension) {
    return `${extension} 文件`;
  }
  return '文件';
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 下载文件
const downloadFile = async () => {
  // 关键判断：如果存在 encryptionInfo，则必须走加密下载流程
  if (props.encryptionInfo) {

    // 确保 emit 的事件能被父组件捕获
    emit('download-encrypted');
    return;
  }

  if (!props.fileUrl) {
    alert('文件链接无效，无法下载。');
    return;
  }
  
  downloading.value = true;
  try {

    
    const response = await fetch(props.fileUrl);
    if (!response.ok) throw new Error(`下载失败: ${response.statusText}`);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = props.fileName || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error(`❌ 文件下载失败:`, error);
    alert(`文件下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    downloading.value = false;
  }
};

// 切换媒体预览
const togglePreview = async () => {
  // 如果已经显示，则直接隐藏
  if (showPreview.value) {
    showPreview.value = false;
    return;
  }

  mediaError.value = false;

  // 关键逻辑：如果是加密文件且尚未解密
  if (props.encryptionInfo && !decryptedMediaUrl.value) {
    if (!props.mxcUrl) {
      alert('无法解密：缺少mxcUrl');
      return;
    }
    decrypting.value = true;
    try {
      const client = matrixClient.getAuthedClient();
      if (!client) throw new Error('Matrix客户端未认证');

      const httpUrl = client.mxcUrlToHttp(props.mxcUrl, null, null, null, true);
      if (!httpUrl) throw new Error('无法将MXC URL转换为HTTP URL');

      const response = await fetch(httpUrl);
      if (!response.ok) throw new Error(`文件下载失败: ${response.statusText}`);
      const encryptedData = await response.arrayBuffer();

      const mediaEncryptionInfo = JSON.stringify(props.encryptionInfo);
      const encryptedAttachment = new EncryptedAttachment(new Uint8Array(encryptedData), mediaEncryptionInfo);
      const decryptedData = Attachment.decrypt(encryptedAttachment);

      const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
      decryptedMediaUrl.value = URL.createObjectURL(blob);
      
    } catch (error) {
      console.error('解密媒体文件失败:', error);
      mediaError.value = true;
      return; // 出错时终止
    } finally {
      decrypting.value = false;
    }
  }

  // 显示预览
  showPreview.value = true;
};

// 处理媒体错误
const handleMediaError = () => {
  mediaError.value = true
  console.error('媒体文件播放失败:', props.fileUrl)
}

// 重试播放媒体
const retryMedia = () => {
  mediaError.value = false
  // 强制重新加载媒体元素
  const mediaElement = document.querySelector('.audio-player, .video-player') as HTMLMediaElement
  if (mediaElement) {
    mediaElement.load()
  }
}
</script>

<style scoped>
.message-file {
  max-width: 100%;
  margin: 4px 0;
}

.file-container {
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 8px;
  background: var(--bg-color-secondary, #f8f9fa);
  overflow: hidden;
  transition: all 0.2s ease;
}

.file-container:hover {
  border-color: var(--color-primary, #1890ff);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.file-header {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}

.file-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color, #fff);
  border-radius: 6px;
  border: 1px solid var(--border-color, #e1e1e1);
}

.icon {
  font-size: 20px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: var(--text-color, #333);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.file-details {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text-color-secondary, #666);
}

.file-size {
  font-weight: 500;
}

.file-type {
  background: var(--color-primary-bg, rgba(24, 144, 255, 0.1));
  color: var(--color-primary, #1890ff);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.file-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.download-btn,
.preview-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color, #d9d9d9);
  background: var(--bg-color, #fff);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
}

.download-btn:hover,
.preview-btn:hover {
  border-color: var(--color-primary, #1890ff);
  background: var(--color-primary-bg, rgba(24, 144, 255, 0.1));
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--bg-color-tertiary, #f5f5f5);
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border: 1px solid #f3f3f3;
  border-top: 1px solid var(--color-primary, #1890ff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.media-preview {
  border-top: 1px solid var(--border-color, #e1e1e1);
  padding: 12px;
  background: var(--bg-color, #fff);
}

.audio-player {
  width: 100%;
  height: 40px;
}

.video-player {
  width: 100%;
  max-height: 300px;
  border-radius: 6px;
}

.media-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  color: var(--text-color-secondary, #666);
  font-size: 14px;
}

.retry-btn {
  padding: 4px 8px;
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

.text-preview {
  border-top: 1px solid var(--border-color, #e1e1e1);
  background: var(--bg-color, #fff);
  position: relative;
}

.text-preview pre {
  margin: 0;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-color, #333);
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.collapse-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: var(--bg-color-secondary, #f8f9fa);
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-color-secondary, #666);
}

.collapse-btn:hover {
  background: var(--bg-color, #fff);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-header {
    padding: 10px;
    gap: 10px;
  }
  
  .file-icon {
    width: 36px;
    height: 36px;
  }
  
  .icon {
    font-size: 18px;
  }
  
  .file-name {
    font-size: 13px;
  }
  
  .file-details {
    font-size: 11px;
  }
  
  .download-btn,
  .preview-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
  
  .video-player {
    max-height: 200px;
  }
}
</style>
