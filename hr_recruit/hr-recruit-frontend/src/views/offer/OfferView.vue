<template>
  <div>
    <div class="page-header"><h3>录用管理</h3></div>
    <div class="data-card">
      <div class="card-header">
        <span>Offer列表</span>
        <el-button type="primary" size="small" @click="handleCreate">新建Offer</el-button>
      </div>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="position" label="岗位" />
        <el-table-column prop="salary" label="薪资" width="120" />
        <el-table-column prop="entryDate" label="预计入职" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{row}">
            <el-tag>{{ {DRAFT:'草稿',SENT:'已发送',ACCEPTED:'已接受',REJECTED:'已拒绝'}[row.status] || row.status }}</el-tag>
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
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="Offer详情" width="600px" :close-on-click-modal="false">
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="薪资">{{ detailData.salary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="预计入职">{{ detailData.entryDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Offer截止日">{{ detailData.offerDeadline || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag>{{ {DRAFT:'草稿',SENT:'已发送',ACCEPTED:'已接受',REJECTED:'已拒绝'}[detailData.status] || detailData.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ detailData.sentAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible=false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="formMode==='create'?'新建Offer':'编辑Offer'" width="500px" :close-on-click-modal="false">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="应聘记录ID">
          <el-input v-model="formData.applicationId" :disabled="formMode==='edit'" placeholder="请输入应聘记录ID" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-input v-model="formData.position" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="薪资">
          <el-input v-model="formData.salary" placeholder="如：30k×14薪" />
        </el-form-item>
        <el-form-item label="预计入职">
          <el-date-picker v-model="formData.entryDate" type="date" placeholder="选择日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="Offer截止日">
          <el-date-picker v-model="formData.offerDeadline" type="date" placeholder="选择截止日期" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible=false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOfferList, getOfferDetail, createOffer, updateOffer, sendOffer } from '@/api/offer'

const tableData = ref([])
const detailVisible = ref(false)
const detailData = ref({})
const formVisible = ref(false)
const formMode = ref('create')
const formData = ref({})

async function loadData() {
  const res = await getOfferList()
  tableData.value = res.data?.records || []
}

function handleCreate() {
  formMode.value = 'create'
  formData.value = { applicationId: '', position: '', salary: '', entryDate: null, offerDeadline: null, status: 'DRAFT' }
  formVisible.value = true
}

async function handleDetail(row) {
  const res = await getOfferDetail(row.id)
  detailData.value = res.data || row
  detailVisible.value = true
}

function handleEdit(row) {
  formMode.value = 'edit'
  formData.value = { ...row }
  formVisible.value = true
}

async function submitForm() {
  if (!formData.value.applicationId) {
    ElMessage.warning('请输入应聘记录ID')
    return
  }
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
    ElMessage.error('操作失败')
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
