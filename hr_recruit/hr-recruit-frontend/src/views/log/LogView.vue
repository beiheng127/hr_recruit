<template>
  <div>
    <div class="page-header"><h3>操作日志</h3></div>
    <div class="filter-bar">
      <el-select v-model="query.module" placeholder="操作模块" clearable style="width:140px">
        <el-option label="岗位管理" value="POSITION" />
        <el-option label="简历管理" value="RESUME" />
        <el-option label="面试管理" value="INTERVIEW" />
        <el-option label="录用管理" value="OFFER" />
      </el-select>
      <el-select v-model="query.action" placeholder="操作类型" clearable style="width:140px">
        <el-option label="创建" value="CREATE" />
        <el-option label="更新" value="UPDATE" />
        <el-option label="删除" value="DELETE" />
        <el-option label="发布" value="PUBLISH" />
      </el-select>
      <el-date-picker
        v-model="query.timeRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width:280px"
        value-format="YYYY-MM-DD"
        clearable
      />
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button @click="resetQuery">重置</el-button>
    </div>
    <div class="data-card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="action" label="操作" width="100" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="ipAddress" label="IP" width="140" />
        <el-table-column prop="costTime" label="耗时(ms)" width="100" />
        <el-table-column prop="createTime" label="操作时间" width="180" />
      </el-table>
      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOperationLogs } from '@/api/common'
import { ElMessage } from 'element-plus'

const query = ref({ module: '', action: '', timeRange: [] })
const tableData = ref([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

async function loadData() {
  loading.value = true
  try {
    const params = {}
    if (query.value.module) params.module = query.value.module
    if (query.value.action) params.action = query.value.action
    if (query.value.timeRange && query.value.timeRange.length === 2) {
      params.startTime = query.value.timeRange[0] + ' 00:00:00'
      params.endTime = query.value.timeRange[1] + ' 23:59:59'
    }
    params.pageNum = pagination.page
    params.pageSize = pagination.pageSize
    
    const res = await getOperationLogs(params)
    const data = res.data || {}
    tableData.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    console.error('加载操作日志失败:', error)
    ElMessage.error('加载操作日志失败: ' + (error.response?.data?.message || error.message || '未知错误'))
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.value = { module: '', action: '', timeRange: [] }
  pagination.page = 1
  loadData()
}

onMounted(loadData)
</script>
