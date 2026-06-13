import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  // ========== 候选人门户（公开访问，无需登录）==========
  {
    path: '/candidate',
    name: 'CandidatePortal',
    component: () => import('@/views/candidate/CandidatePortalView.vue'),
    meta: { requiresAuth: false, title: '人才招聘平台' }
  },
  {
    path: '/candidate/jobs',
    name: 'CandidateJobList',
    component: () => import('@/views/candidate/CandidateJobListView.vue'),
    meta: { requiresAuth: false, title: '岗位列表' }
  },
  {
    path: '/candidate/jobs/:id',
    name: 'CandidateJobDetail',
    component: () => import('@/views/candidate/CandidateJobDetailView.vue'),
    meta: { requiresAuth: false, title: '岗位详情' }
  },
  {
    path: '/candidate/apply/:jobId',
    name: 'CandidateApply',
    component: () => import('@/views/candidate/CandidateApplyView.vue'),
    meta: { requiresAuth: false, title: '投递简历' }
  },
  {
    path: '/candidate/my',
    name: 'CandidateMyApplications',
    component: () => import('@/views/candidate/CandidateMyApplicationsView.vue'),
    meta: { requiresAuth: false, title: '我的申请' }
  },
  // ================================================================

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/auth/AdminLoginView.vue'),
    meta: { requiresAuth: false, title: '管理员登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'redirect',
        component: () => import('@/views/RedirectView.vue'),
        meta: { title: '' }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '数据大屏', icon: 'DataLine' }
      },
      {
        path: 'jobs',
        name: 'JobList',
        component: () => import('@/views/job/JobListView.vue'),
        meta: { title: '岗位管理', icon: 'Briefcase' }
      },
      {
        path: 'resumes',
        name: 'ResumeList',
        component: () => import('@/views/resume/ResumeListView.vue'),
        meta: { title: '简历管理', icon: 'Document' }
      },
      {
        path: 'pipeline',
        name: 'Pipeline',
        component: () => import('@/views/pipeline/PipelineView.vue'),
        meta: { title: '招聘管道', icon: 'Connection' }
      },
      {
        path: 'interviews',
        name: 'InterviewList',
        component: () => import('@/views/interview/InterviewListView.vue'),
        meta: { title: '面试管理', icon: 'ChatDotRound' }
      },
      {
        path: 'offers',
        name: 'OfferView',
        component: () => import('@/views/offer/OfferView.vue'),
        meta: { title: '录用管理', icon: 'Checked' }
      },
      {
        path: 'ai',
        name: 'AiCenter',
        component: () => import('@/views/ai/AiCenterView.vue'),
        meta: { title: 'AI智能中心', icon: 'MagicStick' }
      },
      {
        path: 'notifications',
        name: 'NotificationList',
        component: () => import('@/views/notification/NotificationView.vue'),
        meta: { title: '通知中心', icon: 'Bell' }
      },
      {
        path: 'logs',
        name: 'OperationLog',
        component: () => import('@/views/log/LogView.vue'),
        meta: { title: '操作日志', icon: 'Notebook' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  document.title = `${to.meta.title || ''} - HR招聘管理系统`

  if (to.meta.requiresAuth !== false && !userStore.token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/admin/login') && userStore.token) {
    next('/')
  } else {
    next()
  }
})

export default router
