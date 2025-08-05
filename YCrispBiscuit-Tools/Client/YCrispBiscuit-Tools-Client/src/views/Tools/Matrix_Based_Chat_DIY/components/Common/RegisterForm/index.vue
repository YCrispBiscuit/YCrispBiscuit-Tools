<template>
    <div class="matrix-register-form">
        <form @submit.prevent="handleSubmit" class="register-form">
            <!-- 服务器配置 -->
            <div class="form-group">
                <label for="reg-homeserver">Matrix 服务器地址</label>
                <input id="reg-homeserver" v-model="formData.homeserver" :disabled="isRegistering" type="url"
                    placeholder="https://chat.zy-jn.org.cn/" required class="form-input" />
            </div>

            <!-- 用户名 -->
            <div class="form-group">
                <label for="reg-username">用户名</label>
                <input id="reg-username" v-model="formData.username" :disabled="isRegistering" type="text"
                    placeholder="选择一个用户名" required class="form-input" />
                <small class="form-hint">用户名只能包含字母、数字和下划线</small>
            </div>

            <!-- 密码 -->
            <div class="form-group">
                <label for="reg-password">密码</label>
                <input id="reg-password" v-model="formData.password" :disabled="isRegistering" type="password"
                    placeholder="请输入密码" required class="form-input" />
            </div>

            <!-- 确认密码 -->
            <div class="form-group">
                <label for="reg-confirm-password">确认密码</label>
                <input id="reg-confirm-password" v-model="formData.confirmPassword" :disabled="isRegistering" type="password"
                    placeholder="请再次输入密码" required class="form-input" />
            </div>

            <!-- 错误信息显示 -->
            <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </div>

            <!-- 注册按钮 -->
            <button type="submit" :disabled="isRegistering || !isFormValid" class="register-button">
                {{ isRegistering ? '注册中...' : '注册账户' }}
            </button>

            <!-- 加载指示器 -->
            <div v-if="isRegistering" class="loading-indicator">
                <div class="spinner"></div>
                <p>正在向 Matrix 服务器注册账户...</p>
            </div>

            <!-- 切换到登录链接 -->
            <div class="switch-form">
                <p>已有账户？ <button type="button" @click="switchToLogin" class="link-button">立即登录</button></p>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { MatrixRegisterConfig } from '../../../types'

/**
 * Matrix注册表单组件
 * 提供用户注册界面，收集注册信息并验证
 * 
 * @author YCrispBiscuit
 * @created 2025-08-05
 */

// ===== 组件事件定义 =====
const emit = defineEmits<{
    /** 用户提交注册信息时触发 */
    register: [registerData: MatrixRegisterConfig]
    /** 用户要求切换到登录界面时触发 */
    'switch-to-login': []
}>()

// ===== 响应式数据 =====

/** 表单数据 */
const formData = reactive<MatrixRegisterConfig>({
    homeserver: 'https://chat.zy-jn.org.cn/',
    username: '',
    password: '',
    confirmPassword: ''
})

/** 注册状态 */
const isRegistering = ref(false)

/** 错误信息 */
const errorMessage = ref('')

// ===== 计算属性 =====

/** 表单验证状态 */
const isFormValid = computed(() => {
    return formData.homeserver.trim() !== '' &&
        formData.username.trim() !== '' &&
        formData.password.trim() !== '' &&
        formData.confirmPassword.trim() !== '' &&
        formData.password === formData.confirmPassword
})

// ===== 方法定义 =====

/**
 * 处理表单提交
 * 验证表单数据并触发注册事件
 */
const handleSubmit = () => {
    if (!isFormValid.value) {
        showError('请填写完整的注册信息且确保两次密码输入一致')
        return
    }

    // 额外的密码验证
    if (formData.password !== formData.confirmPassword) {
        showError('密码和确认密码不匹配')
        return
    }

    // 用户名格式验证
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(formData.username)) {
        showError('用户名只能包含字母、数字和下划线')
        return
    }

    // 密码强度验证
    if (formData.password.length < 6) {
        showError('密码长度至少需要6个字符')
        return
    }

    // 清除之前的错误信息
    errorMessage.value = ''

    // 设置注册状态
    isRegistering.value = true

    // 发送注册数据到父组件
    emit('register', { ...formData })
}

/**
 * 切换到登录界面
 */
const switchToLogin = () => {
    emit('switch-to-login')
}

/**
 * 显示错误信息
 * @param message - 错误信息
 */
const showError = (message: string) => {
    errorMessage.value = message
}

/**
 * 重置注册状态
 * 供父组件调用，用于处理注册失败后的状态重置
 * @param error - 可选的错误信息
 */
const resetRegisterState = (error?: string) => {
    isRegistering.value = false
    if (error) {
        errorMessage.value = error
    }
}

// ===== 暴露给父组件的方法 =====
defineExpose({
    resetRegisterState,
    showError
})

// ===== 组件初始化 =====
console.log('RegisterForm 组件已加载')
</script>

<style scoped>
.matrix-register-form {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.register-form {
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

.form-hint {
    color: #666;
    font-size: 12px;
    margin-top: -4px;
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

.register-button {
    padding: 14px 24px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.register-button:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.register-button:disabled {
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
    border-top: 3px solid #28a745;
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

.switch-form {
    text-align: center;
    padding-top: 10px;
    border-top: 1px solid #eee;
}

.switch-form p {
    margin: 0;
    color: #666;
    font-size: 14px;
}

.link-button {
    background: none;
    border: none;
    color: #667eea;
    text-decoration: underline;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
}

.link-button:hover {
    color: #5a6fd8;
}

/* 响应式设计 */
@media (max-width: 480px) {
    .matrix-register-form {
        max-width: 100%;
        padding: 0 20px;
    }

    .form-input {
        padding: 10px 14px;
        font-size: 16px;
        /* 避免iOS缩放 */
    }

    .register-button {
        padding: 12px 20px;
        font-size: 16px;
    }
}
</style>
