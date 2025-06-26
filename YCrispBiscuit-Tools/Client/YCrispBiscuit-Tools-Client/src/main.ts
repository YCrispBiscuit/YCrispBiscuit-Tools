// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router' // 导入路由
import { createDiscreteApi } from 'naive-ui'

// 创建 Pinia 实例
const pinia = createPinia()
const { message } = createDiscreteApi(['message'])
const app = createApp(App)

app.use(router) // 使用路由

// 使用 Pinia
app.use(pinia)

app.provide('message', message)

app.mount('#app')