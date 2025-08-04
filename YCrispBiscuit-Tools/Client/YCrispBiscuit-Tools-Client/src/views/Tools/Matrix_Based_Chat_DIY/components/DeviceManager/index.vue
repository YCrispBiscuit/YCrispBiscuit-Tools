<template>
  <div class="device-manager">
    <div class="device-manager-header">
      <h2>🔐 设备管理</h2>
      <p>管理您的Matrix设备，确保账户安全</p>
    </div>

    <!-- 安全状态概览 -->
    <div class="security-overview">
      <h3>📊 安全概览</h3>
      <div class="stats-grid">
        <div class="stat-card verified">
          <div class="stat-number">{{ securityStats.verified }}</div>
          <div class="stat-label">已验证设备</div>
        </div>
        <div class="stat-card unverified">
          <div class="stat-number">{{ securityStats.unverified }}</div>
          <div class="stat-label">未验证设备</div>
        </div>
        <div class="stat-card blocked">
          <div class="stat-number">{{ securityStats.blocked }}</div>
          <div class="stat-label">已阻止设备</div>
        </div>
        <div class="stat-card total">
          <div class="stat-number">{{ securityStats.total }}</div>
          <div class="stat-label">设备总数</div>
        </div>
      </div>
    </div>

    <!-- 交叉签名状态 -->
    <div class="cross-signing-status">
      <h3>✨ 交叉签名状态</h3>
      <div class="status-row">
        <span class="status-label">交叉签名:</span>
        <span class="status-value" :class="crossSigningStatus.class">
          {{ crossSigningStatus.text }}
        </span>
        <button 
          v-if="!crossSigningStatus.enabled" 
          @click="setupCrossSigning"
          class="btn btn-primary"
          :disabled="loading"
        >
          设置交叉签名
        </button>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="device-list-section">
      <div class="section-header">
        <h3>📱 设备列表</h3>
        <button @click="refreshDevices" class="btn btn-secondary" :disabled="loading">
          <span v-if="loading">🔄 刷新中...</span>
          <span v-else>🔄 刷新</span>
        </button>
      </div>

      <div v-if="loading && devices.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载设备列表...</p>
      </div>

      <div v-else-if="devices.length === 0" class="empty-state">
        <p>没有找到设备</p>
      </div>

      <div v-else class="device-list">
        <div 
          v-for="device in devices" 
          :key="device.deviceId" 
          class="device-item"
          :class="{
            'current': device.isCurrent,
            'verified': device.isVerified,
            'blocked': device.isBlocked
          }"
        >
          <div class="device-icon">
            <span v-if="device.isCurrent">🏠</span>
            <span v-else-if="device.isVerified">✅</span>
            <span v-else-if="device.isBlocked">🚫</span>
            <span v-else>⚠️</span>
          </div>

          <div class="device-info">
            <div class="device-name">
              {{ device.displayName }}
              <span v-if="device.isCurrent" class="current-badge">当前设备</span>
            </div>
            <div class="device-id">{{ device.deviceId }}</div>
            <div class="device-fingerprint">指纹: {{ device.fingerprint }}</div>
            <div class="device-last-seen">
              最后在线: {{ formatLastSeen(device.lastSeen) }}
            </div>
          </div>

          <div class="device-actions">
            <button 
              v-if="!device.isVerified && !device.isCurrent"
              @click="verifyDevice(device)"
              class="btn btn-success btn-sm"
              :disabled="loading"
            >
              ✅ 验证
            </button>
            
            <button 
              v-if="device.isVerified && !device.isCurrent"
              @click="unverifyDevice(device)"
              class="btn btn-warning btn-sm"
              :disabled="loading"
            >
              ❓ 取消验证
            </button>
            
            <button 
              v-if="!device.isBlocked && !device.isCurrent"
              @click="blockDevice(device)"
              class="btn btn-danger btn-sm"
              :disabled="loading"
            >
              🚫 阻止
            </button>
            
            <button 
              v-if="device.isBlocked"
              @click="unblockDevice(device)"
              class="btn btn-secondary btn-sm"
              :disabled="loading"
            >
              🔓 解除阻止
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全建议 -->
    <div class="security-recommendations">
      <h3>💡 安全建议</h3>
      <div v-if="recommendations.length === 0" class="no-recommendations">
        <p>正在生成安全建议...</p>
      </div>
      <div v-else class="recommendation-list">
        <div 
          v-for="(recommendation, index) in recommendations" 
          :key="index"
          class="recommendation-item"
        >
          <span class="recommendation-icon">💡</span>
          <span class="recommendation-text">{{ recommendation }}</span>
        </div>
      </div>
    </div>

    <!-- 操作日志 -->
    <div class="operation-log">
      <h3>📝 操作日志</h3>
      <div class="log-container">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          class="log-entry"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button @click="clearLogs" class="btn btn-secondary btn-sm">
        🗑️ 清空日志
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { deviceService } from '../../services/matrix/devices'
import { matrixClient } from '../../services/matrix/client'
import type { MatrixDevice } from '../../types'

// 响应式数据
const loading = ref(false)
const devices = ref<MatrixDevice[]>([])
const recommendations = ref<string[]>([])
const logs = ref<Array<{time: string, message: string, type: 'info' | 'success' | 'warning' | 'error'}>>([])
const crossSigningStatus = ref({ 
  enabled: false, 
  text: '检查中...', 
  class: 'checking' 
})

// 计算安全统计
const securityStats = computed(() => {
  const total = devices.value.length
  const verified = devices.value.filter(d => d.isVerified).length
  const blocked = devices.value.filter(d => d.isBlocked).length
  const unverified = total - verified - blocked

  return {
    total,
    verified,
    blocked,
    unverified
  }
})

// 添加日志
const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message, type })
  if (logs.value.length > 20) {
    logs.value = logs.value.slice(0, 20)
  }
}

// 格式化最后在线时间
const formatLastSeen = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return date.toLocaleDateString()
}

// 刷新设备列表
const refreshDevices = async () => {
  loading.value = true
  addLog('开始刷新设备列表...', 'info')
  
  try {
    devices.value = await deviceService.获取我的设备列表()
    addLog(`成功获取 ${devices.value.length} 个设备`, 'success')
  } catch (error) {
    addLog(`刷新设备失败: ${(error as Error).message}`, 'error')
    console.error('刷新设备失败:', error)
  } finally {
    loading.value = false
  }
}

// 验证设备
const verifyDevice = async (device: MatrixDevice) => {
  addLog(`开始验证设备: ${device.displayName}`, 'info')
  
  try {
    await deviceService.启动设备验证(device.userId, device.deviceId)
    addLog(`设备验证请求已发送: ${device.displayName}`, 'success')
    
    // 刷新设备列表以更新状态
    await refreshDevices()
  } catch (error) {
    addLog(`设备验证失败: ${(error as Error).message}`, 'error')
    console.error('设备验证失败:', error)
  }
}

// 取消验证设备
const unverifyDevice = async (device: MatrixDevice) => {
  addLog(`取消验证设备: ${device.displayName}`, 'warning')
  // TODO: 实现取消验证逻辑
  addLog('取消验证功能待实现', 'warning')
}

// 阻止设备
const blockDevice = async (device: MatrixDevice) => {
  addLog(`阻止设备: ${device.displayName}`, 'warning')
  // TODO: 实现阻止设备逻辑
  addLog('阻止设备功能待实现', 'warning')
}

// 解除阻止设备
const unblockDevice = async (device: MatrixDevice) => {
  addLog(`解除阻止设备: ${device.displayName}`, 'info')
  // TODO: 实现解除阻止逻辑
  addLog('解除阻止功能待实现', 'info')
}

// 设置交叉签名
const setupCrossSigning = async () => {
  addLog('开始设置交叉签名...', 'info')
  
  try {
    await matrixClient.初始化交叉签名()
    addLog('交叉签名设置成功!', 'success')
    await checkCrossSigningStatus()
  } catch (error) {
    addLog(`交叉签名设置失败: ${(error as Error).message}`, 'error')
    console.error('交叉签名设置失败:', error)
  }
}

// 检查交叉签名状态
const checkCrossSigningStatus = async () => {
  try {
    const client = matrixClient.getAuthedClient()
    if (!client) {
      crossSigningStatus.value = { enabled: false, text: '未登录', class: 'error' }
      return
    }

    const crypto = client.getCrypto()
    const userId = client.getUserId()
    
    if (!crypto || !userId) {
      crossSigningStatus.value = { enabled: false, text: '加密未初始化', class: 'error' }
      return
    }

    // 检查交叉签名是否可用
    const crossSigningInfo = await crypto.getCrossSigningInfo?.(userId)
    if (crossSigningInfo && crossSigningInfo.getId()) {
      crossSigningStatus.value = { enabled: true, text: '已启用', class: 'success' }
    } else {
      crossSigningStatus.value = { enabled: false, text: '未启用', class: 'warning' }
    }
  } catch (error) {
    crossSigningStatus.value = { enabled: false, text: '检查失败', class: 'error' }
    console.error('检查交叉签名状态失败:', error)
  }
}

// 生成安全建议
const generateRecommendations = async () => {
  try {
    recommendations.value = await deviceService.生成安全建议()
    addLog(`生成了 ${recommendations.value.length} 条安全建议`, 'info')
  } catch (error) {
    addLog(`生成安全建议失败: ${(error as Error).message}`, 'error')
    console.error('生成安全建议失败:', error)
  }
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  addLog('日志已清空', 'info')
}

// 组件挂载时初始化
onMounted(async () => {
  addLog('设备管理器已加载', 'info')
  
  // 初始化各项检查
  await Promise.all([
    refreshDevices(),
    checkCrossSigningStatus(),
    generateRecommendations()
  ])
})
</script>

<style scoped>
.device-manager {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

.device-manager-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.device-manager-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 28px;
}

.device-manager-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.security-overview,
.cross-signing-status,
.device-list-section,
.security-recommendations,
.operation-log {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.security-overview h3,
.cross-signing-status h3,
.device-list-section h3,
.security-recommendations h3,
.operation-log h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.stat-card.verified {
  background: #28a745;
}

.stat-card.unverified {
  background: #ffc107;
  color: #333;
}

.stat-card.blocked {
  background: #dc3545;
}

.stat-card.total {
  background: #6c757d;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-label {
  font-weight: 500;
  color: #333;
}

.status-value {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.status-value.success {
  background: #d4edda;
  color: #155724;
}

.status-value.warning {
  background: #fff3cd;
  color: #856404;
}

.status-value.error {
  background: #f8d7da;
  color: #721c24;
}

.status-value.checking {
  background: #d1ecf1;
  color: #0c5460;
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 16px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.device-list {
  display: grid;
  gap: 16px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s;
}

.device-item.current {
  border-color: #007bff;
  background: #f8f9ff;
}

.device-item.verified {
  border-color: #28a745;
  background: #f8fff9;
}

.device-item.blocked {
  border-color: #dc3545;
  background: #fff8f8;
}

.device-icon {
  font-size: 24px;
  min-width: 40px;
  text-align: center;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-badge {
  background: #007bff;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.device-id {
  font-size: 12px;
  color: #666;
  font-family: monospace;
  margin-bottom: 4px;
}

.device-fingerprint {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.device-last-seen {
  font-size: 12px;
  color: #999;
}

.device-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-warning {
  background: #ffc107;
  color: #333;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.recommendation-list {
  display: grid;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.recommendation-icon {
  font-size: 16px;
  margin-top: 2px;
}

.recommendation-text {
  flex: 1;
  color: #856404;
  line-height: 1.4;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-entry {
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
}

.log-time {
  color: #666;
  min-width: 70px;
  font-size: 11px;
}

.log-message {
  flex: 1;
}

.log-entry.success .log-message {
  color: #28a745;
}

.log-entry.error .log-message {
  color: #dc3545;
}

.log-entry.warning .log-message {
  color: #fd7e14;
}

.log-entry.info .log-message {
  color: #333;
}

.no-recommendations {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style>
