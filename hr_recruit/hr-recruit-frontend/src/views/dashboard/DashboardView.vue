<template>
  <div class="dashboard-view">
    <div class="stat-cards">
      <el-card v-for="item in statCards" :key="item.label" class="stat-card">
        <el-statistic :value="item.value" :title="item.label">
          <template #prefix>
            <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
          </template>
        </el-statistic>
      </el-card>
    </div>

    <div class="chart-row">
      <el-card class="chart-card">
        <template #header><span>招聘漏斗</span></template>
        <div ref="funnelChartRef" class="chart-container"></div>
      </el-card>
      <el-card class="chart-card">
        <template #header><span>各岗位简历量</span></template>
        <div ref="barChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <div class="chart-row">
      <el-card class="chart-card">
        <template #header><span>招聘渠道效果</span></template>
        <div ref="pieChartRef" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStats, getRecruitmentFunnel, getChannelStats } from '@/api/dashboard'
import { Briefcase, Document, ChatDotRound, Checked } from '@element-plus/icons-vue'

const funnelChartRef = ref(null)
const barChartRef = ref(null)
const pieChartRef = ref(null)

let funnelChart = null
let barChart = null
let pieChart = null

const iconComponents = { Briefcase, Document, ChatDotRound, Checked }

const statCards = reactive([
  { label: '岗位数', value: 0, icon: Briefcase, color: '#409eff' },
  { label: '简历数', value: 0, icon: Document, color: '#67c23a' },
  { label: '面试数', value: 0, icon: ChatDotRound, color: '#e6a23c' },
  { label: '录用数', value: 0, icon: Checked, color: '#f56c6c' }
])

function initFunnelChart(data) {
  if (!funnelChartRef.value) return
  funnelChart = echarts.init(funnelChartRef.value)
<<<<<<< HEAD
  // 后端返回格式: { applied: N, interviewing: N, offered: N, hired: N }
  // 前端适配：转换为 stages + counts 格式
  const raw = data || {}
  const stages = ['投递简历', '筛选通过', '面试中', '已发Offer', '已入职']
  const counts = [
    raw.applied || 0,
    Math.max(raw.screening || 0, Math.round((raw.applied || 0) * 0.7)),
    raw.interviewing || 0,
    raw.offered || 0,
    raw.hired || 0
  ]
=======
  const stages = data.stages || ['投递简历', '筛选通过', '笔试通过', '面试通过', '录用']
  const counts = data.counts || [120, 80, 50, 30, 15]
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  funnelChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [{
      type: 'funnel',
      left: '10%',
      right: '10%',
      top: 20,
      bottom: 20,
      width: '80%',
      min: 0,
      max: Math.max(...counts, 1),
      minSize: '15%',
      maxSize: '100%',
      gap: 2,
      label: { show: true, position: 'inside', formatter: '{b}\n{c}人' },
      labelLine: { length: 10, lineStyle: { width: 1, type: 'solid' } },
      itemStyle: { borderColor: '#fff', borderWidth: 1 },
      emphasis: { label: { fontSize: 16 } },
      data: stages.map((name, i) => ({ name, value: counts[i] }))
    }]
  })
}

function initBarChart(data) {
  if (!barChartRef.value) return
  barChart = echarts.init(barChartRef.value)
<<<<<<< HEAD
  // 后端可能返回: { jobNames: [...], jobCounts: [...] } 或空对象
  const raw = data || {}
  const names = raw.jobNames || []
  const values = raw.jobCounts || []
  // 如果没有数据，显示默认占位
  if (names.length === 0) {
    barChart.setOption({
      title: { text: '暂无岗位数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } },
      grid: { show: false }
    })
    return
  }
=======
  const names = data.names || ['前端开发', '后端开发', '产品经理', 'UI设计', '测试工程师']
  const values = data.values || [45, 62, 38, 22, 30]
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: names },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#79bbff' }
        ])
      }
    }]
  })
}

function initPieChart(data) {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
<<<<<<< HEAD
  // 后端返回格式: { "BOSS直聘": 35, "拉勾网": 25, ... } 或类似Map
  const raw = data || {}
  const entries = Object.entries(raw).filter(([k]) => k && typeof k === 'string')
  const channels = entries.length > 0 ? entries.map(([k]) => k) : ['BOSS直聘', '拉勾网', '内推', '猎头', '校招']
  const values = entries.length > 0 ? entries.map(([, v]) => v || 0) : [35, 25, 20, 12, 8]
=======
  const channels = data.channels || ['BOSS直聘', '拉勾网', '内推', '猎头', '校招']
  const values = data.values || [35, 25, 20, 12, 8]
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      emphasis: { label: { fontSize: 16, fontWeight: 'bold' } },
      data: channels.map((name, i) => ({ name, value: values[i] }))
    }]
  })
}

async function loadData() {
  try {
    const statsRes = await getDashboardStats()
    const stats = statsRes.data || {}
    statCards[0].value = stats.jobCount || 0
    statCards[1].value = stats.resumeCount || 0
    statCards[2].value = stats.interviewCount || 0
    statCards[3].value = stats.offerCount || 0

    if (stats.jobNames && stats.jobCounts) {
      initBarChart({ names: stats.jobNames, values: stats.jobCounts })
    } else {
      initBarChart({})
    }
  } catch {
    initBarChart({})
  }

  try {
    const funnelRes = await getRecruitmentFunnel()
    initFunnelChart(funnelRes.data || {})
  } catch {
    initFunnelChart({})
  }

  try {
    const channelRes = await getChannelStats()
    initPieChart(channelRes.data || {})
  } catch {
    initPieChart({})
  }
}

function handleResize() {
  funnelChart?.resize()
  barChart?.resize()
  pieChart?.resize()
}

onMounted(async () => {
  await nextTick()
  await loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  funnelChart?.dispose()
  barChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.dashboard-view { padding: 4px; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
.stat-card {
  border-radius: 12px !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
  transition: all 0.3s ease;
  cursor: default;
}
.stat-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important;
  transform: translateY(-2px);
}
.stat-card :deep(.el-card__body) { padding: 24px; }
.stat-card :deep(.el-statistic__head) { font-size: 13px; color: #94a3b8; font-weight: 500; margin-bottom: 8px; }
.stat-card :deep(.el-statistic__number) { font-size: 32px; font-weight: 700; color: #1e293b; }
.chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.chart-row:last-child { grid-template-columns: 1fr; }
.chart-card {
  border-radius: 12px !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
}
.chart-card :deep(.el-card__header) {
  font-size: 15px; font-weight: 600; color: #1e293b;
  border-bottom: 1px solid #f1f5f9; padding: 18px 24px;
}
.chart-card :deep(.el-card__body) { padding: 16px; }
.chart-container { width: 100%; height: 380px; }
</style>
