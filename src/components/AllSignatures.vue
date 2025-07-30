<template>
  <div class="page-wrapper">
    <AppHeader />
    <main class="main-content">
      <div v-if="pdfLoading" class="pdf-loading-mask">
        <div class="pdf-loading-spinner"></div>
        <div class="pdf-loading-text">正在导出PDF，请稍候...</div>
      </div>
      <div class="container">
        <!-- 下载PDF按钮 -->
        <div style="text-align: right; margin-bottom: 15px;">
          <button class="btn-primary" @click="downloadPDF">下载PDF</button>
        </div>

        <!-- 公告内容显示 -->
        <AnnouncementContent :currentDate="currentDate" />

        <!-- 导出PDF的内容区域加id -->
        <div >
          <div v-if="statistics" class="statistics">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ statistics.total_signatures }}</div>
                <div class="stat-label">已签字人数</div>
              </div>
            </div>
            <div class="progress-bar" style="display: none;">
              <div class="progress-fill" :style="{ width: statistics.progress + '%' }"></div>
            </div>
          </div>
          <div class="signatures-header">
            <h2>所有签字记录</h2>
            <p class="subtitle">以下是所有已签字人员的信息列表</p>
          </div>

          <div v-if="loading" class="loading">
            <p>加载中...</p>
          </div>

          <div v-else-if="signatures.length > 0" class="all-signatures">
            <div class="signatures-image-grid">
              <div v-for="(group, groupIdx) in signatureGroups" :key="'group-' + groupIdx" class="signature-group">
                <div v-for="signature in group" :key="signature.id" class="signature-image-flex">
                  <img v-if="signature.signature_image && signature.signature_image.length > 50"
                    :src="'data:image/png;base64,' + signature.signature_image" alt="签名图片" class="signature-image" />
                  <span v-else class="no-signature-image">无签名图片</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 没有数据时显示 -->
          <div v-else class="no-signatures">
            <div class="empty-state">
              <div class="empty-icon">📋</div>
              <h3>暂无签字记录</h3>
              <p>目前还没有任何签字记录，快去邀请大家签字吧！</p>
              <button class="btn-primary" @click="goToAnnouncement">返回公告</button>
            </div>
          </div>
        </div>
      </div>
      
    </main>
    <AppFooter />
  </div>
  <PdfContent
        v-show="false"
        :statistics="statistics"
        :signatures="signatures"
        :loading="loading"
        :currentDate="currentDate"
        :paginatedSignatures="paginatedSignatures"
        :formatDate="formatDate"
        :goToAnnouncement="goToAnnouncement"
      />
</template>

<script>
import axios from 'axios'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import AnnouncementContent from './AnnouncementContent.vue'
import PdfContent from './PdfContent.vue'
import { apiUrl } from '../utils/api.js'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default {
  name: 'AllSignatures',
  components: {
    AppHeader,
    AppFooter,
    AnnouncementContent,
    PdfContent
  },
  data() {
    return {
      signatures: [],
      filteredSignatures: [],
      statistics: null,
      loading: true,
      currentDate: this.getCurrentDate(),
      searchQuery: '',
      sortOption: 'newest',
      currentPage: 1,
      itemsPerPage: 1000,  // 每页显示10条数据
      pdfLoading: false // PDF导出loading遮罩
    }
  },
  computed: {
    // 计算总页数
    totalPages() {
      return Math.ceil(this.filteredSignatures.length / this.itemsPerPage)
    },
    // 计算当前页应该显示的数据
    paginatedSignatures() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredSignatures.slice(startIndex, startIndex + this.itemsPerPage)
    },
    signatureGroups() {
      // 每3个分一组
      const groups = [];
      for (let i = 0; i < this.paginatedSignatures.length; i += 3) {
        groups.push(this.paginatedSignatures.slice(i, i + 3));
      }
      return groups;
    }
  },
  watch: {
    // 搜索时重置到第一页
    searchQuery() {
      this.filterSignatures()
      this.currentPage = 1
    },
    // 排序变化时重新排序
    sortOption() {
      this.sortSignatures()
    }
  },
  mounted() {
    this.loadAllSignatures()
    this.loadStatistics()
  },
  methods: {
    async loadAllSignatures() {
      try {
        this.loading = true
        const response = await axios.get(apiUrl('/all-signatures'))
        this.signatures = response.data.signatures || []
        this.filterSignatures()
        this.sortSignatures()
      } catch (error) {
        console.error('加载所有签字信息失败:', error)
        alert('加载签字记录失败，请重试')
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

    // 过滤签名数据
    filterSignatures() {
      if (!this.searchQuery) {
        this.filteredSignatures = [...this.signatures]
        return
      }

      const query = this.searchQuery.toLowerCase()
      this.filteredSignatures = this.signatures.filter(signature =>
        // signature.signature.toLowerCase().includes(query) ||
        signature.room_number.toLowerCase().includes(query)
      )
    },

    // 排序签名数据
    sortSignatures() {
      switch (this.sortOption) {
        case 'newest':
          this.filteredSignatures.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'oldest':
          this.filteredSignatures.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          break
        case 'nameAsc':
          this.filteredSignatures.sort((a, b) => a.signature.localeCompare(b.signature))
          break
        case 'nameDesc':
          this.filteredSignatures.sort((a, b) => b.signature.localeCompare(a.signature))
          break
        default:
          break
      }
    },

    // 格式化日期显示
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
    downloadPDF() {
      this.pdfLoading = true;
      const element = document.getElementById('pdf-content')
      if (!element) {
        this.pdfLoading = false;
        return
      }
      if (element) element.style.display = ''
      import('html2pdf.js').then(html2pdf => {
        html2pdf.default()
          .set({
            margin: 0,
            filename: `签字记录_${this.currentDate}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          })
          .from(element)
          .toPdf()
          .get('pdf')
          .save()
          .then(() => {
            if (element) element.style.display = 'none'
            this.pdfLoading = false;
          })
          .catch(() => {
            if (element) element.style.display = 'none'
            this.pdfLoading = false;
          })
      })
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
  max-width: 1000px;
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

.filter-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 15px;
}

.search-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.sort-select {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
}

/* 新增搜索统计样式 */
.search-stats {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.search-stats .highlight {
  color: #667eea;
  font-weight: bold;
  font-size: 15px;
}

/* 新增图片网格布局样式 */
.signatures-image-grid {
  display: flex;
  flex-direction: column;
  /* gap: 18px; */
  margin-bottom: 30px;
}

.signature-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* gap: 12px; */
}

.signature-image-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  border-radius: 8px;
}

.signature-image {
  max-width: 100%;
  max-height: 120px;
  display: block;
  margin: 0 auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: #fff;
}

.no-signature-image {
  color: #bbb;
  font-size: 14px;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  background-color: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background-color: #556cd6;
  transform: translateY(-2px);
}

.page-info {
  color: #666;
  font-size: 16px;
}

.no-signatures {
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
  margin-top: 40px;
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
  background: white;
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

.btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* PDF导出loading遮罩层样式 */
.pdf-loading-mask {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pdf-loading-spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #667eea;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin-bottom: 18px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pdf-loading-text {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .main-content {
    padding: 100px 10px 80px 10px;
  }

  .container {
    margin: 0 10px;
    padding: 20px;
  }

  .filter-controls {
    flex-direction: column;
  }

  .table-header {
    display: none;
  }

  .table-row {
    flex-direction: column;
    padding: 15px;
    border-bottom: 2px solid #eee;
  }

  .table-cell {
    width: 100% !important;
    padding: 8px 0;
  }

  .table-cell::before {
    font-weight: bold;
    margin-right: 5px;
  }

  .id-column::before {
    content: "ID: ";
  }

  .name-column::before {
    content: "姓名: ";
  }

  .room-column::before {
    content: "门牌号: ";
  }

  .date-column::before {
    content: "签字时间: ";
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 700px) {
  .signature-row-flex {
    background-color: white;
    flex-direction: column;
    align-items: stretch;
  }
  .signature-info {
    min-width: 0;
    width: 100%;
    padding-left: 0;
    margin-bottom: 10px;
  }
  .signature-image-flex {
    width: 100%;
    justify-content: flex-start;
    margin-top: 0;
  }
}

</style>
