<template>
  <div>
    <div class="page-header"><h3>录用管理</h3></div>
    <div class="data-card">
      <div class="card-header">
        <span>Offer列表</span>
        <el-button type="primary" size="small" @click="handleCreate">新建Offer</el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="position" label="岗位" />
        <el-table-column prop="salary" label="薪资" width="120" />
        <el-table-column prop="entryDate" label="预计入职" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{row}">
            <el-tag size="small">{{ {DRAFT:'草稿',SENT:'已发送',ACCEPTED:'已接受',REJECTED:'已拒绝'}[row.status] || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{row}">
            <el-button size="small" link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button size="small" link type="warning" @click="handleEdit(row)" v-if="row.status==='DRAFT'">编辑</el-button>
            <el-button size="small" type="primary" @click="handleSend(row)" v-if="row.status==='DRAFT'">发送Offer</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="Offer详情" width="600px" :close-on-click-modal="false">
      <el-descriptions :column="2" border v-if="detailData.id">
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="薪资">{{ detailData.salary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="预计入职">{{ detailData.entryDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Offer截止日">{{ detailData.offerDeadline || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small">{{ {DRAFT:'草稿',SENT:'已发送',ACCEPTED:'已接受',REJECTED:'已拒绝'}[detailData.status] || detailData.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ detailData.sentAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible=false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="formMode==='create'?'新建Offer':'编辑Offer'" width="500px" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="formData" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="应聘记录ID" prop="applicationId">
          <el-input-number v-model="formData.applicationId" :min="1" placeholder="请输入应聘记录ID" style="width:100%" />
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="薪资" prop="salary">
          <el-input v-model="formData.salary" placeholder="如：30k×14薪" />
        </el-form-item>
        <el-form-item label="预计入职" prop="entryDate">
          <el-date-picker v-model="formData.entryDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="Offer截止日" prop="offerDeadline">
          <el-date-picker v-model="formData.offerDeadline" type="date" placeholder="选择截止日期" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible=false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOfferList, getOfferDetail, createOffer, updateOffer, sendOffer } from '@/api/offer'

const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const detailVisible = ref(false)
const detailData = ref({})
const formVisible = ref(false)
const formMode = ref('create')
const formRef = ref(null)
const submitLoading = ref(false)
const formData = ref({})
const formRules = {
  applicationId: [{ required: true, message: '请输入应聘记录ID', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOfferList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize
    })
    const data = res.data || {}
    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  formMode.value = 'create'
  formData.value = { applicationId: null, position: '', salary: '', entryDate: null, offerDeadline: null, status: 'DRAFT' }
  formVisible.value = true
}

async function handleDetail(row) {
  try {
    const res = await getOfferDetail(row.id)
    detailData.value = res.data || row
  } catch {
    detailData.value = row
  }
  detailVisible.value = true
}

function handleEdit(row) {
  formMode.value = 'edit'
  formData.value = { ...row }
  formVisible.value = true
}

async function submitForm() {
  try {
    await formRef.value.validate()
  } catch { return }

  submitLoading.value = true
  try {
    if (formMode.value === 'create') {
      await createOffer(formData.value)
      ElMessage.success('Offer创建成功')
    } else {
      await updateOffer(formData.value.id, formData.value)
      ElMessage.success('Offer更新成功')
    }
    formVisible.value = false
    loadData()
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || '操作失败'
    ElMessage.error(msg)
  } finally {
    submitLoading.value = false
  }
}

async function handleSend(row) {
  try {
    await ElMessageBox.confirm('确认发送Offer给候选人？', '提示', { type: 'warning' })
    await sendOffer(row.id)
    ElMessage.success('Offer发送成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('发送失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.page-header { margin-bottom: 16px; }
.data-card { background: #fff; padding: 16px; border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 600; color: #303133; }
.pagination-bar { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
