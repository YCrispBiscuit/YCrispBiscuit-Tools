<template>
  <div class="function-drawer" :class="{ open }">
    <div v-if="open" class="drawer-overlay" @click="$emit('update:open', false)"></div>
    <div class="drawer-content">
      <div class="drawer-header">
        <h3>功能面板</h3>
        <button class="close-btn" @click="$emit('update:open', false)">×</button>
      </div>
      
      <div class="drawer-body">
        <div class="function-category">
          <h4>沟通工具</h4>
          <div class="function-list">
            <div
              v-for="func in communicationFunctions"
              :key="func.id"
              class="function-item"
              @click="$emit('function-click', func)"
            >
              <span class="function-icon">{{ func.icon }}</span>
              <div class="function-info">
                <span class="function-name">{{ func.name }}</span>
                <span class="function-desc">{{ func.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="function-category">
          <h4>生产力工具</h4>
          <div class="function-list">
            <div
              v-for="func in productivityFunctions"
              :key="func.id"
              class="function-item"
              @click="$emit('function-click', func)"
            >
              <span class="function-icon">{{ func.icon }}</span>
              <div class="function-info">
                <span class="function-name">{{ func.name }}</span>
                <span class="function-desc">{{ func.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="function-category">
          <h4>系统工具</h4>
          <div class="function-list">
            <div
              v-for="func in systemFunctions"
              :key="func.id"
              class="function-item"
              @click="$emit('function-click', func)"
            >
              <span class="function-icon">{{ func.icon }}</span>
              <div class="function-info">
                <span class="function-name">{{ func.name }}</span>
                <span class="function-desc">{{ func.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PanelFunction } from './types'

interface Props {
  open: boolean
  availableFunctions: PanelFunction[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'function-click': [func: PanelFunction]
}>()

// 按类别分组功能
const communicationFunctions = computed(() => 
  props.availableFunctions.filter(f => f.category === 'communication')
)

const productivityFunctions = computed(() => 
  props.availableFunctions.filter(f => f.category === 'productivity')
)

const systemFunctions = computed(() => 
  props.availableFunctions.filter(f => f.category === 'system')
)
</script>

<style scoped>
.function-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.function-drawer.open {
  transform: translateX(0);
}

.drawer-overlay {
  position: absolute;
  top: 0;
  left: -100vw;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}

.drawer-content {
  width: 320px;
  height: 100%;
  background-color: #2f3136;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
}

.drawer-header {
  height: 60px;
  background-color: #36393f;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #4f545c;
}

.drawer-header h3 {
  color: #dcddde;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #b9bbbe;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  transition: background-color 0.15s;
}

.close-btn:hover {
  background-color: #ed4245;
  color: white;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.function-category {
  margin-bottom: 24px;
}

.function-category h4 {
  color: #dcddde;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #40444b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  border: 2px solid transparent;
}

.function-item:hover {
  background-color: #5865f2;
  transform: translateX(4px);
  border-color: #4752c4;
}

.function-item:active {
  opacity: 0.8;
  transform: translateX(2px) scale(0.98);
}

.function-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.function-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.function-name {
  color: #dcddde;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.function-desc {
  color: #b9bbbe;
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 点击状态 */
.function-item:hover {
  cursor: grab;
}

.function-item:active {
  cursor: grabbing;
}

/* 滚动条样式 */
.drawer-body::-webkit-scrollbar {
  width: 6px;
}

.drawer-body::-webkit-scrollbar-track {
  background: #2f3136;
}

.drawer-body::-webkit-scrollbar-thumb {
  background: #4f545c;
  border-radius: 3px;
}

.drawer-body::-webkit-scrollbar-thumb:hover {
  background: #5865f2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .drawer-content {
    width: 280px;
  }
  
  .function-item {
    padding: 10px;
  }
  
  .function-icon {
    font-size: 16px;
  }
  
  .function-name {
    font-size: 13px;
  }
  
  .function-desc {
    font-size: 11px;
  }
}
</style>
