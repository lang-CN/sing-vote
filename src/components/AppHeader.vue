<template>
  <header class="app-header">
    <h1>{{ title }}</h1>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    title: {
      type: String,
      default: '想云湾-逸天轩、槿地轩-业主投票'
    }
  }
}
</script>

<style scoped>
.app-header {
  background: #667eea;
  padding: 20px 15px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.app-header h1 {
  color: white;
  font-size: 28px;
  font-weight: 600;
  margin: 0 auto;
  max-width: 800px;
}

/* 平板设备 */
@media (max-width: 1024px) {
  .app-header h1 {
    font-size: 26px;
  }
}

/* 大屏手机和小平板 */
@media (max-width: 768px) {
  .app-header {
    padding: 15px 10px;
  }
  
  .app-header h1 {
    font-size: 22px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .app-header {
    padding: 10px 5px;
  }
  
  .app-header h1 {
    font-size: 18px;
  }
}

/* 超小屏设备 */
@media (max-width: 320px) {
  .app-header {
    padding: 8px 3px;
  }
  
  .app-header h1 {
    font-size: 16px;
  }
}
</style>
