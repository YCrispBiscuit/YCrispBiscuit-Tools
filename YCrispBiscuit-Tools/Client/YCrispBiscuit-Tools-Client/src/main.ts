// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/global.scss'
import './styles/variables.scss'
import App from './App.vue'
import router from './router' // 导入路由
import { createDiscreteApi } from 'naive-ui'
import { useAppStore } from '@/stores/app'

// 创建 Pinia 实例
const pinia = createPinia()
const { message } = createDiscreteApi(['message'])
const app = createApp(App)

app.use(router) // 使用路由

// 使用 Pinia
app.use(pinia)

app.provide('message', message)

// 默认设置为暗色主题（黑色）
const appStore = useAppStore();
if (!appStore.isDark) {
    appStore.toggleTheme();
}
// 设置 html 的 data-theme 属性为 dark
if (document.documentElement.getAttribute('data-theme') !== 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

app.mount('#app')