import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
// import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入第三方树形表格插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入 nprogress 包对应的JS和CSS，实现进度条效果
import NProgress from 'nprogress'

// 导入 axios
import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 配置请求拦截器
// 在 request 拦截其中，展示进度条 NProgress.start()
axios.interceptors.request.use((config) => {
  // 在 API 接口的请求头中使用 Authorization 字段提供 token 令牌
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use((config) => {
  NProgress.done()
  // 在最后必须 return config
  return config
})

// 全局挂载 axios
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 全局挂载第三方树形表格插件
Vue.component('tree-table', TreeTable)
// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

// 声明格式化时间的全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
