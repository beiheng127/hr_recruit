<template>
  <div class="job-list-view">
    <div class="filter-bar">
      <el-input v-model="filters.keyword" placeholder="岗位名称搜索" clearable style="width:220px" @keyup.enter="handleSearch" />
      <el-select v-model="filters.department" placeholder="部门筛选" clearable style="width:180px">
        <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态筛选" clearable style="width:140px">
        <el-option label="草稿" value="DRAFT" />
        <el-option label="已发布" value="PUBLISHED" />
        <el-option label="已关闭" value="CLOSED" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="openDialog()">新增岗位</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe style="margin-top:16px">
      <el-table-column prop="positionName" label="岗位名称" min-width="160" />
      <el-table-column prop="department" label="部门" width="120" />
      <el-table-column prop="headcount" label="招聘人数" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button v-if="row.status === 'PUBLISHED'" link type="warning" @click="handleClose(row)">关闭</el-button>
          <el-button v-else-if="row.status !== 'CLOSED'" link type="success" @click="handlePublish(row)">发布</el-button>
          <el-button v-if="row.status === 'DRAFT'" link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑岗位' : '新增岗位'" width="700px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="positionName">
              <el-input v-model="form.positionName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属部门" prop="department">
              <el-select v-model="form.department" style="width:100%">
                <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="岗位职责" prop="responsibility">
          <el-input v-model="form.responsibility" type="textarea" :rows="4" placeholder="岗位职责描述" />
        </el-form-item>
        <el-form-item label="任职要求" prop="requirement">
          <el-input v-model="form.requirement" type="textarea" :rows="4" placeholder="任职要求" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="招聘人数" prop="headcount">
              <el-input-number v-model="form.headcount" :min="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资范围" prop="salaryRange">
              <el-input v-model="form.salaryRange" placeholder="例如：15k-25k" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="工作地点" prop="location">
          <el-input v-model="form.location" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getJobList, createJob, updateJob, deleteJob, publishJob, closeJob } from '@/api/job'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const tableData = ref([])

const departments = ['技术部', '产品部', '设计部', '市场部', '运营部', '人事部', '财务部']

const filters = reactive({ keyword: '', department: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const form = reactive({
  id: null,
  positionName: '',
  department: '',
  responsibility: '',
  requirement: '',
  headcount: 1,
  salaryRange: '',
  location: ''
})

const rules = {
  positionName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  responsibility: [{ required: true, message: '请输入岗位职责', trigger: 'blur' }],
  requirement: [{ required: true, message: '请输入任职要求', trigger: 'blur' }],
  headcount: [{ required: true, message: '请输入招聘人数', trigger: 'blur' }]
}

function statusType(status) {
  const map = { 'DRAFT': 'info', 'PUBLISHED': 'success', 'CLOSED': 'danger' }
  return map[status] || 'info'
}

function statusLabel(status) {
  const map = { 'DRAFT': '草稿', 'PUBLISHED': '已发布', 'CLOSED': '已关闭' }
  return map[status] || status
}

function resetForm() {
  form.id = null
  form.positionName = ''
  form.department = ''
  form.responsibility = ''
  form.requirement = ''
  form.headcount = 1
  form.salaryRange = ''
  form.location = ''
  formRef.value?.resetFields()
}

function openDialog(row) {
  resetForm()
  if (row && row.id) {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      positionName: row.positionName,
      department: row.department,
      responsibility: row.responsibility || '',
      requirement: row.requirement || '',
      headcount: row.headcount,
      salaryRange: row.salaryRange || '',
      location: row.location || ''
    })
  } else {
    isEdit.value = false
  }
  dialogVisible.value = true
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getJobList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      positionName: filters.keyword,
      department: filters.department,
      status: filters.status
    })
    tableData.value = res.data?.records || res.data?.list || res.data || []
    pagination.total = res.data?.total || 0
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    const payload = {
      positionName: form.positionName,
      department: form.department,
      responsibility: form.responsibility,
      requirement: form.requirement,
      headcount: form.headcount,
      salaryRange: form.salaryRange,
      location: form.location
    }
    if (isEdit.value) {
      await updateJob(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createJob(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    // handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

async function handlePublish(row) {
  try {
    await publishJob(row.id)
    ElMessage.success('发布成功')
    fetchData()
  } catch { /* handled */ }
}

async function handleClose(row) {
  try {
    await ElMessageBox.confirm('确认关闭该岗位？', '提示', { type: 'warning' })
    await closeJob(row.id)
    ElMessage.success('已关闭')
    fetchData()
  } catch { /* cancelled */ }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该岗位？', '提示', { type: 'warning' })
    await deleteJob(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancelled */ }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.job-list-view { }
.filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.pagination-bar { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
