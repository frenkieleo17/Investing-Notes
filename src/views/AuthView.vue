<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- 登录注册卡片 -->
      <div class="bg-white rounded-xl shadow-2xl p-8">
        <!-- 应用标题 -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            📈 Investing Notes
          </h1>
          <p class="text-gray-600">美股投资跟踪平台</p>
        </div>

        <!-- Tab切换 -->
        <div class="flex border-b border-gray-200 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 py-3 px-4 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="login-email" class="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="请输入密码"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">登录</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label for="register-email" class="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label for="register-password" class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              id="register-password"
              v-model="registerForm.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="至少6位密码"
            />
          </div>

          <div>
            <label for="register-confirm" class="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <input
              id="register-confirm"
              v-model="registerForm.confirmPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="再次输入密码"
            />
          </div>

          <button
            type="submit"
            :disabled="loading || registerForm.password !== registerForm.confirmPassword"
            class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">注册</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              注册中...
            </span>
          </button>

          <!-- 密码确认提示 -->
          <div v-if="registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword" 
               class="text-red-600 text-sm text-center">
            密码不一致
          </div>
        </form>

        <!-- 错误提示 -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-center mt-6">
        <p class="text-gray-500 text-sm">
          © 2026 Investing Notes. 美股投资分析工具
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../firebase.js'

const router = useRouter()

const tabs = [
  { id: 'login', label: '登录' },
  { id: 'register', label: '注册' }
]

const activeTab = ref('login')
const loading = ref(false)
const error = ref('')

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await authService.loginWithEmail(loginForm.email, loginForm.password)
    
    // 登录成功，跳转到dashboard
    router.push('/dashboard')
    
  } catch (err) {
    console.error('Login error:', err)
    error.value = getErrorMessage(err.code)
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  try {
    if (registerForm.password !== registerForm.confirmPassword) {
      error.value = '密码不一致'
      return
    }
    
    loading.value = true
    error.value = ''
    
    await authService.registerWithEmail(registerForm.email, registerForm.password)
    
    // 注册成功，跳转到dashboard
    router.push('/dashboard')
    
  } catch (err) {
    console.error('Register error:', err)
    error.value = getErrorMessage(err.code)
  } finally {
    loading.value = false
  }
}

const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': '邮箱格式不正确',
    'auth/user-disabled': '账户已被禁用',
    'auth/user-not-found': '用户不存在',
    'auth/wrong-password': '密码错误',
    'auth/email-already-in-use': '邮箱已被注册',
    'auth/weak-password': '密码强度不足',
    'auth/operation-not-allowed': '操作不允许'
  }
  
  return errorMessages[errorCode] || '发生错误，请重试'
}
</script>

<style scoped>
/* 自定义样式 */
.bg-gradient-to-br {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>