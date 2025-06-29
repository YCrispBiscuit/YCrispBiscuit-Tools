<template>
  <YCB_Header></YCB_Header>
  <div class="main-content">
    <div class="about-page">
      <h1 class="about-page-h1">关于本站</h1>
      <p>个人网站，喜欢什么做什么，随性随兴，代码开源，有事联系，虽然不一定能及时回就是了。</p>
      <div class="contact-list">

        <!-- GitHub -->
        <div class="contact-item" @click="openLink('https://github.com/YCrispBiscuit/YCrispBiscuit-Tools')"
          title="点击跳转至GitHub">
          <n-icon size="40" class="contact-logo">
            <Github />
          </n-icon>
          <span class="contact-name">GitHub</span>
        </div>
        <!-- QQ -->
        <div class="contact-item" @click="openLink('https://qm.qq.com/q/NPGhFM1IMo')" title="点击跳转至QQ">
          <n-icon size="40" class="contact-logo">
            <Qq />
          </n-icon>
          <span class="contact-name">QQ</span>
        </div>
        <!-- 哔哩哔哩 -->
        <div class="contact-item" @click="openLink('https://space.bilibili.com/40162073')" title="点击跳转至Bilibili">
          <n-icon size="40" class="contact-logo">
            <BilibiliIcon />
          </n-icon>
          <span class="contact-name">Bilibili</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import YCB_Header from '@/components/Header';
import { NIcon } from 'naive-ui'
import Github from '@vicons/fa/Github'
import Qq from '@vicons/fa/Qq'
import BilibiliIcon from '@/components/BilibiliIcon'

// 跳转外部链接
function openLink(url: string) {
  window.open(url, '_blank')
}
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 64px);
  /* 64px为导航栏高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-page {
  text-align: center;
}

.about-page-h1 {
  margin-bottom: 16px;
}


.contact-list {
  display: flex;
  gap: 96px;
  justify-content: center;
  margin-top: 32px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
  user-select: none;
}

.contact-item:active {
  transform: scale(0.92);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.10);
}

.contact-logo {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
}

.contact-name {
  font-size: 1rem;
  color: var(--text-color);
  margin-top: 2px;
}
</style>
