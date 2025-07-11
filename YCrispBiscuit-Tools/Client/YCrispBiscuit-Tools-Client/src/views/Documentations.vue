<template>
    <YCB_Header></YCB_Header>
    <div class="Docus-body">

        <div class="main-content">
            <div class="Docus-page">
                <h1 class="Docus-page-h1">文档中心</h1>
                <p>这里收录了本站各领域工具的详细文档与说明，欢迎查阅！</p>
            </div>
        </div>

        <div class="doc-list-wrapper" ref="docListRef">
            <n-card v-for="(item, idx) in docList" :key="item.key" hoverable class="doc-big-card"
                :class="{ 'slide-in': itemVisible[idx] }">
                <div class="doc-card-header">
                    <n-avatar :src="item.icon" size="large" class="doc-avatar" />
                    <div class="doc-card-title">{{ item.title }}</div>
                </div>
                <div class="doc-card-desc">{{ item.desc }}</div>
                <ul v-if="item.details && item.details.length" class="doc-card-detail-list">
                    <li v-for="(d, i) in item.details" :key="i">{{ d }}</li>
                </ul>
                <div class="doc-card-footer">
                    <n-button type="primary" @click="goTo(item.path)">进入文档</n-button>
                </div>
            </n-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import YCB_Header from '@/components/Header';
import { NCard, NAvatar, NButton } from 'naive-ui';
import { useRouter } from 'vue-router';
import { ref, onMounted, nextTick } from 'vue';

const router = useRouter();
const docListRef = ref<HTMLElement | null>(null);

const docList = [
    {
        key: 'acgn',
        title: 'ACGN 工具文档',
        desc: '收录所有ACGN相关工具的使用说明、功能介绍、常见问题等，适合二次元爱好者快速上手。',
        icon: '/public/logo.svg',
        path: '/docs/acgn',
        details: [
            ' 偏好表生成器文档',
            ' 角色数据库说明',
            ' 图片导出与自定义技巧',
        ],
    },
    {
        key: 'dev',
        title: '编程工具文档',
        desc: '涵盖开发辅助工具、API文档、技术细节说明，适合开发者查阅和学习。',
        icon: '/src/assets/bilibili_blue.png',
        path: '/docs/dev',
        details: [
            ' 代码格式化工具文档',
            ' API接口说明',
            ' 常见开发问题解答',
        ],
    },
    {
        key: 'life',
        title: '生活工具文档',
        desc: '介绍日常生活相关工具的使用方法、场景案例，帮助你高效生活。',
        icon: '/src/assets/bilibili_red.png',
        path: '/docs/life',
        details: [
            ' 记账工具文档',
            ' 日程管理说明',
            ' 生活小技巧',
        ],
    },
];

// 控制每个卡片的显示动画
const itemVisible = ref(Array(docList.length).fill(false));

onMounted(() => {
    nextTick(() => {
        if (!docListRef.value) return;
        const observer = new window.IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                itemVisible.value = Array(docList.length).fill(false);
                docList.forEach((_, idx) => {
                    setTimeout(() => {
                        itemVisible.value[idx] = true;
                    }, idx * 240);
                });
            } else {
                itemVisible.value = Array(docList.length).fill(false);
            }
        }, { threshold: 0.1 });
        observer.observe(docListRef.value);
    });
});

function goTo(path: string) {
    router.push(path);
}
</script>

<style scoped>
.Docus-body {
    position: relative;
    /* 让伪元素绝对定位于此容器内 */
    overflow: hidden;
    /* 防止伪元素溢出容器 */
}

.Docus-body::before {
    content: "";
    /* 生成一个空内容的伪元素 */
    position: absolute;
    /* 绝对定位，覆盖整个父容器 */
    inset: 0;
    /* 顶部、右侧、底部、左侧都为0，撑满父容器 */
    background-image: url('@/assets/DocuBack.jpg');
    /* 设置背景图片，与原背景一致 */
    background-size: cover;
    /* 背景图片铺满容器 */
    background-position: center;
    /* 背景图片居中显示 */
    background-attachment: fixed;
    /* 背景图片固定，不随内容滚动 */
    filter: blur(8px);
    /* 应用8px的高斯模糊效果 */
    opacity: 0.5;
    /* 设置不透明度为0.5，实现半透明 */
    z-index: 0;
    /* 保证伪元素在内容下方 */
    pointer-events: none;
    /* 禁止鼠标事件穿透，避免影响内容交互 */
}

.Docus-body>* {
    position: relative;
    /* 让内容层级高于伪元素 */
    z-index: 1;
    /* 保证内容显示在伪元素之上 */
}

.main-content {
    min-height: calc(100vh - 64px);
    /* 64px为导航栏高度 */
    display: flex;
    align-items: center;
    justify-content: center;
}

.Docus-page {
    text-align: center;
}

.Docus-page-h1 {
    margin-bottom: 16px;
}

.doc-list-wrapper {
    margin-top: 164px;
    padding-bottom: 48px;
    width: 100%;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}


.doc-big-card {
    padding: 14px 16px 10px 16px;
    border-radius: 24px;
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.06);
    transition: box-shadow 0.2s;
    background: var(--bg-color-secondary);
    color: var(--text-color);
    margin-top: 24px;
    opacity: 0;
    transform: translateX(180px);
    transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in {
    opacity: 1 !important;
    transform: translateX(0) !important;
}

.doc-card-header {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 10px;
}

.doc-avatar {
    border-radius: 8px;
    background: #f0f0f0;
}

.doc-card-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-color);
}

.doc-card-desc {
    color: var(--text-color-secondary);
    font-size: 1.05rem;
    margin-bottom: 10px;
}

.doc-card-detail-list {
    margin: 0 0 12px 0;
    padding-left: 18px;
    color: var(--text-color-secondary);
    font-size: 0.98rem;
}

.doc-card-footer {
    display: flex;
    justify-content: flex-end;
}
</style>
