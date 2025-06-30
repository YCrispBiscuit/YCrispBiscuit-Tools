<template>
  <YCB_Header></YCB_Header>
  <div class="main-content">
    <div class="tools-page">
      <h1 class="tools-page-h1">工具箱</h1>
      <p>这里是你的工具箱页面，可以在这里添加和管理各种工具。</p>
    </div>
  </div>
  <!-- 工具列表区域，初始在页面下方，需要下滑才能看到 -->
  <div class="tools-list-wrapper" ref="toolsListRef">
    <n-grid :cols="gridCols" :x-gap="24" :y-gap="24" responsive="screen">
      <n-grid-item v-for="(tool, idx) in tools" :key="tool.name">
        <n-card
          :hoverable="true"
          class="tool-card"
          :class="{ 'slide-in': itemVisible[idx] }"
          :style="{ '--n-title-text-color': 'var(--text-color)' }"
        >
          <template #header>
            <div class="tool-header">
              <img v-if="tool.logo" :src="tool.logo" class="tool-logo-inline" alt="logo" />
              <span class="tool-name">{{ tool.name }}</span>
            </div>
          </template>
          <div class="tool-desc">{{ tool.desc }}</div>
          <n-button type="primary" @click="tool.action" size="small">进入</n-button>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import YCB_Header from '@/components/Header';
import { ref, computed, onMounted, nextTick } from 'vue';
import { NGrid, NGridItem, NCard, NButton } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
// 工具列表数据
const tools = [
  {
    name: 'ACGN个人喜好表生成器',
    desc: '这是一个为动漫游戏爱好者打造的个人喜好表生成器，可自定义数据库，支持图表下载。',
    logo: new URL('@/assets/bilibili_blue.png', import.meta.url).href,
    action: () => {
      router.push('/Tools/ACGN_Personal_Preference_Table_Generator');
    }
  },
  {
    name: '示例工具',
    desc: '支持自适应布局和主题切换。',
   // logo: new URL('@/assets/vue.svg', import.meta.url).href,
    action: () => {
      window.$message?.info('点击了示例工具B');
    }
  },
  {
    name: '示例工具',
    desc: '这是一个示例工具的描述，可以自定义扩展。',
    //logo: new URL('@/assets/bilibili_black_00000.svg', import.meta.url).href,
    action: () => {
      window.$message?.info('点击了示例工具A');
    }
  },
  {
    name: '示例工具',
    desc: '支持自适应布局和主题切换。',
    action: () => {
      window.$message?.info('点击了示例工具B');
    }
  },
  {
    name: '示例工具',
    desc: '这是一个示例工具的描述，可以自定义扩展。',
    action: () => {
      window.$message?.info('点击了示例工具A');
    }
  },
  {
    name: '示例工具',
    desc: '支持自适应布局和主题切换。',
    action: () => {
      window.$message?.info('点击了示例工具B');
    }
  },
  {
    name: '示例工具',
    desc: '这是一个示例工具的描述，可以自定义扩展。',
    action: () => {
      window.$message?.info('点击了示例工具A');
    }
  },
  {
    name: '示例工具',
    desc: '支持自适应布局和主题切换。',
    action: () => {
      window.$message?.info('点击了示例工具B');
    }
  },
  {
    name: '示例工具',
    desc: '这是一个示例工具的描述，可以自定义扩展。',
    action: () => {
      window.$message?.info('点击了示例工具A');
    }
  },
  {
    name: '示例工具',
    desc: '支持自适应布局和主题切换。',
    action: () => {
      window.$message?.info('点击了示例工具B');
    }
  },
  {
    name: '示例工具',
    desc: '这是一个示例工具的描述，可以自定义扩展。',
    action: () => {
      window.$message?.info('点击了示例工具A');
    }
  },
  {
    name: '示例工具',
    desc: '支持自适应布局和主题切换。',
    action: () => {
      window.$message?.info('点击了示例工具B');
    }
  },
  
];

// 响应式列数
const gridCols = computed(() => {
  if (window.innerWidth < 600) return 1;
  if (window.innerWidth < 900) return 2;
  return 3;
});

// 动画相关
const itemVisible = ref(Array(tools.length).fill(false));
const toolsListRef = ref<HTMLElement | null>(null);

onMounted(() => {
  nextTick(() => {
    if (!toolsListRef.value) return;
    const observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // 先全部隐藏，再依次显示
        itemVisible.value = Array(tools.length).fill(false);
        tools.forEach((_, idx) => {
          setTimeout(() => {
            itemVisible.value[idx] = true;
          }, idx * 120);
        });
      } else {
        // 离开视口时全部隐藏
        itemVisible.value = Array(tools.length).fill(false);
      }
    }, { threshold: 0.1 });
    observer.observe(toolsListRef.value);
  });
});
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 64px);
  /* 64px为导航栏高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.tools-page {
  text-align: center;
}

.tools-page-h1 {
  margin-bottom: 16px;
}

.tools-list-wrapper {
  margin-top: 64px;
  padding-bottom: 48px;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.tool-card {
  transition: box-shadow var(--transition-duration) var(--transition-timing);
  border-radius: var(--border-radius-md);
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  background-color: var(--bg-color-secondary);
  color: var(--text-color);
  opacity: 0;
  transform: translateX(60px);
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  min-height: 48px;
  padding-left: 4px;
}

.tool-logo-inline {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
  background: var(--bg-color-secondary);
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.06);
}

.tool-name {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  font-weight: 600;
}

.tool-desc {
  margin-bottom: var(--space-md);
  color: var(--text-color-secondary);
  min-height: 40px;
}

.slide-in {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1);
}

@media (max-width: 900px) {
  .tools-list-wrapper {
    max-width: 96vw;
    padding-left: 2vw;
    padding-right: 2vw;
  }
}
@media (max-width: 600px) {
  .tools-list-wrapper {
    margin-top: 32px;
    padding-bottom: 24px;
  }
}
</style>

<style>
.tool-card :deep(.n-card__header),
.tool-card :deep(.n-card__title) {
  color: var(--text-color) !important;
}
</style>

<style>
[data-theme="light"] .tool-card {
  --n-title-text-color: var(--text-color);
}
[data-theme="dark"] .tool-card {
  --n-title-text-color: var(--text-color);
}
</style>
