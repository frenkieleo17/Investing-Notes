import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../firebase.js'

// 路由组件
const AuthView = () => import('../views/AuthView.vue')
const DashboardView = () => import('../views/DashboardView.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 认证检查
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const currentUser = authService.getCurrentUser()

  if (requiresAuth && !currentUser) {
    // 需要认证但未登录，跳转到登录页
    next('/auth')
  } else if (to.path === '/auth' && currentUser) {
    // 已登录但访问登录页，跳转到dashboard
    next('/dashboard')
  } else {
    next()
  }
})

export default router