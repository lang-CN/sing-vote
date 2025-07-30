import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const authToken = env.MY_SECRET;
  const target_url = env.TARGET_URL;
  return {
    build: {
      lib: {
        entry: 'src/main.js', // 指定入口文件
        name: 'CN-LANG', // 库的全局变量名
        fileName: 'index' // 输出为 index.js
      }
    },
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        '/api': {
          target: target_url,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (authToken) {
                proxyReq.setHeader('Authorization', `Bearer ${authToken}`);
              } else {
                proxyReq.removeHeader('Authorization');
              }
              console.log('Proxy Authorization:', proxyReq.getHeader('Authorization'));
            });
          }
        }
      },
    }
  }
})
