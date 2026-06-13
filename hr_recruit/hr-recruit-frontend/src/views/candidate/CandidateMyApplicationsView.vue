<template>
  <div class="candidate-my">
    <div class="my-inner">
      <div class="page-header">
        <h1 class="page-title"><el-icon><List /></el-icon> 我的申请</h1>
        <p class="page-desc">查看你的所有投递记录与进展</p>
      </div>

      <!-- 查询输入 -->
      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="请输入投递时使用的邮箱或手机号" clearable style="width:360px" @keyup.enter="loadApplications">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="loadApplications" :loading="loading">查询申请记录</el-button>
      </div>

      <!-- 状态筛选 -->
      <div class="filter-bar" v-if="applications.length > 0">
        <el-radio-group v-model="filterStatus" @change="loadApplications">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="PENDING">待处理</el-radio-button>
          <el-radio-button label="REVIEWING">简历筛选中</el-radio-button>
          <el-radio-button label="INTERVIEW">面试中</el-radio-button>
          <el-radio-button label="OFFER">Offer</el-radio-button>
          <el-radio-button label="REJECTED">已拒绝</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 申请列表 -->
      <div class="app-list" v-loading="loading">
        <div class="app-card" v-for="app in applications" :key="app.id">
          <div class="app-header">
            <div class="app-job-info">
              <h3 class="app-job-name" @click="viewJob(app.jobId)">{{ app.jobName }}</h3>
              <span class="app-dept">{{ app.department }}</span>
            </div>
            <el-tag :type="statusType(app.status)" size="large">{{ statusText(app.status) }}</el-tag>
          </div>
          <div class="app-body">
            <div class="app-meta">
              <span class="meta-item"><el-icon><Clock /></el-icon> 投递时间：{{ formatDate(app.applyTime) }}</span>
              <span class="meta-item" v-if="app.interviewTime"><el-icon><Calendar /></el-icon> 面试时间：{{ formatDate(app.interviewTime) }}</span>
            </div>
            <div class="app-progress">
              <el-steps :active="progressActive(app.status)" finish-status="success" size="small">
                <el-step title="已投递" />
                <el-step title="简历筛选" />
                <el-step title="面试" />
                <el-step title="Offer" />
              </el-steps>
            </div>
          </div>
          <div class="app-footer" v-if="app.status === 'OFFER'">
            <el-button type="primary" @click="viewOffer(app)">查看Offer</el-button>
          </div>

          <!-- Offer 详情弹窗 -->
          <el-dialog v-model="offerVisible" title="Offer 详情" width="600px" :close-on-click-modal="false">
            <div v-if="offerData" class="offer-detail">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="岗位名称">{{ offerData.jobName || '-' }}</el-descriptions-item>
                <el-descriptions-item label="部门">{{ offerData.department || '-' }}</el-descriptions-item>
                <el-descriptions-item label="薪资">{{ offerData.salary || '-' }}</el-descriptions-item>
                <el-descriptions-item label="入职时间">{{ offerData.onboardTime ? formatDate(offerData.onboardTime) : '-' }}</el-descriptions-item>
                <el-descriptions-item label="Offer状态">
                  <el-tag :type="offerStatusType(offerData.status)">{{ offerStatusText(offerData.status) }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="福利待遇">
                  <div style="white-space:pre-wrap">{{ offerData.benefits || '无' }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="备注说明">
                  <div style="white-space:pre-wrap">{{ offerData.remark || '无' }}</div>
                </el-descriptions-item>
              </el-descriptions>
              <div style="margin-top:16px;padding:12px;background:#f0f9eb;border-radius:6px">
                <p style="color:#67c23a;font-weight:500;margin:0 0 8px 0">✅ 恭喜你获得Offer！</p>
                <p style="color:#606266;font-size:13px;margin:0">请在收到Offer后尽快确认是否接受，如有疑问请联系HR。</p>
              </div>
            </div>
            <div v-else style="text-align:center;padding:40px 0;color:#909399">
              <el-icon :size="32"><Loading /></el-icon>
              <p>加载中...</p>
            </div>
            <template #footer>
              <el-button @click="offerVisible = false">关闭</el-button>
              <el-button type="primary" v-if="offerData">确认接受</el-button>
            </template>
          </el-dialog>
        </div>

        <el-empty v-if="applications.length === 0 && !loading" description="暂无申请记录，快去投递吧！">
          <el-button type="primary" @click="$router.push('/candidate/jobs')">浏览岗位</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { List, Clock, Calendar, Search, Loading } from '@element-plus/icons-vue'
import request from '@/api/request'
import { getOfferDetail } from '@/api/offer'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const filterStatus = ref('')
const applications = ref([])
const searchKeyword = ref('')

const offerVisible = ref(false)
const offerData = ref(null)

async function loadApplications() {
  if (!searchKeyword.value || searchKeyword.value.trim() === '') {
    ElMessage.warning('请输入邮箱或手机号')
    return
  }
  loading.value = true
  try {
    const res = await request.get('/candidate/applications', {
      params: { keyword: searchKeyword.value.trim() }
    })
    let data = res.data || []
    if (filterStatus.value) {
      data = data.filter(a => a.status === filterStatus.value)
    }
    applications.value = data
  } catch (e) {
    ElMessage.error('查询失败，请确认邮箱或手机号是否正确')
    applications.value = []
  } finally {
    loading.value = false
  }
}

function statusType(status) {
  const map = { PENDING: 'info', REVIEWING: 'warning', INTERVIEW: 'primary', OFFER: 'success', REJECTED: 'danger', HIRED: 'success' }
  return map[status] || 'info'
}

function statusText(status) {
  const map = { PENDING: '待处理', REVIEWING: '简历筛选中', INTERVIEW: '面试中', OFFER: '待确认Offer', REJECTED: '未通过', HIRED: '已入职' }
  return map[status] || status
}

function offerStatusType(status) {
  const map = { DRAFT: 'info', PENDING: 'warning', SENT: 'primary', ACCEPTED: 'success', REJECTED: 'danger' }
  return map[status] || 'info'
}

function offerStatusText(status) {
  const map = { DRAFT: '草稿', PENDING: '待确认', SENT: '已发送', ACCEPTED: '已接受', REJECTED: '已拒绝' }
  return map[status] || status
}

function progressActive(status) {
  const map = { PENDING: 0, REVIEWING: 1, INTERVIEW: 2, OFFER: 3, HIRED: 4 }
  return (map[status] || 0) + 1
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return dateStr.slice(0, 16).replace('T', ' ')
}

function viewJob(jobId) {
  router.push(`/candidate/jobs/${jobId}`)
}

async function viewOffer(app) {
  offerVisible.value = true
  offerData.value = null
  try {
    // 根据 app 对象中的 offerId 或 applicantJobId 查询 Offer
    const offerId = app.offerId || app.id
    const res = await getOfferDetail(offerId)
    offerData.value = res.data || {}
  } catch (e) {
    ElMessage.error('获取Offer详情失败')
    offerVisible.value = false
  }
}

onMounted(() => {
  // 如果URL中有keyword参数，自动查询
  const params = new URLSearchParams(window.location.search)
  const kw = params.get('keyword')
  if (kw) {
    searchKeyword.value = kw
    loadApplications()
  }
})
</script>

<style scoped>
.candidate-my { background: #f8fafc; min-height: calc(100vh - 64px); padding: 40px 24px; }
.my-inner { max-width: 900px; margin: 0 auto; }

.page-header { margin-bottom: 28px; }
.page-title { font-size: 26px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.page-desc { font-size: 14px; color: #94a3b8; }

.filter-bar {
  background: #fff; border-radius: 12px; padding: 16px 20px;
  margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.app-list { display: flex; flex-direction: column; gap: 16px; }
.app-card {
  background: #fff; border-radius: 14px; padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); transition: all 0.2s;
}
.app-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

.app-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.app-job-name { font-size: 17px; font-weight: 700; color: #1e293b; cursor: pointer; }
.app-job-name:hover { color: #3b82f6; }
.app-dept { font-size: 12px; color: #94a3b8; margin-top: 2px; }

.app-meta { display: flex; gap: 24px; font-size: 13px; color: #64748b; margin-bottom: 16px; }
.meta-item { display: flex; align-items: center; gap: 4px; }

.app-progress { margin-top: 8px; }
.app-footer { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
