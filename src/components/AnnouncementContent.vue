<template>
  <div class="announcement-content">
    <div class="announcement-header">
      <h2>关于想云湾槿地轩小区北侧门口开放的申请</h2>
      <p class="announcement-date">（{{ currentDate }}）</p>
    </div>
    <div class="announcement-section">
      <h3>致：意境兰庭社区居委会</h3>
      <h3>尊敬的管理方：</h3>
      <p>我们是想云湾槿地轩小区的业主，现就小区门口开放事宜，向贵方提出正式申请，具体如下：</p>
    </div>
    <div class="announcement-section">
      <h3>一、申请事由</h3>
      <p>目前槿地轩小区北侧门（2号楼和3号楼之间）的开放管理方式，在日常出行、物流运输、亲友探访、孩子上下学等方面给业主带来了诸多不便。为提升小区生活便利性，保障业主合理通行权益，特申请开放该门口。</p>
    </div>
    <div class="announcement-section">
      <h3>二、开放建议</h3>
      <div class="requirement-list">
        <div class="requirement-item"><strong>开放时间：</strong>建议全天开放（如若有离得近/低楼层的业主嫌吵闹的话可协商开放时间）；</div>
        <div class="requirement-item"><strong>管理措施：</strong>可配备安保人员值守、安装智能门禁系统、设置监控设备等，确保开放后小区安全不受影响；</div>
        <div class="requirement-item"><strong>其他：</strong>如涉及门口区域改造、设施增设等，业主愿配合协商解决。</div>
      </div>
    </div>
    <div class="announcement-section">
      <h3>三、意见事项</h3>
      <p>恳请管理方对本申请予以研究，明确是否开放及具体实施方案，并将结果公示告知全体业主。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnouncementContent',
  props: {
    currentDate: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.announcement-content {
  margin-bottom: 40px;
}
.announcement-header {
  text-align: center;
  margin-bottom: 30px;
}
.announcement-header h2 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 10px;
}
.announcement-date {
  color: #7f8c8d;
  font-size: 16px;
}
.announcement-section {
  margin-bottom: 25px;
}
.announcement-section h3 {
  color: #34495e;
  font-size: 18px;
  margin-bottom: 15px;
  border-left: 4px solid #3498db;
  padding-left: 15px;
}
.announcement-section p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
  margin-left: 10px;
  margin-right: 10px;

}
.requirement-list {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #e74c3c;
}
.requirement-item {
  margin-bottom: 10px;
  color: #555;
  line-height: 1.5;
}
</style>
