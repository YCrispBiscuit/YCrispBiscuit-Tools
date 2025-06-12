import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

const app = createApp(App, {
    provide: {
        message: message
    }
})



app.mount('#app')