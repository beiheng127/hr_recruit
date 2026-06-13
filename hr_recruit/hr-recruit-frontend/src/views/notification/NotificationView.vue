<template>
  <div>
    <div class="page-header">
      <h3>通知中心</h3>
      <el-button size="small" @click="readAll">全部已读</el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="loadData">
      <el-tab-pane label="未读通知" name="unread" />
      <el-tab-pane label="历史通知" name="read" />
    </el-tabs>
    
    <div class="data-card">
      <el-table :data="tableData" v-loading="loading" border stripe @row-click="handleRead">
        <el-table-column width="40">
          <template #default="{row}">
            <el-badge :is-dot="row.isRead===0" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{row}">
            {{ {SYSTEM:'系统',INTERVIEW:'面试',OFFER:'录用',ONBOARD:'入职'}[row.type] || row.type }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{row}">
            <el-button v-if="row.isRead===0" link type="primary" size="small" @click.stop="handleRead(row)">标记已读</el-button>
            <span v-else class="read-tag">已读</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNotifications, readNotification, readAll as readAllApi } from '@/api/notification'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const activeTab = ref('unread')

async function loadData() {
  loading.value = true
  try {
    const isRead = activeTab.value === 'read' ? 1 : 0
    const res = await getNotifications({ 
      pageNum: 1, 
      pageSize: 50,
      isRead: isRead 
    })
    tableData.value = res.data?.records || []
  } catch (error) {
    console.error('加载通知失败:', error)
    tableData.value = []
  } finally {
    loading.value = false
  }
}

async function handleRead(row) {
  if (row.isRead === 1) return // 已读，无需处理
  
  try {
    await readNotification(row.id)
    ElMessage.success('已标记为已读')
    // 如果在未读标签页，移除该通知
    if (activeTab.value === 'unread') {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
    } else {
      row.isRead = 1 // 更新状态
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

async function readAll() {
  try {
    await readAllApi()
    ElMessage.success('已全部标记已读')
    // 重新加载数据
    if (activeTab.value === 'unread') {
      tableData.value = [] // 清空未读列表
    }
  } catch (error) {
    console.error('全部标记已读失败:', error)
  }
}

onMounted(loadData)
</script>
