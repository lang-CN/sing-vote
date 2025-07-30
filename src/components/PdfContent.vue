<template>
    <div id="pdf-content" class="container">
        <!-- 公告内容显示 -->
        <AnnouncementContent :currentDate="currentDate" />
        <!-- 导出PDF的内容区域加id -->
        <div>
            <div v-if="statistics" class="pdf-statistics">
                <div class="pdf-stats-grid">
                    <div class="pdf-stat-item">
                        <div class="pdf-stat-number">{{ statistics.total_signatures }}</div>
                        <div class="pdf-stat-label">已签字人数</div>
                    </div>
                </div>
                <div class="pdf-progress-bar" style="display: none;">
                    <div class="pdf-progress-fill" :style="{ width: statistics.progress + '%' }"></div>
                </div>
            </div>
            <div class="pdf-signatures-header">
                <h2>所有签字记录</h2>
                <p class="pdf-subtitle">以下是所有已签字人员的信息列表</p>
            </div>
            <div v-if="loading" class="pdf-loading">
                <p>加载中...</p>
            </div>
            <div v-else-if="signatures.length > 0">
                <div class="pdf-signatures-image-grid">
                    <div v-for="(group, groupIdx) in signatureGroups" :key="'group-' + groupIdx"
                        class="pdf-signature-group">
                        <div v-for="signature in group" :key="signature.id" class="pdf-signature-image-flex">
                            <img v-if="signature.signature_image && signature.signature_image.length > 50"
                                :src="'data:image/png;base64,' + signature.signature_image" alt="签名图片"
                                class="pdf-signature-image" />
                            <span v-else class="pdf-no-signature-image">无签名图片</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 没有数据时显示 -->
            <div v-else class="pdf-no-signatures">
                <div class="pdf-empty-state">
                    <div class="pdf-empty-icon">📋</div>
                    <h3>暂无签字记录</h3>
                    <p>目前还没有任何签字记录，快去邀请大家签字吧！</p>
                    <button class="pdf-btn-primary" @click="goToAnnouncement">返回公告</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AnnouncementContent from './AnnouncementContent.vue'
export default {
    name: 'PdfContent',
    components: { AnnouncementContent },
    props: {
        statistics: Object,
        signatures: Array,
        loading: Boolean,
        currentDate: String,
        paginatedSignatures: Array,
        formatDate: Function,
        goToAnnouncement: Function
    },
    computed: {
        signatureGroups() {
            // 每3个分一组
            const groups = [];
            for (let i = 0; i < this.paginatedSignatures.length; i += 3) {
                groups.push(this.paginatedSignatures.slice(i, i + 3));
            }
            return groups;
        }
    }
}
</script>

<style scoped>
/* PDF专用样式，全部加 pdf- 前缀 */
#pdf-content {
    width: 774px;
    min-height: 1123px;
    max-width: 794px;
    max-height: none;
    margin: 0 auto;
    background: #fff;
    box-sizing: border-box;
    padding: 20px 5px;
    overflow: visible;
}

#pdf-content.pdf-container {
    max-width: none;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
}

.pdf-signatures-header {
    text-align: center;
    margin-bottom: 40px;
}

.pdf-signatures-header h2 {
    color: #2c3e50;
    font-size: 28px;
    margin-bottom: 10px;
}

.pdf-subtitle {
    color: #7f8c8d;
    font-size: 16px;
}

.pdf-loading {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 18px;
}

.pdf-signatures-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.pdf-signature-row-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border-bottom: 1px solid #eee;
    padding: 18px 0 18px 0;
    margin-bottom: 0;
    flex-wrap: wrap;
    margin-left: 10px;
    margin-right: 10px;
}

.pdf-signatures-image-grid {
    display: flex;
    flex-direction: column;
    /* gap: 18px; */
    margin-bottom: 30px;
}

.pdf-signature-group {
    display: flex;
    flex-direction: row;
    /* gap: 12px; */
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

@media print {
    .pdf-signature-group {
        display: block !important; /* 关键：打印时用block布局，保证分页控制生效 */
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
}

.pdf-signature-image-flex {
    display: flex;
    align-items: center;
    justify-content: center;
    /* min-height: 140px; */
    min-width: 0;
    /* background: #fafbfc; */
    border-radius: 8px;
    /* border: 1px solid #e9ecef; */
    /* padding: 12px; */
}

.pdf-signature-image {
    max-width: 100%;
    max-height: 85px;
    display: block;
    margin: 0 auto;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    background: #fff;
}

.pdf-no-signature-image {
    color: #bbb;
    font-size: 14px;
    font-style: italic;
}

.pdf-no-signatures {
    text-align: center;
    padding: 60px 20px;
}

.pdf-empty-state {
    max-width: 400px;
    margin: 0 auto;
}

.pdf-empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
}

.pdf-empty-state h3 {
    color: #2c3e50;
    font-size: 24px;
    margin-bottom: 15px;
}

.pdf-empty-state p {
    color: #7f8c8d;
    font-size: 16px;
    margin-bottom: 30px;
}

.pdf-statistics {
    border-top: 2px solid #eee;
    padding-top: 30px;
    margin-top: 40px;
}

.pdf-statistics h3 {
    color: #2c3e50;
    margin-bottom: 25px;
    text-align: center;
    font-size: 22px;
}

.pdf-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}

.pdf-stat-item {
    text-align: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.pdf-stat-number {
    font-size: 32px;
    font-weight: 700;
    color: #3498db;
    margin-bottom: 8px;
}

.pdf-stat-label {
    color: #666;
    font-size: 14px;
    font-weight: 500;
}

.pdf-progress-bar {
    background: #e9ecef;
    height: 12px;
    border-radius: 6px;
    overflow: hidden;
}

.pdf-progress-fill {
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: width 0.5s ease;
}

.pdf-btn-primary {
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

.pdf-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
</style>
