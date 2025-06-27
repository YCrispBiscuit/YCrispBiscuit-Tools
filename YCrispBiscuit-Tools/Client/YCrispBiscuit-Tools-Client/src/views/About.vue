<template>
  <YCB_Header></YCB_Header>
  <div class="main-content">
    <div class="about-page">
      <h1>关于本站</h1>
      <p>个人网站，喜欢什么做什么，随性随兴，代码开源，有事联系。</p>
      <div class="contact-list">
        <!-- 哔哩哔哩 -->
        <div class="contact-item" @click="openLink('https://space.bilibili.com/你的UID')">
          <img src="@/assets/bilibili_blue.svg" alt="bilibili" class="contact-logo" />
          <span class="contact-name">哔哩哔哩</span>
        </div>
        <!-- GitHub -->
        <div class="contact-item" @click="openLink('https://github.com/你的GitHub用户名')">
          <n-icon size="40" class="contact-logo"><FaGithub /></n-icon>
          <span class="contact-name">GitHub</span>
        </div>
        <!-- QQ -->
        <div class="contact-item" @click="openLink('https://qm.qq.com/cgi-bin/qm/qr?k=你的QQ二维码')">
          <n-icon size="40" class="contact-logo"><FaQq /></n-icon>
          <span class="contact-name">QQ</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import YCB_Header from '@/components/Header';
import { NIcon } from 'naive-ui'
import { FaGithub, FaQq } from '@vicons/fa'

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

.contact-list {
  display: flex;
  gap: 48px;
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
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
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
