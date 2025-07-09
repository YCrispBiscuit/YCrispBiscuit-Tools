<template>
    <YCB_Header></YCB_Header>
    <div class="main-content">
        <div class="tools-page">
            <h1 class="tools-page-h1">文档</h1>
            <p>什么？你问为什么文档页面是空的？因为我懒得写文档</p>
        </div>
    </div>
</template>


<script setup lang="ts">
import YCB_Header from '@/components/Header';
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
</style>
