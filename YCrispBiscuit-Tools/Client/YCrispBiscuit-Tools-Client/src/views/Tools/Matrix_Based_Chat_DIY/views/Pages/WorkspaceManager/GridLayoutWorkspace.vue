<template>
  <div class="grid-layout-workspace">
    <div class="workspace-container">
      <grid-layout
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="false"
        :is-resizable="true"
        :is-mirrored="false"
        :vertical-compact="true"
        :margin="[10, 10]"
        :use-css-transforms="true"
        @layout-updated="onLayoutUpdated"
        class="grid-layout"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :static="item.static || false"
          @moved="onItemMoved"
          @resized="onItemResized"
          class="grid-item"
        >
          <TabContainer
            :tabs="item.tabs || []"
            :active-tab="item.activeTab || ''"
            @tab-change="(tabId) => handleTabChange(item.i, tabId)"
            @tab-close="(tabId) => handleTabClose(item.i, tabId)"
            @tab-detach="(tabId) => handleTabDetach(item.i, tabId)"
            @close-other-tabs="(tabId) => handleCloseOtherTabs(item.i, tabId)"
          />
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineExpose, nextTick } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout'
import TabContainer from './TabContainer.vue'
import type { GridLayoutItem, TabItem } from './types'

interface Props {
  initialLayout?: GridLayoutItem[] | null
}

interface Emits {
  (e: 'layout-changed', layout: GridLayoutItem[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 布局状态
const layout = ref<GridLayoutItem[]>([])
const isInitialized = ref(false)

// 初始化默认布局
const initDefaultLayout = () => {
  const defaultLayout = [
    {
      i: 'default-chat',
      x: 0,
      y: 0,
      w: 8,
      h: 12,
      tabs: [
        {
          id: 'chat-1',
          title: '聊天',
          component: 'Chat',
          props: {},
          closeable: false
        }
      ],
      activeTab: 'chat-1'
    },
    {
      i: 'default-tools',
      x: 8,
      y: 0,
      w: 4,
      h: 6,
      tabs: [
        {
          id: 'calendar-1',
          title: '日历',
          component: 'Calendar',
          props: {}
        }
      ],
      activeTab: 'calendar-1'
    }
  ]
  
  // 直接设置布局，不使用nextTick（在onMounted中已经有nextTick了）
  layout.value = defaultLayout
}

// 添加新的面板
const addPanel = (functionId: string, component: string, title: string, props: any = {}) => {
  const newId = `panel-${Date.now()}`
  const newTab: TabItem = {
    id: `${functionId}-${Date.now()}`,
    title,
    component,
    props
  }

  // 找到一个合适的位置
  const newItem: GridLayoutItem = {
    i: newId,
    x: 0,
    y: Math.max(...layout.value.map(item => item.y + item.h), 0),
    w: 6,
    h: 8,
    tabs: [newTab],
    activeTab: newTab.id
  }

  layout.value.push(newItem)
}

// 处理选项卡切换
const handleTabChange = (itemId: string, tabId: string) => {
  const item = layout.value.find(i => i.i === itemId)
  if (item) {
    item.activeTab = tabId
  }
}

// 处理选项卡关闭
const handleTabClose = (itemId: string, tabId: string) => {
  const item = layout.value.find(i => i.i === itemId)
  if (!item || !item.tabs) return

  // 移除选项卡
  item.tabs = item.tabs.filter(tab => tab.id !== tabId)

  // 如果没有选项卡了，移除整个面板
  if (item.tabs.length === 0) {
    layout.value = layout.value.filter(i => i.i !== itemId)
  } else if (item.activeTab === tabId) {
    // 如果关闭的是当前激活的选项卡，切换到第一个
    item.activeTab = item.tabs[0].id
  }
}

// 处理选项卡分离
const handleTabDetach = (itemId: string, tabId: string) => {
  // TODO: 实现浮动窗口功能
  console.log('分离选项卡:', itemId, tabId)
}

// 处理关闭其他选项卡
const handleCloseOtherTabs = (itemId: string, keepTabId: string) => {
  const item = layout.value.find(i => i.i === itemId)
  if (!item || !item.tabs) return

  const keepTab = item.tabs.find(tab => tab.id === keepTabId)
  if (keepTab) {
    item.tabs = [keepTab]
    item.activeTab = keepTab.id
  }
}

// 布局更新事件
const onLayoutUpdated = (newLayout: any[]) => {
  // 如果组件还未完全初始化，跳过更新
  if (!isInitialized.value) {
    return
  }
  
  // 防止在组件初始化阶段的递归更新
  if (layout.value.length === 0) {
    return
  }
  
  // 创建新的布局状态而不是修改现有的响应式对象
  const updatedLayout = layout.value.map(item => {
    const updatedItem = newLayout.find(l => l.i === item.i)
    if (updatedItem) {
      return {
        ...item,
        x: updatedItem.x,
        y: updatedItem.y,
        w: updatedItem.w,
        h: updatedItem.h
      }
    }
    return item
  })
  
  // 只有当布局真正发生变化时才更新和发出事件
  const hasChanged = updatedLayout.some((item, index) => {
    const original = layout.value[index]
    return original && (
      original.x !== item.x || 
      original.y !== item.y || 
      original.w !== item.w || 
      original.h !== item.h
    )
  })
  
  if (hasChanged) {
    // 使用nextTick避免同步更新
    nextTick(() => {
      layout.value = updatedLayout
      emit('layout-changed', updatedLayout)
    })
  }
}

// 面板移动事件
const onItemMoved = (i: string, newX: number, newY: number) => {
  console.log('面板移动:', i, newX, newY)
}

// 面板大小调整事件
const onItemResized = (i: string, newH: number, newW: number) => {
  console.log('面板大小调整:', i, newW, newH)
}

// 获取当前布局配置
const getLayoutConfig = () => {
  return layout.value
}

// 加载布局配置
const loadLayout = (config: GridLayoutItem[]) => {
  if (config && Array.isArray(config)) {
    // 直接设置布局，不使用nextTick（在onMounted中已经有nextTick了）
    layout.value = config
  } else {
    initDefaultLayout()
  }
}

// 初始化
onMounted(async () => {
  // 等待下一个tick，确保DOM完全渲染
  await nextTick()
  
  // 先设置布局，但不允许事件处理
  if (props.initialLayout) {
    loadLayout(props.initialLayout)
  } else {
    initDefaultLayout()
  }
  
  // 再等待一个tick，确保布局设置完成
  await nextTick()
  
  // 最后标记为已初始化，允许布局更新事件
  isInitialized.value = true
})

// 暴露方法给父组件
defineExpose({
  addPanel,
  getLayoutConfig,
  loadLayout
})
</script>

<style scoped>
.grid-layout-workspace {
  width: 100%;
  height: 100%;
  background: var(--bg-color);
}

.workspace-container {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.grid-layout {
  width: 100%;
  min-height: 100%;
}

.grid-item {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.2s ease;
}

.grid-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* Vue Grid Layout 样式覆盖 */
:deep(.vue-grid-item) {
  transition: all 0.2s ease;
}

:deep(.vue-grid-item.vue-grid-placeholder) {
  background: var(--bg-color-hover, rgba(0,122,204,0.3));
  border: 2px dashed var(--color-primary);
  border-radius: 8px;
}

:deep(.vue-resizable-handle) {
  background: var(--color-primary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

:deep(.vue-grid-item:hover .vue-resizable-handle) {
  opacity: 0.7;
}

:deep(.vue-resizable-handle:hover) {
  opacity: 1;
}
</style>
