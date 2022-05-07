import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/icont/iconfont.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor /* { default global options } */)
Vue.component('tree-table', ZkTable)
// console.log(ZkTable)
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置axios拦截
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
// 全局过滤器 时间格式
Vue.filter('dateFormat', function (date) {
  const t = new Date(date)
  const year = t.getFullYear()
  const month = (t.getMonth() + 1 + '').padStart(2, '0')
  const day = (t.getDate() + '').padStart(2, '0')

  const hours = (t.getHours() + '').padStart(2, '0')
  const mintue = (t.getMinutes() + '').padStart(2, '0')
  const second = (t.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${mintue}:${second}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
