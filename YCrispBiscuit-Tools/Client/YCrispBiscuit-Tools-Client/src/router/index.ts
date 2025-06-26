// router/index.ts
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import Home from '../views/Home.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to: RouteLocationNormalized) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      path: '/',
      query: { redirect: to.fullPath !== '/' ? to.fullPath : undefined }
    }
  }
})

export default router