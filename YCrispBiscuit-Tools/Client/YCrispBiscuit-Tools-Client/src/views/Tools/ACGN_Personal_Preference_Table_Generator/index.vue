<template>
  <n-message-provider>
    <div class="preference-table-root">
      <!-- 动态背景装饰图（左右两侧） -->
      <img v-if="bgLeft" class="bg-decor bg-decor-left" :src="bgLeft" alt="bg-left" />
      <img v-if="bgRight" class="bg-decor bg-decor-right" :src="bgRight" alt="bg-right" />
      <!-- 顶部右上角操作栏 -->
      <div class="fixed-header-bar">
        <n-button quaternary class="header-btn" @click="goBack">返回工具页</n-button>
      </div>
      <!-- 主内容区垂直水平居中 -->
      <div class="main-content">
        <div class="main-card">
          <h2 class="main-title">ACGN个人喜好表生成器</h2>
          <div class="selector-bar">
            <n-select
              v-model:value="selectedTable"
              :options="tableOptions"
              placeholder="请选择喜好表类型"
              style="width: 220px"
            />
          </div>
          <div class="table-container">
            <n-spin :show="loading">
              <n-grid :cols="5" x-gap="18" y-gap="18" responsive="screen">
                <n-grid-item v-for="(cell, idx) in gridData" :key="cell.type">
                  <n-card class="character-card" hoverable @click="openDialog(idx)">
                    <div class="cell-type">{{ cell.type }}</div>
                    <img v-if="cell.character" :src="cell.character.image" class="character-img" crossorigin="anonymous" />
                    <div v-else class="character-placeholder">点击选择</div>
                  </n-card>
                </n-grid-item>
              </n-grid>
            </n-spin>
          </div>
          <div class="save-bar">
            <n-button type="primary" @click="saveAsPng">保存PNG到本地</n-button>
          </div>
        </div>
      </div>
      <!-- 选择角色弹窗 -->
      <n-modal v-model:show="dialogVisible" preset="dialog" title="选择角色" :mask-closable="true">
        <div v-if="dialogIdx !== null">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NSelect, NGrid, NGridItem, NCard, NModal, NSpin, useMessage, NMessageProvider } from 'naive-ui'
import { fetchAndConvertGenshinCharacters, type PreferenceTableItem, getDefaultGenshinPreferenceGrid, type GenshinPreferenceCell } from './Data/data'
const bgGenshinLeft = '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/心海.png'
const bgGenshinRight = '/Tools/ACGN_Personal_Preference_Table_Generator/Genshin_Impact/芙宁娜.png'

const router = useRouter()
const message = useMessage()

// 返回工具页
function goBack() {
  router.push('/Tools')
}

// 表类型下拉（可扩展）
const tableOptions = [
  { label: '原神角色喜好表', value: 'genshin_impact' },
  // 其他表类型可在此扩展
]
const selectedTable = ref('genshin_impact')

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
const bgLeft = computed(() => bgMap[selectedTable.value]?.left || '')
const bgRight = computed(() => bgMap[selectedTable.value]?.right || '')

// 原神角色数据
const allCharacters = ref<PreferenceTableItem[]>([])
const characterOptions = computed(() =>
  allCharacters.value.map(c => ({ label: c.name, value: c.id, image: c.image }))
)

// 喜好表格数据（类型+角色）
const gridData = ref<GenshinPreferenceCell[]>(getDefaultGenshinPreferenceGrid())

const loading = ref(false)

async function loadTableData() {
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

onMounted(loadTableData)
watch(selectedTable, loadTableData)

// 弹窗交互
const dialogVisible = ref(false)
const dialogIdx = ref<number|null>(null)
const selectedCharacterId = ref<string | number | null>(null)
const selectedCharacter = computed(() =>
  allCharacters.value.find(c => c.id === selectedCharacterId.value)
)
function openDialog(idx: number) {
  dialogIdx.value = idx
  selectedCharacterId.value = gridData.value[idx].character?.id ?? null
  dialogVisible.value = true
}
function confirmSelect() {
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
</script>

<style scoped>
.preference-table-root {
  min-height: 100vh;
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