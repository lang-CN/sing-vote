<template>
  <div class="wechat-required-page">
    <div class="container">
      <div class="icon-container">
        <svg class="wechat-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path d="M331.52 263.68c35.84 0 59.52 23.68 59.52 59.52s-23.68 59.52-59.52 59.52-59.52-23.68-59.52-59.52 23.68-59.52 59.52-59.52zM569.6 263.68c35.84 0 59.52 23.68 59.52 59.52s-23.68 59.52-59.52 59.52-59.52-23.68-59.52-59.52 23.68-59.52 59.52-59.52z" fill="#00C800"></path>
          <path d="M758.4 406.4c-11.84 0-23.68 0-35.84 0-35.84-142.72-154.24-249.6-309.76-249.6-178.56 0-321.28 130.56-321.28 297.6 0 95.36 47.36 178.56 130.56 237.44l-23.68 71.68 83.2-41.6c29.44 5.92 53.12 11.84 83.2 11.84 11.84 0 23.68 0 35.84 0-5.92-23.68-11.84-47.36-11.84-71.68-5.92-154.24 118.72-285.44 273.6-285.44 29.44 0 59.52 5.92 83.2 11.84 5.92 5.92 11.84 11.84 11.84 17.92z" fill="#00C800"></path>
          <path d="M950.4 709.12c0-130.56-130.56-237.44-285.44-237.44s-285.44 106.88-285.44 237.44c0 130.56 130.56 237.44 285.44 237.44 35.84 0 71.68-5.92 106.88-17.92l65.28 35.84-17.92-59.52c65.28-47.36 106.88-118.72 106.88-195.84h24.32z" fill="#00C800"></path>
          <path d="M569.6 661.76c-23.68 0-41.6-17.92-41.6-41.6s17.92-41.6 41.6-41.6 41.6 17.92 41.6 41.6-17.92 41.6-41.6 41.6zM758.4 661.76c-23.68 0-41.6-17.92-41.6-41.6s17.92-41.6 41.6-41.6 41.6 17.92 41.6 41.6-17.92 41.6-41.6 41.6z" fill="#00C800"></path>
        </svg>
      </div>
      
      <h1 class="title">请使用微信打开</h1>
      
      <div class="message">
        <p>本应用需要在微信浏览器中使用</p>
        <p>请通过以下方式打开：</p>
      </div>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">打开微信APP</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">扫描二维码或点击链接</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">在微信内浏览器中访问</div>
        </div>
      </div>
      
      <div class="qr-placeholder">
        <div class="qr-box">
          <div class="qr-text">二维码区域</div>
          <div class="qr-subtitle">请使用微信扫一扫</div>
        </div>
      </div>
      
      <div class="footer">
        <p>如果您已在微信中，请刷新页面重试</p>
        <button @click="refresh" class="refresh-btn">刷新页面</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WechatRequired',
  methods: {
    refresh() {
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.wechat-required-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.icon-container {
  margin-bottom: 30px;
}

.wechat-icon {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 8px rgba(0, 200, 0, 0.3));
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 30px;
}

.message p {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.steps {
  margin-bottom: 30px;
  text-align: left;
}

.step {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
}

.step-number {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-text {
  color: #555;
  font-size: 14px;
}

.qr-placeholder {
  margin-bottom: 30px;
}

.qr-box {
  width: 150px;
  height: 150px;
  border: 2px dashed #ddd;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.02);
}

.qr-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.qr-subtitle {
  font-size: 12px;
  color: #bbb;
}

.footer {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.footer p {
  font-size: 14px;
  color: #888;
  margin-bottom: 15px;
}

.refresh-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.refresh-btn:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .container {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .wechat-icon {
    width: 60px;
    height: 60px;
  }
}
</style>
