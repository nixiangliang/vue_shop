import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

// 为路由对象，添加 beforeEach 导航守卫
router.beforeEach((to, from, next) => {
  // 如果用户访问的是登录页，直接放行
  if (to.path === '/login') return next()
  // 如果访问的不是登录页，从 sessionStorage 中获取到保存的 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有 token，强制跳转到登录页
  if (!tokenStr) return next('/login')
  // 有 token，直接放行
  next()
})

export default router
