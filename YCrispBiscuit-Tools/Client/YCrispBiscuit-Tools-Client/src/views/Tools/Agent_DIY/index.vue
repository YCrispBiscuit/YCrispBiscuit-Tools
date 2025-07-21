<template>
    <div class="agent-diy-container">

        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 工具栏 -->
            <div class="toolbar">
                <!-- 视图切换按钮 -->
                <div class="view-switcher">
                    <button class="view-btn" :class="{ active: currentView === 'Node' }" @click="currentView = 'Node'">
                        🔗 节点视图
                    </button>
                    <button class="view-btn" :class="{ active: currentView === 'Json' }" @click="currentView = 'Json'">
                        📝 JSON视图
                    </button>
                    <button class="view-btn" :class="{ active: currentView === 'Preview' }" @click="currentView = 'Preview'">
                        👁️ 预览视图
                    </button>
                </div>

                <!-- 未来其他可能的操作 -->
                <div class="actions">
                    <!-- 撤销/重做按钮 -->
                    <div class="undo-redo-group">
                        <button 
                            @click="undo()" 
                            :disabled="!canUndo()" 
                            class="undo-btn"
                            title="撤销 (Ctrl+Z)"
                        >
                            ↶ 撤销
                        </button>
                        <button 
                            @click="redo()" 
                            :disabled="!canRedo()" 
                            class="redo-btn"
                            title="重做 (Ctrl+Shift+Z)"
                        >
                            ↷ 重做
                        </button>
                    </div>

                    <!-- 变化追踪状态显示 -->
                    <div class="change-tracker-status">
                        <span class="change-count">{{ getChangeStats().totalChanges }} 处变化</span>
                        <button v-if="getChangeStats().totalChanges > 0" @click="showChangeDetails = !showChangeDetails" class="detail-btn" title="查看数据变化详情">
                            � 变化
                        </button>
                        <span class="operation-count">{{ getOperationStats().totalOperations }} 个操作</span>
                        <button v-if="getOperationStats().totalOperations > 0" @click="showOperationDetails = !showOperationDetails" class="operation-btn" title="查看操作记录">
                            📋 操作
                        </button>
                        <button v-if="getOperationStats().totalOperations > 0" @click="resetChangeTracking()" class="reset-btn" title="重置追踪">
                            🔄 重置
                        </button>
                    </div>

                    <!-- WebSocket 状态和操作 -->
                    <div class="websocket-status">
                        <span class="connection-status" :class="{ connected: isConnected, disconnected: !isConnected }">
                            {{ isConnected ? '🟢 已连接' : '🔴 未连接' }}
                        </span>
                        <span v-if="autoSaveTimer || isSaving" class="auto-save-status">
                            {{ isSaving ? '💾 保存中...' : '⏱️ 准备保存...' }}
                        </span>
                        <!--button @click="getDataFromBackend()" :disabled="!isConnected" class="websocket-btn" title="从后端获取数据">
                            📥 获取
                        </button-->
                        <!--button @click="deployToBackend()" :disabled="!isConnected || isSaving" class="websocket-btn" title="保存到后端">
                            💾 保存
                        </button-->
                    </div>
                </div>
            </div>

            <!-- 变化详情面板 -->
            <div v-if="showChangeDetails && getChangeStats().totalChanges > 0" class="change-details-panel">
                <div class="change-details-header">
                    <h4>� 数据变化详情</h4>
                    <button @click="showChangeDetails = false" class="close-details">✕</button>
                </div>
                <div class="change-details-content">
                    <div class="change-summary">
                        <p><strong>数据变化数:</strong> {{ getChangeStats().totalChanges }}</p>
                        <p><strong>撤销栈:</strong> {{ undoStack.length - 1 }} 步可撤销</p>
                        <p><strong>重做栈:</strong> {{ redoStack.length }} 步可重做</p>
                    </div>
                    <div class="change-log">
                        <h5>变化字段:</h5>
                        <div v-for="(changePath, index) in getChangeStats().changedPaths" :key="index" class="change-item">
                            <div class="change-info">
                                <span class="change-type" data-type="data_change">变化</span>
                                <span class="change-path">{{ changePath.path }}</span>
                                <span class="change-status">已修改</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作详情面板 -->
            <div v-if="showOperationDetails && getOperationStats().totalOperations > 0" class="change-details-panel">
                <div class="change-details-header">
                    <h4>📋 操作追踪记录</h4>
                    <button @click="showOperationDetails = false" class="close-details">✕</button>
                </div>
                <div class="change-details-content">
                    <div class="change-summary">
                        <p><strong>总操作数:</strong> {{ getOperationStats().totalOperations }}</p>
                        <p v-if="getOperationStats().lastOperationTime"><strong>最后操作:</strong> {{ new Date(getOperationStats().lastOperationTime).toLocaleString() }}</p>
                    </div>
                    <div class="change-log">
                        <h5>操作记录:</h5>
                        <div v-for="(operation, index) in getOperationStats().operationLog" :key="index" class="change-item">
                            <div class="change-info">
                                <span class="change-type" :data-type="operation.operationType">{{ operation.operationType }}</span>
                                <span class="change-path">{{ operation.fieldPath }}</span>
                                <span class="change-time">{{ new Date(operation.timestamp).toLocaleTimeString() }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 视图内容区域 -->
            <div class="view-container">
                <!-- 节点视图 -->
                <Agent_Node v-if="currentView === 'Node'" v-show="currentView === 'Node'" />

                <!-- JSON视图 -->
                <Agent_Json v-if="currentView === 'Json'" v-show="currentView === 'Json'" />

                <!-- 预览视图 -->
                <Agent_Preview v-if="currentView === 'Preview'" v-show="currentView === 'Preview'" />
            </div>
        </div>

        <!-- 未来扩展区域 -->
        <div class="future-area">
            <!-- 留给未来可能进行的其他操作的空间 -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Agent_Node from './Agent_Node/index'
import Agent_Json from './Agent_JSON/index'
import Agent_Preview from './Agent_Preview/index'
import { rawData } from './Data/Raw_Data'
import { useWebSocket } from '../../../utils/websocket'

// 路由参数
const route = useRoute()
const applicationId = computed(() => route.params.applicationId as string)

// 当前视图状态
const currentView = ref<'Node' | 'Json' | 'Preview'>('Node')

// 变化详情显示状态
const showChangeDetails = ref(false)

// 操作详情显示状态
const showOperationDetails = ref(false)

// 共享的团队数据
const teamData = ref(JSON.parse(JSON.stringify(rawData)))

// 当前记录ID（从WebSocket接收的数据ID）
const currentRecordId = ref<number | null>(null)

// 上一次状态快照（用于计算变化差异）
const previousStateSnapshot = ref<any>(null)

// ========== 操作追踪系统 ========== //
const operationLog = ref<any[]>([])

// ========== 变化追踪系统 ========== //
const originalDataSnapshot = ref<any>(null)

// ========== 撤销/重做系统 ========== //
const undoStack = ref<any[]>([])
const redoStack = ref<any[]>([])
const maxUndoSteps = 50 // 最大撤销步数
const isUndoRedoOperation = ref(false) // 标记当前是否在执行撤销/重做操作

// 记录原始数据快照
function saveOriginalSnapshot() {
    originalDataSnapshot.value = JSON.parse(JSON.stringify(teamData.value))
    // 初始状态也保存到撤销栈
    undoStack.value = [JSON.parse(JSON.stringify(teamData.value))]
    redoStack.value = []
    console.log('[ChangeTracker] 📸 保存原始数据快照')
}

// 保存当前状态到撤销栈
function saveToUndoStack() {
    const currentState = JSON.parse(JSON.stringify(teamData.value))
    undoStack.value.push(currentState)
    
    // 清空重做栈（新操作后不能重做之前的撤销）
    redoStack.value = []
    
    // 限制撤销栈大小
    if (undoStack.value.length > maxUndoSteps) {
        undoStack.value.shift()
    }
    
    console.log(`[UndoRedo] 💾 保存状态到撤销栈 (${undoStack.value.length}/${maxUndoSteps})`)
}

// 记录数据变化
function recordChange(fieldPath: string, newValue: any, operationType: string = 'edit') {
    // 如果正在执行撤销/重做操作，不记录变化
    if (isUndoRedoOperation.value) {
        return
    }
    
    // 在记录变化前，先保存当前状态作为previousState（用于变化对比）
    if (!previousStateSnapshot.value) {
        console.log('[ChangeAnalysis] 📸 首次保存previousState快照')
        previousStateSnapshot.value = JSON.parse(JSON.stringify(teamData.value))
    }
    
    // 在记录变化前，先保存当前状态到撤销栈
    saveToUndoStack()
    
    const timestamp = new Date().toISOString()
    const change = {
        timestamp,
        fieldPath,
        newValue: JSON.parse(JSON.stringify(newValue)),
        operationType
    }
    operationLog.value.push(change)
    console.log(`[OperationTracker] 📝 记录操作: ${fieldPath} (${operationType})`)
    
    // 触发自动保存
    autoSave()
}

// 撤销操作
function undo() {
    if (undoStack.value.length <= 1) {
        console.log('[UndoRedo] ⚠️ 没有可撤销的操作')
        return false
    }
    
    isUndoRedoOperation.value = true
    
    try {
        // 将当前状态移到重做栈
        const currentState = JSON.parse(JSON.stringify(teamData.value))
        redoStack.value.push(currentState)
        
        // 从撤销栈取出上一个状态
        undoStack.value.pop() // 移除当前状态
        const previousState = undoStack.value[undoStack.value.length - 1]
        
        // 恢复数据
        teamData.value = JSON.parse(JSON.stringify(previousState))
        
        // 添加撤销操作记录
        const timestamp = new Date().toISOString()
        operationLog.value.push({
            timestamp,
            fieldPath: 'system',
            newValue: null,
            operationType: 'undo'
        })
        
        console.log(`[UndoRedo] ↶ 撤销操作 (撤销栈: ${undoStack.value.length}, 重做栈: ${redoStack.value.length})`)
        return true
    } finally {
        isUndoRedoOperation.value = false
    }
}

// 重做操作
function redo() {
    if (redoStack.value.length === 0) {
        console.log('[UndoRedo] ⚠️ 没有可重做的操作')
        return false
    }
    
    isUndoRedoOperation.value = true
    
    try {
        // 将当前状态保存到撤销栈
        const currentState = JSON.parse(JSON.stringify(teamData.value))
        undoStack.value.push(currentState)
        
        // 从重做栈取出状态并恢复
        const redoState = redoStack.value.pop()
        teamData.value = JSON.parse(JSON.stringify(redoState))
        
        // 添加重做操作记录
        const timestamp = new Date().toISOString()
        operationLog.value.push({
            timestamp,
            fieldPath: 'system',
            newValue: null,
            operationType: 'redo'
        })
        
        console.log(`[UndoRedo] ↷ 重做操作 (撤销栈: ${undoStack.value.length}, 重做栈: ${redoStack.value.length})`)
        return true
    } finally {
        isUndoRedoOperation.value = false
    }
}

// 检查是否可以撤销/重做
function canUndo() {
    return undoStack.value.length > 1
}

function canRedo() {
    return redoStack.value.length > 0
}

// 生成变化摘要
function generateChangesSummary(): any {
    if (!originalDataSnapshot.value || !teamData.value) {
        return {}
    }
    
    const changes: any = {}
    const original = originalDataSnapshot.value
    const current = teamData.value
    
    // 深度比较数据变化
    const changedPaths = findChangedPaths(original, current, '')
    
    changedPaths.forEach(pathInfo => {
        const { path, currentValue } = pathInfo
        setNestedValue(changes, path, currentValue)
    })
    
    return changes
}

// 递归查找变化路径
function findChangedPaths(original: any, current: any, basePath: string = ''): Array<{path: string, originalValue: any, currentValue: any}> {
    const changes: Array<{path: string, originalValue: any, currentValue: any}> = []
    
    if (JSON.stringify(original) === JSON.stringify(current)) {
        return changes
    }
    
    // 数组作为整体比较
    if (Array.isArray(original) || Array.isArray(current)) {
        if (JSON.stringify(original) !== JSON.stringify(current)) {
            changes.push({
                path: basePath,
                originalValue: original,
                currentValue: current
            })
        }
        return changes
    }
    
    // 对象字段逐一比较
    if (typeof original === 'object' && typeof current === 'object' && original !== null && current !== null) {
        const allKeys = new Set([...Object.keys(original), ...Object.keys(current)])
        
        for (const key of allKeys) {
            const newPath = basePath ? `${basePath}.${key}` : key
            const originalValue = original[key]
            const currentValue = current[key]
            
            if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
                changes.push(...findChangedPaths(originalValue, currentValue, newPath))
            }
        }
    } else {
        // 基础类型直接比较
        if (original !== current) {
            changes.push({
                path: basePath,
                originalValue: original,
                currentValue: current
            })
        }
    }
    
    return changes
}

// 设置嵌套对象值
function setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!(key in current)) {
            current[key] = {}
        }
        current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
}

// 获取操作统计
function getOperationStats() {
    const operationCount = operationLog.value.length
    
    return {
        totalOperations: operationCount,
        lastOperationTime: operationLog.value.length > 0 ? operationLog.value[operationLog.value.length - 1].timestamp : null,
        operationLog: operationLog.value
    }
}

// 获取变化统计（与原始版本对比）
function getChangeStats() {
    const summary = generateChangesSummary()
    const changeCount = Object.keys(summary).length
    
    return {
        totalChanges: changeCount,
        changesSummary: summary,
        changedPaths: findChangedPaths(originalDataSnapshot.value, teamData.value, '')
    }
}

// 重置变化追踪（保存新快照）
function resetChangeTracking() {
    saveOriginalSnapshot()
    operationLog.value = []
    console.log('[ChangeTracker] 🔄 重置变化追踪')
}

// 键盘快捷键处理
function handleKeydown(event: KeyboardEvent) {
    // Ctrl+Z 撤销
    if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
    }
    // Ctrl+Shift+Z 或 Ctrl+Y 重做
    else if ((event.ctrlKey && event.shiftKey && event.key === 'Z') || 
             (event.ctrlKey && event.key === 'y')) {
        event.preventDefault()
        redo()
    }
}

// ==================================================================================
// WebSocket 系统 - 后端数据存储与同步
// ==================================================================================
// WebSocket 连接状态
const isConnected = ref(false)
const isSaving = ref(false)
const autoSaveTimer = ref<any>(null)

// 动态WebSocket连接URL
const websocketUrl = computed(() => `wss://chat.zy-jn.org.cn/aagent/ws/${applicationId.value}`)

// WebSocket实例
let websocketInstance: ReturnType<typeof useWebSocket> | null = null

// WebSocket消息发送包装器
function sendWebSocketMessage(data: any) {
    console.log('[WebSocket] 🔍 准备发送消息，检查连接状态')
    console.log('[WebSocket] 🔍 WebSocket实例存在:', !!websocketInstance)
    console.log('[WebSocket] 🔍 连接状态:', isConnected.value)
    
    if (websocketInstance && isConnected.value) {
        console.log('[WebSocket] ✅ 连接正常，开始发送消息')
        console.log('[WebSocket] 📤 发送的数据内容:', JSON.stringify(data, null, 2))
        websocketInstance.send(data)
        console.log('[WebSocket] ✅ 消息发送完成')
    } else {
        console.error('[WebSocket] ❌ WebSocket未连接，无法发送消息')
        console.error('[WebSocket] 🔍 失败原因 - WebSocket实例:', !!websocketInstance, '连接状态:', isConnected.value)
    }
}

// 自动接收数据函数 - 连接成功后自动触发
function autoReceiveData() {
    try {
        console.log('[WebSocket] 🤖 开始自动数据接收流程')
        console.log('[WebSocket] 🔍 当前applicationId:', applicationId.value)
        console.log('[WebSocket] 🤖 自动请求后端数据...')
        
        // 构造查询请求数据
        const requestData = { 
            table: 'AgentTeam', 
            action: 'select' 
        }
        console.log('[WebSocket] 📝 构造的查询请求:', JSON.stringify(requestData, null, 2))
        
        // 发送查询请求，让后端返回Agent_DIY数据
        sendWebSocketMessage(requestData)
        
        console.log('[WebSocket] ✅ 自动数据请求已发送，等待后端响应')
        console.log('[WebSocket] ⏳ 请等待后端处理并返回数据...')
        
    } catch (error: any) {
        console.error('[WebSocket] ❌ 自动请求数据失败:', error)
        console.error('[WebSocket] 🔍 错误详情:', error.message)
        console.error('[WebSocket] 🔍 错误堆栈:', error.stack)
    }
}

// 手动从后端获取数据
function getDataFromBackend() {
    try {
        console.log('[WebSocket] 🔄 手动数据获取流程开始')
        console.log('[WebSocket] 🔍 当前连接状态:', isConnected.value)
        console.log('[WebSocket] 🔄 手动请求后端数据...')
        
        const requestData = { 
            table: 'AgentTeam', 
            action: 'select' 
        }
        console.log('[WebSocket] 📝 手动请求数据:', JSON.stringify(requestData, null, 2))
        
        sendWebSocketMessage(requestData)
        console.log('[WebSocket] ✅ 手动数据请求已发送')
        
    } catch (error: any) {
        console.error('[WebSocket] ❌ 手动请求数据失败:', error)
        console.error('[WebSocket] 🔍 手动请求错误详情:', error.message)
    }
}

// 分析数据变化（用于SubmissionRecord格式）
function analyzeChanges(current: any, previous: any): { content: any, originalContent: any } {
    console.log('[ChangeAnalysis] 🔍 开始分析数据变化')
    console.log('[ChangeAnalysis] 📊 当前数据类型:', typeof current)
    console.log('[ChangeAnalysis] 📊 之前数据类型:', typeof previous)
    
    const content: any = {}
    const originalContent: any = {}
    
    if (!previous) {
        console.log('[ChangeAnalysis] ⚠️ 没有之前的状态，返回完整当前状态')
        return { 
            content: JSON.parse(JSON.stringify(current)), 
            originalContent: {} 
        }
    }
    
    // 递归比较对象，找出变化的键值对
    function findChangedFields(currentObj: any, previousObj: any, path: string = '') {
        if (typeof currentObj !== 'object' || typeof previousObj !== 'object') {
            if (JSON.stringify(currentObj) !== JSON.stringify(previousObj)) {
                console.log('[ChangeAnalysis] 🔍 发现变化字段:', path || 'root')
                setNestedValue(content, path || 'root', currentObj)
                setNestedValue(originalContent, path || 'root', previousObj)
            }
            return
        }
        
        // 处理数组 - 数组作为整体记录
        if (Array.isArray(currentObj) || Array.isArray(previousObj)) {
            if (JSON.stringify(currentObj) !== JSON.stringify(previousObj)) {
                console.log('[ChangeAnalysis] 📝 数组变化:', path)
                setNestedValue(content, path, JSON.parse(JSON.stringify(currentObj)))
                setNestedValue(originalContent, path, JSON.parse(JSON.stringify(previousObj)))
            }
            return
        }
        
        // 处理对象字段
        const allKeys = new Set([
            ...Object.keys(currentObj || {}), 
            ...Object.keys(previousObj || {})
        ])
        
        for (const key of allKeys) {
            const newPath = path ? `${path}.${key}` : key
            const currentValue = currentObj?.[key]
            const previousValue = previousObj?.[key]
            
            findChangedFields(currentValue, previousValue, newPath)
        }
    }
    
    findChangedFields(current, previous)
    
    console.log('[ChangeAnalysis] 📊 分析结果:')
    console.log('[ChangeAnalysis] 📋 变化字段数量:', Object.keys(content).length)
    console.log('[ChangeAnalysis] 📋 content:', content)
    console.log('[ChangeAnalysis] 📋 originalContent:', originalContent)
    
    return { content, originalContent }
}

// 部署/保存数据到后端
function deployToBackend() {
    try {
        console.log('[WebSocket] 💾 部署数据到后端流程开始')
        console.log('[WebSocket] 🔍 当前连接状态:', isConnected.value)
        console.log('[WebSocket] 🔍 当前保存状态:', isSaving.value)
        console.log('[WebSocket] � 当前记录ID:', currentRecordId.value)
        console.log('[WebSocket] �💾 部署数据到后端...')
        
        isSaving.value = true
        console.log('[WebSocket] 🔄 设置保存状态为true')
        
        // 检查必要的数据
        if (!currentRecordId.value) {
            console.warn('[WebSocket] ⚠️ 没有记录ID，无法发送数据')
            isSaving.value = false
            return
        }
        
        // 分析变化
        console.log('[WebSocket] 🔍 开始分析数据变化')
        const changeAnalysis = analyzeChanges(teamData.value, previousStateSnapshot.value)
        console.log('[WebSocket] 📊 变化分析完成:', {
            contentFieldsCount: Object.keys(changeAnalysis.content).length,
            originalContentFieldsCount: Object.keys(changeAnalysis.originalContent).length
        })
        
        // 构造SubmissionRecord格式的数据
        const submissionData = {
            table: 'SubmissionRecord',
            action: 'insert', 
            value: {
                master: currentRecordId.value.toString(),      // 使用当前记录ID作为master
                teamBody: JSON.parse(JSON.stringify(teamData.value)),  // 完整的当前teamBody JSON对象
                content: changeAnalysis.content,               // 变化的部分（当前值）
                originalContent: changeAnalysis.originalContent // 变化的部分（原始值）
            }
        }
        
        console.log('[WebSocket] 📝 构造的SubmissionRecord数据结构:')
        console.log('[WebSocket] 📋 - 表名:', submissionData.table)
        console.log('[WebSocket] 📋 - 操作:', submissionData.action)
        console.log('[WebSocket] 📋 - master ID:', submissionData.value.master)
        console.log('[WebSocket] 📋 - teamBody大小:', JSON.stringify(submissionData.value.teamBody).length, '字符')
        console.log('[WebSocket] 📋 - content变化字段数:', Object.keys(submissionData.value.content).length)
        console.log('[WebSocket] 📋 - originalContent字段数:', Object.keys(submissionData.value.originalContent).length)
        console.log('[WebSocket] 📝 完整SubmissionRecord数据:', JSON.stringify(submissionData, null, 2))
        
        sendWebSocketMessage(submissionData)
        console.log('[WebSocket] ✅ SubmissionRecord部署请求已发送')
        console.log('[WebSocket] ⏳ 等待后端确认保存结果...')
        console.log('[WebSocket] 🔍 发送时间戳:', new Date().toISOString())
        console.log('[WebSocket] 📊 发送数据摘要:')
        console.log('[WebSocket] 📋   - 表名:', submissionData.table)
        console.log('[WebSocket] 📋   - 操作:', submissionData.action)
        console.log('[WebSocket] 📋   - master ID:', submissionData.value.master)
        console.log('[WebSocket] 📋   - teamBody大小:', JSON.stringify(submissionData.value.teamBody).length, '字符')
        console.log('[WebSocket] 📋   - content变化字段:', Object.keys(submissionData.value.content).join(', '))
        console.log('[WebSocket] 📋   - originalContent字段:', Object.keys(submissionData.value.originalContent).join(', '))
        console.log('[WebSocket] 📋   - 实际发送的JSON大小:', JSON.stringify(submissionData).length, '字符')
        
        // 保存当前状态作为下次的previousState
        previousStateSnapshot.value = JSON.parse(JSON.stringify(teamData.value))
        console.log('[WebSocket] 📸 保存当前状态作为下次比较的基准')
        
        // 设置超时重置保存状态（防止一直显示保存中）
        setTimeout(() => {
            if (isSaving.value) {
                console.warn('[WebSocket] ⚠️ 保存超时，自动重置保存状态')
                console.warn('[WebSocket] 🕒 超时时间:', new Date().toISOString())
                console.warn('[WebSocket] ❓ 可能原因: 1.后端未响应 2.网络问题 3.数据格式问题 4.后端错误')
                
                // 清理自动保存定时器
                if (autoSaveTimer.value) {
                    console.warn('[WebSocket] 🗑️ 超时清理自动保存定时器')
                    clearTimeout(autoSaveTimer.value)
                    autoSaveTimer.value = null
                }
                
                isSaving.value = false
            }
        }, 10000) // 10秒超时
        
        console.log('[WebSocket] ⏰ 设置超时保护，10秒后检查保存状态')
        
    } catch (error: any) {
        console.error('[WebSocket] ❌ 部署失败:', error)
        console.error('[WebSocket] 🔍 部署错误详情:', error.message)
        console.error('[WebSocket] 🔍 部署错误堆栈:', error.stack)
        isSaving.value = false
        console.log('[WebSocket] 🔄 重置保存状态为false')
    }
}

// 自动保存功能
function autoSave() {
    console.log('[WebSocket] 🕐 自动保存功能触发')
    console.log('[WebSocket] 🔍 检查当前定时器状态:', !!autoSaveTimer.value)
    
    // 清除之前的定时器（防抖机制）
    if (autoSaveTimer.value) {
        console.log('[WebSocket] 🗑️ 清除之前的自动保存定时器（防抖）')
        clearTimeout(autoSaveTimer.value)
    }
    
    console.log('[WebSocket] ⏰ 设置新的自动保存定时器 (2秒后触发)')
    console.log('[WebSocket] 💡 防抖机制：连续操作只会在最后一次操作2秒后保存')
    
    // 设置新的定时器
    autoSaveTimer.value = setTimeout(() => {
        console.log('[WebSocket] 🕐 自动保存定时器触发，开始执行保存')
        console.log('[WebSocket] 📊 即将保存最终状态，包含所有累积的用户操作')
        console.log('[WebSocket] 💾 执行自动保存到后端...')
        deployToBackend()
    }, 2000) // 2秒后自动保存
    
    console.log('[WebSocket] ✅ 自动保存定时器设置完成')
}

// WebSocket连接函数
function connectWebSocket() {
    console.log('[WebSocket] 🔌 开始WebSocket连接流程')
    console.log('[WebSocket] 🔍 检查现有WebSocket实例:', !!websocketInstance)
    
    if (websocketInstance) {
        console.log('[WebSocket] 🔄 关闭现有WebSocket连接')
        websocketInstance.close()
        websocketInstance = null
        console.log('[WebSocket] ✅ 现有连接已关闭')
    }
    
    console.log('[WebSocket] 🔍 检查applicationId参数:', applicationId.value)
    if (!applicationId.value) {
        console.warn('[WebSocket] ⚠️ 缺少applicationId参数，无法连接WebSocket')
        console.warn('[WebSocket] 🔍 applicationId值:', applicationId.value)
        return
    }
    
    console.log('[WebSocket] 🔌 准备连接到WebSocket服务器')
    console.log('[WebSocket] 🌐 目标URL:', websocketUrl.value)
    console.log('[WebSocket] 🔌 连接到:', websocketUrl.value)
    
    websocketInstance = useWebSocket(websocketUrl.value)
    console.log('[WebSocket] ✅ WebSocket实例已创建')
    
    // 监听连接状态
    console.log('[WebSocket] 👂 设置连接状态监听器')
    watch(
        () => websocketInstance?.isConnected.value,
        (connected) => {
            console.log('[WebSocket] 📡 连接状态变化:', connected)
            isConnected.value = !!connected
            console.log('[WebSocket] 🔄 更新本地连接状态为:', isConnected.value)
            
            if (connected) {
                console.log('[WebSocket] 🚀 WebSocket连接成功！')
                console.log('[WebSocket] ✅ 连接建立完成，准备自动触发数据接收')
                console.log('[WebSocket] ⏱️ 延迟500ms以确保连接完全稳定')
                
                // 延迟一下确保连接完全稳定
                setTimeout(() => {
                    console.log('[WebSocket] 🕐 延迟时间到，开始自动数据接收')
                    autoReceiveData()
                }, 500)
            } else {
                console.log('[WebSocket] 🔌 WebSocket连接断开')
                console.log('[WebSocket] ⚠️ 连接状态已更新为断开')
            }
        },
        { immediate: true }
    )
    
    console.log('[WebSocket] 📨 设置消息处理器')
    // 处理接收到的消息
    websocketInstance.connect((rawData) => {
        try {
            console.log('[WebSocket] � ==========收到新消息==========')
            console.log('[WebSocket] 📥 收到时间戳:', new Date().toISOString())
            console.log('[WebSocket] 📥 收到原始数据类型:', typeof rawData)
            console.log('[WebSocket] �📥 收到原始数据:', rawData)
            console.log('[WebSocket] 🔍 原始数据详细结构:', JSON.stringify(rawData, null, 2))
            console.log('[WebSocket] 🔍 数据长度:', JSON.stringify(rawData).length, '字符')
            
            // 处理数组格式数据
            let processedData = rawData
            console.log('[WebSocket] 🔍 检查数据是否为数组:', Array.isArray(rawData))
            
            if (Array.isArray(rawData) && rawData.length > 0) {
                console.log('[WebSocket] 🔄 检测到数组格式数据，提取第一个元素')
                console.log('[WebSocket] 📊 数组长度:', rawData.length)
                processedData = rawData[0]
                console.log('[WebSocket] ✅ 已提取第一个元素:', processedData)
            } else if (Array.isArray(rawData) && rawData.length === 0) {
                console.log('[WebSocket] 🚫 收到空数组，忽略处理')
                console.log('[WebSocket] ⚠️ 空数组无需处理，直接返回')
                return
            }
            
            console.log('[WebSocket] 🔍 处理后的数据:', processedData)
            console.log('[WebSocket] 🔍 检查是否包含content字段:', !!processedData?.content)
            console.log('[WebSocket] 🔍 检查是否包含originalContent字段:', !!processedData?.originalContent)
            
            // 检查是否是SubmissionRecord的响应确认
            if (processedData && processedData.table === 'SubmissionRecord') {
                console.log('[WebSocket] ✅ 检测到SubmissionRecord响应确认')
                console.log('[WebSocket] 📝 SubmissionRecord响应:', processedData)
                
                // 清理自动保存定时器
                if (autoSaveTimer.value) {
                    console.log('[WebSocket] 🗑️ 清理自动保存定时器 (SubmissionRecord确认)')
                    clearTimeout(autoSaveTimer.value)
                    autoSaveTimer.value = null
                }
                
                isSaving.value = false
                console.log('[WebSocket] 🔄 重置保存状态为false (SubmissionRecord确认)')
                console.log('[WebSocket] ✅ SubmissionRecord确认处理完成')
                return
            }
            
            // 检查是否是部署确认消息（包含content/originalContent字段）
            if (processedData && (processedData.content || processedData.originalContent)) {
                console.log('[WebSocket] ✅ 检测到部署确认消息')
                console.log('[WebSocket] 📝 确认消息内容:', {
                    content: processedData.content,
                    originalContent: processedData.originalContent
                })
                
                // 清理自动保存定时器
                if (autoSaveTimer.value) {
                    console.log('[WebSocket] 🗑️ 清理自动保存定时器 (部署确认)')
                    clearTimeout(autoSaveTimer.value)
                    autoSaveTimer.value = null
                }
                
                isSaving.value = false
                console.log('[WebSocket] 🔄 重置保存状态为false (部署确认)')
                console.log('[WebSocket] ✅ 部署确认处理完成')
                return
            }
            
            // 检查是否是任何包含success或error字段的响应
            if (processedData && (processedData.success !== undefined || processedData.error !== undefined)) {
                console.log('[WebSocket] ✅ 检测到操作响应确认')
                console.log('[WebSocket] 📝 操作响应:', {
                    success: processedData.success,
                    error: processedData.error,
                    message: processedData.message
                })
                
                // 清理自动保存定时器
                if (autoSaveTimer.value) {
                    console.log('[WebSocket] 🗑️ 清理自动保存定时器 (操作响应确认)')
                    clearTimeout(autoSaveTimer.value)
                    autoSaveTimer.value = null
                }
                
                isSaving.value = false
                console.log('[WebSocket] 🔄 重置保存状态为false (操作响应确认)')
                if (processedData.error) {
                    console.error('[WebSocket] ❌ 后端返回错误:', processedData.error)
                }
                console.log('[WebSocket] ✅ 操作响应确认处理完成')
                return
            }
            
            console.log('[WebSocket] 🔍 检查是否包含teamBody字段:', !!processedData?.teamBody)
            // 检查是否是有效的数据获取响应
            if (!processedData || !processedData.teamBody) {
                console.log('[WebSocket] 🚫 非数据获取响应，忽略处理')
                console.log('[WebSocket] 🔍 数据结构不符合预期:')
                console.log('[WebSocket] 🔍 - processedData存在:', !!processedData)
                console.log('[WebSocket] 🔍 - teamBody存在:', !!processedData?.teamBody)
                return
            }
            
            console.log('[WebSocket] ✅ 检测到有效的数据获取响应，开始处理')
            
            // 记录外层ID和数据源选择逻辑
            let recordId = processedData.id
            let finalTeamBody = processedData.teamBody
            
            console.log('[WebSocket] � 外层数据ID:', recordId)
            console.log('[WebSocket] 🔍 检查latest字段:', !!processedData.latest)
            
            // 根据latest字段决定使用哪个数据源
            if (processedData.latest && processedData.latest.teamBody) {
                console.log('[WebSocket] 🔄 检测到latest字段，使用latest中的最新数据')
                console.log('[WebSocket] 📊 latest数据完整结构:', processedData.latest)
                
                // 使用latest中的ID和teamBody
                recordId = processedData.latest.id
                finalTeamBody = processedData.latest.teamBody
                
                console.log('[WebSocket] � 使用latest中的ID:', recordId)
                console.log('[WebSocket] 📋 使用latest中的teamBody')
            } else {
                console.log('[WebSocket] 📋 latest为空或无teamBody，使用外层数据')
                console.log('[WebSocket] 📋 使用外层ID:', recordId)
                console.log('[WebSocket] 📋 使用外层teamBody')
            }
            
            console.log('[WebSocket] 🔍 最终选择的数据源:')
            console.log('[WebSocket] � - 记录ID:', recordId)
            console.log('[WebSocket] 🔍 - teamBody数据:', finalTeamBody)
            console.log('[WebSocket] � - teamBody结构检查:', {
                provider: finalTeamBody.provider,
                component_type: finalTeamBody.component_type,
                version: finalTeamBody.version,
                hasConfig: !!finalTeamBody.config,
                hasParticipants: !!finalTeamBody.config?.participants
            })
            
            // 存储当前记录ID
            currentRecordId.value = recordId
            console.log('[WebSocket] 💾 存储当前记录ID:', currentRecordId.value)
            
            // 更新团队数据 - 直接使用teamBody，因为它就是Agent_Team格式
            if (finalTeamBody) {
                console.log('[WebSocket] 🔄 开始更新团队数据流程')
                console.log('[WebSocket] 📊 团队数据结构类型:', typeof finalTeamBody)
                console.log('[WebSocket] 📊 团队数据大小:', JSON.stringify(finalTeamBody).length, '字符')
                
                // 标记为非用户操作，避免触发变化追踪
                console.log('[WebSocket] 🔒 设置撤销重做操作标记为true (避免触发变化追踪)')
                isUndoRedoOperation.value = true
                
                try {
                    console.log('[WebSocket] 💾 开始深拷贝团队数据')
                    // 直接使用teamBody，因为它就是Agent_Team格式的数据
                    teamData.value = JSON.parse(JSON.stringify(finalTeamBody))
                    console.log('[WebSocket] ✅ 团队数据更新完成')
                    console.log('[WebSocket] 📊 更新后的团队数据结构:', {
                        provider: teamData.value.provider,
                        component_type: teamData.value.component_type,
                        participantsCount: teamData.value.config?.participants?.length || 0
                    })
                    
                    console.log('[WebSocket] 📸 重新保存数据快照作为新基准')
                    // 重新保存快照，将从后端获取的数据作为新的基准
                    saveOriginalSnapshot()
                    console.log('[WebSocket] ✅ 数据快照保存完成')
                    
                    // 同时更新previousStateSnapshot作为变化对比的基准
                    previousStateSnapshot.value = JSON.parse(JSON.stringify(teamData.value))
                    console.log('[WebSocket] 📸 更新previousStateSnapshot作为变化对比基准')
                    
                } finally {
                    console.log('[WebSocket] 🔓 重置撤销重做操作标记为false')
                    isUndoRedoOperation.value = false
                }
            }
            
            console.log('[WebSocket] ========消息处理完成========')
            
        } catch (error: any) {
            console.error('[WebSocket] ❌ 处理接收数据时出错:', error)
            console.error('[WebSocket] 🔍 错误详情:', error.message)
            console.error('[WebSocket] 🔍 错误堆栈:', error.stack)
            console.error('[WebSocket] 🔍 导致错误的原始数据:', rawData)
            isSaving.value = false
            console.log('[WebSocket] 🔄 因错误重置保存状态为false')
        }
    })
    
    console.log('[WebSocket] ✅ WebSocket连接设置完成')
}

// 监听applicationId变化，重新连接WebSocket
watch(applicationId, (newId, oldId) => {
    console.log('[WebSocket] 👂 applicationId监听器触发')
    console.log('[WebSocket] 🔍 旧applicationId:', oldId)
    console.log('[WebSocket] 🔍 新applicationId:', newId)
    
    // 只有当ID真正改变时才重新连接
    if (newId && newId !== oldId) {
        console.log('[WebSocket] 🔄 ApplicationId变化，重新连接WebSocket:', newId)
        console.log('[WebSocket] 🌐 新的WebSocket URL将是:', `wss://chat.zy-jn.org.cn/aagent/ws/${newId}`)
        connectWebSocket()
        console.log('[WebSocket] ✅ 重新连接请求已发送')
    } else if (newId && !oldId) {
        console.log('[WebSocket] 🔄 首次设置ApplicationId，建立WebSocket连接:', newId)
        connectWebSocket()
    } else {
        console.warn('[WebSocket] ⚠️ ApplicationId未变化或为空，跳过重连')
    }
}, { immediate: true })

// ==================================================================================
// WebSocket 系统结束
// ==================================================================================

// 向子组件提供数据和变化追踪函数
provide('teamData', teamData)
provide('recordChange', recordChange)
provide('getChangeStats', getChangeStats)
provide('getOperationStats', getOperationStats)
provide('originalDataSnapshot', originalDataSnapshot)
provide('resetChangeTracking', resetChangeTracking)
provide('undo', undo)
provide('redo', redo)
provide('canUndo', canUndo)
provide('canRedo', canRedo)

// 向子组件提供 WebSocket 相关功能
provide('isConnected', isConnected)
provide('isSaving', isSaving)
provide('getDataFromBackend', getDataFromBackend)
provide('deployToBackend', deployToBackend)
provide('autoSave', autoSave)
provide('applicationId', applicationId)

// 组件挂载时保存初始快照并绑定键盘事件
onMounted(() => {
    console.log('[Lifecycle] 🚀 组件挂载开始')
    console.log('[Lifecycle] 📸 保存初始数据快照')
    saveOriginalSnapshot()
    
    // 绑定全局键盘事件
    console.log('[Lifecycle] ⌨️ 绑定全局键盘事件监听器')
    document.addEventListener('keydown', handleKeydown)
    
    // 不在这里初始化WebSocket，因为applicationId的watch已经处理了
    console.log('[Lifecycle] ⚠️ WebSocket连接由applicationId监听器管理，此处跳过')
    console.log('[Lifecycle] ✅ 组件挂载完成')
})

// 组件卸载时移除键盘事件监听并清理WebSocket连接
onUnmounted(() => {
    console.log('[Lifecycle] 🔄 组件卸载开始')
    
    console.log('[Lifecycle] ❌ 移除全局键盘事件监听器')
    document.removeEventListener('keydown', handleKeydown)
    
    // 清理WebSocket连接
    console.log('[Lifecycle] 🔍 检查WebSocket实例是否需要清理:', !!websocketInstance)
    if (websocketInstance) {
        console.log('[WebSocket] 🔌 组件卸载，关闭WebSocket连接')
        websocketInstance.close()
        websocketInstance = null
        console.log('[WebSocket] ✅ WebSocket连接已关闭并清理')
    }
    
    // 清理定时器
    console.log('[Lifecycle] 🔍 检查自动保存定时器是否需要清理:', !!autoSaveTimer.value)
    if (autoSaveTimer.value) {
        console.log('[Lifecycle] ⏰ 清理自动保存定时器')
        clearTimeout(autoSaveTimer.value)
        autoSaveTimer.value = null
        console.log('[Lifecycle] ✅ 自动保存定时器已清理')
    }
    
    console.log('[Lifecycle] ✅ 组件卸载完成')
})
</script>

<style scoped>
.agent-diy-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f5f5f5;
}

/* 头部样式 */
.header {
    padding: 20px 24px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
    text-align: center;
}

/* 主要内容区域 */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 工具栏样式 */
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1px 2px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
}

.view-switcher {
    display: flex;
    gap: 2px;
    background: #f0f0f0;
    border-radius: 8px;
    padding: 4px;
}

.view-btn {
    padding: 8px 20px;
    background: transparent;
    color: #666;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
}

.view-btn:hover {
    background: #e0e0e0;
    color: #333;
}

.view-btn.active {
    background: #409eff;
    color: white;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* 撤销/重做按钮组 */
.undo-redo-group {
    display: flex;
    gap: 2px;
    background: #f0f0f0;
    border-radius: 6px;
    padding: 2px;
}

.undo-btn, .redo-btn {
    padding: 6px 12px;
    background: transparent;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
    min-width: 60px;
}

.undo-btn:hover:not(:disabled), .redo-btn:hover:not(:disabled) {
    background: #e0e0e0;
    transform: translateY(-1px);
}

.undo-btn:disabled, .redo-btn:disabled {
    color: #ccc;
    cursor: not-allowed;
    background: transparent;
}

.undo-btn:not(:disabled) {
    background: #4caf50;
    color: white;
}

.undo-btn:not(:disabled):hover {
    background: #45a049;
}

.redo-btn:not(:disabled) {
    background: #2196f3;
    color: white;
}

.redo-btn:not(:disabled):hover {
    background: #1976d2;
}

/* 变化追踪状态 */
.change-tracker-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.change-count {
    font-size: 12px;
    color: #6c757d;
    font-weight: 500;
}

.operation-count {
    font-size: 12px;
    color: #6c757d;
    font-weight: 500;
    margin-left: 8px;
}

.operation-btn {
    padding: 4px 8px;
    background: #9c27b0;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s;
}

.operation-btn:hover {
    background: #7b1fa2;
    transform: translateY(-1px);
}

.reset-btn {
    padding: 4px 8px;
    background: #ff9800;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s;
}

.reset-btn:hover {
    background: #f57c00;
    transform: translateY(-1px);
}

.detail-btn {
    padding: 4px 8px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s;
}

.detail-btn:hover {
    background: #1976d2;
    transform: translateY(-1px);
}

/* 变化详情面板 */
.change-details-panel {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-height: 300px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.change-details-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.change-details-header h4 {
    margin: 0;
    font-size: 14px;
    color: #333;
}

.close-details {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #666;
    padding: 4px;
}

.close-details:hover {
    color: #333;
}

.change-details-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
}

.change-summary {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
}

.change-summary p {
    margin: 4px 0;
    font-size: 12px;
    color: #666;
}

.change-log h5 {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #333;
}

.change-item {
    margin-bottom: 8px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 3px solid #409eff;
}

.change-info {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 11px;
}

.change-type {
    background: #409eff;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
    min-width: 80px;
    text-align: center;
}

/* 不同操作类型的颜色 */
.change-type[data-type="undo"] {
    background: #ff9800;
}

.change-type[data-type="redo"] {
    background: #4caf50;
}

.change-type[data-type="add_participant"],
.change-type[data-type="add_tool"] {
    background: #4caf50;
}

.change-type[data-type="remove_participant"],
.change-type[data-type="remove_tool"],
.change-type[data-type="delete_agent"] {
    background: #f44336;
}

.change-type[data-type="edit_agent"],
.change-type[data-type="edit_team"],
.change-type[data-type="json_manual_edit"] {
    background: #2196f3;
}

.change-type[data-type="data_change"] {
    background: #673ab7;
}

.change-status {
    color: #666;
    font-size: 11px;
}

.change-path {
    color: #333;
    font-weight: 500;
    flex: 1;
}

.change-time {
    color: #666;
}

/* WebSocket 状态样式 */
.websocket-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.connection-status {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 3px;
}

.connection-status.connected {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.connection-status.disconnected {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.auto-save-status {
    font-size: 11px;
    color: #ff9800;
    font-weight: 500;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

.websocket-btn {
    padding: 4px 8px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s;
}

.websocket-btn:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
}

.websocket-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
}

.websocket-btn:nth-child(4) {
    background: #007bff;
}

.websocket-btn:nth-child(4):hover:not(:disabled) {
    background: #0056b3;
}

/* 视图容器 */
.view-container {
    flex: 1;
    overflow: hidden;
    position: relative;
}

/* 未来扩展区域 */
.future-area {
    min-height: 0; /* 预留空间，可根据需要添加样式 */
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .toolbar {
        padding: 12px 16px;
    }
    
    .view-btn {
        padding: 10px 16px;
        font-size: 13px;
    }
}

@media (max-width: 768px) {
    .header {
        padding: 16px 20px;
    }
    
    .title {
        font-size: 20px;
    }
    
    .toolbar {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        padding: 16px 20px;
    }
    
    .view-switcher {
        justify-content: center;
        width: 100%;
    }
    
    .view-btn {
        flex: 1;
        text-align: center;
        padding: 12px 20px;
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .agent-diy-container {
        height: 100vh;
        overflow: hidden;
    }
    
    .header {
        padding: 12px 16px;
    }
    
    .title {
        font-size: 18px;
    }
    
    .toolbar {
        padding: 12px 16px;
        gap: 8px;
    }
    
    .view-switcher {
        padding: 2px;
    }
    
    .view-btn {
        padding: 10px 16px;
        font-size: 13px;
        border-radius: 4px;
    }
    
    .view-container {
        flex: 1;
        overflow: hidden;
    }
}
</style>