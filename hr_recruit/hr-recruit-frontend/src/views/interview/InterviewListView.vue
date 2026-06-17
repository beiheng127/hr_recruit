<template>
  <div>
    <div class="page-header">
      <h3>面试管理</h3>
      <el-button type="primary" @click="handleCreate">新建面试</el-button>
    </div>
    <div class="filter-bar">
      <el-input v-model="query.candidateName" placeholder="候选人姓名" style="width:160px" clearable @keyup.enter="loadData" />
      <el-select v-model="query.status" placeholder="面试状态" clearable style="width:140px">
        <el-option label="待安排" value="PENDING" />
        <el-option label="已安排" value="SCHEDULED" />
        <el-option label="进行中" value="ONGOING" />
        <el-option label="已完成" value="COMPLETED" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>
    <div class="data-card">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="candidateName" label="候选人" width="100" />
        <el-table-column prop="positionName" label="应聘岗位" width="160" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="interviewTime" label="面试时间" width="160" />
        <el-table-column prop="location" label="地点" width="120" />
        <el-table-column prop="roundNum" label="轮次" width="60" align="center" />
<<<<<<< HEAD
        <el-table-column prop="interviewerNames" label="面试官" width="140" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{row}">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
=======
        <el-table-column prop="interviewerNames" label="面试官" width="120" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{row}">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
          <template #default="{row}">
            <el-button size="small" @click="handleArrange(row)" v-if="row.status==='PENDING' || row.status==='SCHEDULED'">安排</el-button>
            <el-button size="small" type="primary" @click="handleEvaluate(row)" v-if="row.status==='SCHEDULED' || row.status==='ONGOING'">评价</el-button>
            <el-button size="small" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="loadData"
        />
      </div>
    </div>

    <!-- 新建/安排面试弹窗 -->
<<<<<<< HEAD
    <el-dialog v-model="arrangeVisible" :title="isCreate ? '新建面试' : '安排面试'" width="580px" :close-on-click-modal="false" destroy-on-close>
      <el-form ref="arrangeFormRef" :model="arrangeForm" :rules="arrangeRules" label-width="90px">
        <el-form-item label="候选人" prop="resumeId">
          <el-select
            v-if="isCreate"
            v-model="arrangeForm.resumeId"
            filterable
            remote
            reserve-keyword
            placeholder="输入姓名或手机号搜索候选人"
            :remote-method="searchCandidates"
            :loading="candidateLoading"
            style="width:100%"
            clearable
          >
            <el-option
              v-for="item in candidateOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            >
              <span style="float:left">{{ item.name }}</span>
              <span style="float:right;color:#999;font-size:12px">{{ item.phone }}</span>
            </el-option>
          </el-select>
          <span v-else>{{ arrangeForm.candidateName || '-' }}</span>
        </el-form-item>

        <el-form-item label="应聘岗位" prop="jobId">
          <el-select
            v-if="isCreate"
            v-model="arrangeForm.jobId"
            filterable
            remote
            reserve-keyword
            placeholder="输入岗位名称搜索"
            :remote-method="searchPositions"
            :loading="positionLoading"
            style="width:100%"
            clearable
          >
            <el-option
              v-for="item in positionOptions"
              :key="item.id"
              :label="item.positionName"
              :value="item.id"
            >
              <span style="float:left">{{ item.positionName }}</span>
              <span style="float:right;color:#999;font-size:12px">{{ item.department || '' }}</span>
            </el-option>
          </el-select>
          <span v-else>{{ arrangeForm.positionName || '-' }}</span>
        </el-form-item>

        <el-form-item label="面试时间" prop="interviewTime">
          <el-date-picker v-model="arrangeForm.interviewTime" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DDTHH:mm:ss" style="width:100%" />
=======
    <el-dialog v-model="arrangeVisible" :title="isCreate ? '新建面试' : '安排面试'" width="550px" :close-on-click-modal="false">
      <el-form ref="arrangeFormRef" :model="arrangeForm" :rules="arrangeRules" label-width="90px">
        <el-form-item label="候选人" prop="candidateName">
          <el-input v-model="arrangeForm.candidateName" :disabled="!isCreate" placeholder="候选人姓名" />
        </el-form-item>
        <el-form-item label="应聘岗位" prop="positionName">
          <el-input v-model="arrangeForm.positionName" :disabled="!isCreate" placeholder="岗位名称" />
        </el-form-item>
        <el-form-item label="面试时间" prop="interviewTime">
          <el-date-picker v-model="arrangeForm.interviewTime" type="datetime" placeholder="选择时间" style="width:100%" />
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-input v-model="arrangeForm.location" placeholder="会议室/视频链接" />
        </el-form-item>
        <el-form-item label="轮次" prop="roundNum">
<<<<<<< HEAD
          <el-input-number v-model="arrangeForm.roundNum" :min="1" :max="10" style="width:100%" />
        </el-form-item>
        <el-form-item label="面试官">
          <el-select
            v-model="arrangeForm.interviewerIds"
            multiple
            placeholder="选择面试官"
            style="width:100%"
            :loading="interviewerLoading"
          >
            <el-option
              v-for="item in interviewerOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
=======
          <el-input-number v-model="arrangeForm.roundNum" :min="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="面试官">
          <el-select v-model="arrangeForm.interviewerIds" multiple placeholder="选择面试官" style="width:100%">
            <el-option label="张三（HR）" :value="1" />
            <el-option label="李四（技术总监）" :value="2" />
            <el-option label="王五（部门经理）" :value="3" />
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="arrangeVisible=false">取消</el-button>
        <el-button type="primary" :loading="arrangeLoading" @click="submitArrange">确定</el-button>
      </template>
    </el-dialog>

    <!-- 面试评价弹窗 -->
<<<<<<< HEAD
    <el-dialog v-model="evaluateVisible" title="面试评价" width="550px" :close-on-click-modal="false" destroy-on-close>
=======
    <el-dialog v-model="evaluateVisible" title="面试评价" width="550px" :close-on-click-modal="false">
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
      <el-form ref="evaluateFormRef" :model="evaluateForm" :rules="evaluateRules" label-width="90px">
        <el-form-item label="候选人">
          <span>{{ currentCandidateName }}</span>
        </el-form-item>
        <el-form-item label="评分" prop="score">
<<<<<<< HEAD
          <el-rate v-model="evaluateForm.score" :max="5" show-score allow-half />
          <span style="margin-left:8px;color:#909399">{{ (evaluateForm.score * 20).toFixed(0) }}分</span>
        </el-form-item>
        <el-form-item label="评价内容" prop="comments">
          <el-input v-model="evaluateForm.comments" type="textarea" :rows="4" placeholder="请输入面试评价" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-radio-group v-model="evaluateForm.recommend">
            <el-radio value="yes">推荐录用</el-radio>
            <el-radio value="no">不推荐</el-radio>
            <el-radio value="maybe">待定</el-radio>
=======
          <el-rate v-model="evaluateForm.score" :max="5" show-score />
          <span style="margin-left:8px;color:#909399">{{ evaluateForm.score * 20 }}分</span>
        </el-form-item>
        <el-form-item label="评价内容" prop="comments">
          <el-input v-model="evaluateForm.comments" type="textarea" :rows="4" placeholder="请输入面试评价" />
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-radio-group v-model="evaluateForm.recommend">
            <el-radio label="yes">推荐录用</el-radio>
            <el-radio label="no">不推荐</el-radio>
            <el-radio label="maybe">待定</el-radio>
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateVisible=false">取消</el-button>
        <el-button type="primary" :loading="evaluateLoading" @click="submitEvaluate">提交评价</el-button>
      </template>
    </el-dialog>
<<<<<<< HEAD

    <!-- 面试详情弹窗 -->
    <el-dialog v-model="detailVisible" title="面试详情" width="600px" destroy-on-close>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="面试ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(detail.status)" size="small">{{ statusText(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="候选人">{{ detail.candidateName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.candidatePhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="应聘岗位">{{ detail.positionName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ detail.department || '-' }}</el-descriptions-item>
        <el-descriptions-item label="面试时间">{{ detail.interviewTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="面试地点">{{ detail.location || '-' }}</el-descriptions-item>
        <el-descriptions-item label="轮次">{{ detail.roundNum || '-' }}</el-descriptions-item>
        <el-descriptions-item label="面试官">{{ detail.interviewerNames || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime || '-' }} :span="2"></el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
<<<<<<< HEAD
import {
  getInterviewList,
  arrangeInterview,
  updateInterview,
  submitEvaluation,
  getInterviewerList,
  searchCandidates as apiSearchCandidates
} from '@/api/interview'
import { getJobList } from '@/api/job'

// ==================== 列表数据 ====================
=======
import { getInterviewList, arrangeInterview, updateInterview, submitEvaluation } from '@/api/interview'

>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
const loading = ref(false)
const query = ref({ candidateName: '', status: '' })
const tableData = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

<<<<<<< HEAD
// ==================== 新建/安排面试 ====================
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
const arrangeVisible = ref(false)
const arrangeLoading = ref(false)
const isCreate = ref(false)
const arrangeFormRef = ref(null)
<<<<<<< HEAD

const arrangeForm = ref({
  resumeId: null,
  jobId: null,
=======
const arrangeForm = ref({
  id: null,
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  candidateName: '',
  positionName: '',
  interviewTime: null,
  location: '',
  roundNum: 1,
  interviewerIds: []
})

const arrangeRules = {
<<<<<<< HEAD
  resumeId: [{ required: true, message: '请搜索并选择候选人', trigger: 'change' }],
  jobId: [{ required: true, message: '请搜索并选择应聘岗位', trigger: 'change' }],
  interviewTime: [{ required: true, message: '请选择面试时间', trigger: 'change' }]
}

// 候选人远程搜索
const candidateLoading = ref(false)
const candidateOptions = ref([])
async function searchCandidates(queryStr) {
  if (!queryStr || queryStr.length < 1) return
  candidateLoading.value = true
  try {
    const res = await apiSearchCandidates(queryStr)
    candidateOptions.value = res.data || []
  } catch (e) {
    candidateOptions.value = []
  } finally {
    candidateLoading.value = false
  }
}

// 岗位远程搜索
const positionLoading = ref(false)
const positionOptions = ref([])
async function searchPositions(queryStr) {
  if (!queryStr || queryStr.length < 1) return
  positionLoading.value = true
  try {
    const res = await getJobList({ pageNum: 1, pageSize: 30, positionName: queryStr })
    const data = res.data || {}
    positionOptions.value = data.records || []
  } catch (e) {
    positionOptions.value = []
  } finally {
    positionLoading.value = false
  }
}

// 面试官列表（动态加载）
const interviewerLoading = ref(false)
const interviewerOptions = ref([])
async function loadInterviewers() {
  interviewerLoading.value = true
  try {
    const res = await getInterviewerList()
    interviewerOptions.value = res.data || []
  } catch (e) {
    console.error('加载面试官失败', e)
  } finally {
    interviewerLoading.value = false
  }
}

// ==================== 面试评价 ====================
=======
  candidateName: [{ required: true, message: '请输入候选人姓名', trigger: 'blur' }],
  positionName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  interviewTime: [{ required: true, message: '请选择面试时间', trigger: 'change' }]
}

>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
const evaluateVisible = ref(false)
const evaluateLoading = ref(false)
const evaluateFormRef = ref(null)
const currentInterviewId = ref(null)
const currentCandidateName = ref('')
const evaluateForm = ref({ score: 0, comments: '', recommend: 'maybe' })

const evaluateRules = {
  score: [{ required: true, message: '请评分', trigger: 'change' }],
  comments: [{ required: true, message: '请输入评价内容', trigger: 'blur' }]
}

<<<<<<< HEAD
// ==================== 详情查看 ====================
const detailVisible = ref(false)
const detail = ref({})

// ==================== 状态映射 ====================
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
function statusType(s) {
  return { PENDING: 'info', SCHEDULED: '', ONGOING: 'warning', COMPLETED: 'success' }[s] || 'info'
}
function statusText(s) {
  return { PENDING: '待安排', SCHEDULED: '已安排', ONGOING: '进行中', COMPLETED: '已完成' }[s] || s
}

<<<<<<< HEAD
// ==================== 数据加载 ====================
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
async function loadData() {
  loading.value = true
  try {
    const res = await getInterviewList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      status: query.value.status || undefined,
      candidateName: query.value.candidateName || undefined
    })
    const data = res.data || {}
    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (e) {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

<<<<<<< HEAD
// ==================== 操作方法 ====================
function handleCreate() {
  isCreate.value = true
  arrangeForm.value = {
    resumeId: null, jobId: null, candidateName: '', positionName: '',
    interviewTime: null, location: '', roundNum: 1, interviewerIds: []
  }
  candidateOptions.value = []
  positionOptions.value = []
  // 加载面试官选项
  loadInterviewers()
=======
function handleCreate() {
  isCreate.value = true
  arrangeForm.value = { id: null, candidateName: '', positionName: '', interviewTime: null, location: '', roundNum: 1, interviewerIds: [] }
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  arrangeVisible.value = true
}

function handleArrange(row) {
  isCreate.value = false
  currentInterviewId.value = row.id
  arrangeForm.value = {
    id: row.id,
<<<<<<< HEAD
    resumeId: null,
    jobId: null,
    candidateName: row.candidateName || '',
    positionName: row.positionName || '',
    interviewTime: row.interviewTime || null,
=======
    candidateName: row.candidateName || '',
    positionName: row.positionName || '',
    interviewTime: row.interviewTime ? new Date(row.interviewTime) : null,
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
    location: row.location || '',
    roundNum: row.roundNum || 1,
    interviewerIds: []
  }
<<<<<<< HEAD
  loadInterviewers()
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  arrangeVisible.value = true
}

async function submitArrange() {
  await arrangeFormRef.value.validate()
  arrangeLoading.value = true
  try {
    if (isCreate.value) {
<<<<<<< HEAD
      // 新建：发送 resumeId + jobId，后端自动构建关联链路
      const payload = {
        resumeId: arrangeForm.value.resumeId,
        jobId: arrangeForm.value.jobId,
        interviewTime: arrangeForm.value.interviewTime,
        location: arrangeForm.value.location,
        roundNum: arrangeForm.value.roundNum,
        interviewerIds: arrangeForm.value.interviewerIds
      }
      await arrangeInterview(payload)
      ElMessage.success('面试创建成功')
    } else {
      // 安排/更新：只发送可编辑字段
      const payload = {
=======
      await arrangeInterview(arrangeForm.value)
      ElMessage.success('面试创建成功')
    } else {
      await updateInterview(currentInterviewId.value, {
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
        interviewTime: arrangeForm.value.interviewTime,
        location: arrangeForm.value.location,
        roundNum: arrangeForm.value.roundNum,
        status: 'SCHEDULED',
        interviewerIds: arrangeForm.value.interviewerIds
<<<<<<< HEAD
      }
      await updateInterview(currentInterviewId.value, payload)
=======
      })
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
      ElMessage.success('面试安排成功')
    }
    arrangeVisible.value = false
    loadData()
  } catch (e) {
<<<<<<< HEAD
    const msg = e?.response?.data?.message || e?.message || ''
    ElMessage.error(isCreate.value ? `创建失败: ${msg}` : `安排失败: ${msg}`)
=======
    ElMessage.error(isCreate.value ? '创建失败' : '安排失败')
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  } finally {
    arrangeLoading.value = false
  }
}

function handleEvaluate(row) {
  currentInterviewId.value = row.id
  currentCandidateName.value = row.candidateName || ''
  evaluateForm.value = { score: 0, comments: '', recommend: 'maybe' }
  evaluateVisible.value = true
}

async function submitEvaluate() {
  await evaluateFormRef.value.validate()
  evaluateLoading.value = true
  try {
    await submitEvaluation(currentInterviewId.value, {
<<<<<<< HEAD
      score: Math.round(evaluateForm.value.score * 20),
=======
      score: evaluateForm.value.score * 20,
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
      comments: evaluateForm.value.comments,
      recommend: evaluateForm.value.recommend
    })
    ElMessage.success('评价提交成功')
    evaluateVisible.value = false
    loadData()
  } catch (e) {
<<<<<<< HEAD
    const msg = e?.response?.data?.message || e?.message || ''
    ElMessage.error(`提交失败: ${msg}`)
=======
    ElMessage.error('提交失败')
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  } finally {
    evaluateLoading.value = false
  }
}

function handleView(row) {
<<<<<<< HEAD
  detail.value = { ...row }
  detailVisible.value = true
=======
  ElMessage.info(`查看面试详情：ID=${row.id}`)
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
}

onMounted(loadData)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.filter-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.data-card { background: #fff; padding: 16px; border-radius: 8px; }
.pagination-bar { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
