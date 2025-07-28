import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Announcement from './components/Announcement.vue'
import AllSignatures from './components/AllSignatures.vue'
import Signatures from './components/Signatures.vue'
import WechatRequired from './components/WechatRequired.vue'

const routes = [
  { path: '/', component: Announcement },
  { path: '/signatures', component: Signatures },
  { path: '/allSignatures', component: AllSignatures },
  { path: '/wechat-required', component: WechatRequired }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
