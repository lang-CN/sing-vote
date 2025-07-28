<template>
  <div class="page-wrapper">
      <AppHeader />
      <main class="main-content">
          <div class="container">
              <div v-if="statistics" class="statistics">
                  <h3>签字统计</h3>
                  <div class="stats-grid">
                      <div class="stat-item">
                          <div class="stat-number">{{ statistics.total_signatures }}</div>
                          <div class="stat-label">已签字人数</div>
                      </div>
                  </div>
                  <div class="progress-bar">
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
                  <div class="filter-controls">
                      <input type="text" v-model="searchQuery" placeholder="搜索门牌号..." class="search-input">
                      <select v-model="sortOption" class="sort-select" @change="sortSignatures">
                          <option value="newest">最新签字在前</option>
                          <option value="oldest">最早签字在前</option>
                      </select>
                  </div>
                  
                  <!-- 新增搜索结果统计 -->
                  <div class="search-stats" v-if="searchQuery">
                      <p>搜索结果：共找到 <span class="highlight">{{ filteredSignatures.length }}</span> 条匹配 "{{ searchQuery }}" 的记录</p>
                  </div>
                  <div class="search-stats" v-else>
                      <p>共 <span class="highlight">{{ filteredSignatures.length }}</span> 条记录</p>
                  </div>

                  <div class="signatures-table">
                      <div class="table-header">
                          <div class="table-cell id-column">ID</div>
                          <div class="table-cell name-column" style="display: none;">姓名</div>
                          <div class="table-cell room-column">门牌号</div>
                          <div class="table-cell date-column">签字时间</div>
                      </div>

                      <!-- 使用分页后的数据列表 -->
                      <div v-for="signature in paginatedSignatures" :key="signature.id" class="table-row">
                          <div class="table-cell id-column">{{ signature.id }}</div>
                          <div class="table-cell name-column" style="display: none;">{{ signature.signature }}</div>
                          <div class="table-cell room-column">{{ signature.room_number }}</div>
                          <div class="table-cell date-column">{{ formatDate(signature.created_at) }}</div>
                      </div>
                  </div>

                  <div class="pagination" v-if="totalPages > 1">
                      <button class="page-btn" @click="currentPage = 1" :disabled="currentPage === 1">
                          首页
                      </button>
                      <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1">
                          上一页
                      </button>
                      <span class="page-info">
                          第 {{ currentPage }} / {{ totalPages }} 页
                      </span>
                      <button class="page-btn" @click="currentPage++" :disabled="currentPage === totalPages">
                          下一页
                      </button>
                      <button class="page-btn" @click="currentPage = totalPages"
                          :disabled="currentPage === totalPages">
                          末页
                      </button>
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
      </main>
      <AppFooter />
  </div>
</template>

<script>
import axios from 'axios'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import AnnouncementContent from './AnnouncementContent.vue'
import { apiUrl } from '../utils/api.js'

export default {
  name: 'AllSignatures',
  components: {
      AppHeader,
      AppFooter,
      AnnouncementContent
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
          itemsPerPage: 10  // 每页显示10条数据
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

.signatures-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-cell {
  padding: 15px 20px;
  text-align: left;
}

.id-column {
  width: 10%;
}

.name-column {
  width: 30%;
}

.room-column {
  width: 25%;
}

.date-column {
  width: 35%;
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
</style>
