

<template>
    <div class="agent-flow-root">
        <!-- 顶部功能区 -->
        <div class="toolbar toolbar-with-preview">
            <button :class="{ active: viewMode === 'graph' }" @click="viewMode = 'graph'">可视化结构图</button>
            <button :class="{ active: viewMode === 'json' }" @click="viewMode = 'json'">JSON源码视图</button>
            <button :class="{ active: viewMode === 'preview' }" @click="viewMode = 'preview'">预览</button>
            <span style="flex:1"></span>
            <!-- 自动保存状态指示器 -->
            <span v-if="autoSaveTimer || isSaving" class="auto-save-status">
                {{ isSaving ? '正在保存...' : '准备保存...' }}
            </span>
            <!--button @click="getDatafromBackend">接收数据</button-->
            <!--button @click="deployToBackend">保存</button--> <!-- 已改为自动保存 -->
            <!--button>前往测试</button-->
            

        </div>
        <!-- 底部主要内容区，自适应布局 -->
        <div class="main-content">
            <!-- 浮动式固定侧边栏，仅在 graph 模式显示 -->
            <div class="sidebar-float" v-if="viewMode === 'graph'" v-show="!sidebarMinimized">
                <div class="sidebar-float-header">
                    <span style="flex:1"></span>
                    <button class="sidebar-min-btn" @click="sidebarMinimized = true" title="最小化">—</button>
                </div>
                <input class="sidebar-search" v-model="globalSearch" placeholder="搜索全部..." @click.stop />
                <div v-for="(section, idx) in sidebarSections" :key="section.title" class="sidebar-section">
                    <div class="sidebar-title" @click="toggleSection(idx)">
                        <span>{{ section.title }}</span>
                        <span class="arrow" :class="{ collapsed: collapsedSections[idx] }">▶</span>
                    </div>
                    <transition name="fade">
                        <div v-show="!collapsedSections[idx]">
                            <ul>
                                <li v-for="item in filteredSectionList(idx)"
                                    :key="('name' in item ? item.name : ('type' in item ? item.type : ''))"
                                    draggable="true" @dragstart="onDragStart($event, section.type, item)"
                                    class="sidebar-item">
                                    <div class="item-main">
                                        <span class="item-label">
                                            <!-- agent/tool: name，termination: type -->
                                            {{
                                                'name' in item ? item.name : (
                                                    'type' in item ? item.type : (
                                                        'value' in item ? item.value : ''
                                                    )
                                                )
                                            }}
                                        </span>
                                        <span v-if="'model' in item && item.model" class="item-tag">{{ item.model
                                        }}</span>
                                    </div>
                                    <div class="item-desc">
                                        <!-- 优先展示 description，其次 system_message，其次 value -->
                                        {{
                                            'description' in item && item.description ? item.description : (
                                                'system_message' in item && item.system_message ? item.system_message : (
                                                    'value' in item && item.value ? item.value : ''
                                                )
                                            )
                                        }}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </transition>
                </div>
            </div>
            <!-- 可视化结构图视图 -->
            <div v-if="viewMode === 'graph'" class="flow-canvas">
                <VueFlow :nodes="nodes" :edges="edges" :node-types="nodeTypes" fit-view
                    style="height: 100%; width: 100%; background: #f8f8fa;">
                    <template #node-customNode="{ data, id }">
                        <CustomNode :data="data" :metaData="metaData" @dropOnArea="onDropOnArea"
                            @removeAgent="onRemoveAgent" @removeTool="onRemoveTool" @deleteAgentNode="onDeleteAgentNode"
                            @editAgentNode="onEditAgentNode" @editTeamNode="onEditTeamNode" />
                    </template>
                </VueFlow>
            </div>
            <!-- 预览视图，仅展示结构图，不可编辑，无侧边栏 -->
            <div v-if="viewMode === 'preview'" class="flow-canvas preview-canvas">
                <VueFlow :nodes="nodes" :edges="edges" :node-types="nodeTypes" fit-view
                    style="height: 100%; width: 100%; background: #f8f8fa;" :zoom-on-scroll="true" :pan-on-drag="true">
                    <template #node-customNode="{ data, id }">
                        <CustomNode :data="data" :readonly="true" :metaData="metaData"/>
                    </template>
                </VueFlow>
            </div>
            <!-- JSON源码视图 -->
            <div v-if="viewMode === 'json'" class="json-view">
                <div class="json-panel">
                    <textarea v-model="jsonText" @input="onJsonInput" spellcheck="false"
                        class="json-textarea"></textarea>
                    <button class="export-btn" @click="exportJson">导出 JSON</button>
                </div>
            </div>
        </div>
        <button v-if="sidebarMinimized && viewMode === 'graph'" class="sidebar-min-btn sidebar-min-btn-float"
            @click="sidebarMinimized = false" title="展开">▶</button>
        <!-- 编辑抽屉（右侧滑出） -->
        <div v-if="showEditDrawer">
            <div class="edit-drawer-mask" @click="closeEditDrawer"></div>
            <div class="edit-drawer">
                <div class="edit-drawer-header">
                    <span>编辑 Agent 节点：{{ editAgentNodeId }}</span>
                    <span class="drawer-close" @click="closeEditDrawer">❌</span>
                </div>
                <div class="edit-drawer-body" v-if="editAgent">
                    <form class="agent-edit-form" @submit.prevent>
                        <RecursiveForm :obj="editAgent" :root="true" />
                        <div class="form-row"><button type="button" class="save-btn"
                                @click="onSaveAgentEdit">保存</button></div>
                    </form>
                </div>
            </div>
        </div>
        <!-- 团队节点编辑抽屉，与 agent 编辑抽屉风格一致 -->
        <div v-if="showEditTeamDrawer">
            <div class="edit-drawer-mask" @click="closeEditTeamDrawer"></div>
            <div class="edit-drawer">
                <div class="edit-drawer-header">
                    <span>编辑团队节点</span>
                    <span class="drawer-close" @click="closeEditTeamDrawer">❌</span>
                </div>
                <div class="edit-drawer-body" v-if="editTeamObj">
                    <form class="agent-edit-form" @submit.prevent>
                        <RecursiveForm :obj="editTeamObj" :root="true" />
                        <div class="form-row"><button type="button" class="save-btn" @click="onSaveTeamEdit">保存</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

// =================== 两套逻辑公共部分 =================== //
// 1. 所有 Vue 相关基础 API、组件、数据、拖拽、编辑、WebSocket、JSON 编辑等，均为两套逻辑公共部分
// 2. 这些部分不关心元数据合并方式，始终服务于数据流和 UI 展示
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { VueFlow } from '@vue-flow/core'
import { rawData } from './rawData'
import { parseRawDataToFlow } from './parseRawDataToFlow'
import CustomNode from './CustomNode.vue'
import { agentList, toolList, terminationList } from './data'
import { defineComponent, h } from 'vue'
// =================== 两套逻辑公共部分 =================== //
// 递归表单组件、isPrimitive、所有表单渲染均为公共部分
const isPrimitive = (val: any) => ['string', 'number', 'boolean'].includes(typeof val) || val === null

const RecursiveForm = defineComponent({
    name: 'RecursiveForm',
    props: {
        obj: { type: Object, required: true },
        root: { type: Boolean, default: false }
    },
    setup(props: any) {
        const getLabel = (key: string) => key
        
        // 获取 teamObj.value（始终与表单数据一致）
        const getTeamObj = () => {
            // 递归表单根节点 props.root 时，props.obj 就是 teamObj.value
            return props.root ? props.obj : null
        }
        
        return () => h('div',
            { class: props.root ? 'form-root' : '' },
            Object.entries(props.obj).map(([key, value]) => {
                if (Array.isArray(value)) {
                    return h('div', { class: 'form-card' }, [
                        h('div', { class: 'form-label-row' }, getLabel(key)),
                        ...value.map((item, idx) =>
                            isPrimitive(item)
                                ? h('div', { class: 'form-block' }, [
                                    h('div', { class: 'form-label-row form-array-index' }, `#${idx + 1}`),
                                    h('input', {
                                        class: 'form-input-row',
                                        value: item,
                                        onInput: (e: any) => {
                                            props.obj[key][idx] = e.target.value
                                            // 表单变更后触发自动保存
                                            autoSave()
                                        }
                                    })
                                ])
                                : h('div', { class: 'form-card' }, [
                                    h('div', { class: 'form-label-row form-array-index' }, `#${idx + 1}`),
                                    h(RecursiveForm, { obj: item })
                                ])
                        )
                    ])
                } else if (isPrimitive(value)) {
                    if (typeof value === 'boolean') {
                        return h('div', { class: 'form-block form-block-row' }, [
                            h('label', { class: 'form-label-inline' }, getLabel(key)),
                            h('input', {
                                class: 'form-checkbox-inline',
                                type: 'checkbox',
                                checked: value,
                                onChange: (e: any) => {
                                    props.obj[key] = e.target.checked
                                    // 复选框变更后触发自动保存
                                    autoSave()
                                }
                            })
                        ])
                    } else if (typeof value === 'string' && value.length > 60) {
                        // 根据字段类型设置不同的行数和最小高度
                        let longTextRows = 4
                        let minHeight = '120px'
                        
                        if (['system_message', 'description'].includes(key)) {
                            longTextRows = 8
                            minHeight = '200px'
                        } else if (key === 'source_code') {
                            longTextRows = 12
                            minHeight = '300px'
                        } else if (['prompt', 'content', 'message'].includes(key)) {
                            longTextRows = 6
                            minHeight = '150px'
                        }
                        
                        return h('div', { class: 'form-block' }, [
                            h('div', { class: 'form-label-row' }, getLabel(key)),
                            h('textarea', {
                                class: 'form-input-row form-input-longtext',
                                value: value,
                                rows: longTextRows,
                                style: `resize:vertical; min-height:${minHeight}; line-height: 1.5;`,
                                onInput: (e: any) => {
                                    props.obj[key] = e.target.value
                                    // 文本域变更后触发自动保存
                                    autoSave()
                                }
                            })
                        ])
                    } else {
                        return h('div', { class: 'form-block' }, [
                            h('div', { class: 'form-label-row' }, getLabel(key)),
                            h('input', {
                                class: 'form-input-row',
                                value: value,
                                onInput: (e: any) => {
                                    props.obj[key] = typeof value === 'number' ? Number(e.target.value) : e.target.value
                                    // 输入框变更后触发自动保存
                                    autoSave()
                                }
                            })
                        ])
                    }
                } else if (typeof value === 'object' && value !== null) {
                    return h('div', { class: 'form-card' }, [
                        h('div', { class: 'form-label-row' }, getLabel(key)),
                        h(RecursiveForm, { obj: value })
                    ])
                } else {
                    return null
                }
            })
        )
    }
})



// ========== 新的统一数据管理系统 ========== //
// 获取路由参数
const route = useRoute()
const applicationId = computed(() => route.params.applicationId as string)

// 原始数据存储
const rawDataRef = ref(JSON.parse(JSON.stringify(rawData)))

// ========== 全新的撤销/重做系统 ========== //
interface UndoRedoState {
    past: any[]
    present: any
    future: any[]
}

const undoRedoState = ref<UndoRedoState>({
    past: [],
    present: JSON.parse(JSON.stringify(rawData)),
    future: []
})

// 撤销/重做相关的计算属性
const canUndo = computed(() => {
    return undoRedoState.value && Array.isArray(undoRedoState.value.past) && undoRedoState.value.past.length > 0
})
const canRedo = computed(() => {
    return undoRedoState.value && Array.isArray(undoRedoState.value.future) && undoRedoState.value.future.length > 0
})

// 防抖timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let pendingOperationType: string | null = null

// 核心撤销/重做方法
function createSnapshot(operationType: string = 'unknown') {
    console.log(`[UndoRedo] 创建快照: ${operationType}`)
    
    // 安全检查
    if (!undoRedoState.value) {
        console.warn('[UndoRedo] undoRedoState 未初始化')
        return
    }
    
    // 清除之前的定时器
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    
    // 根据操作类型设置不同的防抖延迟
    const delay = getDebounceDelay(operationType)
    pendingOperationType = operationType
    
    debounceTimer = setTimeout(() => {
        console.log(`[UndoRedo] 执行快照创建: ${pendingOperationType}`)
        
        // 再次安全检查
        if (!undoRedoState.value) {
            console.warn('[UndoRedo] undoRedoState 在执行时未初始化')
            return
        }
        
        // 确保数组存在
        if (!Array.isArray(undoRedoState.value.past)) {
            undoRedoState.value.past = []
        }
        if (!Array.isArray(undoRedoState.value.future)) {
            undoRedoState.value.future = []
        }
        
        // 深拷贝当前状态
        const currentState = JSON.parse(JSON.stringify(rawDataRef.value))
        
        // 如果当前状态与最新状态不同，才创建快照
        if (JSON.stringify(currentState) !== JSON.stringify(undoRedoState.value.present)) {
            // 将当前状态推入历史栈
            undoRedoState.value.past.push(JSON.parse(JSON.stringify(undoRedoState.value.present)))
            
            // 限制历史栈大小（保留最近50个状态）
            if (undoRedoState.value.past.length > 50) {
                undoRedoState.value.past.shift()
            }
            
            // 更新当前状态
            undoRedoState.value.present = currentState
            
            // 清空future栈（新操作后无法重做）
            undoRedoState.value.future = []
            
            console.log(`[UndoRedo] ✅ 快照已创建，历史栈大小: ${undoRedoState.value.past.length}`)
        }
        
        debounceTimer = null
        pendingOperationType = null
    }, delay)
}

function getDebounceDelay(operationType: string): number {
    switch (operationType) {
        case 'input': return 1000    // 输入操作延迟1秒
        case 'edit': return 800      // 编辑操作延迟800ms
        case 'drag': return 100      // 拖拽操作延迟100ms
        case 'delete': return 50     // 删除操作延迟50ms
        case 'websocket': return 0   // WebSocket数据立即保存
        default: return 300          // 默认延迟300ms
    }
}

function undo() {
    if (!canUndo.value || !undoRedoState.value || !Array.isArray(undoRedoState.value.past)) return
    
    console.log('[UndoRedo] 执行撤销操作')
    
    // 取消pending的快照
    if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
    }
    
    // 确保future数组存在
    if (!Array.isArray(undoRedoState.value.future)) {
        undoRedoState.value.future = []
    }
    
    // 将当前状态推入future栈
    undoRedoState.value.future.unshift(JSON.parse(JSON.stringify(undoRedoState.value.present)))
    
    // 从past栈取出上一个状态
    const previousState = undoRedoState.value.past.pop()!
    undoRedoState.value.present = previousState
    
    // 同步到rawDataRef
    rawDataRef.value = JSON.parse(JSON.stringify(previousState))
    
    console.log(`[UndoRedo] ✅ 撤销完成，past: ${undoRedoState.value.past.length}, future: ${undoRedoState.value.future.length}`)
}

function redo() {
    if (!canRedo.value || !undoRedoState.value || !Array.isArray(undoRedoState.value.future)) return
    
    console.log('[UndoRedo] 执行重做操作')
    
    // 取消pending的快照
    if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
    }
    
    // 确保past数组存在
    if (!Array.isArray(undoRedoState.value.past)) {
        undoRedoState.value.past = []
    }
    
    // 将当前状态推入past栈
    undoRedoState.value.past.push(JSON.parse(JSON.stringify(undoRedoState.value.present)))
    
    // 从future栈取出下一个状态
    const nextState = undoRedoState.value.future.shift()!
    undoRedoState.value.present = nextState
    
    // 同步到rawDataRef
    rawDataRef.value = JSON.parse(JSON.stringify(nextState))
    
    console.log(`[UndoRedo] ✅ 重做完成，past: ${undoRedoState.value.past.length}, future: ${undoRedoState.value.future.length}`)
}

// 统一的数据更新函数
function updateTeamData(operationType: string = 'edit') {
    console.log(`[DataUpdate] 数据更新: ${operationType}`)
    createSnapshot(operationType)
}
// teamObj 直接使用 team_json_body JSON对象，无需解析
const teamObj = computed(() => {
    try {
        const body = rawDataRef.value.teamBody
        // 调试输出 team_json_body 类型和内容
        console.log('[调试] teamObj解析 team_json_body:', typeof body?.team_json_body, body?.team_json_body)
        if (body && body.team_json_body) {
            // 后端直接返回JSON对象，无需解析
            if (typeof body.team_json_body === 'object') {
                console.log('[调试] teamObj.value 结果:', body.team_json_body)
                return body.team_json_body
            }
            // 兼容性：如果仍是字符串则警告
            else if (typeof body.team_json_body === 'string') {
                console.warn('[调试] ⚠️ team_json_body 仍为字符串格式，后端可能未完成JSON格式切换')
                return {}
            }
        }
    } catch (err) {
        console.error('[调试] teamObj计算出错:', err)
    }
    return {} // 兜底返回空对象，保证 watch teamObj.value 不为 null
})

// ========== 逻辑二：parseRawDataToFlow.ts 内部合并元数据到节点 data ========== //
// 该逻辑在 parseRawDataToFlow.ts 文件中实现，所有团队节点的 data 都会自动合并 id/version/app_name/department_id 字段
// 这样 CustomNode.vue 渲染时能直接拿到元数据，无需在 teamObj 计算属性重复合并

const nodes = ref<any[]>([])
const edges = ref<any[]>([])

// 调试：每次 nodes/edges 更新时输出内容
watch(nodes, (val) => {
    console.log('[调试] nodes.value:', val)
}, { immediate: true, deep: true })
watch(edges, (val) => {
    console.log('[调试] edges.value:', val)
}, { immediate: true, deep: true })
watch(teamObj, (val) => {
    console.log('[调试] teamObj.value:', val)
}, { immediate: true, deep: true })
const nodeTypes = { customNode: CustomNode }
const viewMode = ref<'graph' | 'json' | 'preview'>('graph')
// JSON编辑区展示对象格式的team_json_body，编辑后自动序列化
const jsonText = ref('')

// =================== 只读顶层元数据 computed =================== //
const metaData = computed(() => ({
    id: rawDataRef.value.id ?? '-',
    version: rawDataRef.value.teamBody?.version ?? '-',
    app_name: rawDataRef.value.teamBody?.app_name ?? '-',
    department_id: rawDataRef.value.teamBody?.department_id ?? '-'
}))

watch(teamObj, () => {
    console.log('[调试] watch teamObj.value:', teamObj.value)
    // 传递 teamBody 元数据，自动合并到每个节点
    if (teamObj.value) {
        const teamBodyMeta = rawDataRef.value.teamBody || {}
        const { nodes: n, edges: e } = parseRawDataToFlow(teamObj.value, teamBodyMeta)
        console.log('[调试] parseRawDataToFlow nodes:', n)
        nodes.value = n
        edges.value = e
    } else {
        nodes.value = []
        edges.value = []
    }
}, { immediate: true, deep: true })

watch(rawDataRef, (val) => {
    // 只有在非JSON视图时才自动刷新jsonText，避免覆盖用户编辑
    if (viewMode.value !== 'json') {
        jsonText.value = JSON.stringify(val, null, 2)
    }
    // 调试输出 rawDataRef 内容
    console.log('[调试] rawDataRef:', val)
}, { deep: true })

// 进入JSON视图时，直接展示JSON对象，无需转义处理
watch(viewMode, (mode) => {
    if (mode === 'json') {
        // 直接展示，无需解析team_json_body字符串
        let displayObj
        try {
            displayObj = JSON.parse(JSON.stringify(rawDataRef.value))
        } catch {
            displayObj = {}
        }
        // team_json_body现在已经是对象，无需额外处理
        jsonText.value = JSON.stringify(displayObj, null, 2)
    }
}, { immediate: true })

function onJsonInput() {
    try {
        const obj = JSON.parse(jsonText.value)
        // team_json_body现在保持为对象格式，无需字符串转换
        rawDataRef.value = obj
        createSnapshot('input') // 使用新的快照系统
        // JSON输入变更后触发自动保存
        autoSave()
    } catch (e) {
        // 不做处理，保持编辑体验
    }
}

function exportJson() {
    // 直接导出，team_json_body保持对象格式
    const exportObj = JSON.parse(JSON.stringify(rawDataRef.value))
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'agent-structure.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// 拖拽事件
function onDragStart(e: DragEvent, type: string, item: any) {
    e.dataTransfer?.setData('application/json', JSON.stringify({ type, item }))
}


function onDropOnArea({ area, payload, nodeId }: any) {
    console.log('[AgentNode] onDropOnArea:', { area, payload, nodeId })
    const team = teamObj.value
    if (!team) return
    // 保证 team.agents 始终为数组
    if (!Array.isArray(team.agents)) {
        team.agents = []
    }
    // 支持 sidebar 拖拽的 agent 数据结构，类型不限
    if (area === 'agents' && payload.type === 'agent') {
        if (!team.agents.some((a: any) => a.name === payload.item.name)) {
            team.agents.push({
                type: payload.item.type || 'Agent',
                name: payload.item.name,
                system_message: payload.item.system_message || '',
                tools: payload.item.tools || []
            })
            console.log('[AgentNode] 新 Agent 已添加:', payload.item.name)
            recordChange(`agents.${payload.item.name}`, payload.item, 'add')
        } else {
            console.log('[AgentNode] Agent 已存在:', payload.item.name)
        }
    } else if (area === 'tools' && (payload.type === 'function' || payload.type === 'tool')) {
        const agent = team.agents.find((a: any) => a.name === nodeId)
        if (agent && !agent.tools.some((t: any) => t.name === payload.item.name)) {
            agent.tools.push({
                type: payload.item.type,
                name: payload.item.name,
                description: payload.item.description,
                source_code: payload.item.source_code || ''
            })
            console.log('[AgentNode] 新 Tool 已添加:', payload.item.name)
            recordChange(`agents.${nodeId}.tools.${payload.item.name}`, payload.item, 'add')
        } else {
            console.log('[AgentNode] Tool 已存在或 Agent 未找到:', payload.item.name)
        }
    } else if (area === 'termination' && payload.type === 'termination') {
        // 设置团队的终止条件
        team.terminator = payload.item.description || payload.item.type || '结束'
        console.log('[AgentNode] 终止条件已设置:', team.terminator)
        recordChange('terminator', team.terminator, 'edit')
    }
    // 拖拽操作统一处理
    const newRawData = JSON.parse(JSON.stringify(rawDataRef.value))
    newRawData.teamBody.team_json_body = JSON.parse(JSON.stringify(team))
    rawDataRef.value = newRawData
    console.log('[AgentNode] rawDataRef 已整体替换:', JSON.parse(JSON.stringify(rawDataRef.value)))
    createSnapshot('drag') // 使用新的快照系统
    // 拖拽操作后触发自动保存
    autoSave()
}

const sidebarSections = [
    { title: 'Agent 列表', type: 'agent', list: agentList },
    { title: 'Tool 列表', type: 'function', list: toolList }, // 工具分组统一命名
    { title: 'Termination 列表', type: 'termination', list: terminationList },
]
const collapsedSections = ref([true, true, true, true])
function toggleSection(idx: number) {
    collapsedSections.value[idx] = !collapsedSections.value[idx]
}

const sidebarMinimized = ref(false)
const globalSearch = ref('')
function filteredSectionList(idx: number) {
    const keyword = globalSearch.value.toLowerCase()
    if (!keyword) return sidebarSections[idx].list
    return sidebarSections[idx].list.filter(item => {
        // 支持 agent/tool/termination 三类结构
        // 搜索 name/type/description/system_message/value 字段
        const fields = [
            (item as any).name || '',
            (item as any).type || '',
            (item as any).description || '',
            (item as any).system_message || '',
            (item as any).value || ''
        ]
        return fields.some(f => f && f.toLowerCase().includes(keyword))
    })
}

const showEditDrawer = ref(false)
const editAgentNodeId = ref('')

function onRemoveAgent({ agentName }: { agentName: string }) {
    const team = teamObj.value
    if (!team || !Array.isArray(team.agents)) return
    
    // 记录被删除的agent信息
    const removedAgent = team.agents.find((a: any) => a.name === agentName)
    if (removedAgent) {
        recordChange(`agents.${agentName}`, null, 'delete')
    }
    
    team.agents = team.agents.filter((a: any) => a.name !== agentName)
    rawDataRef.value.teamBody.team_json_body = team
    createSnapshot('delete') // 使用新的快照系统
    // 删除Agent后触发自动保存
    autoSave()
}
function onRemoveTool({ tool }: { tool: string }) {
    const team = teamObj.value
    if (!team || !Array.isArray(team.agents)) return
    
    // 记录工具删除
    team.agents.forEach((a: any) => {
        const removedTool = a.tools.find((t: any) => t.name === tool)
        if (removedTool) {
            recordChange(`agents.${a.name}.tools.${tool}`, null, 'delete')
        }
        a.tools = a.tools.filter((t: any) => t.name !== tool)
    })
    rawDataRef.value.teamBody.team_json_body = team
    createSnapshot('delete') // 使用新的快照系统
    // 删除Tool后触发自动保存
    autoSave()
}
function onDeleteAgentNode({ nodeId }: { nodeId: string }) {
    const team = teamObj.value
    if (!team || !Array.isArray(team.agents)) return
    
    // 记录被删除的agent信息
    const removedAgent = team.agents.find((a: any) => a.name === nodeId)
    if (removedAgent) {
        recordChange(`agents.${nodeId}`, null, 'delete')
    }
    
    team.agents = team.agents.filter((a: any) => a.name !== nodeId)
    rawDataRef.value.teamBody.team_json_body = team
    createSnapshot('delete') // 使用新的快照系统
    // 删除Agent节点后触发自动保存
    autoSave()
}
function onEditAgentNode({ nodeId }: { nodeId: string }) {
    editAgentNodeId.value = nodeId
    showEditDrawer.value = true
}
function closeEditDrawer() {
    showEditDrawer.value = false
    editAgentNodeId.value = ''
}


const editAgent = computed(() => {
    if (!showEditDrawer.value || !editAgentNodeId.value) return null
    const team = teamObj.value
    if (!team || !Array.isArray(team.agents)) return null
    return team.agents.find((a: any) => a?.name === editAgentNodeId.value) || null
})


const toolsString = computed({
    get() {
        const agent = editAgent.value
        if (!agent || !Array.isArray(agent.tools)) return ''
        return agent.tools.map((t: any) => t?.name || '').join(', ')
    },
    set(val: string) {
        const agent = editAgent.value
        if (!agent) return
        agent.tools = val.split(',').map(s => ({
            type: 'function',
            name: s.trim(),
            description: '',
            source_code: ''
        })).filter(t => t.name)
        // 工具编辑后同步 team_json_body
        if (teamObj.value) {
            rawDataRef.value.teamBody.team_json_body = JSON.stringify(teamObj.value, null, 2)
            rawDataRef.value = { ...rawDataRef.value }
        }
    }
})

const metadataString = computed({
    get() {
        // 新结构无 metadata，返回空
        return ''
    },
    set(val: string) {
        // 新结构无 metadata，不做处理
    }
})

function onToolsInput(e: any) {
    toolsString.value = e.target.value
}
function onMetadataInput(e: any) {
    metadataString.value = e.target.value
}
function onSaveAgentEdit() {
    // 保存 agent 编辑后，强制同步 teamObj 到对象
    if (teamObj.value && editAgent.value) {
        // 记录agent编辑变化
        recordChange(`agents.${editAgent.value.name}`, editAgent.value, 'edit')
        
        rawDataRef.value.teamBody.team_json_body = teamObj.value
        // setRawData 已移除
        createSnapshot('update') // 使用新的快照系统
        // 保存Agent编辑后触发自动保存
        autoSave()
    }
    closeEditDrawer()
}

// ========== 以下为团队节点编辑抽屉相关逻辑 ========== //
const showEditTeamDrawer = ref(false)

function onEditTeamNode() {
    showEditTeamDrawer.value = true
}
function closeEditTeamDrawer() {
    showEditTeamDrawer.value = false
}
// 只编辑 config 除 participants 外的字段，保留顶层字段

// 自动适配 team_json_body 非 agents 字段，顶层字段只读
const editTeamObj = computed(() => {
    if (!showEditTeamDrawer.value) return null
    const team = teamObj.value
    if (!team) return null
    // 只编辑 team_json_body 下除 agents 字段外的所有字段
    const obj: any = {}
    Object.entries(team).forEach(([k, v]) => {
        if (k !== 'agents') {
            obj[k] = v
        }
    })
    return obj
})

function onSaveTeamEdit() {
    // 只同步 team_json_body 下除 agents 字段外的字段
    if (!editTeamObj.value || !teamObj.value) return
    
    // 记录团队配置变化
    const changes: any = {}
    Object.entries(editTeamObj.value).forEach(([k, v]) => {
        if (k !== 'agents' && teamObj.value[k] !== v) {
            changes[k] = v
            teamObj.value[k] = v
        }
    })
    
    if (Object.keys(changes).length > 0) {
        recordChange('team_config', changes, 'edit')
    }
    
    rawDataRef.value.teamBody.team_json_body = teamObj.value
    // setRawData 已移除
    createSnapshot('update') // 使用新的快照系统
    // 保存Team编辑后触发自动保存
    autoSave()
    closeEditTeamDrawer()
}













// 初始化时
// 页面挂载时监听 ctrl+z/ctrl+shift+z
onMounted(() => {
  createSnapshot('init') // 初始化快照，保证撤销栈有内容
  
  // 初始化WebSocket连接
  if (applicationId.value) {
    connectWebSocket()
    console.log('[WebSocket] 🔄 WebSocket 已连接到:', websocketUrl.value)
  } else {
    console.warn('[WebSocket] ⚠️ 缺少applicationId参数，无法连接WebSocket')
  }
  
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      if (undoRedoState.value && Array.isArray(undoRedoState.value.past) && undoRedoState.value.past.length > 0) {
        undo()
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.shiftKey) {
      if (undoRedoState.value && Array.isArray(undoRedoState.value.future) && undoRedoState.value.future.length > 0) {
        redo()
      }
    }
  })
})

// 监听applicationId变化，重新连接WebSocket
watch(applicationId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log('[WebSocket] 🔄 ApplicationId变化，重新连接WebSocket:', newId)
    connectWebSocket()
  }
}, { immediate: false })

// 组件卸载时清理WebSocket连接
onUnmounted(() => {
  if (websocketInstance) {
    console.log('[WebSocket] 🔌 组件卸载，关闭WebSocket连接')
    websocketInstance.close()
    websocketInstance = null
  }
})


















// ========== 变化记录系统 ========== //
// 存储原始数据的快照，用于对比变化
const originalDataSnapshot = ref<any>(null)
const changeLog = ref<any[]>([])

// ========== 自动保存系统 ========== //
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
const autoSaveDelay = 2000 // 2秒后自动保存
const isSaving = ref(false) // 添加保存状态追踪

// 自动保存函数（带防抖）
function autoSave() {
    // 清除之前的定时器
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
    }
    
    // 设置新的定时器
    autoSaveTimer = setTimeout(async () => {
        console.log('[AutoSave] 触发自动保存')
        isSaving.value = true
        
        try {
            await deployToBackend()
            console.log('[AutoSave] ✅ 自动保存完成')
        } catch (error) {
            console.error('[AutoSave] ❌ 自动保存失败:', error)
        } finally {
            autoSaveTimer = null
            isSaving.value = false
        }
    }, autoSaveDelay)
    
    console.log(`[AutoSave] 已设置自动保存，${autoSaveDelay}ms后执行`)
}

// 记录数据变化
function recordChange(fieldPath: string, newValue: any, operationType: string = 'edit') {
    const timestamp = new Date().toISOString()
    const change = {
        timestamp,
        fieldPath,
        newValue: JSON.parse(JSON.stringify(newValue)),
        operationType
    }
    changeLog.value.push(change)
    console.log(`[ChangeLog] 记录变化: ${fieldPath} (${operationType})`)
}

// 生成变化摘要 - 重新设计为对比原始数据和当前数据（JSON对象格式）
function generateChangesSummary(): any {
    if (!originalDataSnapshot.value || !rawDataRef.value) {
        return {}
    }
    
    const changes: any = {}
    const original = originalDataSnapshot.value
    const current = rawDataRef.value
    
    // 对比顶层字段
    if (original.id !== current.id) {
        changes.id = current.id
    }
    
    // 对比teamBody下的字段
    if (original.teamBody && current.teamBody) {
        const originalTeamBody = original.teamBody
        const currentTeamBody = current.teamBody
        
        // 对比version, app_name, department_id等字段
        if (originalTeamBody.version !== currentTeamBody.version) {
            changes.version = currentTeamBody.version
        }
        if (originalTeamBody.app_name !== currentTeamBody.app_name) {
            changes.app_name = currentTeamBody.app_name
        }
        if (originalTeamBody.department_id !== currentTeamBody.department_id) {
            changes.department_id = currentTeamBody.department_id
        }
        
        // 对比team_json_body - 现在都是JSON对象，直接对比
        const originalTeamJson = originalTeamBody.team_json_body
        const currentTeamJson = currentTeamBody.team_json_body
            
        if (JSON.stringify(originalTeamJson) !== JSON.stringify(currentTeamJson)) {
            changes.team_json_body = currentTeamJson
        }
    }
    
    return changes
}

// 精确变化分析函数 - 深度对比原始数据和当前数据
function analyzeChanges() {
    if (!originalDataSnapshot.value || !rawDataRef.value) {
        console.warn('[精确变化] 缺少原始数据快照或当前数据')
        return {
            content: {},
            originalContent: {}
        }
    }
    
    const original = originalDataSnapshot.value.teamBody
    const current = rawDataRef.value.teamBody
    
    console.log('[精确变化] 开始深度对比...')
    console.log('  原始teamBody:', original)
    console.log('  当前teamBody:', current)
    
    const result = {
        content: {},
        originalContent: {}
    }
    
    // 深度比较teamBody中的所有字段
    const changedPaths = findChangedPaths(original, current, 'teamBody')
    
    console.log('[精确变化] 检测到变化路径:', changedPaths)
    
    // 为每个变化路径构建content和originalContent
    changedPaths.forEach(pathInfo => {
        const { path, originalValue, currentValue } = pathInfo
        
        // 将路径转换为嵌套对象结构
        setNestedValue(result.originalContent, path, originalValue)
        setNestedValue(result.content, path, currentValue)
        
        console.log(`[精确变化] 路径 ${path}:`)
        console.log('  原始值:', originalValue)
        console.log('  当前值:', currentValue)
    })
    
    return result
}

// 递归查找变化路径 - 数组作为整体处理，不递归到数组内部
function findChangedPaths(original: any, current: any, basePath: string = ''): Array<{path: string, originalValue: any, currentValue: any}> {
    const changes: Array<{path: string, originalValue: any, currentValue: any}> = []
    
    // 如果两个值完全相同，跳过
    if (JSON.stringify(original) === JSON.stringify(current)) {
        return changes
    }
    
    // 🔑 关键修改：如果是数组，直接作为整体比较，不递归到内部
    if (Array.isArray(original) || Array.isArray(current)) {
        // 数组有任何变化（长度、内容等），就将整个数组作为变化单位
        if (JSON.stringify(original) !== JSON.stringify(current)) {
            changes.push({
                path: basePath,
                originalValue: original,
                currentValue: current
            })
        }
        return changes
    }
    // 如果是对象
    else if (typeof original === 'object' && typeof current === 'object' && original !== null && current !== null) {
        const allKeys = new Set([...Object.keys(original), ...Object.keys(current)])
        
        for (const key of allKeys) {
            const newPath = basePath ? `${basePath}.${key}` : key
            
            if (!(key in original)) {
                // 新增的键
                changes.push({
                    path: newPath,
                    originalValue: undefined,
                    currentValue: current[key]
                })
            } else if (!(key in current)) {
                // 删除的键
                changes.push({
                    path: newPath,
                    originalValue: original[key],
                    currentValue: undefined
                })
            } else {
                // 递归比较（但遇到数组时会在上面的逻辑中被拦截）
                const nestedChanges = findChangedPaths(
                    original[key],
                    current[key],
                    newPath
                )
                changes.push(...nestedChanges)
            }
        }
    }
    // 如果是基本类型值不同
    else if (original !== current) {
        changes.push({
            path: basePath,
            originalValue: original,
            currentValue: current
        })
    }
    
    return changes
}

// 将值设置到嵌套对象路径中 - 简化版，因为不再处理数组索引
function setNestedValue(obj: any, path: string, value: any) {
    const parts = path.split('.')
    let current = obj
    
    // 遍历路径，创建嵌套对象结构
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        
        if (!current[part]) {
            current[part] = {}
        }
        current = current[part]
    }
    
    // 设置最终值
    const lastPart = parts[parts.length - 1]
    current[lastPart] = value
}

// 清空变化记录
function clearChangeLog() {
    changeLog.value = []
    console.log('[ChangeLog] 变化记录已清空')
}


























// WebSocket 连接和消息处理
import { useWebSocket } from '../../../utils/websocket'

// 动态WebSocket连接，使用路由参数中的applicationId
const websocketUrl = computed(() => `wss://chat.zy-jn.org.cn/aagent/ws/${applicationId.value}`)

// 创建WebSocket实例，但需要动态重连
let websocketInstance: ReturnType<typeof useWebSocket> | null = null

// ==================================================================================
// WebSocket 系统 - 按执行顺序组织
// ==================================================================================
// 运行流程：
// 1. 页面加载 → onMounted() → connectWebSocket() 建立连接
// 2. 连接成功 → 自动触发 autoReceiveData() 获取数据  
// 3. 用户交互 → 点击"接收数据" → getDatafromBackend() 手动获取
// 4. 用户交互 → 点击"部署" → deployToBackend() 发送数据
// 5. 所有数据发送都通过 sendWebSocketMessage() 统一处理
// ==================================================================================

// ====================================
// 1. 基础工具函数 - WebSocket消息发送包装器
// ====================================
function sendWebSocketMessage(data: any) {
  if (websocketInstance) {
    websocketInstance.send(data)
  } else {
    console.error('[WebSocket] WebSocket实例未初始化')
  }
}

// ====================================
// 2. 自动数据接收函数 - 连接成功后自动触发
// ====================================

// 自动接收数据函数
function autoReceiveData() {
    try {
        console.log('[WebSocket] 🤖 自动请求后端数据...')
        
        // 发送查询请求，让后端返回数据
        sendWebSocketMessage({ 
            table: 'AgentTeam', 
            action: 'select' 
        })
        
        console.log('[WebSocket] ✅ 自动数据请求已发送，等待后端响应')
        
    } catch (error: any) {
        console.error('[WebSocket] ❌ 自动请求数据失败:', error)
        console.error('[WebSocket] 错误详情:', error.message)
    }
}

// ====================================
// 3. WebSocket连接函数 - 建立连接并自动触发数据接收
// ====================================
function connectWebSocket() {
  if (websocketInstance) {
    websocketInstance.close()
  }
  
  console.log('[WebSocket] 连接到:', websocketUrl.value)
  websocketInstance = useWebSocket(websocketUrl.value)
  
  // 监听连接状态，连接成功后自动请求数据
  watch(
    () => websocketInstance?.isConnected.value,
    (isConnected) => {
      if (isConnected) {
        console.log('[WebSocket] 🚀 连接成功，自动触发数据接收...')
        // 延迟一下确保连接完全稳定
        setTimeout(() => {
          autoReceiveData()
        }, 500)
      }
    },
    { immediate: true }
  )
  
  websocketInstance.connect((rawData) => {
    try {
        console.log('[WebSocket] 收到原始 data:', rawData)

        // � 新格式适配：检查是否为数组格式
        let processedData = rawData
        
        // 如果是数组格式，取第一个元素
        if (Array.isArray(rawData) && rawData.length > 0) {
            console.log('[WebSocket] 🔄 检测到数组格式数据，提取第一个元素')
            processedData = rawData[0]
            console.log('[WebSocket] 提取后的数据:', processedData)
        } else if (Array.isArray(rawData) && rawData.length === 0) {
            console.log('[WebSocket] 🚫 收到空数组，忽略处理')
            return
        }

        // �🔍 关键修复：检查消息类型，只处理获取数据的响应
        // 如果消息包含 content/originalContent 字段，说明是部署确认消息，应该忽略
        if (processedData && (processedData.content || processedData.originalContent)) {
            console.log('[WebSocket] 🚫 检测到部署确认消息，忽略处理')
            console.log('[WebSocket] 确认消息内容:', processedData)
            return // 直接返回，不处理这种消息
        }
        
        // 检查是否是有效的数据获取响应（应该包含 teamBody 字段）
        if (!processedData || !processedData.teamBody) {
            console.log('[WebSocket] 🚫 非数据获取响应，忽略处理')
            console.log('[WebSocket] 消息类型判断: processedData存在?', !!processedData, ', teamBody存在?', !!processedData?.teamBody)
            console.log('[WebSocket] processedData内容:', processedData)
            return
        }

        console.log('[WebSocket] ✅ 检测到有效的数据获取响应，开始处理')

        // 🆕 新逻辑：检查是否有latest字段，如果有则使用latest中的数据
        let data
        
        if (processedData.latest && processedData.latest.teamBody) {
            console.log('[WebSocket] 🔄 检测到latest字段，使用latest中的最新数据')
            
            // 从latest中提取数据（排除content和originalContent）
            const latestData = JSON.parse(JSON.stringify(processedData.latest))
            delete latestData.content
            delete latestData.originalContent
            
            console.log('[WebSocket] latest数据结构预览:')
            console.log('- latest.id:', latestData.id)
            console.log('- latest.teamBody.app_name:', latestData.teamBody?.app_name)
            console.log('- latest.teamBody agents数量:', latestData.teamBody?.team_json_body?.agents?.length || 0)
            
            // 用latest数据替换原数据（保留外层的基础字段，用latest的teamBody等关键数据）
            data = {
                ...processedData, // 保留原来的基础字段（如外层的id等）
                ...latestData, // 用latest中的数据覆盖
                id: processedData.id || latestData.id, // 确保id正确
                application_id: processedData.application_id || latestData.application_id // 确保application_id正确
            }
            
            console.log('[WebSocket] ✅ 已应用latest数据，最终数据预览:')
            console.log('- 最终id:', data.id)
            console.log('- 最终teamBody.app_name:', data.teamBody?.app_name)
            console.log('- 最终agents数量:', data.teamBody?.team_json_body?.agents?.length || 0)
        } else {
            console.log('[WebSocket] 📝 未检测到latest字段，使用原始数据结构')
            data = JSON.parse(JSON.stringify(processedData))
        }

        // 🗑️ 重要：删除latest字段，避免数据结构混乱和层级嵌套错误
        if (data.latest) {
            console.log('[WebSocket] 🗑️ 删除latest字段，避免后续数据结构混乱')
            delete data.latest
        }

        console.log('[WebSocket] ✅ 后端数据为JSON格式，开始处理数据获取响应')
        console.log('[WebSocket] teamBody类型:', typeof data.teamBody)
        if (data.teamBody && data.teamBody.team_json_body) {
            console.log('[WebSocket] team_json_body类型:', typeof data.teamBody.team_json_body)
            console.log('[WebSocket] agents 数量:', data.teamBody.team_json_body.agents?.length || 0)
            
            // 检查agents数组中的工具数量
            if (data.teamBody.team_json_body.agents && Array.isArray(data.teamBody.team_json_body.agents)) {
                data.teamBody.team_json_body.agents.forEach((agent: any, index: number) => {
                    console.log(`[WebSocket] Agent ${index + 1}: ${agent.name}, 工具数量: ${agent.tools?.length || 0}`)
                })
            }
        }

        // 保存原始数据快照用于变化对比
        originalDataSnapshot.value = JSON.parse(JSON.stringify(data))
        console.log('[WebSocket] 原始数据快照已保存')
        
        // 清空之前的变化记录
        clearChangeLog()

        // 将完全解析后的数据赋值给 ref
        rawDataRef.value = data
        createSnapshot('websocket') // 使用新的快照系统

        console.log('[WebSocket] ✅ JSON数据处理完成')
        console.log('[WebSocket] 最终数据结构预览:')
        console.log('- id:', rawDataRef.value.id)
        console.log('- version:', rawDataRef.value.teamBody?.version)
        console.log('- app_name:', rawDataRef.value.teamBody?.app_name)
        console.log('- department_id:', rawDataRef.value.teamBody?.department_id)
        console.log('- team_json_body 类型:', typeof rawDataRef.value.teamBody?.team_json_body)

    } catch (err: any) {
        console.error('[WebSocket] ❌ JSON数据处理失败:', err)
        console.error('[WebSocket] 错误详情:', err.message)
        
        // 获取原始数据的id，适配数组格式
        let fallbackId = 0
        if (Array.isArray(rawData) && rawData.length > 0) {
            fallbackId = rawData[0]?.id || 0
        } else if (rawData && !Array.isArray(rawData)) {
            fallbackId = rawData.id || 0
        }
        
        // 应急处理：设置一个基础的空结构避免应用崩溃
        rawDataRef.value = {
            id: fallbackId,
            teamBody: {
                version: '',
                app_name: '',
                department_id: 0,
                team_json_body: {
                    team_type: "RoundRobinGroupChat",
                    terminator: "结束",
                    selector_config: {
                        allow_repeated_speaker: true
                    },
                    agents: []
                }
            }
        }
        createSnapshot('websocket') // 使用新的快照系统
    }
  })
}

// ====================================
// 3. 手动数据接收函数
// ====================================
// 4. 手动数据接收函数 - 用户点击"接收数据"按钮触发
// ====================================

// 手动触发接收数据（按钮点击时调用）
function getDatafromBackend() {
    try {
        console.log('[WebSocket] 📥 手动请求后端数据...')
        
        // 发送查询请求，让后端返回数据
        sendWebSocketMessage({ 
            table: 'AgentTeam', 
            action: 'select' 
        })
        
        console.log('[WebSocket] ✅ 数据请求已发送，等待后端响应')
        
    } catch (error: any) {
        console.error('[WebSocket] ❌ 请求数据失败:', error)
        console.error('[WebSocket] 错误详情:', error.message)
    }
}

// ====================================
// 5. 数据部署函数 - 将编辑好的配置发送到后端
// ====================================

// 部署数据到后端（按钮点击时调用）
async function deployToBackend() {
    try {
        console.log('[WebSocket] 🚀 开始保存数据...')
        console.log('='.repeat(80))
        
        // 验证必要数据
        if (!rawDataRef.value || !rawDataRef.value.teamBody) {
            console.error('[WebSocket] ❌ 数据不完整，无法保存')
            alert('数据不完整，无法保存！')
            return
        }
        
        const masterId = rawDataRef.value.id
        if (!masterId) {
            console.error('[WebSocket] ❌ 缺少master ID，无法部署')
            alert('缺少master ID，无法保存！')
            return
        }
        
        console.log('[部署调试] 📋 字段转义前后对比：')
        console.log('='.repeat(60))
        
        // 1. master字段 - 直接使用数字，不转义
        console.log('1️⃣ master字段:')
        console.log('  原始值:', masterId, `(类型: ${typeof masterId})`)
        console.log('  最终值:', masterId.toString(), '(转为字符串格式)')
        console.log('')
        
        // 2. 精确变化追踪 - 比较原始数据和当前数据
        console.log('2️⃣ 精确变化追踪:')
        console.log('  原始数据快照:', originalDataSnapshot.value ? '已保存' : '未保存')
        
        const changeAnalysis = analyzeChanges()
        console.log('  变化分析结果:', changeAnalysis)
        
        // 🔍 详细调试：显示数组整体变化情况
        if (changeAnalysis.content && changeAnalysis.originalContent) {
            console.log('  📋 变化详情分析:')
            Object.keys(changeAnalysis.content).forEach(key => {
                console.log(`    键: ${key}`)
                const contentValue = (changeAnalysis.content as any)[key]
                const originalValue = (changeAnalysis.originalContent as any)[key]
                
                if (Array.isArray(contentValue)) {
                    console.log(`      类型: 数组`)
                    console.log(`      原始长度: ${originalValue?.length || 0}`)
                    console.log(`      当前长度: ${contentValue?.length || 0}`)
                } else {
                    console.log(`      类型: ${typeof contentValue}`)
                    console.log(`      原始值: ${JSON.stringify(originalValue)}`)
                    console.log(`      当前值: ${JSON.stringify(contentValue)}`)
                }
            })
        }
        console.log('')
        
        // 3. teamBody字段 - 直接使用JSON对象
        console.log('  当前teamBody结构:', rawDataRef.value.teamBody)
        console.log('  teamBody键名:', Object.keys(rawDataRef.value.teamBody))
        
        // 准备最终的teamBody - 保持JSON对象格式
        const finalTeamBody = JSON.parse(JSON.stringify(rawDataRef.value.teamBody))
        console.log('  最终teamBody (JSON对象):', finalTeamBody)
        
        // team_json_body现在保持为JSON对象，无需字符串转义
        console.log('  team_json_body类型:', typeof finalTeamBody.team_json_body)
        console.log('  team_json_body内容:', finalTeamBody.team_json_body)
        console.log('')
        
        // 4. 构建最终提交数据 - 包含精确变化追踪
        console.log('4️⃣ 最终提交数据格式（包含变化追踪）:')
        const submissionData = {
            table: "SubmissionRecord",
            action: "insert", 
            value: {
                master: masterId.toString(),               // 转为字符串格式
                teamBody: finalTeamBody,                   // 完整的当前teamBody JSON对象
                content: changeAnalysis.content,           // 变化的部分（当前值）
                originalContent: changeAnalysis.originalContent  // 变化的部分（原始值）
            }
        }
        
        console.log('  完整提交结构:')
        console.log('    table:', submissionData.table)
        console.log('    action:', submissionData.action)
        console.log('    value.master:', submissionData.value.master, `(类型: ${typeof submissionData.value.master})`)
        console.log('    value.teamBody类型:', typeof submissionData.value.teamBody)
        console.log('    value.content:', submissionData.value.content)
        console.log('    value.originalContent:', submissionData.value.originalContent)
        console.log('')
        
        console.log('5️⃣ 完整JSON结构:')
        const finalJsonString = JSON.stringify(submissionData)
        console.log('  发送的完整JSON:', finalJsonString)
        console.log('  JSON总长度:', finalJsonString.length)
        
        console.log('='.repeat(80))
        console.log('[WebSocket] 📤 即将发送数据到后端...')
        
        // 💡 重要：在发送前保存当前数据的副本，防止任何意外修改
        const currentDataBackup = JSON.parse(JSON.stringify(rawDataRef.value))
        console.log('[WebSocket] 数据备份已创建')
        
        // 发送到后端
        sendWebSocketMessage(submissionData)
        
        console.log('[WebSocket] ✅ 数据已提交到后端')
        
        // 💡 发送后立即检查并恢复数据（防御性编程）
        if (JSON.stringify(rawDataRef.value) !== JSON.stringify(currentDataBackup)) {
            console.warn('[WebSocket] ⚠️ 检测到数据被意外修改，正在恢复...')
            rawDataRef.value = currentDataBackup
            console.log('[WebSocket] 数据已恢复到部署前状态')
        }
        
        // 静默保存，不显示弹窗（自动保存）
        console.log('[AutoSave] ✅ 自动保存成功')
        
        



        console.log('[WebSocket] 📸 更新原始数据快照...')





        originalDataSnapshot.value = JSON.parse(JSON.stringify(rawDataRef.value))
        console.log('[WebSocket] 原始数据快照已更新')
        
    } catch (error: any) {
        console.error('[WebSocket] ❌ 部署失败:', error)
        console.error('[WebSocket] 错误详情:', error.message)
        alert('部署失败：' + error.message)
    }
}

console.log('[调试] 页面初始 rawDataRef:', rawDataRef.value)







</script>

<style>
.form-root {
    padding: 0 0 8px 0;
}

.form-block {
    margin-bottom: 20px; /* 增加底部间距 */
}

.form-block-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px; /* 增加底部间距 */
}

.form-label-row {
    font-size: 14px;
    color: #409eff;
    font-weight: 500;
    text-align: left;
    margin-bottom: 4px;
    min-width: 0;
}

.form-label-inline {
    font-size: 14px;
    color: #409eff;
    font-weight: 500;
    text-align: left;
    margin-bottom: 0;
    min-width: 0;
}

.form-checkbox-inline {
    width: 18px;
    height: 18px;
    accent-color: #409eff;
    margin-left: 0;
}

.form-array-index {
    color: #b3b3b3;
    font-size: 12px;
    margin-bottom: 2px;
}

.form-input-row {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    border: 1.5px solid #b3c6e0;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    background: #f9f9fb;
    transition: border 0.2s;
    outline: none;
    margin-bottom: 2px;
}

.form-input-row:focus {
    border: 1.5px solid #409eff;
}

/* 长文本框专用样式 */
.form-input-longtext {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    line-height: 1.6;
    padding: 12px 14px;
    background: #fbfbfb;
    border: 1.5px solid #d1d9e6;
    border-radius: 8px;
    resize: vertical;
    overflow-y: auto;
    word-wrap: break-word;
    white-space: pre-wrap;
}

.form-input-longtext:focus {
    border-color: #409eff;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.form-card {
    border: 1.5px solid #e0e6f0;
    border-radius: 10px;
    background: #fafdff;
    margin: 14px 0 14px 0;
    padding: 16px 18px 10px 18px;
    box-shadow: 0 2px 8px #b3c6e022;
}

.save-btn {
    width: 100%;
    max-width: 320px;
    margin: 24px auto 0 auto;
    display: block;
    background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border: none;
    border-radius: 32px;
    box-shadow: 0 4px 18px #409eff33, 0 1.5px 0 #fff inset;
    padding: 16px 0;
    cursor: pointer;
    letter-spacing: 1px;
    transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
}

.save-btn:hover {
    background: linear-gradient(90deg, #357ae8 0%, #409eff 100%);
    box-shadow: 0 6px 24px #409eff55, 0 1.5px 0 #fff inset;
    transform: translateY(-2px) scale(1.03);
}

.save-btn:active {
    background: linear-gradient(90deg, #2d6fd3 0%, #357ae8 100%);
    box-shadow: 0 2px 8px #409eff33;
    transform: scale(0.98);
}

/* 预览按钮靠右 */
.toolbar-with-preview {
    display: flex;
    align-items: center;
    padding: 10px 20px 8px 20px;
    background: #f4f6fa;
    border-bottom: 1.5px solid #e0e0e0;
    gap: 12px;
}

.toolbar-with-preview button {
    background: #fff;
    border: 1.5px solid #409eff;
    color: #409eff;
    border-radius: 6px;
    padding: 4px 18px;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.toolbar-with-preview button.active,
.toolbar-with-preview button:hover {
    background: #409eff;
    color: #fff;
}

/* 预览视图样式 */
.preview-canvas {
    position: fixed;
    top: 70px;
    right: 0;
    width: 100vw;
    height: calc(100vh - 70px);
    left: 0;
    z-index: 101;
    background: #f8f8fa;
    box-shadow: -2px 0 16px #b3c6e044;
    border-left: 1.5px solid #e0e0e0;
}
</style>


<style scoped>
.agent-flow-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.toolbar {
    display: flex;
    align-items: center;
    padding: 10px 20px 8px 20px;
    background: #f4f6fa;
    border-bottom: 1.5px solid #e0e0e0;
    gap: 12px;
}

.toolbar button {
    background: #fff;
    border: 1.5px solid #409eff;
    color: #409eff;
    border-radius: 6px;
    padding: 4px 18px;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.toolbar button.active,
.toolbar button:hover {
    background: #409eff;
    color: #fff;
}

.main-content {
    flex: 1;
    min-height: 0;
    min-width: 0;
    display: flex;
    position: relative;
}

.sidebar-float {
    position: fixed;
    top: 70px;
    left: 24px;
    width: 240px;
    background: #f7faff;
    border-radius: 12px;
    box-shadow: 0 4px 24px #b3c6e044;
    padding: 16px 10px 10px 10px;
    z-index: 100;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE 10+ */
}

.sidebar-float::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none;
}

.sidebar-float-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 6px;
    min-height: 24px;
}

.sidebar-min-btn {
    background: #e6eaf2;
    border: none;
    color: #409eff;
    border-radius: 5px;
    font-size: 18px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    transition: background 0.18s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.sidebar-min-btn:hover {
    background: #d0e6ff;
}

.sidebar-min-btn-float {
    position: fixed;
    top: 80px;
    left: 10px;
    z-index: 200;
    width: 36px;
    height: 36px;
    font-size: 22px;
    background: #f7faff;
    border: 1.5px solid #b3c6e0;
    box-shadow: 0 2px 8px #b3c6e022;
}

.sidebar-section {
    margin-bottom: 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px #b3c6e022;
    padding: 8px 6px 6px 6px;
}

.sidebar-title {
    font-size: 15px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
}

.arrow {
    font-size: 13px;
    transition: transform 0.2s;
}

.arrow.collapsed {
    transform: rotate(90deg);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.flow-canvas {
    flex: 1;
    height: 100%;
    min-width: 0;
    min-height: 0;
}

.json-view {
    flex: 1;
    height: 100%;
    background: #f8fbff;
    color: #222;
    font-size: 13px;
    overflow: auto;
    padding: 24px 32px;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.json-panel {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
}

.json-textarea {
    width: 100%;
    min-height: 400px;
    height: 70vh;
    background: #bdbcbc;
    color: #222;
    border: 1.5px solid #b3c6e0;
    border-radius: 10px;
    font-family: 'Fira Mono', 'Consolas', monospace;
    font-size: 14px;
    padding: 18px 20px;
    box-shadow: 0 2px 12px #b3c6e055;
    resize: vertical;
    outline: none;
    transition: border 0.2s;
}

.json-textarea:focus {
    border: 1.5px solid #409eff;
}

.export-btn {
    background: #fff;
    border: 1.5px solid #67c23a;
    color: #67c23a;
    border-radius: 6px;
    padding: 4px 18px;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.export-btn:hover {
    background: #67c23a;
    color: #fff;
}

.sidebar-item {
    background: #fafdff;
    border: 1px solid #e0e6f0;
    border-radius: 7px;
    margin-bottom: 7px;
    padding: 10px 12px 7px 12px;
    cursor: grab;
    font-size: 15px;
    transition: box-shadow 0.18s, border 0.18s;
    box-shadow: 0 1px 6px #b3c6e022;
    display: flex;
    flex-direction: column;
    gap: 3px;
    position: relative;
}

.sidebar-item:active {
    cursor: grabbing;
    box-shadow: 0 2px 10px #b3c6e044;
}

.item-main {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #2a3a4a;
    flex-direction: column;
}

.item-label {
    font-size: 15px;
    color: #409eff;
    font-weight: bold;
}

.item-tag {
    background: #e6f7ff;
    color: #409eff;
    font-size: 12px;
    border-radius: 4px;
    padding: 1px 7px;
    margin-left: 2px;
}

.item-desc {
    color: #888;
    font-size: 12px;
    margin-top: 2px;
    line-height: 1.5;
    word-break: break-all;
}

.sidebar-search {
    width: 100%;
    margin: 4px 0 8px 0;
    padding: 5px 10px;
    border: 1px solid #b3c6e0;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    background: #fafdff;
    color: #222;
    box-sizing: border-box;
    transition: border 0.18s;
}

.sidebar-search:focus {
    border: 1.5px solid #409eff;
}

.edit-drawer-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.18);
    z-index: 300;
}

.edit-drawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 45vw; /* 增加抽屉宽度 */
    min-width: 500px; /* 设置最小宽度 */
    background: #fff;
    box-shadow: -2px 0 16px #b3c6e044;
    z-index: 301;
    display: flex;
    flex-direction: column;
    animation: drawerIn 0.22s cubic-bezier(.4, 0, .2, 1);
    overflow-y: auto;
}

@keyframes drawerIn {
    from {
        right: -400px;
        opacity: 0;
    }

    to {
        right: 0;
        opacity: 1;
    }
}

.edit-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 17px;
    font-weight: bold;
    color: #409eff;
    padding: 18px 18px 10px 18px;
    border-bottom: 1.5px solid #e0e0e0;
}

.drawer-close {
    cursor: pointer;
    font-size: 18px;
    color: #e74c3c;
    opacity: 0.7;
    transition: opacity 0.18s;
}

.drawer-close:hover {
    opacity: 1;
}

.edit-drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 0; /* 移除默认padding，由form控制 */
}

.agent-edit-form {
    display: flex;
    flex-direction: column;
    padding: 20px 24px; /* 增加左右内边距 */
    gap: 16px; /* 增加间距 */
    min-height: 100%;
    box-sizing: border-box;
}

/* 自动保存状态指示器样式 */
.auto-save-status {
    color: #666;
    font-size: 12px;
    padding: 4px 8px;
    background: #f0f0f0;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
}
</style>
