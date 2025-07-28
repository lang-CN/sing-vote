<template>
  <footer class="app-footer">
    <p>{{ copyright }}</p>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  props: {
    copyright: {
      type: String,
      default: '© 2025 想云湾-槿地轩-全体业主'
    }
  }
}
</script>

<style scoped>
.app-footer {
  background: #764ba2;
  text-align: center;
  padding: 20px;
  color: white;
  backdrop-filter: blur(10px);
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
}

.app-footer p {
  margin: 0;
}

/* 小屏设备适配 */
@media (max-width: 768px) {
  .app-footer {
    padding: 15px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .app-footer {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
