<template>
  <div class="tab-container">
    <!-- 选项卡头部 -->
    <div class="tab-header" v-if="tabs.length > 1">
      <div 
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: tab.id === activeTab }]"
        @click="$emit('tab-change', tab.id)"
        @contextmenu.prevent="showTabMenu(tab, $event)"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <span 
          v-if="tab.closeable !== false"
          class="tab-close"
          @click.stop="$emit('tab-close', tab.id)"
        >
          ×
        </span>
      </div>
      <div class="tab-actions">
        <button 
          class="tab-action-btn"
          @click="$emit('tab-detach', activeTab)"
          title="分离到浮动窗口"
        >
          📤
        </button>
      </div>
    </div>

    <!-- 选项卡内容 -->
    <div class="tab-content">
      <component 
        :is="activeTabComponent"
        v-bind="activeTabProps"
        v-if="activeTabData"
      />
      <div v-else class="empty-content">
        <p>选择一个选项卡查看内容</p>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div 
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="closeTab(contextMenu.tab)">关闭</div>
      <div class="menu-item" @click="closeOtherTabs(contextMenu.tab)">关闭其他</div>
      <div class="menu-item" @click="detachTab(contextMenu.tab)">分离窗口</div>
    </div>

    <!-- 全局点击监听器 -->
    <div 
      v-if="contextMenu.visible"
      class="context-menu-overlay"
      @click="hideContextMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import type { TabItem } from './types'

// 预定义异步组件映射，避免在computed中重复创建
const componentMap = {
  Chat: defineAsyncComponent(() => import('../RightContent/Chat/index.vue')),
  
  
  FileManager: defineAsyncComponent(() => import('../RightContent/FileManager/index.vue')),
  Calendar: defineAsyncComponent(() => import('../RightContent/Calendar/index.vue')),
  Notes: defineAsyncComponent(() => import('../RightContent/Notes/index.vue')),
  
  
  NotificationPanel: defineAsyncComponent(() => import('../RightContent/NotificationPanel/index.vue'))
}

interface Props {
  tabs: TabItem[]
  activeTab: string
}

interface Emits {
  (e: 'tab-change', tabId: string): void
  (e: 'tab-close', tabId: string): void
  (e: 'tab-detach', tabId: string): void
  (e: 'close-other-tabs', tabId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tab: null as TabItem | null
})

// 当前激活的选项卡数据
const activeTabData = computed(() => {
  return props.tabs.find(tab => tab.id === props.activeTab)
})

// 动态加载组件
const activeTabComponent = computed(() => {
  if (!activeTabData.value) return null
  
  const componentName = activeTabData.value.component as keyof typeof componentMap
  
  // 从预定义的组件映射中获取组件
  return componentMap[componentName] || null
})

// 当前激活选项卡的 props
const activeTabProps = computed(() => {
  return activeTabData.value?.props || {}
})

// 显示右键菜单
const showTabMenu = (tab: TabItem, event: MouseEvent) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    tab
  }
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.tab = null
}

// 关闭选项卡
const closeTab = (tab: TabItem | null) => {
  if (tab && tab.closeable !== false) {
    emit('tab-close', tab.id)
  }
  hideContextMenu()
}

// 关闭其他选项卡
const closeOtherTabs = (tab: TabItem | null) => {
  if (tab) {
    emit('close-other-tabs', tab.id)
  }
  hideContextMenu()
}

// 分离选项卡
const detachTab = (tab: TabItem | null) => {
  if (tab) {
    emit('tab-detach', tab.id)
  }
  hideContextMenu()
}
</script>

<style scoped>
.tab-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color, #1e1e1e);
  border-radius: 6px;
  overflow: hidden;
}

.tab-header {
  display: flex;
  align-items: center;
  background: var(--tab-header-bg, #2d2d2d);
  border-bottom: 1px solid var(--border-color, #404040);
  padding: 0;
  min-height: 32px;
  overflow-x: auto;
  overflow-y: hidden;
}

.tab {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--tab-bg, #3c3c3c);
  border-right: 1px solid var(--border-color, #404040);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  max-width: 200px;
  min-width: 80px;
}

.tab:hover {
  background: var(--tab-hover-bg, #4a4a4a);
}

.tab.active {
  background: var(--tab-active-bg, #007acc);
  color: white;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}

.tab-close {
  margin-left: 6px;
  padding: 2px 4px;
  border-radius: 2px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.tab-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.tab-actions {
  margin-left: auto;
  padding: 0 8px;
}

.tab-action-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  font-size: 12px;
}

.tab-action-btn:hover {
  opacity: 1;
}

.tab-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.empty-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary, #888);
  font-size: 14px;
}

.context-menu {
  position: fixed;
  background: var(--menu-bg, #2d2d2d);
  border: 1px solid var(--border-color, #404040);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  min-width: 120px;
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: var(--menu-item-hover, #4a4a4a);
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
}

.unknown-component {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary, #888);
  font-style: italic;
}
</style>
