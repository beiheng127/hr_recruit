<template>
  <div class="candidate-job-detail" v-loading="loading">
    <div class="detail-inner" v-if="job.id">
      <!-- 返回 + 操作 -->
      <div class="nav-bar">
        <el-button text @click="$router.back()"><el-icon><ArrowLeft /></el-icon> 返回列表</el-button>
        <div class="nav-actions">
          <el-button :icon="Star" text>收藏</el-button>
          <el-button type="primary" size="large" round @click="goApply" :disabled="job.status !== 'PUBLISHED'">
            {{ job.status === 'PUBLISHED' ? '立即投递' : '已停止招聘' }}
          </el-button>
        </div>
      </div>

      <div class="detail-grid">
        <!-- 左侧主内容 -->
        <div class="detail-main">
          <div class="card">
            <div class="job-title-area">
              <h1 class="job-title">{{ job.positionName }}</h1>
              <div class="job-tags">
              <el-tag type="success" v-if="job.status === 'PUBLISHED'">招聘中</el-tag>
              <el-tag type="info" v-else>已关闭</el-tag>
              </div>
            </div>
            <div class="job-meta">
              <span class="meta-item"><el-icon><OfficeBuilding /></el-icon> {{ job.department }}</span>
              <span class="meta-item" v-if="job.location"><el-icon><Location /></el-icon> {{ job.location }}</span>
              <span class="meta-item"><el-icon><User /></el-icon> 招聘{{ job.headcount }}人</span>
              <span class="meta-item" v-if="job.salaryRange"><el-icon><Money /></el-icon> {{ job.salaryRange }}</span>
              <span class="meta-item"><el-icon><Calendar /></el-icon> {{ formatDate(job.createTime) }}发布</span>
            </div>
          </div>

          <div class="card" v-if="job.responsibility">
            <h2 class="section-h2"><el-icon><Briefcase /></el-icon> 岗位职责</h2>
            <div class="section-content" v-html="formatText(job.responsibility)"></div>
          </div>

          <div class="card" v-if="job.requirement">
            <h2 class="section-h2"><el-icon><Tickets /></el-icon> 任职要求</h2>
            <div class="section-content" v-html="formatText(job.requirement)"></div>
          </div>

          <div class="card" v-if="job.jobType">
            <h2 class="section-h2"><el-icon><InfoFilled /></el-icon> 其他信息</h2>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="岗位类型">{{ job.jobType }}</el-descriptions-item>
              <el-descriptions-item label="工作经验">{{ job.experience || '不限' }}</el-descriptions-item>
              <el-descriptions-item label="学历要求">{{ job.education || '不限' }}</el-descriptions-item>
              <el-descriptions-item label="工作地点">{{ job.location || '远程' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <!-- 右侧侧边栏 -->
        <div class="detail-side">
          <div class="card side-card">
            <h3 class="side-title">快速投递</h3>
            <p class="side-desc">符合要求？立即投递简历，开始你的职业新篇章！</p>
            <el-button type="primary" size="large" round style="width:100%" @click="goApply" :disabled="job.status !== 'PUBLISHED'">
              立即投递简历
            </el-button>
            <div class="side-tips">
              <div class="tip-item"><el-icon><Check /></el-icon> 免费投递，无需注册</div>
              <div class="tip-item"><el-icon><Check /></el-icon> 3个工作日内回复</div>
              <div class="tip-item"><el-icon><Check /></el-icon> 个人信息严格保密</div>
            </div>
          </div>

          <div class="card side-card">
            <h3 class="side-title">公司信息</h3>
            <div class="company-info">
              <div class="company-logo">HR</div>
              <div>
                <div class="company-name">HR科技有限公司</div>
                <div class="company-industry">互联网 · 人工智能 · 500-2000人</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!job.id && !loading" class="empty-state">
      <el-empty description="岗位不存在或已下架" />
      <el-button type="primary" @click="$router.push('/candidate/jobs')">浏览其他岗位</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Star, OfficeBuilding, Location, User, Money, Calendar,
  Briefcase, Tickets, InfoFilled, Check } from '@element-plus/icons-vue'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const job = ref({})

async function loadJob() {
  loading.value = true
  try {
    const res = await request.get(`/candidate/jobs/${route.params.id}`)
    job.value = res.data || {}
  } catch (e) {
    console.error(e)
    job.value = {}
  } finally {
    loading.value = false
  }
}

function goApply() {
  router.push(`/candidate/apply/${route.params.id}`)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

function formatText(text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br/>')
}

onMounted(() => {
  loadJob()
})
</script>

<style scoped>
.candidate-job-detail { background: #f8fafc; min-height: calc(100vh - 64px); padding: 24px; }
.detail-inner { max-width: 1200px; margin: 0 auto; }
.nav-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; padding: 0 4px;
}
.nav-actions { display: flex; gap: 12px; align-items: center; }

.detail-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
.card {
  background: #fff; border-radius: 16px; padding: 28px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 20px;
}

.job-title-area { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.job-title { font-size: 26px; font-weight: 800; color: #1e293b; }
.job-meta { display: flex; flex-wrap: wrap; gap: 20px; font-size: 14px; color: #64748b; }
.meta-item { display: flex; align-items: center; gap: 4px; }

.section-h2 {
  font-size: 17px; font-weight: 700; color: #1e293b;
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}
.section-content { font-size: 14px; color: #475569; line-height: 1.8; }

.side-card { position: sticky; top: 84px; }
.side-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
.side-desc { font-size: 13px; color: #94a3b8; margin-bottom: 20px; line-height: 1.6; }
.side-tips { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
.tip-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; }
.tip-item .el-icon { color: #10b981; }

.company-info { display: flex; align-items: center; gap: 12px; }
.company-logo {
  width: 48px; height: 48px; border-radius: 12px;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: #fff; font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}
.company-name { font-size: 14px; font-weight: 600; color: #1e293b; }
.company-industry { font-size: 12px; color: #94a3b8; margin-top: 2px; }

.empty-state { text-align: center; padding: 80px 0; }

@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
  .side-card { position: static; }
}
</style>
