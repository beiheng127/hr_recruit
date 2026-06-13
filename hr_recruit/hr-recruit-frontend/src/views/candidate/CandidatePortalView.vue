<template>
  <div class="candidate-portal" ref="portalRef">
    <!-- 顶部导航 -->
    <header class="portal-header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-inner">
        <div class="logo-area" @click="scrollToSection('hero')">
          <div class="logo-icon">
            <el-icon :size="28"><Briefcase /></el-icon>
          </div>
          <div class="logo-text">
            <span class="logo-title">HR招聘</span>
            <span class="logo-subtitle">人才招聘平台</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button text @click="scrollToSection('jobs')">热门岗位</el-button>
          <el-button text @click="scrollToSection('process')">招聘流程</el-button>
          <el-button text @click="scrollToSection('about')">关于我们</el-button>
          <el-button type="primary" round @click="scrollToSection('jobs')">
            <el-icon><Search /></el-icon> 立即投递
          </el-button>
        </div>
      </div>
    </header>

    <!-- Hero区域 -->
    <section class="hero-section" id="hero">
      <div class="hero-bg">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
        <div class="grid-overlay"></div>
      </div>
      <div class="hero-content" :class="{ 'animate-in': heroAnimated }">
        <h1 class="hero-title">
          找到属于你的<br/><span class="highlight">理想职位</span>
        </h1>
        <p class="hero-desc">我们致力于为每一位人才匹配最适合的岗位，让你的职业生涯更上一层楼</p>
        <div class="hero-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索岗位名称、技能、部门..."
            size="large"
            clearable
            @keyup.enter="goSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="goSearch">搜索岗位</el-button>
            </template>
          </el-input>
        </div>
        <div class="hero-stats">
          <div class="stat-item" v-for="(stat, idx) in stats" :key="idx">
            <div class="stat-number" :ref="el => statRefs[idx] = el">{{ stat.displayValue }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
      <div class="scroll-indicator" @click="scrollToSection('jobs')">
        <span>向下滚动</span>
        <el-icon :size="20"><ArrowDown /></el-icon>
      </div>
    </section>

    <!-- 热门岗位 -->
    <section class="section jobs-section" id="jobs">
      <div class="section-inner">
        <div class="section-header" :class="{ 'animate-in': jobsAnimated }">
          <h2 class="section-title">热门在招岗位</h2>
          <p class="section-desc">我们为不同方向的人才提供了丰富的岗位选择</p>
        </div>
        <div class="job-cards" v-loading="loadingJobs">
          <div 
            class="job-card" 
            v-for="(job, idx) in hotJobs" 
            :key="job.id" 
            @click="viewJobDetail(job.id)"
            :style="{ animationDelay: idx * 0.1 + 's' }"
          >
            <div class="job-card-header">
              <div class="job-dept">{{ job.department }}</div>
              <div class="job-status" :class="job.status === 'PUBLISHED' ? 'open' : 'closed'">
                {{ job.status === 'PUBLISHED' ? '招聘中' : '已关闭' }}
              </div>
            </div>
            <h3 class="job-name">{{ job.positionName }}</h3>
            <div class="job-meta">
              <span><el-icon><Location /></el-icon> {{ job.location || '远程' }}</span>
              <span><el-icon><User /></el-icon> 招{{ job.headcount }}人</span>
            </div>
            <div class="job-salary" v-if="job.salaryRange">
              <el-icon><Money /></el-icon> {{ job.salaryRange }}
            </div>
            <div class="job-tags" v-if="job.requirement">
              <el-tag v-for="tag in parseTags(job.requirement)" :key="tag" size="small" type="info">{{ tag }}</el-tag>
            </div>
            <div class="job-card-footer">
              <span class="post-date">发布于 {{ formatDate(job.createTime) }}</span>
              <el-button type="primary" link size="small">查看详情 →</el-button>
            </div>
          </div>
          <div class="job-card empty-card" v-if="hotJobs.length === 0 && !loadingJobs" @click="$router.push('/candidate/jobs')">
            <el-icon :size="48"><Briefcase /></el-icon>
            <p>查看全部岗位</p>
          </div>
        </div>
        <div class="section-more">
          <el-button type="primary" plain size="large" round @click="$router.push('/candidate/jobs')">
            查看全部岗位 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <!-- 招聘流程 -->
    <section class="section process-section" id="process">
      <div class="section-inner">
        <div class="section-header" :class="{ 'animate-in': processAnimated }">
          <h2 class="section-title">招聘流程</h2>
          <p class="section-desc">简单四步，开启你的职业新篇章</p>
        </div>
        <div class="process-steps">
          <div 
            class="process-step" 
            v-for="(step, idx) in steps" 
            :key="idx"
            :style="{ animationDelay: idx * 0.2 + 's' }"
          >
            <div class="step-icon" :class="'step-' + (idx + 1)">
              <el-icon :size="32"><component :is="step.icon" /></el-icon>
            </div>
            <div class="step-number">{{ idx + 1 }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
            <div class="step-arrow" v-if="idx < steps.length - 1">
              <el-icon :size="24"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 关于我们 -->
    <section class="section about-section" id="about">
      <div class="section-inner">
        <div class="about-grid" :class="{ 'animate-in': aboutAnimated }">
          <div class="about-text">
            <h2 class="section-title">关于我们的公司</h2>
            <p class="about-desc">我们是一家专注于科技创新的企业，致力于为员工提供最好的工作环境和发展机会。加入我们，一起创造未来。</p>
            <div class="about-stats">
              <div class="about-stat" v-for="stat in aboutStats" :key="stat.label">
                <div class="about-stat-value">{{ stat.value }}</div>
                <div class="about-stat-label">{{ stat.label }}</div>
              </div>
            </div>
            <ul class="about-benefits">
              <li><el-icon><Check /></el-icon> 具有竞争力的薪酬福利</li>
              <li><el-icon><Check /></el-icon> 灵活的工作时间</li>
              <li><el-icon><Check /></el-icon> 完善的培训体系</li>
              <li><el-icon><Check /></el-icon> 清晰的晋升通道</li>
            </ul>
          </div>
          <div class="about-img">
            <div class="img-placeholder">
              <el-icon :size="64"><OfficeBuilding /></el-icon>
              <p>公司办公环境</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="portal-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="logo-area">
            <div class="logo-icon"><el-icon :size="24"><Briefcase /></el-icon></div>
            <span class="logo-title">HR招聘平台</span>
          </div>
          <p class="footer-desc">让每一次招聘都成为美好的开始</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>快速链接</h4>
            <ul>
              <li @click="scrollToSection('hero')">首页</li>
              <li @click="scrollToSection('jobs')">浏览岗位</li>
              <li @click="scrollToSection('process')">招聘流程</li>
              <li @click="scrollToSection('about')">关于我们</li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>联系我们</h4>
            <ul>
              <li>邮箱：hr@company.com</li>
              <li>电话：400-123-4567</li>
              <li>地址：北京市海淀区</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 HR招聘管理系统 - 版权所有</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Briefcase, Location, User, ArrowRight, Check, OfficeBuilding, ArrowDown, Money,
  EditPen, Upload, ChatDotRound, Checked } from '@element-plus/icons-vue'
import { getJobList } from '@/api/job'
import request from '@/api/request'

const router = useRouter()
const searchKeyword = ref('')
const loadingJobs = ref(false)
const hotJobs = ref([])
const portalRef = ref(null)
const isScrolled = ref(false)

// 动画状态
const heroAnimated = ref(false)
const jobsAnimated = ref(false)
const processAnimated = ref(false)
const aboutAnimated = ref(false)

// 统计数据
const stats = ref([
  { value: 0, displayValue: '0', label: '在招岗位' },
  { value: 0, displayValue: '0', label: '投递简历' },
  { value: 0, displayValue: '0', label: '面试安排' },
  { value: 0, displayValue: '0', label: '成功录用' }
])

const statRefs = ref([])

const aboutStats = [
  { value: '500+', label: '员工数量' },
  { value: '50+', label: '办公城市' },
  { value: '100+', label: '合作企业' },
  { value: '95%', label: '员工满意度' }
]

const steps = [
  { icon: Upload, title: '投递简历', desc: '选择合适的岗位，在线填写并投递你的简历' },
  { icon: ChatDotRound, title: '面试邀请', desc: '通过初筛后，我们将通过邮件或短信通知你' },
  { icon: Checked, title: '发放Offer', desc: '面试通过后，我们将为你准备正式的录用通知' },
  { icon: OfficeBuilding, title: '入职报到', desc: '完成入职手续，正式成为我们的一员' }
]

// 滚动监听
function handleScroll() {
  isScrolled.value = window.scrollY > 50
  
  // 检查各个section是否进入视口
  const sections = ['hero', 'jobs', 'process', 'about']
  sections.forEach((id, idx) => {
    const el = document.getElementById(id)
    if (el) {
      const rect = el.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
      if (isVisible) {
        if (idx === 0) heroAnimated.value = true
        if (idx === 1) jobsAnimated.value = true
        if (idx === 2) processAnimated.value = true
        if (idx === 3) aboutAnimated.value = true
      }
    }
  })
}

// 滚动到指定板块
function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function goSearch() {
  router.push({ path: '/candidate/jobs', query: { keyword: searchKeyword.value } })
}

function viewJobDetail(id) {
  router.push(`/candidate/jobs/${id}`)
}

function parseTags(req) {
  if (!req) return []
  return req.split(/[,，、]/).map(s => s.trim()).filter(Boolean).slice(0, 3)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

// 数字动画
function animateNumbers() {
  stats.value.forEach((stat, idx) => {
    if (stat.value > 0) {
      let current = 0
      const increment = stat.value / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= stat.value) {
          current = stat.value
          clearInterval(timer)
        }
        stats.value[idx].displayValue = Math.floor(current).toString()
      }, 30)
    }
  })
}

async function loadStats() {
  try {
    const res = await request.get('/dashboard/summary')
    if (res.data) {
      stats.value = [
        { value: res.data.jobCount || 0, displayValue: '0', label: '在招岗位' },
        { value: res.data.resumeCount || 0, displayValue: '0', label: '投递简历' },
        { value: res.data.interviewCount || 0, displayValue: '0', label: '面试安排' },
        { value: res.data.offerCount || 0, displayValue: '0', label: '成功录用' }
      ]
      nextTick(() => {
        animateNumbers()
      })
    }
  } catch {}
}

async function loadHotJobs() {
  loadingJobs.value = true
  try {
    const res = await getJobList({ pageNum: 1, pageSize: 6, status: 'PUBLISHED' })
    hotJobs.value = res.data?.records || res.data?.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingJobs.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadStats()
  loadHotJobs()
  // 初始动画
  setTimeout(() => {
    heroAnimated.value = true
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.candidate-portal {
  min-height: 100vh;
  background: #f8fafc;
}

/* === 顶部导航 === */
.portal-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom:1px solid #e2e8f0;
  transition: all 0.3s;
}
.header-scrolled {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.header-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 64px;
}
.logo-area { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logo-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.logo-text { display: flex; flex-direction: column; }
.logo-title { font-size: 18px; font-weight: 700; color: #1e293b; line-height: 1.2; }
.logo-subtitle { font-size: 11px; color: #94a3b8; }
.header-actions { display: flex; align-items: center; gap: 8px; }

/* === Hero === */
.hero-section {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%);
  padding: 140px 24px 120px; text-align: center; color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.hero-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.circle {
  position: absolute; border-radius: 50%; opacity: 0.07; background: #fff;
}
.c1 { width: 500px; height: 500px; top: -150px; right: -100px; }
.c2 { width: 300px; height: 300px; bottom: -80px; left: -60px; }
.c3 { width: 200px; height: 200px; top: 30%; left: 60%; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}
.hero-content { 
  position: relative; z-index: 1; max-width: 700px; margin: 0 auto; 
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}
.hero-content.animate-in {
  opacity: 1;
  transform: translateY(0);
}
.hero-title { font-size: 48px; font-weight: 800; line-height: 1.2; margin-bottom: 20px; }
.highlight { 
  background: linear-gradient(90deg, #60a5fa, #38bdf8); 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent; 
}
.hero-desc { font-size: 18px; color: rgba(255,255,255,0.7); margin-bottom: 40px; }
.hero-search { max-width: 560px; margin: 0 auto 60px; }
.hero-search :deep(.el-input__wrapper) { border-radius: 12px !important; padding: 4px 8px; }
.hero-search :deep(.el-input-group__append) .el-button { border-radius: 0 12px 12px 0 !important; padding: 0 24px; }
.hero-stats { display: flex; justify-content: center; gap: 60px; }
.stat-number { font-size: 36px; font-weight: 800; }
.stat-label { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 4px; }

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  animation: bounce 2s infinite;
  color: rgba(255,255,255,0.6);
  font-size: 14px;
}
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(-10px); }
  60% { transform: translateX(-50%) translateY(-5px); }
}

/* === 通用段落 === */
.section { padding: 100px 24px; }
.section-inner { max-width: 1200px; margin: 0 auto; }
.section-header { 
  text-align: center; margin-bottom: 60px; 
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}
.section-header.animate-in {
  opacity: 1;
  transform: translateY(0);
}
.section-title { font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
.section-desc { font-size: 16px; color: #94a3b8; }

/* === 岗位卡片 === */
.job-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
.job-card {
  background: #fff; border-radius: 16px; padding: 28px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); cursor: pointer;
  transition: all 0.3s; border: 1px solid #f1f5f9;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.job-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
.job-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.job-dept { font-size: 12px; color: #3b82f6; background: #eff6ff; padding: 4px 12px; border-radius: 20px; }
.job-status { font-size: 12px; padding: 4px 12px; border-radius: 20px; }
.job-status.open { background: #f0fdf4; color: #16a34a; }
.job-status.closed { background: #fef2f2; color: #dc2626; }
.job-name { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
.job-meta { display: flex; gap: 20px; font-size: 14px; color: #94a3b8; margin-bottom: 12px; }
.job-meta span { display: flex; align-items: center; gap: 6px; }
.job-salary { font-size: 18px; font-weight: 700; color: #f59e0b; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.job-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.job-card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #94a3b8; padding-top: 16px; border-top: 1px solid #f1f5f9; }
.empty-card { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; min-height: 200px; }
.section-more { text-align: center; margin-top: 60px; }

/* === 招聘流程 === */
.process-section { background: #fff; }
.process-steps { display: flex; gap: 32px; position: relative; }
.process-step {
  flex: 1; text-align: center; padding: 40px 20px;
  background: #f8fafc; border-radius: 16px; position: relative;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  transition: all 0.3s;
}
.process-step:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
.step-icon {
  width: 72px; height: 72px; border-radius: 16px; margin: 0 auto 16px;
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.step-1 { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.step-2 { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
.step-3 { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.step-4 { background: linear-gradient(135deg, #10b981, #34d399); }
.step-number {
  width: 32px; height: 32px; border-radius: 50%;
  background: #1e293b; color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.step-title { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
.step-desc { font-size: 14px; color: #94a3b8; line-height: 1.6; }
.step-arrow { position: absolute; right: -24px; top: 50%; transform: translateY(-50%); color: #cbd5e1; }

/* === 关于我们 === */
.about-grid { 
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; 
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}
.about-grid.animate-in {
  opacity: 1;
  transform: translateY(0);
}
.about-desc { font-size: 16px; color: #64748b; line-height: 1.8; margin-bottom: 24px; }
.about-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
.about-stat { text-align: center; padding: 16px; background: #f8fafc; border-radius: 12px; }
.about-stat-value { font-size: 24px; font-weight: 800; color: #3b82f6; }
.about-stat-label { font-size: 13px; color: #94a3b8; margin-top: 4px; }
.about-benefits { list-style: none; padding: 0; }
.about-benefits li { display: flex; align-items: center; gap: 8px; font-size: 15px; color: #1e293b; padding: 8px 0; }
.about-benefits .el-icon { color: #10b981; }
.img-placeholder {
  background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 16px;
  height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #93c5fd;
  transition: all 0.3s;
}
.img-placeholder:hover {
  transform: scale(1.02);
}

/* === 页脚 === */
.portal-footer { background: #0f172a; color: #94a3b8; padding: 80px 24px 0; }
.footer-inner { max-width: 1200px; margin: 0 auto; display: flex; gap: 80px; padding-bottom: 60px; border-bottom: 1px solid #1e293b; }
.footer-brand { max-width: 300px; }
.footer-brand .logo-area { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.footer-brand .logo-icon { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #60a5fa); display: flex; align-items: center; justify-content: center; color: #fff; }
.footer-brand .logo-title { font-size: 16px; font-weight: 700; color: #fff; }
.footer-desc { font-size: 14px; line-height: 1.6; }
.footer-links { display: flex; gap: 80px; }
.footer-col h4 { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.footer-col ul { list-style: none; padding: 0; }
.footer-col li { font-size: 14px; padding: 6px 0; cursor: pointer; }
.footer-col li:hover { color: #60a5fa; }
.footer-bottom { text-align: center; padding: 24px; font-size: 13px; }
</style>
