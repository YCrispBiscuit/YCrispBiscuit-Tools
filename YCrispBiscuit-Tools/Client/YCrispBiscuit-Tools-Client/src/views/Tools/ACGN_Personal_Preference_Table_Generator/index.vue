<template>
  <n-message-provider> <!-- Naive UI 消息提示全局包裹 -->
    <div class="preference-table-root"> <!-- 页面根容器 -->
      <!-- 动态背景装饰图（左右两侧） -->
      <img v-if="bgLeft" class="bg-decor bg-decor-left" :src="bgLeft" alt="bg-left" />
      <img v-if="bgRight" class="bg-decor bg-decor-right" :src="bgRight" alt="bg-right" />
      <!-- 顶部右上角操作栏 -->
      <div class="fixed-header-bar"> <!-- 固定在右上角的操作栏 -->
        <n-button quaternary class="header-btn" @click="goBack">返回工具页</n-button> <!-- 返回按钮 -->
      </div>
      <!-- 主内容区垂直水平居中 -->
      <div class="main-content"> <!-- 主内容区，居中 -->
        <div class="main-card"> <!-- 卡片容器 -->
          <h2 class="main-title">ACGN个人喜好表生成器</h2> <!-- 标题 -->
          <div class="selector-bar"> <!-- 表类型选择和切换按钮 -->
            <n-select
              v-model:value="selectedTable" 
              :options="tableOptions"
              placeholder="请选择喜好表类型" 
              style="width: 220px"
            />
            <n-button quaternary style="margin-left: 16px;" @click="isTableView = !isTableView">
              {{ isTableView ? '切换为数据源' : '切换为表格' }} <!-- 切换按钮文本 -->
            </n-button>
          </div>
          
          <div v-if="isTableView" class="table-container"> <!-- 表格模式 -->
            <n-spin :show="loading"> <!-- 加载动画 -->
              <n-grid :cols="5" x-gap="18" y-gap="18" responsive="screen"> <!-- 5列网格布局 -->
                <n-grid-item v-for="(cell, idx) in gridData" :key="cell.type"> <!-- 遍历每个格子 -->
                  <n-card class="character-card" hoverable @click="openDialog(idx)"> <!-- 角色卡片 -->
                    <div class="cell-type">{{ cell.type }}</div> <!-- 格子类型 -->
                    <img v-if="cell.character" :src="cell.character.image" class="character-img" crossorigin="anonymous" /> <!-- 已选角色头像 -->
                    <div v-else class="character-placeholder">点击选择</div> <!-- 未选角色占位 -->
                  </n-card>
                </n-grid-item>
              </n-grid>
            </n-spin>
            <div class="save-bar"> <!-- 保存按钮区域 -->
              <n-button type="primary" @click="saveAsPng">保存PNG到本地</n-button>
            </div>
          </div>
          <div v-else class="datasource-list-container"> <!-- 数据源模式 -->
            <n-input v-model:value="searchText" placeholder="搜索名称或ID" clearable style="margin-bottom: 16px; width: 320px;" /> <!-- 搜索框 -->
            <n-scrollbar > <!-- 滚动区域 -->
              <n-list bordered> <!-- 列表 -->
                <n-list-item v-for="item in filteredDataSourceList" :key="item.id"> <!-- 遍历数据源 -->
                  <div class="ds-item"> <!-- 单项容器 -->
                    <img :src="item.image" class="ds-avatar" crossorigin="anonymous" /> <!-- 头像 -->
                    <div class="ds-info"> <!-- 信息区 -->
                      <div class="ds-name">{{ item.name }}</div> <!-- 名称 -->
                      <div class="ds-id">ID: {{ item.id }}</div> <!-- ID -->
                    </div>
                  </div>
                </n-list-item>
              </n-list>
            </n-scrollbar>
            <button class="invisible-trigger" @click="updateDataSource" aria-label="update-ds"></button> <!-- 隐形触发按钮 -->
          </div>
        </div>
      </div>
      <!-- 选择角色弹窗 -->
      <n-modal v-model:show="dialogVisible" preset="dialog" title="选择角色" :mask-closable="true">
        <div v-if="dialogIdx !== null"> <!-- 弹窗内容 -->
          <div class="cell-type">{{ gridData[dialogIdx].type }}</div>
          <n-select
            v-model:value="selectedCharacterId"
            :options="characterOptions"
            placeholder="请选择角色"
            filterable
            style="width: 240px; margin: 16px 0;"
          />
          <div v-if="selectedCharacter">
            <img :src="selectedCharacter.image" class="dialog-img" crossorigin="anonymous" />
          </div>
        </div>
        <template #action>
          <n-button @click="dialogVisible = false">取消</n-button>
          <n-button type="primary" @click="confirmSelect">确定</n-button>
        </template>
      </n-modal>
    </div>
  </n-message-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue' // Vue3 响应式API
import { useRouter } from 'vue-router' // 路由
import { NButton, NSelect, NGrid, NGridItem, NCard, NModal, NSpin, useMessage, NMessageProvider, NScrollbar, NList, NListItem, NInput } from 'naive-ui' // Naive UI 组件
import { fetchAndConvertGenshinCharacters, type PreferenceTableItem, getDefaultGenshinPreferenceGrid, type GenshinPreferenceCell } from './Data/data1' // 数据与类型
const bgGenshinLeft = '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/心海.png' // 左背景
const bgGenshinRight = '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/芙宁娜.png' // 右背景

const router = useRouter() // 路由实例
const message = useMessage() // 消息实例

// 返回工具页
function goBack() {
  router.push('/Tools')
}

// 表类型下拉（可扩展）
const tableOptions = [
  { label: '原神角色喜好表', value: 'genshin_impact' },
  // 其他表类型可在此扩展
]
const selectedTable = ref('genshin_impact') // 当前选中表类型

// 动态背景图路径（可根据表类型扩展）
interface BgMapType {
  [key: string]: {
    left: string
    right: string
  }
}
const bgMap: BgMapType = {
  genshin_impact: {
    left: bgGenshinLeft,
    right: bgGenshinRight,
  },
  // 其他表类型可继续扩展
}
const bgLeft = computed(() => bgMap[selectedTable.value]?.left || '') // 左背景
const bgRight = computed(() => bgMap[selectedTable.value]?.right || '') // 右背景

// 原神角色数据
const allCharacters = ref<PreferenceTableItem[]>([]) // 角色数据
const characterOptions = computed(() =>
  allCharacters.value.map(c => ({ label: c.name, value: c.id, image: c.image }))
) // 下拉选项

// 喜好表格数据（类型+角色）
const gridData = ref<GenshinPreferenceCell[]>(getDefaultGenshinPreferenceGrid()) // 表格数据

const loading = ref(false) // 加载状态

async function loadTableData() { // 加载表格和角色数据
  loading.value = true
  if (selectedTable.value === 'genshin_impact') {
    allCharacters.value = await fetchAndConvertGenshinCharacters()
    gridData.value = getDefaultGenshinPreferenceGrid()
  } else {
    allCharacters.value = []
    gridData.value = []
  }
  loading.value = false
}

onMounted(loadTableData) // 首次加载
watch(selectedTable, loadTableData) // 切换表类型时加载

// 弹窗交互
const dialogVisible = ref(false) // 弹窗显示
const dialogIdx = ref<number|null>(null) // 当前弹窗索引
const selectedCharacterId = ref<string | number | null>(null) // 选中角色id
const selectedCharacter = computed(() =>
  allCharacters.value.find(c => c.id === selectedCharacterId.value)
) // 当前选中角色
function openDialog(idx: number) { // 打开弹窗
  dialogIdx.value = idx
  selectedCharacterId.value = gridData.value[idx].character?.id ?? null
  dialogVisible.value = true
}
function confirmSelect() { // 确认选择
  if (dialogIdx.value !== null) {
    const char = allCharacters.value.find(c => c.id === selectedCharacterId.value)
    gridData.value[dialogIdx.value].character = char
    dialogVisible.value = false
  }
}

// 等待所有图片加载完毕
async function waitAllImagesLoaded(container: HTMLElement) {
  const imgs = Array.from(container.querySelectorAll('img'));
  await Promise.all(imgs.map(img => {
    if ((img as HTMLImageElement).complete) return Promise.resolve();
    return new Promise(res => {
      img.onload = img.onerror = res;
    });
  }));
}

// 保存PNG（仅导出PNG，确保图片加载完毕）
async function saveAsPng() {
  try {
    // 1. 导出合成表格PNG
    const el = document.querySelector('.table-container') as HTMLElement
    if (!el) return
    await waitAllImagesLoaded(el)
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, { useCORS: true })
    const link = document.createElement('a')
    link.download = 'preference-table.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    message.success('已保存PNG到本地')
  } catch (e) {
    message.error('保存失败')
  }
}

const isTableView = ref(true) // 是否为表格模式

// mock 数据源（可替换为后端数据）
const dataSourceList = ref([
  { id: '1001', name: '芙宁娜', image: '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/芙宁娜.png' },
  { id: '1002', name: '心海', image: '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/心海.png' },
  { id: '1003', name: '梦见月瑞希', image: '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/梦见月瑞希.png' },
  { id: '1004', name: '茜特菈莉', image: '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/茜特菈莉.png' },
  // ...可继续扩展超多项
  ...Array.from({ length: 100 }, (_, i) => ({ id: `id${i+2000}`, name: `角色${i+1}`, image: '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/芙宁娜.png' }))
]) // 数据源

const searchText = ref('') // 搜索关键字
const filteredDataSourceList = computed(() => {
  if (!searchText.value) return dataSourceList.value
  const kw = searchText.value.trim().toLowerCase()
  return dataSourceList.value.filter(item =>
    item.name.toLowerCase().includes(kw) || String(item.id).toLowerCase().includes(kw)
  )
}) // 过滤后的数据源

async function updateDataSource() {
  // 这里模拟后端更新，可替换为真实API
  // 假设后端返回新数据
  const newItem = {
    id: `id${Math.floor(Math.random()*100000)}`,
    name: `新角色${Math.floor(Math.random()*1000)}`,
    image: '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/芙宁娜.png'
  }
  dataSourceList.value = [...dataSourceList.value, newItem]
  message.success('数据源已更新')
}
</script>

<style scoped>
.preference-table-root {
  min-height: 100vh; /* 页面最小高度 */
  background: var(--n-color-body, #f8f9fa);
  position: relative;
  overflow: hidden;
}
.bg-decor {
  position: fixed;
  top: 50%;
  width: 360px;
  height: auto;
  
  opacity: 0.28;
  pointer-events: none;
  user-select: none;
  z-index: 10;
  transform: translateY(-50%);
}
.bg-decor-left {
  left: 0;
}
.bg-decor-right {
  right: 0;
}
.fixed-header-bar {
  position: fixed;
  top: 0;
  right: 32px;
  display: flex;
  gap: 12px;
  z-index: 100;
  background: transparent;
  box-shadow: none;
  height: 48px;
  align-items: center;
}
.main-content {
  z-index: 2;
  min-height: 100vh; /* 恢复为100vh，保证主内容始终垂直居中 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}
.main-card {
  max-width: 700px;
  width: 100%;
  background: var(--n-color-card, #fff);
  border-radius: 22px;
  box-shadow: 0 6px 32px 0 rgba(0,0,0,0.10);
  padding: 48px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
}
.selector-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}
.table-container {
  width: 100%;
  margin: 0 auto;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.character-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--n-color-card, #fff);
}
.character-card:hover {
  box-shadow: 0 6px 24px 0 rgba(0,0,0,0.13);
  transform: translateY(-2px) scale(1.03);
}
.cell-type {
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
  color: var(--n-text-color, #222);
}
.character-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  background: #f8f8f8;
}
.character-placeholder {
  width: 80px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1px;
}
.save-bar {
  width: 100%;
  margin: 32px 0 0 0;
  display: flex;
  justify-content: flex-end;
}
.dialog-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 14px;
  margin: 0 auto 8px auto;
  display: block;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
}
.datasource-list-container {
  width: 100%;
  margin: 0 auto;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ds-item {
  display: flex;
  align-items: center;
  padding: 48px 0 48px 48px; /* 上右下左，左与上下相同 */
}
.ds-avatar {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
  margin-right: 16px; /* 固定间距 */
  background: #f0f0f0;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.08);
}
.ds-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.ds-name {
  font-size: 22px;
  font-weight: 600;
  color: #222;
}
.ds-id {
  font-size: 16px;
  color: #888;
  margin-top: 6px;
}
.invisible-trigger {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #fff;
  outline: none;
  box-shadow: none;
  opacity: 0;
  cursor: pointer;
  padding: 0;
  margin: 0 auto;
  display: block;
}
@media (max-width: 900px) {
  .main-card {
    max-width: 98vw;
    padding: 48px 2vw 16px 2vw;
  }
  .fixed-header-bar {
    right: 10px;
    top: 0;
  }
}
@media (max-width: 600px) {
  .main-card {
    max-width: 100vw;
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  .character-img, .character-placeholder {
    width: 60px;
    height: 60px;
  }
  .dialog-img {
    width: 70px;
    height: 70px;
  }
  .cell-type {
    font-size: 14px;
  }
}
</style>