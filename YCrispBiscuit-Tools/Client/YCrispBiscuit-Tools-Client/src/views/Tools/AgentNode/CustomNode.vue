<template>
  <div class="custom-node" :class="data.type">
    <div class="node-header">
      <span class="node-title">
        <!-- 团队节点优先显示应用名 -->
        {{ props.metaData?.app_name ?? (data.app_name !== undefined && data.app_name !== null ? data.app_name : '-') }}
      </span>
      <span class="node-type">{{ data.type || 'Team' }}</span>
      <template v-if="data.type === 'AssistantAgent' && !readonly">
        <span class="node-action-btns">
          <span class="node-action" title="编辑" @click.stop="onEdit">✏️</span>
          <span class="node-action" title="删除" @click.stop="onDelete">❌</span>
        </span>
      </template>
      <template v-if="data.team_type && !readonly">
        <span class="node-action-btns">
          <span class="node-action" title="编辑" @click.stop="onEditTeam">✏️</span>
        </span>
      </template>
    </div>
    <div class="node-body">
      <div v-if="data.team_type">
        <div class="node-desc"><b>ID：</b>{{ props.metaData?.id ?? (data.id !== undefined && data.id !== null ? data.id : '-') }}</div>
        <div class="node-desc"><b>版本：</b>{{ props.metaData?.version ?? (data.version !== undefined && data.version !== null ? data.version : '-') }}</div>
        <!--div class="node-desc"><b>应用名：</b>{{ props.metaData?.app_name ?? (data.app_name !== undefined && data.app_name !== null ? data.app_name : '-') }}</div-->
    <div class="node-desc"><b>部门ID：</b>{{ (props.metaData?.department_id ?? data.department_id) ?? '-' }}</div>
        <div class="node-desc">团队类型：{{ data.team_type }}</div>
        <div class="node-desc">选择器配置：{{ data.selector_config?.prompt }}</div>
        
        <div class="section-title">终止条件</div>
        <div class="drop-area termination-drop" @dragover.prevent @drop="onDrop('termination', $event)">
          <b>当前终止条件：</b>{{ data.terminator || '未设置' }}
          <div v-if="!props.readonly" class="drop-hint">拖拽 Termination 到此处设置终止条件</div>
        </div>
        
        <div class="section-title">Agents</div>
        <div class="drop-area agents-drop" @dragover.prevent @drop="onDrop('agents', $event)">
          <ul class="agent-list">
            <li v-for="agent in data.agents" :key="agent.name">
              {{ agent.name }}
              <span style="color:#888">({{ agent.type }})</span>
              <span v-if="!props.readonly" class="agent-del" title="移除" @click.stop="onRemoveAgent(agent.name)">❌</span>
            </li>
          </ul>
          <div class="drop-hint">拖拽 Agent 到此处添加</div>
        </div>
      </div>
      <div v-else>
        <div class="node-desc">系统提示：{{ data.system_message }}</div>
        <div class="section-title">Tools</div>
        <div class="drop-area tools-drop" @dragover.prevent @drop="onDrop('tools', $event)">
          <b>Tools:</b>
          <template v-if="data.tools && data.tools.length">
            <span v-for="(tool, i) in data.tools" :key="tool.name">
              {{ tool.name }}
              <span v-if="!props.readonly" class="tool-del" title="移除" @click.stop="onRemoveTool(tool.name)">❌</span>
              <span v-if="i < data.tools.length - 1">, </span>
            </span>
          </template>
          <span v-else>无</span>
          <div class="drop-hint">拖拽 Tool 到此处添加</div>
        </div>
      </div>
    </div>
    <Handle type="target" :position="Position.Left" :style="handleStyle" />
    <Handle type="source" :position="Position.Right" :style="handleStyle" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { defineEmits } from 'vue'
const props = defineProps<{
  data: any;
  readonly?: boolean;
  metaData?: {
    id?: string | number;
    version?: string;
    app_name?: string;
    department_id?: string | number;
  }
}>()
const emit = defineEmits([
  'dropOnArea',
  'removeAgent',
  'removeTool',
  'deleteAgentNode',
  'editAgentNode',
  'editTeamNode'
])

const handleStyle = { width: '12px', height: '12px', background: '#409eff', border: '2px solid #fff' }

function onDrop(area: string, e: DragEvent) {
  console.log('[CustomNode] onDrop triggered:', area, e)
  try {
    const raw = e.dataTransfer?.getData('application/json')
    console.log('[CustomNode] Drag data:', raw)
    const payload = JSON.parse(raw || '{}')
    console.log('[CustomNode] Parsed payload:', payload)
    emit('dropOnArea', { area, payload, nodeId: props.data.name || props.data.id })
  } catch (err) {
    console.error('[CustomNode] Drag data parse error:', err)
  }
}
function onRemoveAgent(name: string) {
  emit('removeAgent', { agentName: name })
}
function onRemoveTool(tool: string) {
  emit('removeTool', { tool })
}
function onDelete() {
  emit('deleteAgentNode', { nodeId: props.data.name || props.data.id })
}
function onEdit() {
  emit('editAgentNode', { nodeId: props.data.name || props.data.id })
}
function onEditTeam() {
  emit('editTeamNode')
}
</script>

<style scoped>
.custom-node {
  min-width: 180px;
  max-width: 320px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  border: 1.5px solid #e0e0e0;
  padding: 12px 16px 10px 16px;
  position: relative;
  font-size: 14px;
}

.node-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.node-title {
  font-weight: bold;
  font-size: 16px;
  margin-right: 8px;
}

.node-type {
  color: #fff;
  background: #409eff;
  border-radius: 6px;
  font-size: 12px;
  padding: 2px 8px;
}

.node-body {
  margin-top: 2px;
}

.node-desc {
  color: #666;
  margin-bottom: 8px;
}

.section-title {
  font-size: 13px;
  color: #888;
  margin-bottom: 2px;
}

.agent-list {
  padding-left: 18px;
  margin: 0 0 8px 0;
}

.drop-area {
  border: 1.5px dashed #b3c6e0;
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 8px;
  background: #f7faff;
  position: relative;
}

.termination-drop {
  border-color: #e67e22;
  background: #fdf6f0;
}

.termination-drop .drop-hint {
  color: #d35400;
}

.drop-hint {
  font-size: 12px;
  color: #b3b3b3;
  margin-top: 2px;
}

.node-action-btns {
  margin-left: 10px;
  display: flex;
  gap: 4px;
}

.node-action {
  cursor: pointer;
  font-size: 16px;
  margin-left: 2px;
  user-select: none;
  opacity: 0.7;
  transition: opacity 0.18s;
}

.node-action:hover {
  opacity: 1;
}

.agent-del,
.tool-del {
  cursor: pointer;
  margin-left: 4px;
  color: #e74c3c;
  font-size: 13px;
  opacity: 0.7;
  user-select: none;
  transition: opacity 0.18s;
}

.agent-del:hover,
.tool-del:hover {
  opacity: 1;
}
</style>
