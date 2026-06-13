<template>
  <div class="auth-page">
    <!-- 左侧品牌展示区 -->
    <div class="auth-left">
      <div class="brand-content">
        <div class="brand-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-icon">
            <rect x="4" y="8" width="40" height="32" rx="4" fill="white" fill-opacity="0.15"/>
            <rect x="8" y="12" width="14" height="10" rx="2" fill="white" fill-opacity="0.9"/>
            <rect x="26" y="12" width="14" height="10" rx="2" fill="white" fill-opacity="0.7"/>
            <rect x="8" y="26" width="10" height="10" rx="2" fill="white" fill-opacity="0.8"/>
            <rect x="22" y="26" width="18" height="10" rx="2" fill="white" fill-opacity="0.6"/>
          </svg>
        </div>
        <h1 class="brand-title">HR 智能招聘</h1>
        <p class="brand-desc">AI 驱动的智能招聘管理平台</p>
        <div class="brand-features">
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>AI 候选人匹配评分</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>智能 JD 与面试题生成</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>可视化招聘管道看板</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>实时数据大屏监控</span>
          </div>
        </div>
      </div>
      <!-- 装饰性动画图形 -->
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
      </div>
      <div class="left-footer">© 2026 HR智能招聘平台 · 山东理工大学软件工程实训项目</div>
    </div>

    <!-- 右侧表单区 -->
    <div class="auth-right">
      <div class="form-card">
        <!-- 模式切换 -->
        <div class="mode-tabs">
          <button
            :class="['mode-tab', { active: mode === 'login' }]"
            @click="switchMode('login')"
          >登录</button>
          <button
            :class="['mode-tab', { active: mode === 'register' }]"
            @click="switchMode('register')"
          >注册</button>
        </div>

        <h2 class="form-title">{{ mode === 'login' ? '欢迎回来' : '创建账号' }}</h2>
        <p class="form-subtitle">{{ mode === 'login' ? '登录您的HR招聘管理系统' : '注册成为HR招聘管理系统用户' }}</p>

        <!-- 登录表单 -->
        <el-form
          v-if="mode === 'login'"
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          @keyup.enter="handleLogin"
          class="auth-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
              class="custom-input"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              class="custom-input"
            />
          </el-form-item>
          <div class="form-extra">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
          </div>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loginLoading"
            size="large"
            class="submit-btn"
          >
            登 录
          </el-button>
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-else
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
          class="auth-form"
        >
          <el-form-item prop="realName">
            <el-input
              v-model="registerForm.realName"
              placeholder="真实姓名"
              :prefix-icon="UserFilled"
              size="large"
              class="custom-input"
            />
          </el-form-item>
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="用户名（登录用）"
              :prefix-icon="User"
              size="large"
              class="custom-input"
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="邮箱地址"
              :prefix-icon="Message"
              size="large"
              class="custom-input"
            />
          </el-form-item>
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="手机号码"
              :prefix-icon="Phone"
              size="large"
              class="custom-input"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="设置密码（至少6位）"
              :prefix-icon="Lock"
              size="large"
              show-password
              class="custom-input"
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              class="custom-input"
            />
          </el-form-item>
          <el-button
            type="primary"
            @click="handleRegister"
            :loading="registerLoading"
            size="large"
            class="submit-btn"
          >
            注 册
          </el-button>
        </el-form>

        <!-- 底部链接 -->
        <div class="form-footer">
          <template v-if="mode === 'login'">
            <span>还没有账号？<a @click="switchMode('register')" class="link">立即注册</a></span>
            <br>
            <a @click="goAdminLogin" class="link admin-link">管理员登录入口</a>
          </template>
          <template v-else>
            <span>已有账号？<a @click="switchMode('login')" class="link">立即登录</a></span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled, Message, Phone } from '@element-plus/icons-vue'
import { register } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const mode = ref('login')
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const loginLoading = ref(false)
const registerLoading = ref(false)
const rememberMe = ref(false)

// --- 登录表单 ---
const loginForm = reactive({ username: '', password: '' })
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate()
  loginLoading.value = true
  try {
    if (rememberMe.value) {
      localStorage.setItem('remembered_user', loginForm.username)
    } else {
      localStorage.removeItem('remembered_user')
    }
    await userStore.login(loginForm.username, loginForm.password)
    router.push('/')
  } catch (e) {
    // handled by interceptor
  } finally {
    loginLoading.value = false
  }
}

// --- 注册表单 ---
const registerForm = reactive({
  realName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPass = (_rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' }
  ]
}

async function handleRegister() {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate()
  registerLoading.value = true
  try {
    await register({
      realName: registerForm.realName,
      username: registerForm.username,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password
    })
    ElMessage.success('注册成功！请登录')
    switchMode('login')
    loginForm.username = registerForm.username
  } catch (e) {
    // handled by interceptor
  } finally {
    registerLoading.value = false
  }
}

// --- 辅助方法 ---
function switchMode(m) {
  mode.value = m
}

function goAdminLogin() {
  router.push('/admin/login')
}

// 恢复记住的用户名
const remembered = localStorage.getItem('remembered_user')
if (remembered) {
  loginForm.username = remembered
  rememberMe.value = true
}
</script>

<style scoped>
/* ============ 整体布局 ============ */
.auth-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ============ 左侧品牌展示区 ============ */
.auth-left {
  position: relative;
  flex: 1;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brand-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 60px;
  max-width: 520px;
}

.brand-logo { margin-bottom: 32px; }
.logo-icon { width: 72px; height: 72px; }

.brand-title {
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  margin: 0 0 12px 0;
}

.brand-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 48px 0;
  line-height: 1.5;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  padding: 0 20px;
}

.feature-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  flex-shrink: 0;
}

/* 浮动装饰图形 */
.floating-shapes { position: absolute; inset: 0; pointer-events: none; }

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.shape-1 {
  width: 400px; height: 400px;
  background: #667eea;
  top: -100px; right: -100px;
  animation: float1 12s ease-in-out infinite;
}

.shape-2 {
  width: 300px; height: 300px;
  background: #764ba2;
  bottom: -80px; left: -60px;
  animation: float2 15s ease-in-out infinite;
}

.shape-3 {
  width: 200px; height: 200px;
  background: #f093fb;
  top: 40%; left: 20%;
  animation: float3 10s ease-in-out infinite;
}

.shape-4 {
  width: 150px; height: 150px;
  background: #4facfe;
  top: 15%; left: 50%;
  border-radius: 30px;
  animation: float4 14s ease-in-out infinite;
}

.shape-5 {
  width: 120px; height: 120px;
  background: #43e97b;
  bottom: 25%; right: 20%;
  border-radius: 20px;
  animation: float1 11s ease-in-out infinite reverse;
}

.shape-6 {
  width: 80px; height: 80px;
  background: #fa709a;
  top: 30%; right: 30%;
  animation: float2 9s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-25px, 25px) rotate(-120deg); }
  66% { transform: translate(20px, -15px) rotate(-240deg); }
}

@keyframes float3 {
  0%, 100% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.2) translate(15px, -10px); }
}

@keyframes float4 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-20px, 15px) rotate(180deg); }
}

.left-footer {
  position: absolute;
  bottom: 24px;
  left: 0; right: 0;
  text-align: center;
  color: rgba(255,255,255,0.35);
  font-size: 12px;
  z-index: 5;
}

/* ============ 右侧表单区 ============ */
.auth-right {
  flex: 0 0 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fc;
  padding: 40px;
}

.form-card {
  width: 100%;
  max-width: 400px;
}

/* 模式切换 Tabs */
.mode-tabs {
  display: flex;
  background: #e8ecf1;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 32px;
}

.mode-tab {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-tab.active {
  background: #ffffff;
  color: #1a1a2e;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-weight: 600;
}

/* 表单标题 */
.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
}

.form-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 32px 0;
}

/* 表单 */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  box-shadow: none !important;
  padding: 2px 16px;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

.custom-input :deep(.el-input__inner) {
  font-size: 14px;
  color: #1a1a2e;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

.form-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-extra :deep(.el-checkbox__label) {
  font-size: 13px;
  color: #6b7280;
}

.submit-btn {
  width: 100%;
  height: 48px !important;
  border-radius: 10px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  transition: all 0.3s ease !important;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
}

.submit-btn:active {
  transform: translateY(0);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.8;
}

.link {
  color: #667eea;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.link:hover {
  color: #764ba2;
}

.admin-link {
  font-size: 12px;
  color: #9ca3af;
}

.admin-link:hover {
  color: #6b7280;
}

/* ============ 响应式 ============ */
@media (max-width: 768px) {
  .auth-left { display: none; }
  .auth-right { flex: 1; padding: 24px; }
}
</style>
