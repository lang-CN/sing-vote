<template>
  <div class="page-wrapper">
    <AppHeader />
    <main class="main-content">
      <div class="container">
        <AnnouncementContent :currentDate="currentDate" />
        <h3>签字确认</h3>
        <div v-if="message" class="flash-message" :class="messageType">{{ message }}</div>
        <form @submit.prevent="submitSignature" id="signatureForm">
          <div class="signature-container">
            <input v-model="signatureName" type="text" placeholder="请输入您的姓名" required>
            <!-- 新增的下拉选项 -->
            <select v-model="buildingName" class="building-select" required readonly>
              <option value="逸天轩">逸天轩</option>
              <option value="槿地轩" selected>槿地轩</option>
            </select>

            <div class="room-inputs">
              <input v-model="building" type="number" min="1" step="1" placeholder="楼号" required>
              <input v-model="unit" type="number" min="1" step="1" placeholder="单元号" required>
              <input v-model="door" type="number" min="1" step="1" placeholder="门牌号" required>
            </div>
            <label>请在下方签字板上签字：</label>
            <div ref="signaturePad" class="signature-pad">
              <canvas ref="canvas" width="600" height="200"></canvas>
            </div>
            <div class="signature-controls">
              <button type="button" @click="clearSignature" class="btn-secondary">清除签字</button>
            </div>
          </div>
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : '提交签字' }}
          </button>
        </form>
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
  name: 'Announcement',
  components: {
    AppHeader,
    AppFooter,
    AnnouncementContent
  },
  data() {
    return {
      signatureName: '',
      buildingName: '槿地轩', 
      building: '',
      unit: '',
      door: '',
      isSubmitting: false,
      message: '',
      messageType: '',
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      ctx: null,
      currentDate: this.getCurrentDate(),
    }
  },
  mounted() {
    this.initCanvas()
    this.checkUserStatus()
  },
  computed: {
    roomNumber() {
      let parts = [this.buildingName];
      if (String(this.building).trim()) parts.push(`${this.building}号楼`)
      if (String(this.unit).trim()) parts.push(`${this.unit}单元`)
      if (String(this.door).trim()) parts.push(`${this.door}号门`)
      return parts.join(' ')
    }
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas
      // 记录样式宽高
      const styleWidth = 600
      const styleHeight = 200
      // 设置实际像素宽高
      canvas.width = styleWidth
      canvas.height = styleHeight
      canvas.style.width = '100%'
      canvas.style.maxWidth = styleWidth + 'px'
      canvas.style.height = styleHeight + 'px'
      this.ctx = canvas.getContext('2d')
      this.ctx.strokeStyle = '#000'
      this.ctx.lineWidth = 2
      this.ctx.lineCap = 'round'

      // 添加鼠标事件
      canvas.addEventListener('mousedown', this.startDrawing)
      canvas.addEventListener('mousemove', this.draw)
      canvas.addEventListener('mouseup', this.stopDrawing)
      canvas.addEventListener('mouseout', this.stopDrawing)

      // 添加触摸事件
      canvas.addEventListener('touchstart', this.startDrawing)
      canvas.addEventListener('touchmove', this.draw)
      canvas.addEventListener('touchend', this.stopDrawing)

      // 添加水印
      this.addWatermark()
    },

    addWatermark() {
      const canvas = this.$refs.canvas
      const ctx = this.ctx

      ctx.save()
      ctx.font = '14px Arial'
      ctx.fillStyle = 'rgba(128, 128, 128, 0.3)'
      ctx.textAlign = 'center'
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-Math.PI / 6)
      ctx.fillText(`签字仅用于本次公告${this.currentDate}`, 0, 0)
      ctx.restore()

      // 在左下角显示 signatureName
      ctx.save()
      ctx.font = '16px Arial'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`签字人:${this.signatureName}`, 10, canvas.height - 10)
      ctx.restore()

      // 在右下角显示 roomNumber
      ctx.save()
      ctx.font = '16px Arial'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`${this.roomNumber}`, canvas.width - 10, canvas.height - 10)
      ctx.restore()
    },

    getEventPos(e) {
      const canvas = this.$refs.canvas
      const rect = canvas.getBoundingClientRect()
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)
      // 按实际像素比例换算
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      }
    },

    startDrawing(e) {
      // 校验签名姓名和门牌号及楼号、单元号、门牌号
      if (!this.signatureName.trim()) {
        this.showMessage('请输入您的姓名', 'error')
        return
      }
      if (!String(this.building).trim() || !String(this.unit).trim() || !String(this.door).trim()) {
        this.showMessage('请填写完整楼号、单元号、门牌号', 'error')
        return
      }
      if (!this.roomNumber.trim()) {
        this.showMessage('请先填写门牌号后再签名', 'error')
        return
      }
      e.preventDefault()
      this.isDrawing = true
      const pos = this.getEventPos(e)
      this.lastX = pos.x
      this.lastY = pos.y
    },

    draw(e) {
      if (!this.isDrawing) return
      e.preventDefault()

      const pos = this.getEventPos(e)
      this.ctx.beginPath()
      this.ctx.moveTo(this.lastX, this.lastY)
      this.ctx.lineTo(pos.x, pos.y)
      this.ctx.stroke()

      this.lastX = pos.x
      this.lastY = pos.y
    },

    stopDrawing() {
      this.isDrawing = false
    },

    clearSignature() {
      const canvas = this.$refs.canvas
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.addWatermark()
    },
    async checkUserStatus() {
      try {
        const deviceInfo = await getDeviceIdentity()
        const response = await axios.post(apiUrl('/user-status'), deviceInfo)
        if (response.data.hasSigned) {
          this.$router.push('/signatures')
        }
      } catch (error) {
        console.error('检查用户状态失败:', error)
      }
    },
    async submitSignature() {
      if (!this.signatureName.trim()) {
        this.showMessage('请输入您的姓名', 'error')
        return
      }
      if (!this.roomNumber.trim()) {
        this.showMessage('请输入您的门牌号', 'error')
        return
      }

      const canvas = this.$refs.canvas
      const signatureData = canvas.toDataURL('image/png')
      const signatureTime = new Date().toISOString()

      this.isSubmitting = true

      try {
        // 获取设备标识信息
        const deviceInfo = await getDeviceIdentity()

        const response = await axios.post(apiUrl('/sign'), {
          signature_name: this.signatureName,
          room_number: this.roomNumber,
          signature_data: signatureData,
          signature_time: signatureTime,
          device_uuid: deviceInfo.uuid,
          device_fingerprint: deviceInfo.fingerprint
        })

        this.showMessage(response.data.message, 'success')
        setTimeout(() => {
          this.$router.push('/signatures')
        }, 1500)

      } catch (error) {
        const message = error.response?.data?.error || '签字提交失败，请重试'
        this.showMessage(message, 'error')
        if(message == '该姓名和门牌号已存在'){
          if (error.response.data.user.device_uuid && error.response.data.user.device_fingerprint) {
            const deviceInfo = await getDeviceIdentity(error.response.data.user.device_uuid, error.response.data.user.device_fingerprint)
            this.$router.push('/signatures')
          }
        }
        
      } finally {
        this.isSubmitting = false
      }
    },

    showMessage(text, type) {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = ''
        this.messageType = ''
      }, 3000)
    },

    getCurrentDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()
      return `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日`
    },
  },
  // 监听姓名和门牌号变化，实时刷新画布水印
  watch: {
    signatureName() {
      this.clearSignature()
    },
    roomNumber() {
      this.clearSignature()
    }
  }
}
</script>

<style scoped>
.building-select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 18px;
  background-color: #fff;
  transition: border-color 0.3s;
}

.building-select:focus {
  outline: none;
  border-color: #764ba2;
}
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 100%;
}

.main-content {
  flex: 1;
  padding: 120px 15px 100px 15px;
  width: 100%;
  /* 去掉flex布局，允许内容自适应宽度 */
}

.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.signature-notice {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
}

.signature-notice p {
  color: #856404;
  font-weight: 600;
}

.flash-message {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

.flash-message.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.flash-message.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.signature-container {
  margin: 30px 0;
}

.signature-container label {
  display: block;
  margin-bottom: 15px;
  font-weight: 600;
  color: #333;
}

.signature-pad {
  border: 2px solid #ddd;
  border-radius: 10px;
  background: #fff;
  margin-bottom: 15px;
  overflow: hidden;
}

.signature-pad canvas {
  display: block;
  cursor: crosshair;
}

.signature-controls {
  margin-bottom: 20px;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background: #5a6268;
}

input[type="text"] {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input[type="text"]:focus {
  outline: none;
  border-color: #3498db;
}

button[type="submit"] {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button[type="submit"]:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.signature-container input[type="text"] {
  margin-bottom: 18px;
}

.room-inputs {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 18px;
  gap: 12px;
}

.room-inputs input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(102,126,234,0.08);
}

.room-inputs input:focus {
  outline: none;
  border-color: #764ba2;
  background: #fff;
}

.room-inputs input::-webkit-input-placeholder {
  color: #aaa;
}

.room-inputs input::placeholder {
  color: #aaa;
}

/* 平板设备 */
@media (max-width: 1024px) {
  .container {
    width: 100%;
    max-width: 100%;
    padding: 30px;
  }
}

/* 大屏手机和小平板 */
@media (max-width: 768px) {
  .main-content {
    padding: 100px 10px 80px 10px;
  }

  .container {
    width: 100%;
    max-width: 100%;
    padding: 20px;
    border-radius: 15px;
  }

  .announcement-header h2 {
    font-size: 20px;
  }

  .announcement-section h3 {
    font-size: 16px;
  }

  .requirement-list,
  .plan-list {
    padding: 15px;
  }

  .signature-notice {
    padding: 15px;
  }

  .signature-container {
    margin: 20px 0;
  }

  .signature-pad canvas {
    width: 100%;
    height: auto;
    max-width: 100%;
  }

  input[type="text"] {
    padding: 10px 12px;
    font-size: 14px;
  }

  button[type="submit"] {
    padding: 12px;
    font-size: 16px;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .main-content {
    padding: 80px 5px 70px 5px;
  }

  .container {
    width: 100%;
    max-width: 100%;
    padding: 15px;
    border-radius: 10px;
  }

  .announcement-header h2 {
    font-size: 18px;
    line-height: 1.3;
  }

  .announcement-section h3 {
    font-size: 15px;
    padding-left: 10px;
  }

  .requirement-list,
  .plan-list {
    padding: 10px;
  }

  .signature-notice {
    padding: 10px;
  }

  .signature-container label {
    font-size: 14px;
  }
}

/* 超小屏设备 */
@media (max-width: 320px) {
  .main-content {
    padding: 70px 3px 60px 3px;
  }

  .container {
    width: 100%;
    max-width: 100%;
    padding: 10px;
    border-radius: 8px;
  }

  .announcement-header h2 {
    font-size: 16px;
  }

  .announcement-section h3 {
    font-size: 14px;
    padding-left: 8px;
  }

  .requirement-list,
  .plan-list {
    padding: 8px;
  }

  .signature-notice {
    padding: 8px;
  }
}

h3 {
  color: #2c3e50;
  font-weight: 700;
}
</style>
