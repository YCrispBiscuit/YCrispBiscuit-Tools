<template>
  <div class="file-manager-panel">
    <div class="panel-header">
      <h3>文件管理</h3>
      <button class="upload-btn" @click="uploadFile">上传文件</button>
    </div>
    
    <div class="file-list">
      <div v-if="files.length === 0" class="empty-state">
        <p>暂无文件</p>
        <button class="upload-btn-large" @click="uploadFile">点击上传文件</button>
      </div>
      
      <div v-else class="files-container">
        <div 
          v-for="file in files" 
          :key="file.id"
          class="file-item"
          @click="openFile(file)"
        >
          <div class="file-icon">📄</div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-date">{{ formatDate(file.uploadDate) }}</span>
            </div>
          </div>
          <div class="file-actions">
            <button @click.stop="downloadFile(file)" title="下载">⬇️</button>
            <button @click.stop="deleteFile(file)" title="删除">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FileItem {
  id: string
  name: string
  size: number
  uploadDate: Date
  url: string
}

// 文件列表
const files = ref<FileItem[]>([])

// 方法
const uploadFile = () => {
  alert('文件上传功能待实现')
}

const openFile = (file: FileItem) => {
  window.open(file.url, '_blank')
}

const downloadFile = (file: FileItem) => {
  const a = document.createElement('a')
  a.href = file.url
  a.download = file.name
  a.click()
}

const deleteFile = (file: FileItem) => {
  if (confirm(`确定要删除文件 "${file.name}" 吗？`)) {
    files.value = files.value.filter(f => f.id !== file.id)
  }
}

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.file-manager-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #2f3136;
  color: #dcddde;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #40444b;
  background: #36393f;
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.upload-btn {
  padding: 6px 12px;
  background: #43b581;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.upload-btn:hover {
  background: #3ca374;
}

.file-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.upload-btn-large {
  padding: 12px 24px;
  background: #5865f2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.upload-btn-large:hover {
  background: #4752c4;
}

.files-container {
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #40444b;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.file-item:hover {
  background: #4f545c;
}

.file-icon {
  font-size: 24px;
  margin-right: 12px;
}

.file-info {
  flex: 1;
}

.file-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #96989d;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.file-actions button:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
