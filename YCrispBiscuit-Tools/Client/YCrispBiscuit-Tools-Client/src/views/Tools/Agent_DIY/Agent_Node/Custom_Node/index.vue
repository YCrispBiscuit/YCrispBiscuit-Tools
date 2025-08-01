<template>
    <div class="custom-node" :class="nodeClass">
        <!-- Team节点 -->
        <div v-if="isTeamNode" class="team-node">
            <div class="node-header">
                <span class="node-title">{{ data.label || 'Team' }}</span>
                <div class="node-actions">
                    <span class="node-action" title="编辑团队" @click.stop="onEditTeam">✏️</span>
                </div>
            </div>
            <div class="node-body">
                <div class="node-info">
                    <div class="info-item">
                        <span class="info-label">类型:</span>
                        <span class="info-value">{{ data.component_type }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">描述:</span>
                        <span class="info-value">{{ data.description }}</span>
                    </div>
                </div>

                <!-- 参与者列表 -->
                <div class="section">
                    <div class="section-title">Agents</div>
                    <div class="drop-area participants-drop" 
                         @dragover.prevent 
                         @drop="onDrop('participants', $event)"
                         :class="{ 'drag-over': isDragOver, 'readonly-mode': readonly }">
                        <div v-if="data.participants && data.participants.length > 0" class="participants-list">
                            <div v-for="(participant, index) in data.participants" 
                                 :key="index" 
                                 class="participant-item">
                                <span class="participant-name">{{ participant.name }}</span>
                                <span class="participant-label">({{ participant.label }})</span>
                                <span v-if="!readonly" 
                                      class="delete-btn" 
                                      title="移除Agent" 
                                      @click.stop="onRemoveParticipant(index)">❌</span>
                            </div>
                        </div>
                        <div v-else class="empty-state">暂无参与者</div>
                        <div v-if="!readonly" class="drop-hint">拖拽 Agent 到此处添加参与者</div>
                    </div>
                </div>

                <!-- 终止条件 -->
                <div class="section">
                    <div class="section-title">终止条件</div>
                    <div class="drop-area termination-drop" 
                         @dragover.prevent 
                         @drop="onDrop('termination', $event)"
                         :class="{ 'drag-over': isDragOver, 'readonly-mode': readonly }">
                        <div v-if="data.termination" class="termination-item">
                            <span class="termination-label">{{ data.termination }}</span>
                        </div>
                        <div v-else class="empty-state">未设置终止条件</div>
                        <div v-if="!readonly" class="drop-hint">拖拽终止条件到此处设置</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Agent节点 -->
        <div v-else class="agent-node">
            <div class="node-header">
                <span class="node-title">{{  data.name || 'Agent' }}</span>
                <div class="node-actions">
                    <span class="node-action" title="编辑Agent" @click.stop="onEditAgent">✏️</span>
                    <span v-if="!readonly" 
                          class="node-action delete-agent" 
                          title="删除Agent" 
                          @click.stop="onDeleteAgent">❌</span>
                </div>
            </div>
            <div class="node-body">
                <div class="node-info">
                    <div class="info-item">
                        <span class="info-label">名称:</span>
                        <span class="info-value">{{ nodeId }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">类型:</span>
                        <span class="info-value">{{ agentComponentType }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">描述:</span>
                        <span class="info-value">{{ data.description }}</span>
                    </div>
                </div>

                <!-- 工具列表 -->
                <div class="section">
                    <div class="section-title">工具 (Tools)</div>
                    <div class="drop-area tools-drop" 
                         @dragover.prevent 
                         @drop="onDrop('tools', $event)"
                         :class="{ 'drag-over': isDragOver, 'readonly-mode': readonly }">
                        <div v-if="data.workbench && data.workbench[0] && data.workbench[0].config && data.workbench[0].config.tools && data.workbench[0].config.tools.length > 0" class="tools-list">
                            <div v-for="(tool, index) in data.workbench[0].config.tools" 
                                 :key="index" 
                                 class="tool-item">
                                <span class="tool-name">{{ tool.config?.name || tool.name }}</span>
                                <span class="tool-label">({{ tool.label }})</span>
                                <span v-if="!readonly" 
                                      class="delete-btn" 
                                      title="移除工具" 
                                      @click.stop="onRemoveTool(index)">❌</span>
                            </div>
                        </div>
                        <div v-else class="empty-state">暂无工具</div>
                        <div v-if="!readonly" class="drop-hint">拖拽工具到此处添加</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 连接点 -->
        <Handle type="target" :position="Position.Left" :style="handleStyle" />
        <Handle type="source" :position="Position.Right" :style="handleStyle" />
    </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed, ref } from 'vue'

const props = defineProps<{
    id?: string;
    data: any;
    label?: string;
    type?: string;
    selected?: boolean;
    //只读控制，用于是否对节点进行编辑操作的展示（通常用于预览模式）
    readonly?: boolean;
}>()

const emit = defineEmits([
    //拖拽
    'dropOnArea',
    //移除参与者
    'removeParticipant',
    //移除工具
    'removeTool',
    //删除Agent节点
    'deleteAgentNode',
    //编辑Agent节点
    'editAgentNode',
    //编辑团队节点
    'editTeamNode'
])

const isDragOver = ref(false)

// 判断是否为团队节点
const isTeamNode = computed(() => {
    return props.data.component_type === 'team' || props.data.participants
})

// 节点样式类
const nodeClass = computed(() => {
    return isTeamNode.value ? 'team-type' : 'agent-type'
})

// 节点ID（用于事件传递）
const nodeId = computed(() => {
    return props.id || props.data.name || props.data.id || props.data.component_type
})

// Agent节点的组件类型
const agentComponentType = computed(() => {
    return props.label || props.data.component_type || 'agent'
})

const handleStyle = { 
    width: '12px', 
    height: '12px', 
    background: '#409eff', 
    border: '2px solid #fff' 
}

// 拖拽处理
function onDrop(area: string, e: DragEvent) {
    console.log('[CustomNode] onDrop triggered:', area, e)
    isDragOver.value = false
    
    try {
        const raw = e.dataTransfer?.getData('application/json')
        console.log('[CustomNode] Drag data:', raw)
        const payload = JSON.parse(raw || '{}')
        console.log('[CustomNode] Parsed payload:', payload)
        
        emit('dropOnArea', { 
            area, 
            payload, 
            nodeId: nodeId.value
        })
    } catch (err) {
        console.error('[CustomNode] Drag data parse error:', err)
    }
}

// 移除参与者
function onRemoveParticipant(index: number) {
    emit('removeParticipant', { 
        nodeId: nodeId.value,
        index 
    })
}

// 移除工具
function onRemoveTool(index: number) {
    emit('removeTool', { 
        nodeId: nodeId.value,
        index 
    })
}

// 删除Agent节点
function onDeleteAgent() {
    emit('deleteAgentNode', { 
        nodeId: nodeId.value
    })
}

// 编辑Agent节点
function onEditAgent() {
    emit('editAgentNode', { 
        nodeId: nodeId.value
    })
}

// 编辑团队节点
function onEditTeam() {
    emit('editTeamNode', { 
        nodeId: nodeId.value
    })
}

//以下是上面六个事件的处理函数，暂时还没写

</script>

<style scoped>
.custom-node {
    min-width: 240px;
    max-width: 320px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e0e0e0;
    position: relative;
    font-size: 13px;
    overflow: hidden;
    transform: scale(0.9); /* 整体缩小10% */
}

.custom-node.team-type {
    border-color: #4CAF50;
    background: linear-gradient(135deg, #f8fff8 0%, #ffffff 100%);
}

.custom-node.agent-type {
    border-color: #2196F3;
    background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%);
}

.node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid #eee;
}

.team-type .node-header {
    background: rgba(76, 175, 80, 0.1);
}

.agent-type .node-header {
    background: rgba(33, 150, 243, 0.1);
}

.node-title {
    font-weight: bold;
    font-size: 14px;
    color: #333;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.node-actions {
    display: flex;
    gap: 8px;
}

.node-action {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #ddd;
    font-size: 12px;
    transition: all 0.2s;
}

.node-action:hover {
    background: #f0f0f0;
    transform: scale(1.05);
}

.delete-agent {
    color: #f44336;
}

.node-body {
    padding: 12px;
}

.node-info {
    margin-bottom: 16px;
}

.info-item {
    display: flex;
    margin-bottom: 6px;
    font-size: 12px;
}

.info-label {
    font-weight: 500;
    color: #666;
    min-width: 50px;
    margin-right: 8px;
}

.info-value {
    color: #333;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.section {
    margin-bottom: 16px;
}

.section-title {
    font-size: 13px;
    font-weight: 600;
    color: #555;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
}

.section-title::before {
    content: '';
    width: 4px;
    height: 14px;
    background: #409eff;
    margin-right: 6px;
    border-radius: 2px;
}

.drop-area {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 12px;
    background: #fafafa;
    transition: all 0.3s;
    min-height: 60px;
    position: relative;
}

/* 只读模式下隐藏拖拽边框 */
.drop-area.readonly-mode {
    border: 1px solid transparent;
    background: transparent;
    padding: 8px;
}

.drop-area.drag-over {
    border-color: #409eff;
    background: #e3f2fd;
}

.participants-drop {
    border-color: #4CAF50;
    background: #f1f8e9;
}

.tools-drop {
    border-color: #FF9800;
    background: #fff3e0;
}

.termination-drop {
    border-color: #f44336;
    background: #ffebee;
}

.participants-list,
.tools-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.participant-item,
.tool-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 13px;
}

.participant-name,
.tool-name {
    font-weight: 500;
    color: #333;
    margin-right: 8px;
}

.participant-label,
.tool-label {
    color: #666;
    font-size: 12px;
    flex: 1;
}

.termination-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 13px;
}

.termination-label {
    font-weight: 500;
    color: #333;
    margin-right: 8px;
}

.termination-desc {
    color: #666;
    font-size: 12px;
    flex: 1;
}

.delete-btn {
    cursor: pointer;
    color: #f44336;
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 3px;
    transition: all 0.2s;
}

.delete-btn:hover {
    background: #ffebee;
    transform: scale(1.1);
}

.empty-state {
    color: #999;
    font-style: italic;
    text-align: center;
    padding: 8px;
}

.drop-hint {
    font-size: 12px;
    color: #999;
    text-align: center;
    margin-top: 8px;
    padding: 4px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .custom-node {
        min-width: 260px;
        max-width: 380px;
    }
}

@media (max-width: 768px) {
    .custom-node {
        min-width: 240px;
        max-width: 320px;
    }
    
    .node-title {
        font-size: 14px;
        padding: 10px 12px;
    }
    
    .node-content {
        padding: 12px;
    }
    
    .info-item,
    .participant-item,
    .tool-item {
        font-size: 12px;
        padding: 8px 10px;
        margin-bottom: 6px;
    }
    
    .node-actions {
        padding: 8px 12px;
        gap: 6px;
    }
    
    .action-btn {
        padding: 6px 10px;
        font-size: 11px;
    }
}

@media (max-width: 480px) {
    .custom-node {
        min-width: 200px;
        max-width: 280px;
    }
    
    .node-title {
        font-size: 13px;
        padding: 8px 10px;
    }
    
    .node-content {
        padding: 10px;
    }
    
    .info-item,
    .participant-item,
    .tool-item {
        font-size: 11px;
        padding: 6px 8px;
        margin-bottom: 4px;
    }
    
    .info-label {
        min-width: 40px;
        font-size: 10px;
    }
    
    .node-actions {
        padding: 6px 10px;
        gap: 4px;
        flex-wrap: wrap;
    }
    
    .action-btn {
        padding: 4px 8px;
        font-size: 10px;
        min-width: auto;
    }
    
    .drop-area {
        min-height: 30px;
        font-size: 11px;
        padding: 8px;
    }
}
</style>