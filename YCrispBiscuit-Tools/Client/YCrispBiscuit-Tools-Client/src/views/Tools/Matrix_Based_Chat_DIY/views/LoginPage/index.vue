<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="app-title">Matrix 聊天应用</h1>
      <p class="app-description">连接到Matrix网络，与世界各地的用户安全通讯</p>
      
      <!-- 登录表单组件 -->
      <LoginForm 
        v-if="!isRegisterMode"
        ref="loginFormRef"
        @login="handleLoginAttempt" 
        @auto-login-success="handleAutoLoginSuccess"
        @switch-to-register="switchToRegister"
      />

      <!-- 注册表单组件 -->
      <RegisterForm 
        v-else
        ref="registerFormRef"
        @register="handleRegisterAttempt"
        @switch-to-login="switchToLogin"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '../../components/Common/LoginForm'  // 直接导入vue文件
import RegisterForm from '../../components/Common/RegisterForm'  // 导入注册表单
import { matrixClient } from '../../services/matrix/client'
import type { MatrixLoginConfig, MatrixRegisterConfig, MatrixUser } from '../../types'

// ===== 组件引用 =====
const loginFormRef = ref()
const registerFormRef = ref()

// ===== 页面状态 =====
/** 是否显示注册模式 */
const isRegisterMode = ref(false)

// ===== 登录限制状态 =====
const 上次登录尝试时间 = ref<number>(0)
const 登录冷却时间 = 5 * 1000 // 30秒冷却时间
const 最大重试次数 = 3
let 当前重试次数 = 0

// ===== 事件定义 =====
const emit = defineEmits<{
  /** 登录成功事件，传递用户信息给父组件 */
  'login-success': [userInfo: MatrixUser]
}>()

// ===== 事件处理函数 =====

/**
 * 处理自动登录成功
 * 当组件加载时自动登录成功时调用
 * @param userInfo - 自动登录成功的用户信息
 */
const handleAutoLoginSuccess = async (userInfo: MatrixUser) => {
  console.log('处理自动登录成功...')
  
  try {
    // 第1步：初始化加密功能（可选，失败不影响基础功能）
    console.log('步骤1: 初始化端到端加密...')
    await matrixClient.初始化加密功能()
    
    // 第2步：启动客户端同步
    console.log('步骤2: 启动客户端同步...')
    matrixClient.启动客户端同步()
    
    // 第3步：通知父组件登录成功
    console.log('✅ 自动登录流程完成，通知应用切换到聊天页面')
    emit('login-success', userInfo)
    
  } catch (错误: any) {
    console.error('❌ 自动登录后续流程失败:', 错误)
    
    // 自动登录失败时清理令牌，让用户手动登录
    matrixClient.清除登录令牌()
    
    if (loginFormRef.value) {
      loginFormRef.value.resetLoginState('自动登录失败，请手动登录')
    }
  }
}

/**
 * 处理用户登录尝试
 * 这个函数包含完整的登录流程：认证、加密初始化、客户端启动
 * @param loginData - 用户输入的登录信息
 */
const handleLoginAttempt = async (loginData: MatrixLoginConfig) => {
  console.log('开始处理用户登录请求...')
  console.log('收到的登录数据:', JSON.stringify(loginData, null, 2))
  
  // 检查是否在冷却期内
  const 当前时间 = Date.now()
  const 距离上次尝试时间 = 当前时间 - 上次登录尝试时间.value
  
  if (距离上次尝试时间 < 登录冷却时间) {
    const 剩余冷却时间 = Math.ceil((登录冷却时间 - 距离上次尝试时间) / 1000)
    const errorMessage = `请等待 ${剩余冷却时间} 秒后再次尝试登录`
    
    if (loginFormRef.value) {
      loginFormRef.value.resetLoginState(errorMessage)
    }
    return
  }
  
  // 更新尝试时间
  上次登录尝试时间.value = 当前时间
  
  try {
    // 第1步：用户认证
    console.log('步骤1: 进行用户认证...')
    const userInfo = await matrixClient.用户登录(loginData)
    
    // 登录成功，重置重试计数
    当前重试次数 = 0
    
    // 第2步：初始化加密功能（可选，失败不影响基础功能）
    console.log('步骤2: 初始化端到端加密...')
    await matrixClient.初始化加密功能()
    
    // 第3步：启动客户端同步
    console.log('步骤3: 启动客户端同步...')
    matrixClient.启动客户端同步()
    
    // 第4步：通知父组件登录成功
    console.log('✅ 登录流程完成，通知应用切换到聊天页面')
    emit('login-success', userInfo)
    
  } catch (loginError: any) {
    // 登录失败处理
    console.error('❌ 登录失败:', loginError)
    
    当前重试次数++
    
    // 构建错误信息
    let errorMessage = loginError.message || '登录失败，请重试'
    
    // 如果是429错误，建议用户等待更长时间
    if (errorMessage.includes('过于频繁') || errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
      errorMessage += `\n\n建议：请等待30秒后再次尝试`
      // 如果达到最大重试次数，强制冷却
      if (当前重试次数 >= 最大重试次数) {
        errorMessage += `\n已达到最大重试次数(${最大重试次数})，将暂时限制登录`
        // 延长冷却时间
        上次登录尝试时间.value = 当前时间 + 登录冷却时间
      }
    }
    
    // 将错误信息传递给登录表单显示
    if (loginFormRef.value) {
      loginFormRef.value.resetLoginState(errorMessage)
    }
  }
}

/**
 * 处理用户注册尝试
 * @param registerData - 用户输入的注册信息
 */
const handleRegisterAttempt = async (registerData: MatrixRegisterConfig) => {
  console.log('开始处理用户注册请求...')
  console.log('收到的注册数据:', JSON.stringify({
    homeserver: registerData.homeserver,
    username: registerData.username,
    deviceName: registerData.deviceName
  }, null, 2))
  
  try {
    // 第1步：用户注册
    console.log('步骤1: 进行用户注册...')
    const userInfo = await matrixClient.用户注册(registerData)
    
    // 第2步：初始化加密功能（可选，失败不影响基础功能）
    console.log('步骤2: 初始化端到端加密...')
    await matrixClient.初始化加密功能()
    
    // 第3步：启动客户端同步
    console.log('步骤3: 启动客户端同步...')
    matrixClient.启动客户端同步()
    
    // 第4步：通知父组件注册成功，直接进入聊天页面
    console.log('✅ 注册流程完成，通知应用切换到聊天页面')
    emit('login-success', userInfo)
    
  } catch (registerError: any) {
    // 注册失败处理
    console.error('❌ 注册失败:', registerError)
    
    let errorMessage = registerError.message || '注册失败，请重试'
    
    // 将错误信息传递给注册表单显示
    if (registerFormRef.value) {
      registerFormRef.value.resetRegisterState(errorMessage)
    }
  }
}

/**
 * 切换到注册模式
 */
const switchToRegister = () => {
  isRegisterMode.value = true
  console.log('切换到注册模式')
}

/**
 * 切换到登录模式
 */
const switchToLogin = () => {
  isRegisterMode.value = false
  console.log('切换到登录模式')
}

// ===== 页面初始化 =====
console.log('登录页面已加载')
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.app-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
  font-weight: 600;
}

.app-description {
  margin: 0 0 30px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* 登录表单会继承这个容器的样式 */
:deep(.matrix-login) {
  background: transparent;
  padding: 0;
  box-shadow: none;
}

:deep(.login-form) {
  background: transparent;
  padding: 0;
  box-shadow: none;
}
</style>
