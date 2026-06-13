import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getProfile } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => userInfo.value?.role || '')

  async function login(username, password) {
    const res = await loginApi({ username, password })
    token.value = res.data.token
    userInfo.value = {
      userId: res.data.userId,
      username: res.data.username,
      realName: res.data.realName,
      role: res.data.role
    }
    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    ElMessage.success('登录成功')
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, isLoggedIn, role, login, logout }
})
