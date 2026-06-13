<template>
  <div class="candidate-apply" v-loading="submitting">
    <div class="apply-inner">
      <!-- 步骤条 -->
      <div class="steps-bar">
        <div class="step-item" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
          <div class="step-dot">1</div>
          <span>填写信息</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 2, done: currentStep > 2 }">
          <div class="step-dot">2</div>
          <span>上传简历</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step-item" :class="{ active: currentStep >= 3 }">
          <div class="step-dot">3</div>
          <span>投递完成</span>
        </div>
      </div>

      <!-- 步骤1：填写基本信息 -->
      <div class="apply-card" v-if="currentStep === 1">
        <h2 class="card-title"><el-icon><EditPen /></el-icon> 填写基本信息</h2>
        <p class="card-desc">请填写你的基本信息，带 <span class="required">*</span> 的为必填项</p>

        <el-form ref="basicFormRef" :model="form" :rules="basicRules" label-width="100px" size="large">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入你的姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学历" prop="educationLevel">
                <el-select v-model="form.educationLevel" placeholder="请选择学历" style="width:100%">
                  <el-option label="大专" value="大专" />
                  <el-option label="本科" value="本科" />
                  <el-option label="硕士" value="硕士" />
                  <el-option label="博士" value="博士" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="工作年限" prop="workYears">
                <el-input-number v-model="form.workYears" :min="0" :max="50" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期望薪资" prop="expectedSalary">
                <el-input v-model="form.expectedSalary" placeholder="例如：15k-25k" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="技能标签" prop="skillTags">
            <el-select v-model="form.skillTags" multiple filterable allow-create default-first-option placeholder="输入技能后回车" style="width:100%">
            </el-select>
          </el-form-item>
          <el-form-item label="个人简介" prop="bio">
            <el-input v-model="form.bio" type="textarea" :rows="4" placeholder="简要介绍你的工作经验、核心技能等" />
          </el-form-item>
        </el-form>

        <div class="card-actions">
          <el-button size="large" round @click="$router.back()">返回</el-button>
          <el-button type="primary" size="large" round @click="goNextStep">下一步 →</el-button>
        </div>
      </div>

      <!-- 步骤2：上传简历 -->
      <div class="apply-card" v-if="currentStep === 2">
        <h2 class="card-title"><el-icon><UploadFilled /></el-icon> 上传简历文件</h2>
        <p class="card-desc">支持 PDF、Word 格式，文件大小不超过 10MB</p>

        <div
          class="upload-area"
          @click="triggerUpload"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input ref="fileInputRef" type="file" accept=".pdf,.doc,.docx" style="display:none" @change="handleFileChange" />
          <el-icon :size="48" color="#3b82f6"><UploadFilled /></el-icon>
          <p class="upload-text">点击或拖拽文件到此处上传</p>
          <p class="upload-hint">支持 .pdf .doc .docx 格式</p>
        </div>

        <div class="file-preview" v-if="form.file">
          <div class="file-info">
            <el-icon :size="24" color="#3b82f6"><Document /></el-icon>
            <span class="file-name">{{ form.file.name }}</span>
            <span class="file-size">({{ (form.file.size / 1024 / 1024).toFixed(2) }} MB)</span>
            <el-button text type="danger" @click="removeFile">移除</el-button>
          </div>
        </div>

        <div class="card-actions">
          <el-button size="large" round @click="currentStep = 1">上一步</el-button>
          <el-button type="primary" size="large" round @click="submitApplication" :loading="submitting">
            确认投递
          </el-button>
        </div>
      </div>

      <!-- 步骤3：投递完成 -->
      <div class="apply-card success-card" v-if="currentStep === 3">
        <div class="success-icon">
          <el-icon :size="64" color="#10b981"><CircleCheckFilled /></el-icon>
        </div>
        <h2 class="success-title">投递成功！</h2>
        <p class="success-desc">
          你的简历已成功投递至 <strong>{{ jobTitle }}</strong>，<br/>
          我们将在 3 个工作日内通过邮件或短信通知你后续进展。
        </p>
        <div class="success-actions">
          <el-button size="large" round @click="$router.push('/candidate/my')">查看我的申请</el-button>
          <el-button type="primary" size="large" round @click="$router.push('/candidate/jobs')">继续浏览岗位</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { EditPen, UploadFilled, Document, CircleCheckFilled } from '@element-plus/icons-vue'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()
const currentStep = ref(1)
const submitting = ref(false)
const jobTitle = ref('')
const jobId = ref('')
const basicFormRef = ref(null)
const fileInputRef = ref(null)
const form = reactive({
  name: '',
  phone: '',
  email: '',
  educationLevel: '',
  workYears: 0,
  expectedSalary: '',
  skillTags: [],
  bio: '',
  file: null
})

const basicRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [{ required: true, type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
  educationLevel: [{ required: true, message: '请选择学历', trigger: 'change' }]
}

function goNextStep() {
  basicFormRef.value.validate(valid => {
    if (valid) currentStep.value = 2
  })
}

function triggerUpload() {
  fileInputRef.value.click()
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) validateAndSetFile(file)
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file) validateAndSetFile(file)
}

function validateAndSetFile(file) {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowed.includes(file.type)) {
    ElMessage.warning('仅支持 PDF、Word 格式')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('文件大小不能超过 10MB')
    return
  }
  form.file = file
}

function removeFile() {
  form.file = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function submitApplication() {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('jobId', jobId.value)
    formData.append('name', form.name)
    formData.append('phone', form.phone)
    formData.append('email', form.email)
    formData.append('educationLevel', form.educationLevel)
    formData.append('workYears', form.workYears)
    formData.append('expectedSalary', form.expectedSalary)
    formData.append('skillTags', form.skillTags.join('、'))
    formData.append('bio', form.bio)
    if (form.file) formData.append('file', form.file)

    await request.post('/candidate/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    currentStep.value = 3
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '投递失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  jobId.value = route.params.jobId
  try {
    const res = await request.get(`/candidate/jobs/${jobId.value}`)
    jobTitle.value = res.data?.positionName || ''
  } catch {}
})
</script>

<style scoped>
.candidate-apply { background: #f8fafc; min-height: calc(100vh - 64px); padding: 40px 24px; }
.apply-inner { max-width: 800px; margin: 0 auto; }

.steps-bar {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 40px; gap: 0;
}
.step-item { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #94a3b8; font-size: 13px; }
.step-item.active { color: #3b82f6; font-weight: 600; }
.step-dot {
  width: 36px; height: 36px; border-radius: 50%;
  background: #e2e8f0; color: #94a3b8; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.step-item.active .step-dot { background: #3b82f6; color: #fff; }
.step-item.done .step-dot { background: #10b981; color: #fff; }
.step-line { width: 80px; height: 3px; background: #e2e8f0; margin: 0 8px; margin-bottom: 24px; border-radius: 2px; }
.step-line.active { background: #3b82f6; }

.apply-card {
  background: #fff; border-radius: 16px; padding: 36px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.card-title { font-size: 22px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.card-desc { font-size: 14px; color: #94a3b8; margin-bottom: 28px; }
.required { color: #ef4444; }

.upload-area {
  border: 2px dashed #cbd5e1; border-radius: 16px; padding: 48px;
  text-align: center; cursor: pointer; transition: all 0.2s;
  margin-bottom: 20px;
}
.upload-area:hover { border-color: #3b82f6; background: #f0f9ff; }
.upload-text { font-size: 15px; color: #1e293b; margin-top: 12px; }
.upload-hint { font-size: 12px; color: #94a3b8; margin-top: 4px; }

.file-preview { background: #f8fafc; border-radius: 12px; padding: 16px 20px; }
.file-info { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.file-name { font-weight: 600; color: #1e293b; }
.file-size { color: #94a3b8; }

.card-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }

.success-card { text-align: center; padding: 60px 36px; }
.success-icon { margin-bottom: 20px; }
.success-title { font-size: 26px; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
.success-desc { font-size: 14px; color: #64748b; line-height: 1.8; margin-bottom: 32px; }
.success-actions { display: flex; justify-content: center; gap: 16px; }
</style>
