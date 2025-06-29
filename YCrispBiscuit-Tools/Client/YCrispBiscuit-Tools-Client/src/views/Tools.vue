<template>
  <YCB_Header></YCB_Header>
  <div class="main-content">
    <div class="tools-page">
      <h1 class="tools-page-h1">工具箱</h1>
      <p>这里是你的工具箱页面，可以在这里添加和管理各种工具。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import YCB_Header from '@/components/Header';
// 这里可以引入和注册你的工具组件
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
