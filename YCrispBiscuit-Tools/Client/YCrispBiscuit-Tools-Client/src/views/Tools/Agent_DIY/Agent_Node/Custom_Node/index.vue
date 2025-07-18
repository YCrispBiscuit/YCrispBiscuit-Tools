<template>
    <div class="custom-node" :class="nodeClass">
        <div v-if="data."></div>
        <div class="node-header">


        </div>


        <Handle type="target" :position="Position.Left" :style="handleStyle" />
        <Handle type="source" :position="Position.Right" :style="handleStyle" />
    </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'


const props = defineProps<{
    data: any;

    //只读控制，用于是否对节点进行编辑操作的展示（通常用于预览模式）
    readonly?: boolean;
}>()

const emit = defineEmits([
    //拖拽
    'dropOnArea',
    //移除Agent
    'removeAgent',
    //移除Tool
    'removeTool',
    //删除Agent节点
    'deleteAgentNode',
    //编辑Agent节点
    'editAgentNode',
    //边界团队节点
    'editTeamNode'
])

const handleStyle = { width: '12px', height: '12px', background: '#409eff', border: '2px solid #fff' }

//以下是上面六个事件的处理函数，暂时还没写

</script>

<style scoped></style>