<template>
    <div class="matrix-login-form">
        <form @submit.prevent="handleSubmit" class="login-form">
            <!-- 服务器配置 -->
            <div class="form-group">
                <label for="homeserver">Matrix 服务器地址</label>
                <input id="homeserver" v-model="formData.homeserver" :disabled="isLoggingIn" type="url"
                    placeholder="https://chat.zy-jn.org.cn/" required class="form-input" />
            </div>

            <!-- 用户名 -->
            <div class="form-group">
                <label for="username">用户名</label>
                <input id="username" v-model="formData.username" :disabled="isLoggingIn" type="text"
                    placeholder="@username:matrix.org" required class="form-input" />
            </div>

            <!-- 密码 -->
            <div class="form-group">
                <label for="password">密码</label>
                <input id="password" v-model="formData.password" :disabled="isLoggingIn" type="password"
                    placeholder="请输入密码" required class="form-input" />
            </div>

            <!-- 错误信息显示 -->
            <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </div>

            <!-- 登录按钮 -->
            <button type="submit" :disabled="isLoggingIn || !isFormValid" class="login-button">
                {{ isLoggingIn ? '登录中...' : '登录' }}
            </button>

            <!-- 加载指示器 -->
            <div v-if="isLoggingIn" class="loading-indicator">
                <div class="spinner"></div>
                <p>正在连接到 Matrix 服务器...</p>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { MatrixLoginConfig } from '../../../types'

/**
 * Matrix登录表单组件
 * 提供用户登录界面，收集登录信息并验证
 * 
 * @author YCrispBiscuit
 * @created 2025-07-29
 */

// ===== 组件事件定义 =====
const emit = defineEmits<{
    /** 用户提交登录信息时触发 */
    login: [loginData: MatrixLoginConfig]
}>()

// ===== 响应式数据 =====

/** 表单数据 */
const formData = reactive<MatrixLoginConfig>({
    homeserver: 'https://chat.zy-jn.org.cn/',
    username: '',
    password: ''
})

/** 登录状态 */
const isLoggingIn = ref(false)

/** 错误信息 */
const errorMessage = ref('')

// ===== 计算属性 =====

/** 表单验证状态 */
const isFormValid = computed(() => {
    return formData.homeserver.trim() !== '' &&
        formData.username.trim() !== '' &&
        formData.password.trim() !== ''
})

// ===== 方法定义 =====

/**
 * 处理表单提交
 * 验证表单数据并触发登录事件
 */
const handleSubmit = () => {
    if (!isFormValid.value) {
        showError('请填写完整的登录信息')
        return
    }

    // 清除之前的错误信息
    errorMessage.value = ''

    // 设置登录状态
    isLoggingIn.value = true

    // 发送登录数据到父组件
    emit('login', { ...formData })
}

/**
 * 显示错误信息
 * @param message - 错误信息
 */
const showError = (message: string) => {
    errorMessage.value = message
}

/**
 * 重置登录状态
 * 供父组件调用，用于处理登录失败后的状态重置
 * @param error - 可选的错误信息
 */
const resetLoginState = (error?: string) => {
    isLoggingIn.value = false
    if (error) {
        errorMessage.value = error
    }
}

// ===== 暴露给父组件的方法 =====
defineExpose({
    resetLoginState,
    showError
})

// ===== 组件初始化 =====
console.log('LoginForm 组件已加载')
</script>

<style scoped>
.matrix-login-form {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
}

.form-input {
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    background: white;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
}

.error-message {
    padding: 12px;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 6px;
    color: #c33;
    font-size: 14px;
    text-align: center;
}

.login-button {
    padding: 14px 24px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.login-button:hover:not(:disabled) {
    background: #5a6fd8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    text-align: center;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-indicator p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
    .matrix-login-form {
        max-width: 100%;
        padding: 0 20px;
    }

    .form-input {
        padding: 10px 14px;
        font-size: 16px;
        /* 避免iOS缩放 */
    }

    .login-button {
        padding: 12px 20px;
        font-size: 16px;
    }
}
</style>
