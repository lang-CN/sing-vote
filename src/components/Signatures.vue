<template>
  <div class="page-wrapper">
    <AppHeader />
    <main class="main-content">
      <div class="container">
        <AnnouncementContent :currentDate="currentDate" />
        <div class="signatures-header">
          <h2>签字确认</h2>
          <p class="subtitle">感谢您的参与！以下是您的签字记录</p>
        </div>

        <div v-if="loading" class="loading">
          <p>加载中...</p>
        </div>

        <div v-else-if="userSignature" class="signature-display">
          <div class="signature-info">
            <h3>签字信息</h3>
            <div class="info-row">
              <label>姓名：</label>
              <span>{{ userSignature.signature }}</span>
            </div>
            <div class="info-row">
              <label>门牌号：</label>
              <span>{{ userSignature.room_number }}</span>
            </div>
            <div class="info-row">
              <label>签字时间：</label>
              <span>{{ formatDate(userSignature.created_at) }}</span>
            </div>
          </div>

          <div class="signature-image-container" v-if="userSignature.signature_image">
            <h3>您的签字</h3>
            <div class="signature-image">
              <img :src="getSignatureImageUrl(userSignature.signature_image)" alt="用户签字" />
            </div>
          </div>

          <div class="action-buttons" style="display: none;">
            <button @click="goBack" class="btn-secondary">返回公告</button>
            <button @click="downloadSignature" class="btn-primary">下载签字</button>
          </div>
        </div>

        <div v-else class="no-signature">
          <div class="empty-state">
            <div class="empty-icon">✍️</div>
            <h3>您还未签字</h3>
            <p>请先阅读公告内容并完成签字</p>
            <button @click="goToAnnouncement" class="btn-primary">去签字</button>
          </div>
        </div>

        <div v-if="statistics" class="statistics">
          <h3>签字统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.total_signatures }}</div>
              <div class="stat-label">已签字人数</div>
            </div>
            <div class="stat-item" style="display: none;">
              <div class="stat-number">{{ statistics.target_signatures }}</div>
              <div class="stat-label">目标人数</div>
            </div>
            <div class="stat-item" style="display: none;">
              <div class="stat-number">{{ statistics.progress }}%</div>
              <div class="stat-label">完成进度</div>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: statistics.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import axios from 'axios'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import AnnouncementContent from './AnnouncementContent.vue'
import { getDeviceIdentity } from '../utils/deviceInfo.js'
import { apiUrl } from '../utils/api.js'

export default {
  name: 'Signatures',
  components: {
    AppHeader,
    AppFooter,
    AnnouncementContent
  },
  data() {
    return {
      userSignature: null,
      statistics: null,
      loading: true,
      currentDate: this.getCurrentDate(),
    }
  },
  mounted() {
    this.loadUserSignature()
    this.loadStatistics()
  },
  methods: {
    async loadUserSignature() {
      try {
        const deviceInfo = await getDeviceIdentity()
        const response = await axios.post(apiUrl('/user-signature'), deviceInfo)
        this.userSignature = response.data.signature
      } catch (error) {
        console.error('加载用户签字失败:', error)
      } finally {
        this.loading = false
      }
    },

    async loadStatistics() {
      try {
        const response = await axios.get(apiUrl('/statistics'))
        this.statistics = response.data
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    getSignatureImageUrl(imageData) {
      if (imageData.startsWith('data:image/')) {
        return imageData
      }
      return `data:image/png;base64,${imageData}`
    },

    formatDate(dateString) {
      if (!dateString) return '未知时间'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    goBack() {
      this.$router.push('/')
    },

    goToAnnouncement() {
      this.$router.push('/')
    },
    getCurrentDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()
      return `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日`
    },

    async downloadSignature() {
      if (!this.userSignature?.signature_image) return

      try {
        const link = document.createElement('a')
        link.href = this.getSignatureImageUrl(this.userSignature.signature_image)
        link.download = `${this.userSignature.signature}_signature.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('下载签字失败:', error)
        alert('下载失败，请重试')
      }
    }
  }
}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  flex: 1;
  padding: 120px 20px 100px 20px;
}

.container {
  max-width: 800px;
  margin: 10px auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.signatures-header {
  text-align: center;
  margin-bottom: 40px;
}

.signatures-header h2 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.signature-display {
  margin-bottom: 40px;
}

.signature-info {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  border-left: 4px solid #3498db;
}

.signature-info h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.info-row label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
}

.info-row span {
  color: #333;
  font-size: 16px;
}

.signature-image-container {
  margin-bottom: 30px;
}

.signature-image-container h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
}

.signature-image {
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}

.signature-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.no-signature {
  text-align: center;
  padding: 60px 20px;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 15px;
}

.empty-state p {
  color: #7f8c8d;
  font-size: 16px;
  margin-bottom: 30px;
}

.statistics {
  border-top: 2px solid #eee;
  padding-top: 30px;
}

.statistics h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  text-align: center;
  font-size: 22px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.progress-bar {
  background: #e9ecef;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
}

@media (max-width: 768px) {
  .main-content {
    padding: 100px 10px 80px 10px;
  }

  .container {
    margin: 0 10px;
    padding: 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
