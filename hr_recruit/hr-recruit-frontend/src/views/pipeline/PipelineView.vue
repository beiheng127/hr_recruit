<template>
  <div class="pipeline-view">
    <div class="pipeline-header">
      <el-select v-model="selectedJobId" placeholder="选择岗位" style="width:300px" @change="loadPipeline" clearable>
        <el-option v-for="j in jobList" :key="j.id" :label="j.name" :value="j.id" />
      </el-select>
      <el-tag type="info">共 {{ totalCandidates }} 人</el-tag>
    </div>

    <div v-if="!selectedJobId" class="empty-tip">
      <el-empty description="请先选择岗位查看招聘管道" />
    </div>

    <div v-else class="kanban-board">
      <div
        v-for="stage in stages"
        :key="stage.stageType"
        class="kanban-column"
        @dragover.prevent="onDragOver($event, stage.stageType)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, stage.stageType)"
      >
        <div class="column-header">
          <span class="column-title">{{ stage.stageName }}</span>
          <el-tag size="small" round>{{ getStageCount(stage.stageType) }}</el-tag>
        </div>
        <div class="column-body">
          <div
            v-for="candidate in getStageCandidates(stage.stageType)"
            :key="candidate.id"
            class="candidate-card"
            :class="{ 'dragging': dragItem?.id === candidate.id }"
            draggable="true"
            @dragstart="onDragStart($event, candidate)"
            @dragend="onDragEnd"
          >
            <div class="card-name">{{ candidate.name }}</div>
            <div class="card-position">{{ candidate.position }}</div>
            <div class="card-score">
              <el-progress :percentage="candidate.matchScore || 0" :color="scoreColor(candidate.matchScore)" :stroke-width="6" />
            </div>
          </div>
          <div v-if="getStageCandidates(stage.stageType).length === 0" class="empty-stage">暂无候选人</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPipeline, switchStage, getStageRecords } from '@/api/pipeline'
import { getJobList } from '@/api/job'

const stages = ref([])
const selectedJobId = ref('')
const jobList = ref([])
const candidates = ref([])
const dragItem = ref(null)

const totalCandidates = computed(() => candidates.value.length)

function getStageCandidates(stageType) {
  return candidates.value.filter(c => c.stage === stageType)
}

function getStageCount(stageType) {
  return getStageCandidates(stageType).length
}

function scoreColor(score) {
  if (!score) return '#909399'
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

function onDragStart(event, candidate) {
  dragItem.value = candidate
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', candidate.id)
}

function onDragEnd() {
  dragItem.value = null
}

function onDragOver(event, stageType) {
  event.dataTransfer.dropEffect = 'move'
}

function onDragLeave() {}

async function onDrop(event, targetStageType) {
  if (!dragItem.value) return
  const candidate = dragItem.value
  if (candidate.stage === targetStageType) return
  const oldStage = candidate.stage
  try {
    await switchStage(candidate.recordId, targetStageType, selectedJobId.value)
    candidate.stage = targetStageType
    ElMessage.success('阶段切换成功')
  } catch {
    ElMessage.error('阶段切换失败')
  } finally {
    dragItem.value = null
  }
}

async function loadJobs() {
  try {
    const res = await getJobList({ pageSize: 100 })
    jobList.value = res.data?.records || res.data?.list || res.data || []
  } catch {
    jobList.value = []
  }
}

async function loadPipeline() {
  if (!selectedJobId.value) {
    candidates.value = []
    stages.value = []
    return
  }
  try {
    const res = await getPipeline(selectedJobId.value)
    const list = res.data || []
    stages.value = list.map(item => ({
      stageType: item.stageType,
      stageName: item.stageName,
      stageOrder: item.stageOrder
    }))
  } catch {
    stages.value = []
  }
  try {
    const res = await getStageRecords(selectedJobId.value)
    const records = res.data || []
    candidates.value = records.map(item => {
      const stage = stages.value.find(s => s.pipelineId === item.pipelineId)
      return {
        id: item.applicationId || item.id,
        recordId: item.id,
        name: item.name || '',
        position: item.position || '',
        matchScore: item.matchScore || 0,
        stage: stage ? stage.stageType : ''
      }
    })
  } catch {
    candidates.value = []
  }
}

onMounted(() => {
  loadJobs()
})
</script>

<style scoped>
.pipeline-view { }
.pipeline-header { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
.empty-tip { padding: 80px 0; }

.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  min-height: 400px;
  overflow-x: auto;
}

.kanban-column {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  transition: background-color 0.2s;
}
.kanban-column:hover {
  background: #ebedf0;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7ed;
}
.column-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.column-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.candidate-card {
  background: white;
  border-radius: 6px;
  padding: 12px;
  cursor: grab;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
}
.candidate-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}
.candidate-card.dragging {
  opacity: 0.4;
  transform: scale(0.95);
}

.card-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}
.card-position {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}
.card-score {
  margin-bottom: 8px;
}

.empty-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 13px;
}
</style>
