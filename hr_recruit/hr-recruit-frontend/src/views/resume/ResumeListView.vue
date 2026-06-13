<template>
  <div class="resume-list-view">
    <div class="filter-bar">
      <el-input v-model="filters.keyword" placeholder="姓名搜索" clearable style="width:180px" @keyup.enter="handleSearch" />
      <el-input v-model="filters.skills" placeholder="技能标签搜索" clearable style="width:200px" @keyup.enter="handleSearch" />
      <el-select v-model="filters.talentStatus" placeholder="人才库状态" clearable style="width:160px">
        <el-option label="待处理" value="PENDING" />
        <el-option label="人才库" value="TALENT" />
        <el-option label="面试中" value="INTERVIEW" />
        <el-option label="已录用" value="HIRED" />
        <el-option label="黑名单" value="BLACKLIST" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-upload
        :action="uploadUrl"
        :headers="uploadHeaders"
        accept=".pdf,.docx"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :on-success="onUploadSuccess"
        :on-error="onUploadError"
        :on-progress="onUploadProgress"
      >
        <el-button type="success" :loading="uploading">上传简历</el-button>
      </el-upload>
    </div>

    <!-- 上传进度/结果提示 -->
    <div v-if="uploading || lastUploadFile" class="upload-status-bar">
      <template v-if="uploading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在上传 {{ uploadingFileName }}...</span>
      </template>
      <template v-else-if="lastUploadFile">
        <el-icon color="#67c23a"><CircleCheck /></el-icon>
        <span>最近上传：<b>{{ lastUploadFile }}</b></span>
        <el-button link type="primary" size="small" @click="scrollToLastUploaded">查看</el-button>
      </template>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe style="margin-top:12px">
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column label="简历文件" width="140" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.fileName"
            link type="primary" size="small"
            @click="handleDetail(row); setTimeout(() => openPdfPreview(), 300)"
          >
            <el-icon><Document /></el-icon> {{ row.fileName.length > 10 ? row.fileName.slice(0, 8) + '...' : row.fileName }}
          </el-button>
          <span v-else style="color:#c0c4cc">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="educationLevel" label="学历" width="90" />
      <el-table-column prop="workYears" label="工作年限" width="100" align="center">
        <template #default="{ row }">
          {{ row.workYears != null ? row.workYears + '年' : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="skillTags" label="技能标签" min-width="150">
        <template #default="{ row }">
          <el-tag v-for="s in formatSkills(row.skillTags)" :key="s" size="small" style="margin:2px">{{ s }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="AI匹配分数" width="120" align="center">
        <template #default="{ row }">
          <el-progress :percentage="row.matchScore || 0" :color="scoreColor(row.matchScore)" :stroke-width="8" />
        </template>
      </el-table-column>
      <el-table-column prop="talentPoolStatus" label="人才库状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="talentStatusType(row.talentPoolStatus)" size="small">{{ talentStatusLabel(row.talentPoolStatus || 'NORMAL') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleDetail(row)">查看</el-button>
          <el-button link type="success" @click="handleParse(row)">AI解析</el-button>
          <el-button link type="warning" @click="handleEdit(row)">编辑</el-button>
          <el-dropdown @command="(cmd) => handleTalentAction(row, cmd)" style="margin-left:4px">
            <el-button link type="info">更多<el-icon><ArrowDown /></el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="TALENT">移至人才库</el-dropdown-item>
                <el-dropdown-item command="INTERVIEW">移至面试中</el-dropdown-item>
                <el-dropdown-item command="HIRED">移至已录用</el-dropdown-item>
                <el-dropdown-item command="BLACKLIST">移至黑名单</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
        @change="fetchData"
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" title="编辑简历" width="680px" :close-on-click-modal="false">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name"><el-input v-model="editForm.name" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone"><el-input v-model="editForm.phone" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email"><el-input v-model="editForm.email" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="editForm.gender" style="width:100%" clearable>
                <el-option label="男" value="男" /><el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学历" prop="educationLevel">
              <el-select v-model="editForm.educationLevel" style="width:100%" clearable>
                <el-option label="大专" value="大专" /><el-option label="本科" value="本科" />
                <el-option label="硕士" value="硕士" /><el-option label="博士" value="博士" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作年限" prop="workYears">
              <el-input-number v-model="editForm.workYears" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学校"><el-input v-model="editForm.schoolName" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业"><el-input v-model="editForm.major" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="当前公司"><el-input v-model="editForm.currentCompany" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前职位"><el-input v-model="editForm.currentPosition" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="技能标签" prop="skillTags">
          <el-select v-model="editForm.skillTags" multiple filterable allow-create default-first-option style="width:100%" placeholder="输入技能标签后回车"></el-select>
        </el-form-item>
        <el-form-item label="自我评价">
          <el-input v-model="editForm.selfEvaluation" type="textarea" :rows="3" placeholder="请输入自我评价" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情+预览弹窗 -->
    <el-dialog v-model="detailVisible" title="简历详情" width="920px" :close-on-click-modal="false" top="4vh">
      <div v-if="detailData" class="resume-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detailData.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ detailData.gender || '-' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ detailData.age != null ? detailData.age + '岁' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="学历">{{ detailData.educationLevel || '-' }}</el-descriptions-item>
          <el-descriptions-item label="学校">{{ detailData.schoolName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ detailData.major || '-' }}</el-descriptions-item>
          <el-descriptions-item label="当前公司">{{ detailData.currentCompany || '-' }}</el-descriptions-item>
          <el-descriptions-item label="当前职位">{{ detailData.currentPosition || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作年限">{{ detailData.workYears != null ? detailData.workYears + '年' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="人才库状态">
            <el-tag :type="talentStatusType(detailData.talentPoolStatus)">{{ talentStatusLabel(detailData.talentPoolStatus || 'NORMAL') }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="detailData.skillTags" style="margin-top:14px">
          <span style="color:#909399;font-size:13px">技能标签：</span>
          <el-tag v-for="s in formatSkills(detailData.skillTags)" :key="s" size="small" style="margin:2px">{{ s }}</el-tag>
        </div>
        <div v-if="detailData.selfEvaluation" style="margin-top:14px">
          <span style="color:#909399;font-size:13px">自我评价：</span>
          <p style="margin:6px 0;line-height:1.6;color:#303133">{{ detailData.selfEvaluation }}</p>
        </div>

        <!-- PDF 预览区域 -->
        <div class="pdf-section">
          <div class="pdf-toolbar">
            <span class="pdf-label">
              <el-icon><Document /></el-icon>
              {{ detailData.fileName ? detailData.fileName : '暂无附件' }}
            </span>
            <div v-if="detailData.fileName">
              <el-button type="primary" size="small" @click="openPdfPreview" :loading="pdfLoading">
                {{ pdfVisible ? '隐藏预览' : '预览PDF' }}
              </el-button>
              <el-button size="small" @click="downloadPdf">下载PDF</el-button>
            </div>
            <span v-else style="color:#c0c4cc;font-size:13px">该简历未上传附件文件</span>
          </div>
          <!-- PDF iframe 预览 -->
          <div v-if="pdfVisible && pdfUrl" class="pdf-preview-box">
            <iframe :src="pdfUrl" width="100%" height="520px" style="border:1px solid #e4e7ed;border-radius:6px;background:#fff"></iframe>
          </div>
          <!-- 加载中 -->
          <div v-else-if="pdfLoading" class="pdf-preview-box pdf-loading">
            <el-icon class="is-loading" :size="32" color="#409eff"><Loading /></el-icon>
            <p style="margin-top:10px;color:#909399">正在加载 PDF...</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown, Loading, CircleCheck, Document } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getResumeList, getResumeDetail, uploadResume, parseResume, updateResume, updateTalentStatus } from '@/api/resume'

const userStore = useUserStore()
const loading = ref(false)
const editLoading = ref(false)
const editVisible = ref(false)
const editFormRef = ref(null)
const tableData = ref([])

const detailVisible = ref(false)
const detailData = ref({})
const pdfVisible = ref(false)
const pdfUrl = ref('')
const pdfLoading = ref(false)

// 上传状态
const uploading = ref(false)
const uploadingFileName = ref('')
const lastUploadFile = ref('')
const lastUploadedId = ref(null)

const uploadUrl = '/api/resumes/upload'
const uploadHeaders = { Authorization: `Bearer ${userStore.token}` }

const filters = reactive({ keyword: '', skills: '', talentStatus: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const editForm = reactive({
  id: null,
  name: '',
  phone: '',
  email: '',
  gender: '',
  educationLevel: '',
  workYears: 0,
  schoolName: '',
  major: '',
  currentCompany: '',
  currentPosition: '',
  skillTags: [],
  selfEvaluation: ''
})

const editRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

function scoreColor(score) {
  if (!score) return '#909399'
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

function formatSkills(skillTags) {
  if (!skillTags) return []
  if (Array.isArray(skillTags)) return skillTags
  return skillTags.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
}

function talentStatusType(status) {
  const map = { PENDING: 'info', TALENT: 'success', INTERVIEW: 'warning', HIRED: 'primary', BLACKLIST: 'danger', NORMAL: 'info' }
  return map[status] || 'info'
}

function talentStatusLabel(status) {
  const map = { PENDING: '待处理', TALENT: '人才库', INTERVIEW: '面试中', HIRED: '已录用', BLACKLIST: '黑名单', NORMAL: '正常' }
  return map[status] || status
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getResumeList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      skillTags: filters.skills || undefined,
      talentPoolStatus: filters.talentStatus || undefined
    })
    const data = res.data || {}
    tableData.value = data.records || data.list || []
    pagination.total = data.total || 0
  } catch (error) {
    console.error('查询简历失败:', error)
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

function beforeUpload(file) {
  const valid = file.type === 'application/pdf' ||
    file.name.endsWith('.pdf') ||
    file.name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (!valid) {
    ElMessage.error('仅支持 PDF 和 DOCX 格式')
    return false
  }
  uploadingFileName.value = file.name
  return true
}

function onUploadProgress() {
  uploading.value = true
}

function onUploadSuccess(response) {
  uploading.value = false
  const fname = uploadingFileName.value || '未知文件'
  if (response && response.code === 200) {
    ElMessage.success(`✅ "${fname}" 上传成功`)
    lastUploadFile.value = fname
    if (response.data) {
      lastUploadedId.value = response.data
    }
    // 自动解析
    parseResume(response.data).then(() => {
      ElMessage.info('简历 AI 解析完成')
      fetchData()
    }).catch(() => {
      ElMessage.warning('AI 解析失败，可手动点击解析')
      fetchData()
    })
  } else {
    ElMessage.error(response?.message || '上传失败')
  }
}

function onUploadError() {
  uploading.value = false
  ElMessage.error('上传失败，请重试')
}

function scrollToLastUploaded() {
  fetchData().then(() => {
    if (lastUploadedId.value) {
      const row = tableData.value.find(r => r.id === lastUploadedId.value)
      if (row) handleDetail(row)
    }
  })
}

function handleDetail(row) {
  // 先获取完整详情（包含 fileName）
  getResumeDetail(row.id).then(res => {
    detailData.value = res.data || { ...row }
  }).catch(() => {
    detailData.value = { ...row }
  })
  detailVisible.value = true
  pdfVisible.value = false
  pdfUrl.value = ''
  pdfLoading.value = false
}

function openPdfPreview() {
  if (!detailData.value.fileName) {
    ElMessage.warning('该简历没有上传附件')
    return
  }
  pdfLoading.value = true
  pdfVisible.value = false
  const token = userStore.token
  fetch(`/api/resumes/${detailData.value.id}/file`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => {
    if (!res.ok) throw new Error('下载失败')
    return res.blob()
  }).then(blob => {
    if (blob.size === 0) throw new Error('文件为空')
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
    pdfUrl.value = URL.createObjectURL(blob)
    pdfVisible.value = true
  }).catch(err => {
    console.error('PDF预览失败:', err)
    ElMessage.error('无法加载 PDF 文件')
  }).finally(() => {
    pdfLoading.value = false
  })
}

function downloadPdf() {
  const token = userStore.token
  fetch(`/api/resumes/${detailData.value.id}/file`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.blob())
  .then(blob => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (detailData.value.fileName || detailData.value.name || 'resume') + '.pdf'
    a.click()
    URL.revokeObjectURL(a.href)
  })
}

async function handleParse(row) {
  try {
    await parseResume(row.id)
    ElMessage.success('AI 解析完成')
    fetchData()
  } catch { /* handled */ }
}

function handleEdit(row) {
  editForm.id = row.id
  editForm.name = row.name || ''
  editForm.phone = row.phone || ''
  editForm.email = row.email || ''
  editForm.gender = row.gender || ''
  editForm.educationLevel = row.educationLevel || ''
  editForm.workYears = row.workYears || 0
  editForm.schoolName = row.schoolName || ''
  editForm.major = row.major || ''
  editForm.currentCompany = row.currentCompany || ''
  editForm.currentPosition = row.currentPosition || ''
  editForm.skillTags = formatSkills(row.skillTags)
  editForm.selfEvaluation = row.selfEvaluation || ''
  editVisible.value = true
}

async function handleEditSubmit() {
  await editFormRef.value.validate()
  editLoading.value = true
  try {
    await updateResume(editForm.id, {
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email,
      gender: editForm.gender,
      educationLevel: editForm.educationLevel,
      workYears: editForm.workYears,
      schoolName: editForm.schoolName,
      major: editForm.major,
      currentCompany: editForm.currentCompany,
      currentPosition: editForm.currentPosition,
      skillTags: Array.isArray(editForm.skillTags) ? editForm.skillTags.join('、') : editForm.skillTags,
      selfEvaluation: editForm.selfEvaluation
    })
    ElMessage.success('保存成功')
    editVisible.value = false
    fetchData()
  } catch { /* handled */ } finally {
    editLoading.value = false
  }
}

async function handleTalentAction(row, status) {
  try {
    await updateTalentStatus(row.id, status)
    ElMessage.success('操作成功')
    fetchData()
  } catch { /* handled */ }
}

onMounted(() => fetchData())
</script>

<style scoped>
.resume-list-view {}
.filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.upload-status-bar {
  margin-top: 10px;
  padding: 8px 14px;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 6px;
  font-size: 13px;
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 8px;
}
.upload-status-bar .el-icon { vertical-align: middle; }
.pagination-bar { display: flex; justify-content: flex-end; margin-top: 16px; }
.resume-detail { font-size: 14px; }
.resume-detail :deep(.el-descriptions__label) { width: 100px; }

.pdf-section { margin-top: 18px; border-top: 1px solid #ebeef5; padding-top: 16px; }
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.pdf-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 5px;
}
.pdf-preview-box { margin-top: 8px; }
.pdf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px dashed #dcdfe6;
}
</style>
