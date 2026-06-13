<template>
  <div>
    <div class="page-header"><h3>AI智能中心</h3></div>
    <el-tabs v-model="activeTab" class="ai-tabs">
      <!-- 智能问答 -->
      <el-tab-pane label="智能问答" name="chat">
        <div class="chat-wrapper">
          <div class="chat-messages" ref="msgBox">
            <div v-if="messages.length === 0" class="chat-welcome">
              <div class="welcome-icon"><el-icon :size="48" color="#667eea"><MagicStick /></el-icon></div>
              <h4 class="welcome-title">HR 智能助手</h4>
              <p class="welcome-desc">我可以帮你解答招聘流程、岗位管理、面试安排等各类问题</p>
              <div class="welcome-suggestions">
                <div v-for="(s, i) in suggestions" :key="i" class="suggestion-chip" @click="sendQuick(s)">{{ s }}</div>
              </div>
            </div>
            <template v-else>
              <div v-for="(msg, i) in messages" :key="i" :class="['msg-row', msg.role]">
                <div class="msg-avatar">
                  <el-icon v-if="msg.role === 'user'" :size="18"><User /></el-icon>
                  <el-icon v-else :size="18"><MagicStick /></el-icon>
                </div>
                <div class="msg-body">
                  <div class="msg-label">{{ msg.role === 'user' ? '你' : 'AI助手' }}</div>
                  <div class="msg-content" v-html="renderMarkdown(msg.content)" />
                </div>
              </div>
              <div v-if="isThinking" class="msg-row assistant">
                <div class="msg-avatar thinking"><el-icon :size="18"><MagicStick /></el-icon></div>
                <div class="msg-body">
                  <div class="msg-label">AI助手</div>
                  <div class="thinking-box" @click="thinkingOpen = !thinkingOpen">
                    <span class="thinking-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>
                    <span class="thinking-text">正在思考</span>
                    <el-icon class="thinking-arrow" :class="{ open: thinkingOpen }"><ArrowDown /></el-icon>
                  </div>
                  <div v-if="thinkingOpen" class="thinking-content">
                    <div class="thinking-line" v-for="(line, idx) in thinkingLines" :key="idx">
                      <span class="thinking-bullet">{{ idx + 1 }}.</span>{{ line }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="isStreaming" class="msg-row assistant">
                <div class="msg-avatar streaming"><el-icon :size="18"><MagicStick /></el-icon></div>
                <div class="msg-body">
                  <div class="msg-label">AI助手</div>
                  <div class="msg-content streaming-content" v-html="renderMarkdown(streamingText)" />
                  <span class="stream-cursor"></span>
                </div>
              </div>
            </template>
          </div>
          <div class="chat-input-bar">
            <el-input v-model="inputMsg" placeholder="请输入问题，如：如何发布岗位？" :disabled="isThinking || isStreaming" @keyup.enter="sendMsg" class="chat-input">
              <template #suffix>
                <el-button type="primary" :icon="Promotion" :disabled="!inputMsg.trim() || isThinking || isStreaming" @click="sendMsg" class="send-btn" circle />
              </template>
            </el-input>
          </div>
        </div>
      </el-tab-pane>

      <!-- AI生成JD -->
      <el-tab-pane label="AI生成JD" name="jd">
        <div class="jd-panel">
          <el-form :model="jdForm" label-width="90px" class="jd-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="岗位名称"><el-input v-model="jdForm.positionName" placeholder="例如：Java开发工程师" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属部门"><el-input v-model="jdForm.department" placeholder="例如：技术部" /></el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="岗位要求">
              <el-input v-model="jdForm.requirement" type="textarea" :rows="4" placeholder="描述岗位的核心要求，如技能、经验、学历等" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="jdLoading" @click="generateJd" :icon="MagicStick">生成岗位JD</el-button>
            </el-form-item>
          </el-form>
          <div v-if="jdResult" class="jd-result-card">
            <div class="jd-result-header">
              <el-icon :size="18" color="#667eea"><DocumentChecked /></el-icon>
              <span>生成结果</span>
              <el-button link type="primary" :icon="CopyDocument" @click="copyJd">复制</el-button>
            </div>
            <div class="jd-result-body" v-html="renderMarkdown(jdResult)" />
          </div>
        </div>
      </el-tab-pane>

      <!-- AI匹配评分 P1-03 -->
      <el-tab-pane label="AI匹配评分" name="match">
        <div class="match-panel">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form label-width="90px" class="match-form">
                <el-form-item label="简历文本">
                  <el-input v-model="matchForm.resumeText" type="textarea" :rows="10" placeholder="粘贴简历文本内容，或选择简历自动填充" />
                </el-form-item>
                <el-form-item label="选择简历">
                  <el-select v-model="matchForm.resumeId" placeholder="选择简历自动填充" style="width:100%" @change="fillResumeText" clearable>
                    <el-option v-for="r in resumeList" :key="r.id" :label="r.name" :value="r.id" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="12">
              <el-form label-width="90px" class="match-form">
                <el-form-item label="岗位要求">
                  <el-input v-model="matchForm.jobRequirement" type="textarea" :rows="10" placeholder="粘贴岗位要求描述，或选择岗位自动填充" />
                </el-form-item>
                <el-form-item label="选择岗位">
                  <el-select v-model="matchForm.jobId" placeholder="选择岗位自动填充" style="width:100%" @change="fillJobRequirement" clearable>
                    <el-option v-for="j in jobListForMatch" :key="j.id" :label="j.name" :value="j.id" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <div style="text-align:center;margin:16px 0">
            <el-button type="primary" :loading="matchLoading" @click="doMatch" :icon="Promotion" size="large">开始匹配评分</el-button>
          </div>
          <div v-if="matchResult" class="match-result-card">
            <div class="match-score-section">
              <el-progress type="dashboard" :percentage="matchScore" :color="matchScoreColor" :stroke-width="10" :width="120" />
              <div class="match-score-label">匹配分数</div>
            </div>
            <div class="match-reason-section">
              <h4>匹配分析</h4>
              <div v-if="matchReason" v-html="renderMarkdown(matchReason)" />
            </div>
            <div v-if="matchDetailObj" class="match-detail-section">
              <h4>详细分析</h4>
              <el-descriptions :column="1" border v-if="matchDetailObj">
                <el-descriptions-item v-if="matchDetailObj['技能匹配']" label="技能匹配">{{ matchDetailObj['技能匹配'] }}</el-descriptions-item>
                <el-descriptions-item v-if="matchDetailObj['经验匹配']" label="经验匹配">{{ matchDetailObj['经验匹配'] }}</el-descriptions-item>
                <el-descriptions-item v-if="matchDetailObj['学历匹配']" label="学历匹配">{{ matchDetailObj['学历匹配'] }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 生成面试题 P1-04 -->
      <el-tab-pane label="AI生成面试题" name="interview">
        <div class="interview-panel">
          <el-form :model="interviewForm" label-width="100px" class="interview-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="岗位名称"><el-input v-model="interviewForm.position" placeholder="例如：Java后端工程师" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工作年限"><el-input v-model="interviewForm.experience" placeholder="例如：3-5年" /></el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="技能标签">
              <el-select v-model="interviewForm.skills" multiple filterable allow-create default-first-option placeholder="输入技能后回车" style="width:100%">
                <el-option v-for="s in skillOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
            <el-form-item label="简历摘要">
              <el-input v-model="interviewForm.experienceSummary" type="textarea" :rows="4" placeholder="简要描述候选人项目经历，便于生成针对性问题" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="interviewLoading" @click="generateInterview" :icon="MagicStick" size="large">生成面试题</el-button>
            </el-form-item>
          </el-form>
          <div v-if="interviewResult" class="interview-result-card">
            <div class="interview-result-header">
              <el-icon :size="18" color="#667eea"><DocumentChecked /></el-icon>
              <span>生成结果</span>
              <el-button link type="primary" :icon="CopyDocument" @click="copyInterview">复制</el-button>
            </div>
            <div class="interview-result-body" v-html="renderMarkdown(interviewResult)" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed, onMounted } from 'vue'
import { generateJd as generateJdApi, matchResumeJob, generateQuestions } from '@/api/ai'
import { getResumeList } from '@/api/resume'
import { getJobList } from '@/api/job'
import { ElMessage } from 'element-plus'
import {
  MagicStick, User, ArrowDown, Promotion, DocumentChecked, CopyDocument
} from '@element-plus/icons-vue'

const activeTab = ref('chat')
const inputMsg = ref('')
const messages = ref([])
const msgBox = ref(null)

const isThinking = ref(false)
const isStreaming = ref(false)
const streamingText = ref('')
const thinkingOpen = ref(false)
const thinkingLines = ref([
  '分析用户问题的意图和关键词',
  '检索HR招聘管理相关知识库',
  '构建专业、简洁的回答内容'
])

const suggestions = [
  '如何发布一个新的招聘岗位？',
  '面试评价应该怎么写？',
  '招聘流程包含哪些环节？',
  '如何筛选合适的候选人？'
]

const jdForm = ref({ positionName: '', department: '', requirement: '' })
const jdResult = ref('')
const jdLoading = ref(false)

const matchForm = ref({ resumeText: '', resumeId: null, jobRequirement: '', jobId: null })
const matchLoading = ref(false)
const matchResult = ref('')
const matchScore = ref(0)
const matchReason = ref('')
const matchDetailObj = ref(null)
const resumeList = ref([])
const jobListForMatch = ref([])

const interviewForm = ref({ position: '', experience: '', skills: [], experienceSummary: '' })
const interviewLoading = ref(false)
const interviewResult = ref('')
const skillOptions = ['Java', 'Python', 'Vue', 'React', 'Spring Boot', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'Linux', '机器学习', '深度学习']

watch([messages, streamingText], () => {
  nextTick(() => {
    if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
  })
}, { deep: true })

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\s\S]*?```/g, m => `<pre><code>${m.slice(3, -3).trim()}</code></pre>`)
    .replace(/\n/g, '<br>')
}

function sendQuick(text) {
  inputMsg.value = text
  sendMsg()
}

function sendMsg() {
  const text = inputMsg.value.trim()
  if (!text || isThinking.value || isStreaming.value) return
  messages.value.push({ role: 'user', content: text })
  inputMsg.value = ''
  isThinking.value = true
  thinkingOpen.value = false
  const token = localStorage.getItem('token') || ''
  const url = `/api/ai/chat?message=${encodeURIComponent(text)}`
  fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(response => {
    if (!response.ok) throw new Error('认证失败或网络错误')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let firstChunk = true
    let buffer = ''
    function readStream() {
      return reader.read().then(({ done, value }) => {
        if (done) {
          isStreaming.value = false
          isThinking.value = false
          if (streamingText.value) {
            messages.value.push({ role: 'assistant', content: streamingText.value })
            streamingText.value = ''
          }
          return
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]' || data === '') continue
            if (firstChunk) {
              firstChunk = false
              isThinking.value = false
              isStreaming.value = true
              streamingText.value = ''
            }
            streamingText.value += data
          }
        }
        return readStream()
      }).catch(err => {
        console.error('SSE stream error:', err)
        isThinking.value = false
        isStreaming.value = false
        if (!streamingText.value) ElMessage.error('AI对话连接失败，请检查网络或重新登录')
      })
    }
    return readStream()
  }).catch(err => {
    console.error('Fetch error:', err)
    isThinking.value = false
    isStreaming.value = false
    ElMessage.error('AI对话请求失败，请确认已登录')
  })
}

async function generateJd() {
  if (!jdForm.value.positionName) {
    ElMessage.warning('请输入岗位名称')
    return
  }
  jdLoading.value = true
  try {
    const res = await generateJdApi(jdForm.value)
    jdResult.value = res.data || ''
  } catch { ElMessage.error('生成失败') } finally { jdLoading.value = false }
}

function copyJd() {
  navigator.clipboard.writeText(jdResult.value).then(() => ElMessage.success('已复制到剪贴板'))
}

async function loadResumes() {
  try {
    const res = await getResumeList({ pageSize: 100 })
    resumeList.value = res.data?.records || res.data?.list || []
  } catch { resumeList.value = [] }
}

async function loadJobsForMatch() {
  try {
    const res = await getJobList({ pageSize: 100 })
    jobListForMatch.value = res.data?.records || res.data?.list || []
  } catch { jobListForMatch.value = [] }
}

function fillResumeText() {
  const r = resumeList.value.find(item => item.id === matchForm.value.resumeId)
  if (r) {
    const parts = [r.name||'', r.phone||'', r.educationLevel||'', r.schoolName||'', r.major||'', r.workYears!=null?r.workYears+'年':'', r.skillTags||'', r.selfEvaluation||'']
    matchForm.value.resumeText = parts.filter(Boolean).join('；')
  }
}

function fillJobRequirement() {
  const j = jobListForMatch.value.find(item => item.id === matchForm.value.jobId)
  if (j) {
    matchForm.value.jobRequirement = [j.name, j.requirement, j.salary].filter(Boolean).join('；')
  }
}

async function doMatch() {
  if (!matchForm.value.resumeText || !matchForm.value.jobRequirement) {
    ElMessage.warning('请填写简历文本和岗位要求')
    return
  }
  matchLoading.value = true
  matchResult.value = ''
  matchReason.value = ''
  matchDetailObj.value = null
  matchScore.value = 0
  try {
    const res = await matchResumeJob({ resumeText: matchForm.value.resumeText, jobRequirement: matchForm.value.jobRequirement })
    const raw = res.data || ''
    matchResult.value = raw
    try {
      const jsonStr = raw.replace(/```json|```/g, '').trim()
      const obj = JSON.parse(jsonStr)
      matchScore.value = obj.matchScore || 0
      matchReason.value = obj.matchReason || ''
      matchDetailObj.value = obj.matchDetail || null
    } catch {
      matchReason.value = raw
    }
    ElMessage.success('匹配评分完成')
  } catch { ElMessage.error('匹配评分失败') } finally { matchLoading.value = false }
}

const matchScoreColor = computed(() => {
  const s = matchScore.value
  if (s >= 80) return '#67c23a'
  if (s >= 60) return '#e6a23c'
  return '#f56c6c'
})

async function generateInterview() {
  if (!interviewForm.value.position) {
    ElMessage.warning('请输入岗位名称')
    return
  }
  interviewLoading.value = true
  interviewResult.value = ''
  try {
    const res = await generateQuestions({
      position: interviewForm.value.position,
      skills: (interviewForm.value.skills || []).join('、'),
      experience: interviewForm.value.experienceSummary || interviewForm.value.experience || ''
    })
    interviewResult.value = res.data || ''
    ElMessage.success('面试题生成成功')
  } catch { ElMessage.error('生成失败') } finally { interviewLoading.value = false }
}

function copyInterview() {
  navigator.clipboard.writeText(interviewResult.value).then(() => ElMessage.success('已复制到剪贴板'))
}

watch(activeTab, (tab) => {
  if (tab === 'match' && resumeList.value.length === 0) loadResumes()
  if (tab === 'match' && jobListForMatch.value.length === 0) loadJobsForMatch()
})
</script>

<style scoped>
.ai-tabs :deep(.el-tabs__item) { font-size: 14px; font-weight: 500; }
.ai-tabs :deep(.el-tabs__active-bar) { background: #667eea; }

/* 智能问答 */
.chat-wrapper { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; height: calc(100vh - 220px); min-height: 400px; }
.chat-messages { flex: 1; overflow-y: auto; padding: 20px 8px; scroll-behavior: smooth; }
.chat-welcome { text-align: center; padding: 40px 20px; }
.welcome-icon { width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 20px; background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1)); display: flex; align-items: center; justify-content: center; }
.welcome-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
.welcome-desc { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
.welcome-suggestions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.suggestion-chip { padding: 8px 16px; border-radius: 20px; background: #f1f5f9; color: #64748b; font-size: 13px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.suggestion-chip:hover { background: rgba(102,126,234,0.08); color: #667eea; border-color: rgba(102,126,234,0.2); }

.msg-row { display: flex; gap: 12px; margin-bottom: 20px; animation: msgIn 0.3s ease; }
@keyframes msgIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.msg-row.user { flex-direction: row-reverse; }
.msg-avatar { width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #64748b; }
.msg-row.user .msg-avatar { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.msg-avatar.thinking, .msg-avatar.streaming { background: linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15)); color: #667eea; }
.msg-body { max-width: 75%; }
.msg-label { font-size: 12px; color: #94a3b8; margin-bottom: 4px; font-weight: 500; }
.msg-row.user .msg-label { text-align: right; }
.msg-content { padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.7; color: #334155; background: #ffffff; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.msg-content :deep(h1), .msg-content :deep(h2), .msg-content :deep(h3) { margin: 12px 0 8px; color: #1e293b; }
.msg-content :deep(pre) { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; margin: 8px 0; }
.msg-content :deep(code) { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #667eea; }
.msg-row.user .msg-content { background: linear-gradient(135deg, #667eea, #764ba2); color: #ffffff; border: none; }
.msg-row.user .msg-content :deep(code) { background: rgba(255,255,255,0.15); color: #fff; }
.thinking-box { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #f1f5f9; cursor: pointer; user-select: none; }
.thinking-dots { display: flex; gap: 4px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #667eea; animation: dotBounce 1.4s infinite ease-in-out both; }
.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes dotBounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
.thinking-text { font-size: 13px; color: #64748b; }
.thinking-arrow { font-size: 12px; color: #94a3b8; transition: transform 0.2s; }
.thinking-arrow.open { transform: rotate(180deg); }
.thinking-content { margin-top: 8px; padding: 12px 16px; border-radius: 10px; background: #f8fafc; border: 1px solid #f1f5f9; font-size: 13px; color: #64748b; line-height: 1.8; }
.thinking-line { display: flex; gap: 8px; align-items: flex-start; }
.thinking-bullet { color: #667eea; font-weight: 600; flex-shrink: 0; }
.stream-cursor { display: inline-block; width: 2px; height: 18px; background: #667eea; margin-left: 2px; vertical-align: middle; animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }
.streaming-content { min-height: 40px; }
.chat-input-bar { padding: 12px 0; border-top: 1px solid #f1f5f9; }
.chat-input :deep(.el-input__wrapper) { border-radius: 24px !important; padding: 4px 6px 4px 18px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important; }
.send-btn { width: 36px; height: 36px; background: linear-gradient(135deg, #667eea, #764ba2) !important; border: none !important; }

/* JD生成 */
.jd-panel { max-width: 800px; margin: 0 auto; padding: 8px 0; }
.jd-form { background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; }
.jd-result-card { margin-top: 20px; background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; overflow: hidden; }
.jd-result-header { display: flex; align-items: center; gap: 8px; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; }
.jd-result-header .el-button { margin-left: auto; }
.jd-result-body { padding: 20px; font-size: 14px; line-height: 1.8; color: #334155; }

/* 匹配评分 P1-03 */
.match-panel { max-width: 1000px; margin: 0 auto; padding: 8px 0; }
.match-form { background: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; }
.match-result-card { margin-top: 20px; background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 24px; }
.match-score-section { text-align: center; margin-bottom: 20px; }
.match-score-label { font-size: 13px; color: #94a3b8; margin-top: 8px; }
.match-reason-section { margin-bottom: 20px; }
.match-reason-section h4, .match-detail-section h4 { font-size: 15px; color: #1e293b; margin-bottom: 10px; }
.match-detail-section { margin-top: 16px; }

/* 生成面试题 P1-04 */
.interview-panel { max-width: 800px; margin: 0 auto; padding: 8px 0; }
.interview-form { background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; }
.interview-result-card { margin-top: 20px; background: #ffffff; border-radius: 12px; border: 1px solid #f1f5f9; overflow: hidden; }
.interview-result-header { display: flex; align-items: center; gap: 8px; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; }
.interview-result-header .el-button { margin-left: auto; }
.interview-result-body { padding: 20px; font-size: 14px; line-height: 1.8; color: #334155; }
</style>
