<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="230px" class="sidebar">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon-box">
          <svg viewBox="0 0 40 40" fill="none" class="logo-svg">
            <rect x="4" y="6" width="32" height="28" rx="4" fill="white" fill-opacity="0.2"/>
            <rect x="8" y="10" width="10" height="8" rx="2" fill="white" fill-opacity="0.9"/>
            <rect x="22" y="10" width="10" height="8" rx="2" fill="white" fill-opacity="0.7"/>
            <rect x="8" y="22" width="8" height="8" rx="2" fill="white" fill-opacity="0.8"/>
            <rect x="20" y="22" width="14" height="8" rx="2" fill="white" fill-opacity="0.6"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-title">HR 智能招聘</span>
          <span class="logo-subtitle">AI-Powered Recruitment</span>
        </div>
      </div>

      <!-- 菜单 -->
      <div class="menu-wrapper">
        <el-menu
          :default-active="activeMenu"
          router
          class="custom-menu"
          background-color="transparent"
          text-color="rgba(255,255,255,0.65)"
          active-text-color="#ffffff"
        >
          <template v-for="item in menuItems" :key="item.path">
            <el-menu-item :index="item.path" class="menu-item">
              <template #title>
                <div class="menu-item-content">
                  <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
                  <span>{{ item.title }}</span>
                </div>
              </template>
            </el-menu-item>
          </template>
        </el-menu>
      </div>

      <!-- 底部用户区 -->
      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">{{ (userStore.userInfo?.realName || 'U')[0] }}</div>
          <div class="user-meta">
            <div class="user-name">{{ userStore.userInfo?.realName || '用户' }}</div>
            <div class="user-role">{{ roleLabel }}</div>
          </div>
          <el-icon class="logout-icon" @click="handleLogout" title="退出登录"><SwitchButton /></el-icon>
        </div>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <div class="breadcrumb">
            <el-icon class="bc-icon"><component :is="currentIcon" /></el-icon>
            <span class="bc-title">{{ currentTitle }}</span>
          </div>
        </div>
        <div class="header-right">
          <!-- 通知 -->
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notify-badge">
            <el-button circle :icon="Bell" @click="$router.push('/notifications')" class="icon-btn"/>
          </el-badge>
          <!-- 刷新 -->
          <el-button circle :icon="Refresh" @click="refreshPage" class="icon-btn"/>
        </div>
      </el-header>

      <!-- 内容区（带过渡动画） -->
      <el-main class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
<<<<<<< HEAD
import { ref, computed, provide, onMounted } from 'vue'
=======
import { ref, computed, provide } from 'vue'
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  DataLine, Briefcase, Document, Connection, ChatDotRound,
  Checked, MagicStick, Bell, Notebook, ArrowDown,
  SwitchButton, Refresh
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
<<<<<<< HEAD
import { getNotifications } from '@/api/notification'
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const unreadCount = ref(0)

const menuItems = [
  { path: '/dashboard', title: '数据大屏', icon: DataLine },
  { path: '/jobs', title: '岗位管理', icon: Briefcase },
  { path: '/resumes', title: '简历管理', icon: Document },
  { path: '/pipeline', title: '招聘管道', icon: Connection },
  { path: '/interviews', title: '面试管理', icon: ChatDotRound },
  { path: '/offers', title: '录用管理', icon: Checked },
  { path: '/ai', title: 'AI智能中心', icon: MagicStick },
  { path: '/notifications', title: '通知中心', icon: Bell },
  { path: '/logs', title: '操作日志', icon: Notebook }
]

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title || '')
const currentIcon = computed(() => {
  const item = menuItems.find(m => m.path === route.path)
  return item ? item.icon : DataLine
})

const roleLabel = computed(() => {
  const role = userStore.userInfo?.role
  const map = { ADMIN: '系统管理员', HR: 'HR专员', MANAGER: '部门经理' }
  return map[role] || role || '普通用户'
})

function refreshPage() {
  router.replace({ path: '/redirect', query: { to: route.fullPath } })
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  }).catch(() => {})
}
<<<<<<< HEAD

/** 加载通知未读数 */
async function loadUnreadCount() {
  try {
    const res = await getNotifications({ pageNum: 1, pageSize: 1, isRead: 0 })
    const data = res.data || {}
    unreadCount.value = data.total || 0
  } catch {
    // 静默失败，不影响主功能
  }
}

onMounted(loadUnreadCount)
=======
>>>>>>> 1a1d158e371191531b75389502f38fd6b00454a3
</script>

<style scoped>
/* ========== 整体布局 ========== */
.layout-container {
  height: 100vh;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ========== 侧边栏 ========== */
.sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%) !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.05);
}

/* Logo区 */
.logo-section {
  padding: 28px 20px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.logo-icon-box {
  width: 44px; height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.logo-svg { width: 28px; height: 28px; }

.logo-text { display: flex; flex-direction: column; }
.logo-title {
  font-size: 16px; font-weight: 700;
  color: #ffffff; letter-spacing: -0.2px;
}
.logo-subtitle {
  font-size: 10px; color: rgba(255,255,255,0.4);
  letter-spacing: 0.5px; margin-top: 2px;
}

/* 菜单区 */
.menu-wrapper {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.custom-menu {
  border-right: none !important;
  background: transparent !important;
}

.menu-item {
  margin-bottom: 4px !important;
  border-radius: 10px !important;
  height: 44px !important;
  line-height: 44px !important;
  transition: all 0.25s ease !important;
}

.menu-item:hover {
  background: rgba(255,255,255,0.06) !important;
}

.menu-item.is-active {
  background: linear-gradient(135deg, rgba(102,126,234,0.25), rgba(118,75,162,0.2)) !important;
  border-left: 3px solid #667eea !important;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.menu-icon { font-size: 18px; }

/* 底部用户卡片 */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
}

.user-avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-meta { flex: 1; min-width: 0; }
.user-name {
  font-size: 13px; color: rgba(255,255,255,0.9);
  font-weight: 500; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}
.user-role {
  font-size: 11px; color: rgba(255,255,255,0.4);
  margin-top: 2px;
}

.logout-icon {
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  font-size: 18px;
  transition: color 0.2s;
  flex-shrink: 0;
}
.logout-icon:hover { color: #ef4444; }

/* ========== 顶部栏 ========== */
.header {
  background: #ffffff !important;
  border-bottom: 1px solid #f1f5f9 !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px !important;
  height: 60px !important;
}

.header-left { display: flex; align-items: center; }

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bc-icon {
  font-size: 20px;
  color: #667eea;
}

.bc-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  border: 1px solid #e2e8f0 !important;
  color: #64748b !important;
  transition: all 0.2s;
}
.icon-btn:hover {
  border-color: #667eea !important;
  color: #667eea !important;
  background: rgba(102,126,234,0.05) !important;
}

.notify-badge :deep(.el-badge__content) {
  background: #ef4444;
}

/* ========== 主内容区 ========== */
.main-content {
  background: #f8fafc !important;
  padding: 24px !important;
  min-height: calc(100vh - 60px);
  overflow-y: auto;
}

/* 页面过渡动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.25s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
