<template>
  <div class="docu-layout">
    <!-- 左侧：分类标题+文档列表 -->
    <aside class="docu-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">{{ categoryTitle }}</h2>
      </div>
      <div class="sidebar-list">
        <n-menu
          :options="docMenuOptions"
          :value="activeDocKey"
          @update:value="handleDocChange"
          class="doc-menu"
        />
      </div>
    </aside>

    <!-- 右侧：顶部导航栏+主内容区 -->
    <main class="docu-main">
      <!-- 顶部导航栏（预留位置） -->
      <div class="docu-navbar">
        <!-- 这里留空，供你自定义导航栏内容（如返回主页、黑白切换按钮等） -->
      </div>
      <div class="docu-content-wrapper">
        <!-- 主内容区左：文档内容 -->
        <section class="docu-content">
          <div v-if="docContent" class="docu-md" v-html="docContent"></div>
        </section>
        <!-- 主内容区右：目录+自定义链接区 -->
        <aside class="docu-toc">
          <div class="toc-title">目录</div>
          <ul class="toc-list">
            <li v-for="item in tocList" :key="item.id">
              <a :href="`#${item.id}`">{{ item.text }}</a>
            </li>
          </ul>
          <div class="toc-links">
            <div class="toc-links-title">相关链接</div>
            <ul>
              <li v-for="link in customLinks" :key="link.url">
                <a :href="link.url" target="_blank">{{ link.text }}</a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NMenu } from 'naive-ui';
//import { getCategoryDocs, getDocContent, getDocToc, getCustomLinks } from './Data/Data';

// 当前分类标题（可由路由或父页面传入）
const categoryTitle = ref('ACGN 工具文档');

// 文档列表与选中项
const docMenuOptions = ref([]);
const activeDocKey = ref('');

// 文档内容、目录、链接
const docContent = ref('');
const tocList = ref([]);
const customLinks = ref([]);

// 加载文档列表
onMounted(async () => {
  const docs = await getCategoryDocs(categoryTitle.value);
  docMenuOptions.value = docs.map(doc => ({
    label: doc.title,
    key: doc.key
  }));
  if (docs.length) {
    activeDocKey.value = docs[0].key;
    await loadDoc(activeDocKey.value);
  }
});

// 切换文档
async function handleDocChange(key: string) {
  activeDocKey.value = key;
  await loadDoc(key);
}

// 加载文档内容、目录、链接
async function loadDoc(key: string) {
  docContent.value = await getDocContent(key);
  tocList.value = await getDocToc(docContent.value);
  customLinks.value = await getCustomLinks(key);
}
</script>

<style scoped>
.docu-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
}
.docu-sidebar {
  width: 260px;
  background: var(--bg-color-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  min-height: 100vh;
}
.sidebar-header {
  padding: 32px 0 16px 0;
  text-align: center;
  background: inherit;
  position: sticky;
  top: 0;
  z-index: 2;
}
.sidebar-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text-color);
}
.sidebar-list {
  flex: 1;
  padding: 0 0 24px 0;
  overflow-y: auto;
}
.doc-menu {
  background: transparent;
}
.docu-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.docu-navbar {
  height: 56px;
  background: transparent;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.docu-content-wrapper {
  display: flex;
  flex: 1;
  min-width: 0;
}
.docu-content {
  flex: 1.5;
  padding: 32px 32px 32px 0;
  min-width: 0;
  overflow-x: auto;
}
.docu-md {
  background: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(64,158,255,0.06);
  color: var(--text-color);
  word-break: break-word;
}
.docu-toc {
  width: 260px;
  padding: 32px 16px 32px 0;
  border-left: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
  position: sticky;
  top: 56px;
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.toc-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--text-color);
}
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}
.toc-list li {
  margin-bottom: 8px;
}
.toc-list a {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.98rem;
}
.toc-links-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color-secondary);
}
.toc-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-links li {
  margin-bottom: 6px;
}
.toc-links a {
  color: var(--primary-color);
  text-decoration: underline;
  font-size: 0.95rem;
}
@media (max-width: 900px) {
  .docu-layout {
    flex-direction: column;
  }
  .docu-sidebar {
    width: 100vw;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    position: static;
  }
  .docu-main {
    flex-direction: column;
  }
  .docu-content-wrapper {
    flex-direction: column;
  }
  .docu-toc {
    width: 100vw;
    border-left: none;
    border-top: 1px solid var(--border-color);
    position: static;
    min-height: auto;
    padding: 24px 16px;
  }
}
</style>