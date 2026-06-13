<template>
  <div class="admin-page">
    <!-- 装饰背景 -->
    <div class="admin-bg">
      <div class="bg-grid"></div>
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="admin-card">
      <div class="card-header">
        <div class="admin-badge">
          <svg viewBox="0 0 24 24" fill="none" class="shield-icon">
            <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z"
              stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>管理员登录</h2>
        <p>系统后台管理 · 仅限授权管理员访问</p>
      </div>

      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        @keyup.enter="handleLogin"
        class="admin-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="管理员账号"
            :prefix-icon="User"
            size="large"
            class="dark-input"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="管理员密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            class="dark-input"
          />
        </el-form-item>
        <el-button
          @click="handleLogin"
          :loading="loading"
          size="large"
          class="admin-submit-btn"
        >
          验证登录
        </el-button>
      </el-form>

      <div class="card-footer">
        <a @click="goUserLogin" class="back-link">← 返回用户登录</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入管理员密码', trigger: 'blur' }]
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate()
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    // 校验是否为管理员
    if (userStore.role !== 'ADMIN') {
      userStore.logout()
      ElMessage.error('非管理员账号，无权访问后台')
      return
    }
    router.push('/')
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function goUserLogin() {
  router.push('/login')
}
</script>

<style scoped>
/* ============ 整体布局 ============ */
.admin-page {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0e17;
  overflow: hidden;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ============ 背景装饰 ============ */
.admin-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
}

.bg-glow-1 {
  width: 500px; height: 500px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  top: -150px; right: -150px;
  animation: adminGlow1 10s ease-in-out infinite;
}

.bg-glow-2 {
  width: 400px; height: 400px;
  background: linear-gradient(135deg, #0f3460, #16213e);
  bottom: -100px; left: -100px;
  animation: adminGlow2 12s ease-in-out infinite;
}

@keyframes adminGlow1 {
  0%, 100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.1); }
}

@keyframes adminGlow2 {
  0%, 100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(20px, -20px) scale(1.15); }
}

/* ============ 登录卡片 ============ */
.admin-card {
  position: relative;
  z-index: 10;
  width: 420px;
  padding: 48px 44px;
  background: rgba(20, 25, 40, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  box-shadow:
    0 0 60px rgba(102, 126, 234, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.04);
}

/* 头部 */
.card-header { text-align: center; margin-bottom: 36px; }

.admin-badge {
  width: 60px; height: 60px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15));
  border: 1px solid rgba(102,126,234,0.25);
  border-radius: 16px;
  color: #667eea;
}

.shield-icon { width: 32px; height: 32px; }

.card-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #e5e7eb;
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
}

.card-header p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

/* 表单 */
.admin-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.dark-input :deep(.el-input__wrapper) {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  padding: 2px 16px;
  transition: all 0.3s ease;
}

.dark-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(102,126,234,0.4) !important;
}

.dark-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.15) !important;
}

.dark-input :deep(.el-input__inner) {
  color: #e5e7eb !important;
  font-size: 14px;
}

.dark-input :deep(.el-input__inner::placeholder) {
  color: #4b5563 !important;
}

.dark-input :deep(.el-input__prefix) {
  color: #4b5563;
}

.admin-submit-btn {
  width: 100% !important;
  height: 48px !important;
  border-radius: 10px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  margin-top: 8px;
  transition: all 0.3s ease !important;
}

.admin-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102,126,234,0.4) !important;
}

.admin-submit-btn:active {
  transform: translateY(0);
}

/* 底部 */
.card-footer {
  text-align: center;
  margin-top: 24px;
}

.back-link {
  color: #4b5563;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover { color: #667eea; }
</style>
