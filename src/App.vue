<template>
  <div>
    <WechatRequired v-if="!isWechat" />
    <router-view v-else />
  </div>
</template>

<script>
import { isWechatBrowser } from './utils/wechatDetector.js'
import WechatRequired from './components/WechatRequired.vue'

export default {
  name: 'App',
  components: {
    WechatRequired
  },
  data() {
    return {
      isWechat: false
    }
  },
  computed: {
    needWechatCheck() {
      const path = this.$route?.path || window.location.pathname
      return !['/allSignatures', '/password-error'].includes(path)
    }
  },
  watch: {
    '$route.path': 'checkWechatBrowser'
  },
  created() {
    this.checkWechatBrowser()
  },
  methods: {
    checkWechatBrowser() {
      if (!this.needWechatCheck) {
        this.isWechat = true
        return
      }
      this.isWechat = isWechatBrowser()
      if(window.location.hostname === 'localhost'){
        this.isWechat = true
      }

      // 开发环境下可以通过URL参数强制进入
      if (process.env.NODE_ENV === 'development') {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('force') === 'true') {
          this.isWechat = true
        }
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 0;
  width: 100%;
  display: block;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

html {
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>
