<template>
  <div class="candidate-jobs">
    <!-- 顶部搜索区 -->
    <div class="search-hero">
      <div class="search-inner">
        <h1 class="search-title">探索适合你的岗位</h1>
        <p class="search-desc">找到与你技能匹配的完美职位</p>
        <div class="search-bar">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索岗位名称、部门、技能..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" size="large" @click="handleSearch">搜索</el-button>
        </div>
      </div>
    </div>

    <div class="content-inner">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select v-model="filters.department" placeholder="全部部门" clearable style="width:160px" @change="handleSearch">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
        <el-select v-model="filters.status" placeholder="招聘状态" clearable style="width:140px" @change="handleSearch">
          <el-option label="招聘中" value="PUBLISHED" />
          <el-option label="已关闭" value="CLOSED" />
        </el-select>
        <div class="result-count">共 {{ pagination.total }} 个岗位</div>
      </div>

      <!-- 岗位列表 -->
      <div class="job-list" v-loading="loading">
        <div class="job-item" v-for="job in jobList" :key="job.id">
          <div class="job-item-main" @click="viewDetail(job.id)">
            <div class="job-item-header">
              <h3 class="job-item-name">{{ job.positionName }}</h3>
              <el-tag v-if="job.status === 'PUBLISHED'" type="success" size="small">招聘中</el-tag>
              <el-tag v-else type="info" size="small">已关闭</el-tag>
            </div>
            <div class="job-item-meta">
              <span class="meta-item"><el-icon><OfficeBuilding /></el-icon> {{ job.department }}</span>
              <span class="meta-item" v-if="job.location"><el-icon><Location /></el-icon> {{ job.location }}</span>
              <span class="meta-item"><el-icon><User /></el-icon> 招{{ job.headcount }}人</span>
              <span class="meta-item" v-if="job.salaryRange"><el-icon><Money /></el-icon> {{ job.salaryRange }}</span>
            </div>
            <div class="job-item-tags" v-if="job.requirement">
              <el-tag v-for="tag in parseTags(job.requirement)" :key="tag" size="small" type="info">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="job-item-side">
            <div class="post-date">{{ formatDate(job.createTime) }}发布</div>
            <el-button type="primary" link @click.stop="viewDetail(job.id)">查看详情 →</el-button>
            <el-button 
              type="primary" 
              size="small" 
              round 
              @click.stop="goApply(job.id)"
              :disabled="job.status !== 'PUBLISHED'"
              style="margin-top:8px"
            >
              {{ job.status === 'PUBLISHED' ? '立即投递' : '已停止招聘' }}
            </el-button>
          </div>
        </div>

        <el-empty v-if="jobList.length === 0 && !loading" description="暂无符合条件的岗位" />
      </div>

      <!-- 分页 -->
      <div class="pagination-wrap" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="prev, pager, next, total"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, OfficeBuilding, Location, User, Money } from '@element-plus/icons-vue'
import request from '@/api/request'

const router = useRouter()
const loading = ref(false)
const jobList = ref([])
const departments = ref(['技术部', '产品部', '设计部', '市场部', '人力资源部'])

const filters = ref({
  keyword: '',
  department: '',
  status: 'OPEN'
})

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

function parseTags(req) {
  if (!req) return []
  return req.split(/[,，、]/).map(s => s.trim()).filter(Boolean).slice(0, 5)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

function handleSearch() {
  pagination.value.page = 1
  loadJobs()
}

function handlePageChange(page) {
  pagination.value.page = page
  loadJobs()
}

function viewDetail(id) {
  router.push(`/candidate/jobs/${id}`)
}

function goApply(id) {
  router.push(`/candidate/apply/${id}`)
}

async function loadJobs() {
  loading.value = true
  try {
    const res = await request.get('/candidate/jobs', {
      params: {
        pageNum: pagination.value.page,
        pageSize: pagination.value.pageSize,
        keyword: filters.value.keyword || undefined,
        department: filters.value.department || undefined
      }
    })
    jobList.value = res.data?.records || res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadJobs()
})
</script>

<style scoped>
.candidate-jobs { background: #f8fafc; min-height: calc(100vh - 64px); }

.search-hero {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  padding: 60px 24px 48px; color: #fff; text-align: center;
}
.search-inner { max-width: 800px; margin: 0 auto; }
.search-title { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
.search-desc { font-size: 15px; opacity: 0.7; margin-bottom: 28px; }
.search-bar { display: flex; gap: 12px; }
.search-bar .el-input { flex: 1; }
.search-bar :deep(.el-input__wrapper) { border-radius: 12px !important; padding: 4px 12px; }
.search-bar .el-button { border-radius: 12px !important; padding: 0 32px; }

.content-inner { max-width: 1000px; margin: 0 auto; padding: 24px; }

.filter-bar {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 12px; padding: 16px 20px;
  margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.result-count { margin-left: auto; font-size: 13px; color: #94a3b8; }

.job-list { display: flex; flex-direction: column; gap: 12px; }
.job-item {
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-radius: 12px; padding: 20px 24px;
  cursor: pointer; transition: all 0.2s; border: 1px solid #f1f5f9;
}
.job-item:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
.job-item-main { flex: 1; }
.job-item-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.job-item-name { font-size: 17px; font-weight: 700; color: #1e293b; }
.job-item-meta { display: flex; gap: 20px; font-size: 13px; color: #94a3b8; margin-bottom: 8px; }
.meta-item { display: flex; align-items: center; gap: 4px; }
.job-item-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.job-item-side { text-align: right; margin-left: 24px; }
.post-date { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }

.pagination-wrap { display: flex; justify-content: center; margin-top: 32px; }
</style>
