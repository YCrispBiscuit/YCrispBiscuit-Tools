<template>
  <div v-if="showVerification" class="verification-overlay">
    <div class="verification-dialog">
      <div class="verification-header">
        <h3>🔐 设备验证</h3>
        <button @click="closeVerification" class="close-btn">×</button>
      </div>
      
      <div class="verification-content">
        <!-- 等待验证请求阶段 -->
        <div v-if="verificationState === 'waiting'" class="verification-step">
          <div class="loading-spinner"></div>
          <p>正在等待验证请求...</p>
          <p class="hint">请在Element或其他Matrix客户端中查看验证请求</p>
        </div>

        <!-- 显示验证请求 -->
        <div v-else-if="verificationState === 'request' || verificationState === 'pending'" class="verification-step">
          <h4>收到验证请求</h4>
          <p>设备: {{ currentRequest?.otherDeviceId }}</p>
          <p>用户: {{ currentRequest?.otherUserId }}</p>
          <div class="verification-actions">
            <button @click="acceptVerification" class="accept-btn">接受验证</button>
            <button @click="rejectVerification" class="reject-btn">拒绝验证</button>
          </div>
        </div>

        <!-- 验证已开始，等待SAS -->
        <div v-else-if="verificationState === 'ready' || verificationState === 'started'" class="verification-step">
          <div class="loading-spinner"></div>
          <h4>验证进行中</h4>
          <p>正在生成验证码，请稍候...</p>
          <div class="verification-actions">
            <button @click="cancelVerification" class="reject-btn">取消验证</button>
          </div>
        </div>

        <!-- 显示验证码 -->
        <div v-else-if="verificationState === 'sas'" class="verification-step">
          <h4>验证码确认</h4>
          <p>请确认以下验证码与另一设备显示的相同：</p>
          <div class="sas-display">
            <div v-for="(emoji, index) in sasEmojis" :key="index" class="sas-emoji">
              <span class="emoji">{{ emoji.emoji }}</span>
              <span class="name">{{ emoji.name }}</span>
            </div>
          </div>
          <div class="verification-actions">
            <button @click="confirmSas" class="accept-btn">验证码匹配</button>
            <button @click="cancelVerification" class="reject-btn">验证码不匹配</button>
          </div>
        </div>

        <!-- 验证完成 -->
        <div v-else-if="verificationState === 'completed'" class="verification-step">
          <div class="success-icon">✅</div>
          <h4>验证成功！</h4>
          <p>设备已成功验证，现在可以安全地进行端到端加密通信</p>
          
          <!-- 提供交叉签名选项 -->
          <div v-if="showCrossSigningOption" class="cross-signing-option">
            <h5>🔐 启用交叉签名？</h5>
            <p>交叉签名可以让您的所有设备相互信任，提高安全性和便利性</p>
            <div class="verification-actions">
              <button @click="setupCrossSigning" class="accept-btn">启用交叉签名</button>
              <button @click="skipCrossSigning" class="neutral-btn">暂时跳过</button>
            </div>
          </div>
          
          <div v-else class="verification-actions">
            <button @click="closeVerification" class="accept-btn">完成</button>
          </div>
        </div>

        <!-- 验证失败 -->
        <div v-else-if="verificationState === 'failed'" class="verification-step">
          <div class="error-icon">❌</div>
          <h4>验证失败</h4>
          <p>{{ verificationError }}</p>
          <button @click="closeVerification" class="reject-btn">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { matrixClient } from '../../services/matrix/client'

// 验证状态
const showVerification = ref(false)
const loading = ref(false)
const verificationState = ref<'waiting' | 'pending' | 'request' | 'ready' | 'started' | 'sas' | 'completed' | 'failed' | 'confirming'>('waiting')
const currentRequest = ref<any>(null)
const currentVerifier = ref<any>(null)
const sasEmojis = ref<Array<{emoji: string, name: string}>>([])
const verificationError = ref('')
const sasConfirmCallback = ref<any>(null)
const showCrossSigningOption = ref(false)

// 打开验证界面
const openVerification = async () => {
  showVerification.value = true
  verificationState.value = 'waiting'  
  loading.value = true
  
  setupVerificationListeners()
  
  // 检查是否已有待处理的验证请求
  const client = matrixClient.获取已认证客户端()
  if (client && client.getCrypto()) {
    try {
      // 尝试多种API方法获取验证请求
      let requests
      const crypto = client.getCrypto()
      const userId = client.getUserId()
      
      // 尝试不同的API方法
      if (crypto.getVerificationRequestsToDeviceInProgress) {
        requests = crypto.getVerificationRequestsToDeviceInProgress(userId!)
      } else if (crypto.inRoomVerificationRequests) {
        requests = crypto.inRoomVerificationRequests
      } else if (crypto.verificationRequests) {
        requests = crypto.verificationRequests
      }
      
      console.log('获取到的验证请求:', requests)
      
      if (requests && (requests.size > 0 || requests.length > 0)) {
        const request = Array.isArray(requests) ? requests[0] : Array.from(requests.values())[0]
        console.log('找到验证请求:', request)
        loading.value = false
        handleVerificationRequest(request)
        return
      }
    } catch (error) {
      console.log('检查验证请求时出错:', error)
    }
  }
  
  loading.value = false
}

// 关闭验证界面
const closeVerification = () => {
  showVerification.value = false
  verificationState.value = 'waiting'
  currentRequest.value = null
  sasEmojis.value = []
  verificationError.value = ''
}

// 设置验证监听器
const setupVerificationListeners = () => {
  const client = matrixClient.获取已认证客户端()
  if (!client) {
    console.error('无法获取已认证客户端')
    return
  }

  // 监听验证请求事件 - 使用正确的事件名称
  client.on('crypto.verification.request', (request: any) => {
    console.log('收到新的验证请求:', request)
    showVerification.value = true  // 自动显示弹窗
    handleVerificationRequest(request)
  })
  
  // 备用事件监听
  client.on('toDeviceEvent', (event: any) => {
    if (event.getType() === 'm.key.verification.request') {
      console.log('通过toDeviceEvent收到验证请求:', event)
      // 这里需要将事件转换为验证请求对象
      const crypto = client.getCrypto()
      if (crypto) {
        // 重新检查验证请求
        setTimeout(() => {
          const requests = crypto.getVerificationRequestsToDeviceInProgress?.(client.getUserId())
          if (requests && requests.size > 0) {
            const request = Array.from(requests.values())[0]
            showVerification.value = true
            handleVerificationRequest(request)
          }
        }, 100)
      }
    }
  })
}

// 处理验证请求
const handleVerificationRequest = (request: any) => {
  currentRequest.value = request
  loading.value = false

  console.log('处理验证请求，当前阶段:', request.phase)
  
  // 根据当前阶段设置状态
  if (request.phase === 1 || request.phase === 'requested') {
    verificationState.value = 'pending'
  } else if (request.phase === 2 || request.phase === 'ready') {
    verificationState.value = 'request'  // 阶段2显示接受验证按钮
  } else if (request.phase === 3 || request.phase === 'started') {
    verificationState.value = 'started'
  } else if (request.phase === 4 || request.phase === 'show_sas') {
    verificationState.value = 'started'
    // 如果已经到了SAS阶段，立即处理
    const verifier = request.verifier
    if (verifier) {
      setupVerifier(verifier)
    }
  } else {
    verificationState.value = 'request'
  }

  // 监听验证状态变化
  request.on('change', () => {
    console.log('验证请求状态变化:', request.phase)
    
    if (request.phase === 1 || request.phase === 'requested') {
      // 验证请求等待接受
      verificationState.value = 'pending'
    } else if (request.phase === 2 || request.phase === 'ready') {
      // 验证请求已准备，显示接受按钮
      verificationState.value = 'request'
    } else if (request.phase === 3 || request.phase === 'started') {
      // 验证已开始，等待SAS
      verificationState.value = 'started'
      // 立即尝试获取验证器
      setTimeout(() => {
        const verifier = request.verifier
        if (verifier) {
          currentVerifier.value = verifier
          setupVerifier(verifier)
        }
      }, 100)
    } else if (request.phase === 4 || request.phase === 'show_sas') {
      // SAS验证码已显示
      console.log('显示SAS验证码, verifier:', request.verifier)
      const verifier = request.verifier
      if (verifier) {
        currentVerifier.value = verifier
        setupVerifier(verifier)
      }
    } else if (request.phase === 5 || request.phase === 'done') {
      // 验证完成 - 但只有在用户确认SAS后才真正完成
      console.log('验证阶段5/done，检查是否需要用户确认')
      if (verificationState.value === 'confirming') {
        // 用户已经确认了SAS，可以标记为完成
        console.log('用户已确认SAS，验证完成!')
        verificationState.value = 'completed'
        // 检查是否需要设置交叉签名
        checkCrossSigningStatus()
        setTimeout(() => {
          if (!showCrossSigningOption.value) {
            closeVerification()
          }
        }, 2000)
      } else if (verificationState.value !== 'sas') {
        // 如果还没有显示SAS，直接完成
        console.log('未显示SAS直接完成')
        verificationState.value = 'completed'
        setTimeout(() => {
          closeVerification()
        }, 2000)
      } else {
        // 正在显示SAS，不要自动完成
        console.log('正在显示SAS，等待用户确认')
      }
    } else if (request.phase === 'cancelled' || request.phase === 'failed') {
      // 验证失败
      console.log('验证失败或取消:', request.phase)
      verificationState.value = 'failed'
      verificationError.value = request.cancellationCode || '验证被取消'
    }
  })
}

// 接受验证请求
const acceptVerification = async () => {
  if (!currentRequest.value) {
    console.error('没有当前验证请求')
    return
  }
  
  try {
    console.log('当前验证请求阶段:', currentRequest.value.phase)
    
    // 如果已经在进行中的阶段，直接获取验证器
    if (currentRequest.value.phase === 4 || currentRequest.value.phase === 'started') {
      console.log('验证已开始，获取验证器...')
      const verifier = currentRequest.value.verifier
      if (verifier) {
        console.log('验证器已存在:', verifier)
        currentVerifier.value = verifier
        setupVerifier(verifier)
        return
      }
    }
    
    // 如果还在等待接受阶段，调用accept
    if (currentRequest.value.phase === 2 || currentRequest.value.phase === 'ready') {
      console.log('接受验证请求...')
      await currentRequest.value.accept()
      console.log('验证请求已接受')
    }
    
    // 等待验证器创建并设置
    setTimeout(() => {
      const verifier = currentRequest.value?.verifier
      if (verifier) {
        console.log('验证器已创建:', verifier)
        currentVerifier.value = verifier
        setupVerifier(verifier)
      }
    }, 500)
    
  } catch (error: any) {
    console.error('处理验证请求失败:', error)
    verificationState.value = 'failed'
    verificationError.value = error.message || '处理验证请求失败'
  }
}

// 设置验证器事件监听
const setupVerifier = (verifier: any) => {
  console.log('设置验证器事件监听...', verifier)
  
  // 监听SAS显示事件
  verifier.on('show_sas', (e: any) => {
    console.log('显示SAS验证码事件:', e)
    if (e.sas) {
      if (e.sas.emoji) {
        console.log('SAS表情符号:', e.sas.emoji)
        // 转换格式：从 [["🐶", "dog"], ["🏠", "house"]] 转换为 [{emoji: "🐶", name: "dog"}]
        const formattedEmojis = e.sas.emoji.map((item: any) => {
          if (Array.isArray(item) && item.length >= 2) {
            return { emoji: item[0], name: item[1] }
          } else if (item && typeof item === 'object' && item.emoji) {
            return item
          } else {
            return { emoji: '❓', name: 'unknown' }
          }
        })
        console.log('格式化后的SAS表情符号:', formattedEmojis)
        sasEmojis.value = formattedEmojis
        verificationState.value = 'sas'
      }
      if (e.sas.decimal) {
        console.log('SAS数字:', e.sas.decimal)
        // 如果需要可以也支持数字验证
      }
    }
    
    // 保存确认回调
    if (typeof e.confirm === 'function') {
      console.log('保存SAS确认回调')
      sasConfirmCallback.value = e.confirm
    }
  })
  
  // 监听验证完成事件
  verifier.on('done', (e: any) => {
    console.log('验证器完成事件:', e)
    // 不要立即设置为完成，等待手动确认
  })
  
  // 监听验证取消事件
  verifier.on('cancel', (e: any) => {
    console.log('验证器取消事件:', e)
    verificationState.value = 'failed'
    verificationError.value = e.reason || '验证被取消'
  })
  
  // 尝试获取SAS回调
  try {
    if (typeof verifier.getShowSasCallbacks === 'function') {
      console.log('调用getShowSasCallbacks...')
      const callbacks = verifier.getShowSasCallbacks()
      console.log('SAS回调:', callbacks)
      
      // 如果有回调，尝试执行
      if (callbacks && typeof callbacks.accept === 'function') {
        console.log('找到SAS accept回调')
        // 暂时不自动接受，等待用户操作
      }
    }
  } catch (error) {
    console.error('获取SAS回调失败:', error)
  }
  
  // 立即检查验证器状态和SAS数据
  setTimeout(async () => {
    console.log('检查验证器当前状态:', verifier.verificationPhase)
    console.log('验证器完整对象:', verifier)
    console.log('验证器原型方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(verifier)))
    
    // 首先尝试发送accept以确保SAS生成
    try {
      if (typeof verifier.sendAccept === 'function') {
        console.log('在获取SAS前发送accept...')
        await verifier.sendAccept()
        console.log('accept已发送，等待SAS生成')
        
        // 等待一段时间让SAS生成
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('发送accept失败:', error)
    }
    
    // 尝试多种方式获取SAS数据
    try {
      // 方法1: 直接访问属性
      if (verifier.emoji && verifier.emoji.length > 0) {
        console.log('方法1 - 验证器emoji属性:', verifier.emoji)
        sasEmojis.value = verifier.emoji
        verificationState.value = 'sas'
        return
      }
      
      // 方法2: 调用方法
      if (typeof verifier.getEmojiIndex === 'function') {
        const sasEmoji = verifier.getEmojiIndex()
        console.log('方法2 - getEmojiIndex():', sasEmoji)
        if (sasEmoji && sasEmoji.length > 0) {
          sasEmojis.value = sasEmoji
          verificationState.value = 'sas'
          return
        }
      }
      
      // 方法3: 检查inner对象 - 需要等待SAS生成
      if (verifier.inner && verifier.inner.emoji) {
        console.log('方法3 - inner.emoji函数:', verifier.inner.emoji)
        // 尝试多次获取，因为SAS可能还没生成
        let attempts = 0
        const tryGetEmoji = () => {
          try {
            const emojiResult = verifier.inner.emoji()
            console.log(`方法3 - 第${attempts + 1}次调用inner.emoji()结果:`, emojiResult)
            if (emojiResult && emojiResult.length > 0) {
              // 转换Emoji对象格式
              const formattedEmojis = emojiResult.map((emojiObj: any) => {
                if (emojiObj && typeof emojiObj.emoji === 'function' && typeof emojiObj.description === 'function') {
                  return {
                    emoji: emojiObj.emoji(),
                    name: emojiObj.description()
                  }
                } else if (Array.isArray(emojiObj) && emojiObj.length >= 2) {
                  return { emoji: emojiObj[0], name: emojiObj[1] }
                } else if (emojiObj && typeof emojiObj === 'object' && emojiObj.emoji) {
                  return emojiObj
                } else {
                  return { emoji: '❓', name: 'unknown' }
                }
              })
              console.log(`格式化后的emoji结果:`, formattedEmojis)
              sasEmojis.value = formattedEmojis
              verificationState.value = 'sas'
              return true
            }
          } catch (error) {
            console.error(`第${attempts + 1}次调用inner.emoji()失败:`, error)
          }
          return false
        }
        
        // 立即尝试一次
        if (tryGetEmoji()) return
        
        // 如果失败，每1000ms重试一次，最多重试8次（等待更长时间）
        const retryInterval = setInterval(() => {
          attempts++
          if (tryGetEmoji() || attempts >= 8) {
            clearInterval(retryInterval)
            if (attempts >= 8) {
              console.log('重试8次后仍无法获取SAS，等待show_sas事件')
            }
          }
        }, 1000)
        
        return // 让重试机制处理
      }
      
      // 方法4: 检查其他可能的方法
      const methods = ['emoji', 'getEmoji', 'getSasEmoji', 'getEmojiSas']
      for (const method of methods) {
        if (typeof verifier[method] === 'function') {
          try {
            console.log(`尝试调用方法: ${method}`)
            const result = verifier[method]()
            console.log(`方法 ${method} 结果:`, result)
            if (result && result.length > 0) {
              sasEmojis.value = result
              verificationState.value = 'sas'
              return
            }
          } catch (error) {
            console.error(`调用 ${method} 失败:`, error)
          }
        }
      }
      
      // 方法5: 等待SAS事件
      console.log('所有直接方法都失败，等待show_sas事件...')
      
    } catch (error) {
      console.error('获取SAS码失败:', error)
    }
  }, 500)
}

// 拒绝验证请求
const rejectVerification = async () => {
  if (!currentRequest.value) return
  
  try {
    console.log('拒绝验证请求')
    await currentRequest.value.cancel()
    closeVerification()
  } catch (error: any) {
    console.error('拒绝验证失败:', error)
  }
}

// 确认SAS验证码
const confirmSas = async () => {
  if (!currentRequest.value) return
  
  try {
    console.log('确认SAS验证码')
    console.log('当前请求:', currentRequest.value)
    console.log('当前验证器:', currentVerifier.value)
    console.log('SAS确认回调:', sasConfirmCallback.value)
    
    // 优先使用SAS事件回调
    if (sasConfirmCallback.value && typeof sasConfirmCallback.value === 'function') {
      console.log('使用SAS事件确认回调')
      await sasConfirmCallback.value()
      console.log('SAS确认回调执行成功')
      verificationState.value = 'confirming'
      
      // 等待验证完成
      setTimeout(() => {
        if (verificationState.value === 'confirming') {
          verificationState.value = 'completed'
        }
      }, 2000)
      return
    }
    
    // 回退到验证器方法
    let verifier = currentVerifier.value || currentRequest.value.verifier
    
    if (verifier) {
      console.log('使用验证器确认SAS:', verifier)
      
      // 尝试多种确认方法
      if (typeof verifier.confirm === 'function') {
        console.log('调用verifier.confirm()')
        await verifier.confirm()
      } else if (typeof verifier.verify === 'function') {
        console.log('调用verifier.verify()')
        await verifier.verify()
      } else if (verifier.inner && typeof verifier.inner.confirm === 'function') {
        console.log('调用verifier.inner.confirm()')
        await verifier.inner.confirm()
      } else if (typeof verifier.accept === 'function') {
        console.log('调用verifier.accept()')
        await verifier.accept()
      } else if (currentRequest.value && typeof currentRequest.value.accept === 'function') {
        console.log('通过请求确认')
        await currentRequest.value.accept()
      } else {
        console.error('无法找到确认方法，验证器属性:', Object.keys(verifier))
        console.error('验证器类型:', verifier.constructor.name)
        console.error('验证器原型方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(verifier)))
        verificationState.value = 'failed'
        verificationError.value = '无法确认验证码'
        return
      }
      
      console.log('SAS验证码确认成功')
      verificationState.value = 'confirming'
      
      // 等待验证完成
      setTimeout(() => {
        if (verificationState.value === 'confirming') {
          verificationState.value = 'completed'
        }
      }, 2000)
      
    } else {
      console.error('无法找到验证器或确认回调')
      verificationState.value = 'failed'
      verificationError.value = '无法找到验证器'
    }
  } catch (error: any) {
    console.error('确认SAS失败:', error)
    verificationState.value = 'failed'
    verificationError.value = error.message || '确认验证码失败'
  }
}

// 取消验证
const cancelVerification = async () => {
  if (!currentRequest.value) return
  
  try {
    console.log('取消验证')
    // 直接取消验证请求
    await currentRequest.value.cancel()
    closeVerification()
  } catch (error: any) {
    console.error('取消验证失败:', error)
    closeVerification()
  }
}

// 暴露给父组件的方法
defineExpose({
  openVerification
})

// 设置交叉签名
const setupCrossSigning = async () => {
  try {
    console.log('开始设置交叉签名...')
    loading.value = true
    
    // 调用客户端的交叉签名初始化
    await matrixClient.初始化交叉签名()
    
    console.log('交叉签名设置成功')
    showCrossSigningOption.value = false
    
    // 可以考虑显示成功提示
    setTimeout(() => {
      closeVerification()
    }, 1000)
    
  } catch (error) {
    console.error('设置交叉签名失败:', error)
    verificationError.value = '交叉签名设置失败: ' + (error as Error).message
  } finally {
    loading.value = false
  }
}

// 跳过交叉签名
const skipCrossSigning = () => {
  console.log('用户选择跳过交叉签名')
  showCrossSigningOption.value = false
  closeVerification()
}

// 检查交叉签名状态
const checkCrossSigningStatus = async () => {
  try {
    const client = matrixClient.获取已认证客户端()
    if (!client) return

    const crypto = client.getCrypto()
    const userId = client.getUserId()
    
    if (!crypto || !userId) return

    // 检查交叉签名是否已设置
    const crossSigningInfo = await crypto.getCrossSigningInfo?.(userId)
    
    if (!crossSigningInfo || !crossSigningInfo.getId()) {
      // 没有交叉签名，显示设置选项
      console.log('检测到没有交叉签名，显示设置选项')
      showCrossSigningOption.value = true
    } else {
      console.log('交叉签名已存在')
      showCrossSigningOption.value = false
    }
  } catch (error) {
    console.warn('检查交叉签名状态失败:', error)
    showCrossSigningOption.value = false
  }
}

onMounted(() => {
  // 组件挂载时立即设置监听器，这样就能接收到验证请求
  setupVerificationListeners()
})

onUnmounted(() => {
  // 清理监听器
})
</script>

<style scoped>
.verification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.verification-dialog {
  background: white;
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.verification-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.verification-content {
  padding: 20px;
}

.verification-step {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hint {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
}

.verification-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.accept-btn, .reject-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.accept-btn {
  background: #28a745;
  color: white;
}

.accept-btn:hover {
  background: #218838;
}

.reject-btn {
  background: #dc3545;
  color: white;
}

.reject-btn:hover {
  background: #c82333;
}

.sas-display {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.sas-emoji {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.sas-emoji .emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.sas-emoji .name {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.success-icon, .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-icon {
  color: #28a745;
}

.error-icon {
  color: #dc3545;
}

.cross-signing-option {
  margin-top: 20px;
  padding: 16px;
  background: #e8f4f8;
  border-radius: 8px;
  border-left: 4px solid #17a2b8;
}

.cross-signing-option h5 {
  margin: 0 0 8px 0;
  color: #17a2b8;
}

.cross-signing-option p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.neutral-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.neutral-btn:hover {
  background: #5a6268;
}
</style>
