import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Announcement from './components/Announcement.vue'
import AllSignatures from './components/AllSignatures.vue'
import Signatures from './components/Signatures.vue'
import WechatRequired from './components/WechatRequired.vue'
import PasswordError from './components/PasswordError.vue'
import axios from 'axios'
import { apiUrl } from './utils/api.js'

const routes = [
  { path: '/', component: Announcement },
  { path: '/signatures', component: Signatures },
  { path: '/allSignatures', component: AllSignatures, meta: { requirePassword: true } },
  { path: '/wechat-required', component: WechatRequired },
  { path: '/password-error', component: PasswordError }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 密码验证拦截
let passwordChecked = false;
async function showPasswordDialog() {
  return new Promise((resolve, reject) => {
    // 避免重复弹窗
    if (document.getElementById('custom-password-modal')) return;
    const mask = document.createElement('div');
    mask.style.cssText = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;';
    mask.id = 'custom-password-modal';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;padding:32px 28px 24px 28px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.18);min-width:320px;display:flex;flex-direction:column;align-items:center;';
    const title = document.createElement('div');
    title.innerText = '请输入访问密码';
    title.style.cssText = 'font-size:20px;font-weight:600;margin-bottom:18px;color:#333;';
    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = '访问密码';
    input.style.cssText = 'padding:10px 14px;font-size:16px;border-radius:6px;border:1px solid #ccc;width:220px;margin-bottom:18px;outline:none;';
    input.autofocus = true;
    const btn = document.createElement('button');
    btn.innerText = '确认';
    btn.style.cssText = 'padding:10px 32px;font-size:16px;border-radius:6px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border:none;cursor:pointer;font-weight:600;';
    const err = document.createElement('div');
    err.style.cssText = 'color:#e74c3c;font-size:14px;margin-top:10px;min-height:18px;';
    btn.onclick = () => {
      if (!input.value) {
        err.innerText = '请输入密码';
        return;
      }
      mask.remove();
      resolve(input.value);
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') btn.click();
    };
    box.appendChild(title);
    box.appendChild(input);
    box.appendChild(btn);
    box.appendChild(err);
    mask.appendChild(box);
    document.body.appendChild(mask);
    input.focus();
  });
}

router.beforeEach(async (to, from, next) => {
  if (to.meta && to.meta.requirePassword) {
    if (passwordChecked) {
      next();
      return;
    }
    let pwd = await showPasswordDialog();
    if (!pwd) return;
    try {
      const resp = await axios.post(apiUrl('/check-password'), { password: pwd });
      if (resp.data && resp.data.success) {
        passwordChecked = true;
        next();
      } else {
        router.replace('/password-error');
      }
    } catch {
      // alert('验证失败');
      router.replace('/password-error');
      next(false);
    }
  } else {
    next();
  }
});

const app = createApp(App)
app.use(router)
app.mount('#app')
