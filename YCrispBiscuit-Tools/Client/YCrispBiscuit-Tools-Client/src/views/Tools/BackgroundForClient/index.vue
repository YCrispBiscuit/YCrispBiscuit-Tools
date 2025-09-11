<template>
  <div class="main-container">
    <!-- 侧边抽屉 -->
    <n-drawer
      v-model:show="drawerVisible"
      :width="300"
      placement="left"
      :auto-focus="false"
    >
      <n-drawer-content title="几何背景风格选择">
        <n-list>
          <n-list-item
            v-for="(style, index) in styles"
            :key="style.name"
            clickable
            @click="selectStyle(index)"
            :class="{ 'selected': currentIndex === index }"
          >
            <template #prefix>
              <n-icon :component="style.icon" />
            </template>
            <n-thing :title="style.name" :description="style.description" />
          </n-list-item>
        </n-list>
      </n-drawer-content>
    </n-drawer>

    <!-- 主内容区域 -->
    <div class="content-area">
      <!-- 顶部控制栏 -->
      <div class="control-bar">
        <n-button @click="drawerVisible = true" type="primary">
          <template #icon>
            <n-icon :component="Menu" />
          </template>
          选择风格
        </n-button>
        <div class="current-style">
          当前风格: {{ styles[currentIndex].name }}
        </div>
      </div>

      <!-- 动态背景组件 -->
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NDrawer, NDrawerContent, NList, NListItem, NButton, NIcon, NThing } from 'naive-ui'
import { MenuOutline as Menu } from '@vicons/ionicons5'

// 导入所有背景组件
import ParticleNetwork from './styles/ParticleNetwork.vue'
import PaperPolyhedra from './styles/PaperPolyhedra.vue'
import LineNetwork from './styles/LineNetwork.vue'
import CellNetwork from './styles/3DCellNetwork.vue'


// 风格配置
const styles = [
  {
    name: '粒子网络',
    description: '动态粒子通过线段连接，形成网络结构',
    component: ParticleNetwork,
    icon: Menu
  },
  {
    name: '纸片多面体',
    description: '三维空间中的纸片多面体，旋转翻转移动',
    component: PaperPolyhedra,
    icon: Menu
  },

  {
    name: '移动直线网络',
    description: '超长直线随机移动，产生动态交点',
    component: LineNetwork,
    icon: Menu
  },
  {
    name: '3D细胞网络',
    description: '超大型3D细胞组织结构，自转的云状网络',
    component: CellNetwork,
    icon: Menu
  }
]

// 状态管理
const drawerVisible = ref(false)
const currentIndex = ref(0)

// 当前组件
const currentComponent = computed(() => styles[currentIndex.value].component)

// 选择风格
function selectStyle(index: number) {
  currentIndex.value = index
  drawerVisible.value = false
}
</script>

<style scoped>
.main-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.content-area {
  position: relative;
  width: 100%;
  height: 100%;
}

.control-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.current-style {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.selected {
  background-color: rgba(24, 160, 88, 0.1);
  border-left: 3px solid #18a058;
}
</style>