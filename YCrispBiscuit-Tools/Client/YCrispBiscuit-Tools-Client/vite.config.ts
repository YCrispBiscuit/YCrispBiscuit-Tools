import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const PROD_API_BASE = 'https://e50d0ca04b77.ngrok-free.app'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: '/YCrispBiscuit-Tools/',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    proxy: {
      '/api': {
        target: PROD_API_BASE,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist'
  },
  define: {
    __API_BASE__: JSON.stringify(mode === 'production' ? PROD_API_BASE : '/api')
  }
}))