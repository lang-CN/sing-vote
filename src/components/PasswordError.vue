<template>
  <div class="password-error-wrapper">
    <div class="error-box">
      <h2>密码错误</h2>
      <p>您输入的访问密码不正确，请重试。</p>
      <button class="retry-btn" @click="retry">重新输入密码</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordError',
  methods: {
    retry() {
      this.$router.replace('/allSignatures');
    }
  }
}
</script>

<style scoped>
.password-error-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.error-box {
  background: #fff;
  padding: 40px 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  text-align: center;
}
.error-box h2 {
  color: #e74c3c;
  margin-bottom: 18px;
}
.error-box p {
  color: #555;
  margin-bottom: 28px;
}
.retry-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: all 0.3s;
}
.retry-btn:hover {
  background: linear-gradient(135deg, #556cd6 0%, #764ba2 100%);
}
</style>
