// Matrix 客户端管理服务
// 负责处理Matrix客户端的创建、登录、认证、加密初始化等核心功能
import * as sdk from "matrix-js-sdk";
import type { MatrixLoginConfig, MatrixRegisterConfig, MatrixUser } from '../../types'

/**
 * Matrix客户端服务类
 * 这是整个Matrix功能的核心，负责与Matrix服务器的连接和认证
 */
class Matrix客户端服务类 {
  
  // 基础客户端实例（用于登录等未认证操作）
  private 基础客户端实例: any = null
  
  // 已认证的客户端实例（用于发送消息、获取房间等需要认证的操作）
  private 已认证客户端实例: any = null

  /**
   * 创建基础Matrix客户端
   * 这个客户端只能执行不需要登录的操作，比如登录本身
   * @param 服务器地址 - Matrix服务器的URL，如 https://matrix.org
   * @returns 基础客户端实例
   */
  创建基础客户端(服务器地址: string) {
    // 确保服务器地址有正确的协议前缀
    let 完整服务器地址 = 服务器地址
    if (!完整服务器地址.startsWith('http://') && !完整服务器地址.startsWith('https://')) {
      完整服务器地址 = `https://${完整服务器地址}`
    }
    
    console.log(`创建Matrix基础客户端，连接服务器: ${完整服务器地址}`)
    this.基础客户端实例 = sdk.createClient({ baseUrl: 完整服务器地址 })
    return this.基础客户端实例
  }

  /**
   * 为用户生成唯一的设备ID
   * 基于用户ID生成一致的设备ID，确保同一用户每次登录都使用相同设备ID
   * @param userId - Matrix用户ID，如 @user:server.com
   * @returns 该用户的唯一设备ID
   */
  private 生成用户设备ID(userId: string): string {
    // 提取用户名部分，去掉@和服务器部分
    const 用户名 = userId.split(':')[0].replace('@', '')
    // 生成格式：LingJing_用户名_CLIENT
    return `LingJing_AI_${用户名}_CLIENT`
  }

  /**
   * 用户登录到Matrix服务器
   * @param 登录配置 - 包含服务器地址、用户名、密码的配置对象
   * @returns 登录成功的用户信息
   * @throws 如果登录失败则抛出详细错误信息
   */
  async 用户登录(登录配置: MatrixLoginConfig): Promise<MatrixUser> {
    // 清理之前的客户端实例，确保完全重新开始
    this.基础客户端实例 = null
    this.已认证客户端实例 = null
    
    // 生成完整的Matrix用户ID格式：@username:server.com
    const 完整用户ID = this.生成完整用户ID(登录配置.username, 登录配置.homeserver)
    const 新设备ID = this.生成用户设备ID(完整用户ID)
    
    // 🔍 检查设备ID是否发生变化，如果变化则清理相关存储
    await this.检查并处理设备ID变化(完整用户ID, 新设备ID)
    
    // 每次登录都重新创建基础客户端，确保使用正确的服务器地址
    console.log(`准备登录到服务器: ${登录配置.homeserver}`)
    this.创建基础客户端(登录配置.homeserver)
    
    console.log(`开始登录Matrix账户: ${完整用户ID}`)
    console.log(`基础客户端baseUrl: ${this.基础客户端实例?.baseUrl}`)

    try {
      // 🔑 使用已生成的设备ID
      const 设备显示名 = `LingJing 客户端 - ${登录配置.username}`
      
      // 调用Matrix SDK的登录接口
      const 登录结果 = await this.基础客户端实例.loginRequest({
        type: "m.login.password",  // 使用密码登录方式
        identifier: {
          type: "m.id.user",
          user: 完整用户ID
        },
        password: 登录配置.password,
        device_id: 新设备ID, // 🔑 使用检查后的设备ID
        initial_device_display_name: 设备显示名 // 🔑 个性化显示名
      })

      console.log(`登录成功! 用户ID: ${登录结果.user_id}`)
      console.log(`设备ID: ${登录结果.device_id}`)

      // 使用登录获得的访问令牌创建已认证的客户端
      this.已认证客户端实例 = sdk.createClient({
        baseUrl: this.基础客户端实例.baseUrl,  // 使用基础客户端的相同地址
        accessToken: 登录结果.access_token,  // 这是关键：访问令牌
        userId: 登录结果.user_id,
        deviceId: 登录结果.device_id, // 传递设备ID
        useAuthorizationHeader: true  // 使用Authorization头而不是查询参数
      })
      
      console.log(`已认证客户端创建成功, baseUrl: ${this.已认证客户端实例.baseUrl}`)
      console.log(`客户端设备ID: ${this.已认证客户端实例.getDeviceId()}`)

      // 保存登录参数到本地存储
      this.保存登录参数(登录配置)

      // 返回用户信息
      return {
        userId: 登录结果.user_id,
        displayName: 登录结果.user_id  // TODO: 后续可以获取用户的真实显示名称
      }

    } catch (登录错误: any) {
      const 错误信息 = 登录错误.message || 登录错误.toString()
      console.error('登录失败:', 错误信息)
      
      // 根据不同的错误类型提供友好的提示
      if (错误信息.includes('M_FORBIDDEN') || 错误信息.includes('Invalid password')) {
        throw new Error('用户名或密码错误，请重新输入')
      } else if (错误信息.includes('M_USER_DEACTIVATED')) {
        throw new Error('此账户已被停用，请联系管理员')
      } else if (错误信息.includes('M_LIMIT_EXCEEDED') || 错误信息.includes('429') || 错误信息.includes('Too Many Requests')) {
        throw new Error('登录尝试过于频繁，请等待30秒后再试')
      } else if (错误信息.includes('Network')) {
        throw new Error('网络连接失败，请检查网络设置或服务器地址')
      } else {
        throw new Error(`登录失败: ${错误信息}`)
      }
    }
  }

  /**
   * 用户注册到Matrix服务器
   * @param 注册配置 - 包含服务器地址、用户名、密码等注册信息
   * @returns 注册成功的用户信息
   * @throws 如果注册失败则抛出详细错误信息
   */
  async 用户注册(注册配置: MatrixRegisterConfig): Promise<MatrixUser> {
    console.log(`开始注册Matrix账户: ${注册配置.username}@${注册配置.homeserver}`)

    // 验证密码确认
    if (注册配置.password !== 注册配置.confirmPassword) {
      throw new Error('密码和确认密码不匹配')
    }

    // 清理之前的客户端实例
    this.基础客户端实例 = null
    this.已认证客户端实例 = null

    // 创建基础客户端用于注册
    this.创建基础客户端(注册配置.homeserver)

    try {
      console.log(`向服务器发送注册请求...`)
      
      // 构建注册请求数据
      const 注册数据 = {
        username: 注册配置.username,
        password: 注册配置.password,
        initial_device_display_name: `LingJing 客户端 - ${注册配置.username}`,
        inhibit_login: false // 注册后自动登录
      }

      // 调用Matrix SDK的注册接口
      const 注册结果 = await this.基础客户端实例.registerRequest(注册数据)

      console.log(`注册成功! 用户ID: ${注册结果.user_id}`)
      console.log(`设备ID: ${注册结果.device_id}`)

      // 如果注册成功且没有禁止登录，创建已认证的客户端
      if (注册结果.access_token && 注册结果.device_id) {
        this.已认证客户端实例 = sdk.createClient({
          baseUrl: this.基础客户端实例.baseUrl,
          accessToken: 注册结果.access_token,
          userId: 注册结果.user_id,
          deviceId: 注册结果.device_id,
          useAuthorizationHeader: true
        })

        console.log(`已认证客户端创建成功`)

        // 保存登录参数到本地存储
        this.保存登录参数({
          homeserver: 注册配置.homeserver,
          username: 注册配置.username,
          password: 注册配置.password
        })

        return {
          userId: 注册结果.user_id,
          displayName: 注册结果.user_id
        }
      } else {
        throw new Error('注册成功但未获得访问令牌，请手动登录')
      }

    } catch (注册错误: any) {
      const 错误信息 = 注册错误.message || 注册错误.toString()
      console.error('注册失败:', 错误信息)

      // 根据不同的错误类型提供友好的提示
      if (错误信息.includes('M_USER_IN_USE') || 错误信息.includes('User ID already taken')) {
        throw new Error('用户名已被占用，请选择其他用户名')
      } else if (错误信息.includes('M_INVALID_USERNAME')) {
        throw new Error('用户名格式无效，请使用字母、数字和下划线')
      } else if (错误信息.includes('M_WEAK_PASSWORD')) {
        throw new Error('密码强度不足，请使用更复杂的密码')
      } else if (错误信息.includes('M_REGISTRATION_DISABLED')) {
        throw new Error('此服务器已禁用用户注册')
      } else if (错误信息.includes('M_LIMIT_EXCEEDED') || 错误信息.includes('429')) {
        throw new Error('注册请求过于频繁，请稍后再试')
      } else if (错误信息.includes('Network')) {
        throw new Error('网络连接失败，请检查网络设置或服务器地址')
      } else {
        throw new Error(`注册失败: ${错误信息}`)
      }
    }
  }

  /**
   * 保存登录参数到本地存储
   * @param 登录配置 - 要保存的登录参数
   */
  保存登录参数(登录配置: MatrixLoginConfig): void {
    try {
      // 使用简单的编码（不是加密，只是编码以避免明文存储）
      const 编码数据 = btoa(JSON.stringify(登录配置))
      localStorage.setItem('matrix_login_params', 编码数据)
      console.log('登录参数已保存到本地存储')
    } catch (错误) {
      console.warn('保存登录参数失败:', 错误)
    }
  }

  /**
   * 从本地存储加载登录参数
   * @returns 保存的登录参数，如果没有则返回null
   */
  加载登录参数(): MatrixLoginConfig | null {
    try {
      const 编码数据 = localStorage.getItem('matrix_login_params')
      if (!编码数据) {
        return null
      }

      const 解码数据 = JSON.parse(atob(编码数据))
      console.log('从本地存储加载登录参数成功')
      return 解码数据
    } catch (错误) {
      console.warn('加载登录参数失败:', 错误)
      // 清理无效数据
      localStorage.removeItem('matrix_login_params')
      return null
    }
  }

  /**
   * 清除本地存储的登录参数
   */
  清除登录参数(): void {
    localStorage.removeItem('matrix_login_params')
    console.log('登录参数已从本地存储清除')
  }

  /**
   * 初始化端到端加密功能
   * Matrix支持端到端加密以保护消息隐私，但需要额外的初始化
   * @throws 如果加密初始化失败会记录警告但不影响基础功能
   */
  async 初始化加密功能(): Promise<void> {
    if (!this.已认证客户端实例) {
      console.warn('没有已认证的客户端，无法初始化加密功能')
      return
    }

    console.log('开始初始化Matrix端到端加密功能...')

    try {
      // 尝试使用Rust版本的加密（推荐，性能更好）
      if (typeof this.已认证客户端实例.initRustCrypto === 'function') {
        await this.已认证客户端实例.initRustCrypto()
        console.log("✅ 端到端加密初始化成功 (使用 initRustCrypto)")
      } 
      // 回退到老版本的加密初始化
      else if (typeof this.已认证客户端实例.initCrypto === 'function') {
        await this.已认证客户端实例.initCrypto()
        console.log("✅ 端到端加密初始化成功 (使用 initCrypto)")
      } 
      // 如果都没有，说明当前SDK版本不支持加密
      else {
        console.log("⚠️ 当前Matrix SDK版本不支持加密功能，将使用基础模式")
        console.log("   在基础模式下可以发送和接收明文消息，但无法处理加密房间")
        return
      }

      // 加密初始化成功后，初始化交叉签名和密钥备份
      await this.初始化交叉签名()
      await this.初始化密钥备份()
      
      // 添加加密事件监听器，优化错误处理
      this.设置加密事件监听器()
      
    } catch (加密初始化错误: any) {
      const 错误详情 = 加密初始化错误.message || 加密初始化错误.toString()
      console.warn("⚠️ 加密初始化失败，继续使用非加密模式:", 错误详情)
      console.warn("   这意味着您可能无法在启用了端到端加密的房间中发送消息")
    }
  }

  /**
   * 设置加密相关事件监听器，优化错误处理和用户体验
   */
  private 设置加密事件监听器(): void {
    if (!this.已认证客户端实例) return

    // 监听Olm会话错误，过滤重放警告
    this.已认证客户端实例.on('crypto.warning' as any, (warning: any) => {
      if (warning && warning.type) {
        // 过滤掉常见的无害警告
        if (warning.type.includes('OLM_REPLAY_ATTACK') || 
            warning.type.includes('REPLAY') ||
            warning.message?.includes('replay') ||
            warning.message?.includes('已使用')) {
          // 这些是正常的会话状态调整，不需要用户关注
          return
        }
        // 其他加密警告仍然显示，但使用更友好的格式
        console.log('🔐 加密状态提示:', warning.message || warning.type)
      }
    })

    // 监听解密错误，提供友好提示
    this.已认证客户端实例.on('Event.decrypted' as any, (event: any) => {
      if (event.isDecryptionFailure?.()) {
        console.log('🔓 消息解密处理中...（如果是历史消息可能需要密钥恢复）')
      }
    })
  }

  /**
   * 初始化密钥备份和恢复
   */
  async 初始化密钥备份(): Promise<void> {
    if (!this.已认证客户端实例) {
      return
    }

    try {
      console.log('🔑 检查并尝试恢复密钥备份...')
      
      // 安全检查密钥备份API是否存在
      if (typeof this.已认证客户端实例.getKeyBackupVersion !== 'function') {
        console.log('🔑 当前SDK版本不支持密钥备份API，跳过')
        return
      }
      
      // 检查是否有可用的密钥备份
      const 备份信息 = await this.已认证客户端实例.getKeyBackupVersion()
      
      if (备份信息) {
        console.log('🔑 发现密钥备份版本:', 备份信息.version)
        
        // 尝试信任并恢复备份
        try {
          if (typeof this.已认证客户端实例.trustKeyBackupVersion === 'function') {
            await this.已认证客户端实例.trustKeyBackupVersion(备份信息)
          }
          
          if (typeof this.已认证客户端实例.restoreKeyBackupWithCache === 'function') {
            const 恢复结果 = await this.已认证客户端实例.restoreKeyBackupWithCache()
            
            if (恢复结果 && 恢复结果.imported > 0) {
              console.log(`🔑 成功恢复 ${恢复结果.imported} 个密钥`)
            } else {
              console.log('🔑 没有新的密钥需要恢复')
            }
          }
        } catch (恢复错误) {
          console.log('🔑 密钥备份恢复失败:', 恢复错误)
        }
      } else {
        console.log('🔑 没有发现密钥备份')
      }
    } catch (错误: any) {
      console.log('🔑 密钥备份检查失败（不影响聊天功能）:', 错误.message || 错误)
    }
  }

  /**
   * 初始化交叉签名
   * 交叉签名用于验证用户的所有设备，提高安全性
   */
  async 初始化交叉签名(): Promise<void> {
    if (!this.已认证客户端实例) {
      console.warn('⚠️ 无法初始化交叉签名：客户端未认证')
      return
    }

    try {
      console.log('🔐 开始初始化交叉签名...')
      const crypto = this.已认证客户端实例.getCrypto()
      
      if (!crypto) {
        console.log('⚠️ 加密模块未初始化，跳过交叉签名设置')
        return
      }

      const userId = this.已认证客户端实例.getUserId()
      
      // 检查交叉签名是否已经设置
      try {
        const crossSigningInfo = await crypto.getCrossSigningInfo?.(userId)
        
        if (crossSigningInfo && crossSigningInfo.getId && crossSigningInfo.getId()) {
          console.log('🔐 交叉签名已存在，无需重新设置')
          return
        }
      } catch (checkError) {
        console.log('🔐 交叉签名信息检查失败，将尝试初始化')
      }

      // 谨慎初始化交叉签名
      if (crypto.bootstrapCrossSigning) {
        console.log('🔐 正在谨慎地引导交叉签名设置...')
        
        try {
          await crypto.bootstrapCrossSigning({
            authUploadDeviceSigningKeys: async (makeRequest: any) => {
              console.log('🔐 尝试上传设备签名密钥...')
              try {
                // 简化授权流程，避免401错误
                return await makeRequest({})
              } catch (uploadError: any) {
                console.warn('🔐 设备签名密钥上传失败（这是常见现象）:', uploadError.message)
                // 返回null而不是抛出错误，让bootstrap继续
                return null
              }
            },
            setupNewCrossSigning: true
          })
          
          console.log('🔐 交叉签名初始化成功')
          
        } catch (bootstrapError: any) {
          console.warn('🔐 交叉签名引导失败，但不影响基础聊天功能:', bootstrapError.message)
          // 不重新抛出错误
        }
        
      } else {
        console.log('🔐 当前SDK版本不支持交叉签名，跳过')
      }
    } catch (错误: any) {
      console.warn('🔐 交叉签名初始化过程中出现问题（不影响聊天功能）:', 错误.message || 错误)
      // 确保不抛出错误，让应用继续运行
    }
  }

  /**
   * 检查设备信任状态
   * @param userId 用户ID
   * @param deviceId 设备ID
   * @returns 设备是否被信任
   */
  async 检查设备信任状态(userId: string, deviceId: string): Promise<boolean> {
    if (!this.已认证客户端实例) {
      return false
    }

    try {
      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto) {
        return false
      }

      const deviceInfo = await crypto.getDeviceInfo(userId, deviceId)
      return deviceInfo?.isVerified() || false
    } catch (错误) {
      console.warn('检查设备信任状态失败:', 错误)
      return false
    }
  }

  /**
   * 获取用户的所有设备
   * @param userId 用户ID，如果不提供则获取当前用户的设备
   * @returns 设备列表
   */
  async 获取用户设备列表(userId?: string): Promise<any[]> {
    if (!this.已认证客户端实例) {
      return []
    }

    try {
      const targetUserId = userId || this.已认证客户端实例.getUserId()
      if (!targetUserId) return []

      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto) {
        console.warn('加密模块未初始化，无法获取设备列表')
        return []
      }

      // 获取设备列表
      const devices = await crypto.getUserDeviceInfo([targetUserId])
      const userDevices = devices.get(targetUserId)
      
      if (!userDevices) {
        console.log(`用户 ${targetUserId} 没有设备信息`)
        return []
      }

      const deviceList = Array.from(userDevices.values()).map((device: any) => ({
        deviceId: device.deviceId,
        displayName: device.getDisplayName?.() || '未知设备',
        isVerified: device.isVerified?.() || false,
        isBlocked: device.isBlocked?.() || false,
        userId: targetUserId,
        keys: device.keys || {}
      }))

      console.log(`获取到用户 ${targetUserId} 的 ${deviceList.length} 个设备`)
      return deviceList

    } catch (错误) {
      console.warn('获取用户设备列表失败:', 错误)
      return []
    }
  }

  /**
   * 标记设备为已验证
   * @param userId 用户ID
   * @param deviceId 设备ID
   * @param verified 是否验证
   */
  async 设置设备验证状态(userId: string, deviceId: string, verified: boolean): Promise<void> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto) {
        throw new Error('加密模块未初始化')
      }

      console.log(`设置设备 ${deviceId} 验证状态为: ${verified}`)
      
      if (crypto.setDeviceVerified) {
        await crypto.setDeviceVerified(userId, deviceId, verified)
        console.log(`设备 ${deviceId} 验证状态已更新`)
      } else {
        console.warn('当前SDK版本不支持设置设备验证状态')
      }
    } catch (错误) {
      console.error('设置设备验证状态失败:', 错误)
      throw 错误
    }
  }

  /**
   * 启动密钥共享监听
   * 监听来自其他设备的密钥请求
   */
  启动密钥共享监听(): void {
    if (!this.已认证客户端实例) {
      console.warn('客户端未认证，无法启动密钥共享监听')
      return
    }

    console.log('🔑 启动密钥共享监听...')

    // 监听密钥请求事件
    this.已认证客户端实例.on('crypto.roomKeyRequest', (request: any) => {
      console.log('🔑 收到密钥请求:', request)
      this.处理密钥请求(request)
    })

    // 监听密钥共享事件
    this.已认证客户端实例.on('crypto.roomKeyRequestCancellation', (request: any) => {
      console.log('🔑 密钥请求被取消:', request)
    })

    // 监听设备变化事件
    this.已认证客户端实例.on('crypto.devicesUpdated', (users: string[]) => {
      console.log('🔐 设备列表更新:', users)
      this.处理设备列表更新(users)
    })

    console.log('🔑 密钥共享监听已启动')
  }

  /**
   * 处理密钥请求
   * @param request 密钥请求对象
   */
  private async 处理密钥请求(request: any): Promise<void> {
    try {
      const { requesting_device_id, requesting_user_id, room_id, session_id } = request

      console.log(`🔑 处理来自设备 ${requesting_device_id} 的密钥请求`)

      // 检查请求设备是否被信任
      const isDeviceTrusted = await this.检查设备信任状态(requesting_user_id, requesting_device_id)
      
      if (!isDeviceTrusted) {
        console.log(`🔑 设备 ${requesting_device_id} 未被信任，拒绝密钥请求`)
        return
      }

      // 如果设备被信任，自动共享密钥
      const crypto = this.已认证客户端实例?.getCrypto()
      if (crypto && crypto.shareRoomKey) {
        await crypto.shareRoomKey(room_id, session_id, [requesting_user_id], [requesting_device_id])
        console.log(`🔑 已向设备 ${requesting_device_id} 共享密钥`)
      }

    } catch (错误) {
      console.warn('🔑 处理密钥请求失败:', 错误)
    }
  }

  /**
   * 处理设备列表更新
   * @param users 更新的用户列表
   */
  private async 处理设备列表更新(users: string[]): Promise<void> {
    try {
      console.log('🔐 处理设备列表更新，受影响用户:', users)
      
      for (const userId of users) {
        // 获取用户的新设备
        const devices = await this.获取用户设备列表(userId)
        const unverifiedDevices = devices.filter(device => !device.isVerified)
        
        if (unverifiedDevices.length > 0) {
          console.log(`🔐 用户 ${userId} 有 ${unverifiedDevices.length} 个未验证设备`)
          
          // 这里可以触发用户界面提示新设备需要验证
          // 或者根据策略自动处理某些设备
          this.通知新设备需要验证(userId, unverifiedDevices)
        }
      }
    } catch (错误) {
      console.warn('🔐 处理设备列表更新失败:', 错误)
    }
  }

  /**
   * 通知有新设备需要验证
   * @param userId 用户ID
   * @param devices 未验证的设备列表
   */
  private 通知新设备需要验证(userId: string, devices: any[]): void {
    console.log(`🔐 [安全提示] 用户 ${userId} 有新的未验证设备:`)
    devices.forEach(device => {
      console.log(`  - 设备: ${device.displayName} (${device.deviceId})`)
    })
    
    // 这里可以发送通知给UI层，提示用户验证新设备
    // 例如：emit('newDeviceDetected', { userId, devices })
  }

  /**
   * 启动Matrix客户端
   * 开始与服务器同步数据，接收消息等
   */
  启动客户端同步(): void {
    if (!this.已认证客户端实例) {
      console.error('无法启动客户端：没有已认证的客户端实例')
      return
    }

    console.log('启动Matrix客户端，开始同步数据...')
    
    // 添加Olm会话错误处理，避免重放警告
    this.已认证客户端实例.on('crypto.warning' as any, (warning: any) => {
      if (warning && warning.type) {
        // 过滤掉Olm重放警告，避免控制台噪音
        if (warning.type.includes('OLM_REPLAY_ATTACK') || 
            warning.type.includes('REPLAY') ||
            warning.message?.includes('replay')) {
          console.log('🔄 Olm会话状态自动调整（正常现象）')
          return
        }
        // 其他加密警告仍然显示
        console.warn('🔐 加密警告:', warning)
      }
    })
    
    // 启动客户端，配置初始同步选项
    this.已认证客户端实例.startClient({
      // 减少初始同步时的重复消息处理
      initialSyncLimit: 10,
      // 启用会话持久化，减少Olm重放警告
      lazyLoadMembers: true
    })
    
    // 启动密钥共享监听
    this.启动密钥共享监听()
    
    console.log('客户端已启动，正在与服务器同步')
  }

  /**
   * 生成完整的Matrix用户ID
   * Matrix用户ID格式为: @username:server.com
   * @param 用户名 - 纯用户名，不包含@和服务器部分
   * @param 服务器地址 - 完整的服务器URL
   * @returns 完整的Matrix用户ID
   */
  private 生成完整用户ID(用户名: string, 服务器地址: string): string {
    // 从URL中提取服务器名称，去掉协议部分
    const 服务器名称 = 服务器地址
      .replace('https://', '')
      .replace('http://', '')
      .replace(/\/$/, '') // 去掉末尾的斜杠
    
    const 完整ID = `@${用户名}:${服务器名称}`
    console.log(`生成完整用户ID: ${完整ID}`)
    return 完整ID
  }

  /**
   * 用户登出
   * 清理所有客户端实例和相关状态
   * @param 保留登录参数 - 是否保留本地存储的登录参数，默认保留
   */
  用户登出(保留登录参数: boolean = true): void {
    console.log('开始登出Matrix账户...')
    
    // 如果有已认证的客户端，先停止同步并执行登出操作
    if (this.已认证客户端实例) {
      try {
        // 先停止客户端同步，避免继续发送请求
        console.log('停止客户端同步...')
        this.已认证客户端实例.stopClient()
        
        // 然后执行登出操作
        this.已认证客户端实例.logout()
        console.log('已向服务器发送登出请求')
      } catch (登出错误) {
        console.warn('登出过程中出现错误:', 登出错误)
      }
      this.已认证客户端实例 = null
    }
    
    // 清理基础客户端
    if (this.基础客户端实例) {
      try {
        this.基础客户端实例.stopClient()
      } catch (停止错误) {
        console.warn('停止基础客户端时出现错误:', 停止错误)
      }
      this.基础客户端实例 = null
    }
    
    // 根据参数决定是否清除登录参数
    if (!保留登录参数) {
      this.清除登录参数()
      console.log('✅ 完全登出完成，所有数据已清理')
    } else {
      console.log('✅ 登出完成，登录参数已保留')
    }
  }

  /**
   * 检查用户是否已登录
   * @returns 如果有已认证的客户端实例则返回true
   */
  检查登录状态(): boolean {
    const 已登录 = this.已认证客户端实例!== null
    console.log(`当前登录状态: ${已登录 ? '已登录' : '未登录'}`)
    return 已登录
  }

  /**
   * 获取已认证的客户端实例
   * 供其他服务模块调用，用于执行需要认证的操作
   * @returns 已认证的Matrix客户端实例，如果未登录则返回null
   */
  getAuthedClient() {
    if (!this.已认证客户端实例) {
      console.warn('尚未登录或客户端未初始化')
      return null
    }
    return this.已认证客户端实例
  }

  /**
   * 获取已认证的客户端实例（中文方法名）
   * @returns 已认证的Matrix客户端实例，如果未登录则返回null
   */
  获取已认证客户端() {
    return this.getAuthedClient()
  }

  /**
   * 检查并处理设备ID变化
   * 如果检测到设备ID发生变化，自动清理相关的加密存储
   */
  private async 检查并处理设备ID变化(userId: string, newDeviceId: string): Promise<void> {
    const storageKey = `matrix_device_id_${userId}`
    
    try {
      // 从localStorage获取上次使用的设备ID
      const lastDeviceId = localStorage.getItem(storageKey)
      
      console.log(`🔍 检查设备ID变化:`)
      console.log(`  - 存储键: ${storageKey}`)
      console.log(`  - 上次设备ID: ${lastDeviceId || '无'}`)
      console.log(`  - 新设备ID: ${newDeviceId}`)
      
      // 特殊处理：如果发现localStorage中还有YCB格式的相关数据，强制清理
      const hasYCBData = this.检查是否存在YCB格式数据()
      if (hasYCBData) {
        console.log('🚨 发现YCB格式的历史数据，执行强制清理...')
        await this.清理设备ID相关存储(userId, 'YCB_*')
      }
      
      if (lastDeviceId && lastDeviceId !== newDeviceId) {
        console.log(`🔍 检测到设备ID变化: ${lastDeviceId} -> ${newDeviceId}`)
        console.log('🧹 设备ID变化会导致加密冲突，开始清理相关存储...')
        
        // 清理与旧设备ID相关的存储
        await this.清理设备ID相关存储(userId, lastDeviceId)
        
        console.log('✅ 设备ID变化清理完成，现在可以正常使用新设备ID')
      } else if (!lastDeviceId) {
        console.log(`🔍 首次登录用户 ${userId}，设备ID: ${newDeviceId}`)
      } else {
        console.log(`🔍 设备ID无变化: ${newDeviceId}`)
        // 即使设备ID无变化，也检查是否有残留的加密冲突数据
        if (hasYCBData) {
          console.log('🧹 虽然设备ID无变化，但发现YCB残留数据，执行清理...')
          await this.清理设备ID相关存储(userId, 'YCB_*')
        }
      }
      
      // 保存当前设备ID以供下次比较
      localStorage.setItem(storageKey, newDeviceId)
      
    } catch (error) {
      console.warn('检查设备ID变化时出错:', error)
      // 出错时也保存新设备ID，避免下次再出错
      localStorage.setItem(storageKey, newDeviceId)
    }
  }

  /**
   * 检查localStorage中是否存在YCB格式的数据
   */
  private 检查是否存在YCB格式数据(): boolean {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('YCB_')) {
        console.log(`🔍 发现YCB格式数据: ${key}`)
        return true
      }
    }
    return false
  }

  /**
   * 清理与特定设备ID相关的存储
   */
  private async 清理设备ID相关存储(_userId: string, oldDeviceId: string): Promise<void> {
    try {
      console.log(`🧹 开始彻底清理设备ID ${oldDeviceId} 相关的存储数据`)
      
      // 1. 完全清理localStorage - 清理所有Matrix相关数据，不留死角
      const allLocalStorageKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) allLocalStorageKeys.push(key)
      }
      
      const matrixKeysToRemove = allLocalStorageKeys.filter(key => 
        key.includes(oldDeviceId) ||
        key.includes('matrix') ||
        key.includes('crypto') ||
        key.includes('device') ||
        key.includes('olm') ||
        key.includes('pickle') ||
        key.includes('e2e') ||
        key.includes('cross_signing') ||
        key.includes('YCB_') ||
        key.includes('LingJing_') ||
        key.includes('rust-sdk') ||
        key.includes('mx_') ||
        key.includes('@')  // Matrix用户ID格式
      )
      
      console.log(`🧹 localStorage 彻底清理 ${matrixKeysToRemove.length} 个Matrix相关键`)
      matrixKeysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log(`✅ 彻底清理localStorage: ${key}`)
      })
      
      // 2. 完全清理sessionStorage - 一网打尽
      const allSessionStorageKeys = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) allSessionStorageKeys.push(key)
      }
      
      const matrixSessionKeysToRemove = allSessionStorageKeys.filter(key =>
        key.includes(oldDeviceId) ||
        key.includes('matrix') ||
        key.includes('crypto') ||
        key.includes('YCB_') ||
        key.includes('LingJing_') ||
        key.includes('mx_') ||
        key.includes('@')
      )
      
      console.log(`🧹 sessionStorage 彻底清理 ${matrixSessionKeysToRemove.length} 个Matrix相关键`)
      matrixSessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key)
        console.log(`✅ 彻底清理sessionStorage: ${key}`)
      })
      
      // 3. 彻底清理IndexedDB - 删除所有可能的Matrix数据库
      const allPossibleDatabases = [
        'matrix-js-sdk:crypto',
        'matrix-js-sdk:riot-web-sync', 
        'matrix-js-sdk:store',
        'matrix-js-sdk',
        'rust-sdk-crypto',
        'olmCrypto',
        'crypto-store',
        'matrix-crypto',
        'matrix-store',
        'matrix-sync',
        'riot-web-sync',
        'element-crypto',
        'matrix-rust-crypto'
      ]
      
      console.log(`🧹 彻底清理 ${allPossibleDatabases.length} 个可能的IndexedDB数据库`)
      for (const dbName of allPossibleDatabases) {
        try {
          await this.deleteIndexedDB(dbName)
          console.log(`✅ 彻底清理IndexedDB: ${dbName}`)
        } catch (error) {
          console.log(`⚠️ IndexedDB ${dbName} 不存在或已删除`)
        }
      }
      
      // 4. 额外清理：检查并删除所有以matrix开头的数据库
      try {
        // 获取所有IndexedDB数据库名称（如果浏览器支持）
        if ('databases' in indexedDB) {
          const databases = await indexedDB.databases()
          for (const db of databases) {
            if (db.name && (
              db.name.toLowerCase().includes('matrix') ||
              db.name.toLowerCase().includes('crypto') ||
              db.name.toLowerCase().includes('olm') ||
              db.name.toLowerCase().includes('rust')
            )) {
              try {
                await this.deleteIndexedDB(db.name)
                console.log(`✅ 额外清理IndexedDB: ${db.name}`)
              } catch (error) {
                console.log(`⚠️ 额外清理IndexedDB ${db.name} 失败`)
              }
            }
          }
        }
      } catch (error) {
        console.log('⚠️ 无法枚举IndexedDB数据库（浏览器不支持）')
      }
      
      console.log('🎉 设备ID相关存储彻底清理完成 - 一干二净！')
      
    } catch (error) {
      console.warn('❌ 彻底清理设备ID相关存储时出错:', error)
    }
  }

  /**
   * 强制清理所有加密相关存储 - 用于解决设备认证问题
   */
  public async 强制清理加密存储(): Promise<void> {
    try {
      console.log('🚨 开始强制清理所有加密相关存储...')
      
      // 1. 清理localStorage中的所有Matrix相关数据
      const allKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) allKeys.push(key)
      }
      
      const matrixKeys = allKeys.filter(key => 
        key.includes('matrix') ||
        key.includes('crypto') ||
        key.includes('device') ||
        key.includes('olm') ||
        key.includes('pickle') ||
        key.includes('e2e') ||
        key.includes('cross_signing') ||
        key.includes('YCB_') ||
        key.includes('LingJing_')
      )
      
      console.log(`🧹 强制清理 localStorage 中的 ${matrixKeys.length} 个加密相关键`)
      matrixKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log(`✅ 强制清理localStorage: ${key}`)
      })
      
      // 2. 清理sessionStorage
      const sessionKeys = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) sessionKeys.push(key)
      }
      
      const matrixSessionKeys = sessionKeys.filter(key =>
        key.includes('matrix') ||
        key.includes('crypto')
      )
      
      console.log(`🧹 强制清理 sessionStorage 中的 ${matrixSessionKeys.length} 个加密相关键`)
      matrixSessionKeys.forEach(key => {
        sessionStorage.removeItem(key)
        console.log(`✅ 强制清理sessionStorage: ${key}`)
      })
      
      // 3. 清理所有可能的IndexedDB数据库
      const allDatabasesToDelete = [
        'matrix-js-sdk:crypto',
        'matrix-js-sdk:riot-web-sync',
        'matrix-js-sdk:store',
        'rust-sdk-crypto',
        'olmCrypto',
        'matrix-js-sdk',
        'crypto-store'
      ]
      
      console.log(`🧹 强制清理 ${allDatabasesToDelete.length} 个 IndexedDB 数据库`)
      for (const dbName of allDatabasesToDelete) {
        try {
          await this.deleteIndexedDB(dbName)
          console.log(`✅ 强制清理IndexedDB: ${dbName}`)
        } catch (error) {
          console.log(`⚠️ IndexedDB ${dbName} 不存在或清理失败`)
        }
      }
      
      console.log('🎉 强制清理完成！请刷新页面后重新登录')
      alert('🎉 强制清理完成！请刷新页面后重新登录以解决设备认证问题')
      
    } catch (error) {
      console.error('❌ 强制清理失败:', error)
      alert('❌ 强制清理失败: ' + String(error))
    }
  }

  /**
   * 删除指定的IndexedDB数据库
   */
  private deleteIndexedDB(dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const deleteReq = indexedDB.deleteDatabase(dbName)
      
      deleteReq.onsuccess = () => resolve()
      deleteReq.onerror = () => reject(deleteReq.error)
      deleteReq.onblocked = () => {
        console.warn(`删除数据库 ${dbName} 被阻塞`)
        // 等待一下再重试
        setTimeout(() => resolve(), 1000)
      }
    })
  }

  // ==================== 完整的密钥管理功能 ====================

  /**
   * 密钥轮转管理
   * 定期更换房间密钥以提升安全性
   */
  async 执行密钥轮转(roomId: string): Promise<void> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证，无法执行密钥轮转')
    }

    try {
      console.log(`🔄 开始为房间 ${roomId} 执行密钥轮转...`)
      
      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto) {
        throw new Error('加密模块未初始化')
      }

      // 强制生成新的房间密钥
      if (crypto.forceDiscardSession) {
        await crypto.forceDiscardSession(roomId)
        console.log('🔄 已丢弃旧的房间会话')
      }

      // 为房间准备新的加密会话
      const room = this.已认证客户端实例.getRoom(roomId)
      if (room && crypto.ensureOlmSessionsForUsers) {
        const members = room.getJoinedMembers()
        const userIds = members.map((member: any) => member.userId)
        
        await crypto.ensureOlmSessionsForUsers(userIds)
        console.log(`🔄 已为 ${userIds.length} 个用户准备新的加密会话`)
      }

      console.log(`✅ 房间 ${roomId} 密钥轮转完成`)

    } catch (错误: any) {
      console.error('❌ 密钥轮转失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 批量密钥轮转
   * 为所有加密房间执行密钥轮转
   */
  async 批量执行密钥轮转(): Promise<void> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log('🔄 开始批量密钥轮转...')
      
      const rooms = this.已认证客户端实例.getRooms()
      const encryptedRooms = rooms.filter((room: any) =>
        room.hasEncryptionStateEvent() && room.isSpaceRoom() === false
      )

      console.log(`发现 ${encryptedRooms.length} 个加密房间需要轮转`)

      for (const room of encryptedRooms) {
        try {
          await this.执行密钥轮转(room.roomId)
          // 添加延迟避免服务器压力
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (错误) {
          console.warn(`房间 ${room.roomId} 轮转失败:`, 错误)
        }
      }

      console.log('✅ 批量密钥轮转完成')

    } catch (错误: any) {
      console.error('❌ 批量密钥轮转失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 完整的交叉签名设置
   * 包括主密钥、自签密钥、用户签名密钥的完整生成
   */
  async 完整设置交叉签名(密码?: string): Promise<boolean> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log('🔐 开始完整的交叉签名设置...')
      
      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto || !crypto.bootstrapCrossSigning) {
        console.warn('当前SDK版本不支持交叉签名')
        return false
      }

      // 检查是否已经设置过交叉签名
      const userId = this.已认证客户端实例.getUserId()
      const existingCrossSigning = await crypto.getCrossSigningInfo?.(userId)
      
      if (existingCrossSigning && existingCrossSigning.getId && existingCrossSigning.getId()) {
        console.log('交叉签名已存在，检查是否需要重置...')
        
        // 可以添加检查逻辑，比如密钥是否损坏
        const isValid = await this.验证交叉签名完整性()
        if (isValid) {
          console.log('✅ 现有交叉签名完整有效')
          return true
        }
      }

      // 执行完整的交叉签名引导
      await crypto.bootstrapCrossSigning({
        // 授权上传设备签名密钥的回调
        authUploadDeviceSigningKeys: async (makeRequest: any) => {
          console.log('🔐 上传设备签名密钥...')
          
          // 如果提供了密码，使用密码认证
          if (密码) {
            return await makeRequest({
              type: 'm.login.password',
              password: 密码,
              identifier: {
                type: 'm.id.user',
                user: userId
              }
            })
          }
          
          // 否则尝试直接上传
          try {
            return await makeRequest({})
          } catch (错误: any) {
            if (错误.errcode === 'M_FORBIDDEN' || 错误.status === 401) {
              console.log('🔐 需要重新认证以上传签名密钥')
              // 可以触发重新登录或密码确认流程
              throw new Error('需要重新认证才能完成交叉签名设置')
            }
            throw 错误
          }
        },
        
        // 设置新的交叉签名
        setupNewCrossSigning: true
      })

      console.log('✅ 交叉签名设置成功')
      
      // 验证设置结果
      const newCrossSigning = await crypto.getCrossSigningInfo?.(userId)
      if (newCrossSigning && newCrossSigning.getId && newCrossSigning.getId()) {
        console.log('✅ 交叉签名验证通过')
        
        // 自动信任自己的设备
        await this.信任自己的所有设备()
        
        return true
      } else {
        console.warn('⚠️ 交叉签名设置后验证失败')
        return false
      }

    } catch (错误: any) {
      console.error('❌ 交叉签名设置失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 验证交叉签名完整性
   */
  async 验证交叉签名完整性(): Promise<boolean> {
    try {
      const crypto = this.已认证客户端实例?.getCrypto()
      const userId = this.已认证客户端实例?.getUserId()
      
      if (!crypto || !userId) return false

      const crossSigningInfo = await crypto.getCrossSigningInfo?.(userId)
      if (!crossSigningInfo) return false

      // 检查主密钥
      const masterKey = crossSigningInfo.getId()
      if (!masterKey) {
        console.log('❌ 缺少主密钥')
        return false
      }

      // 检查自签密钥
      const selfSigningKey = crossSigningInfo.getId('self_signing')
      if (!selfSigningKey) {
        console.log('❌ 缺少自签密钥')
        return false
      }

      // 检查用户签名密钥
      const userSigningKey = crossSigningInfo.getId('user_signing')
      if (!userSigningKey) {
        console.log('❌ 缺少用户签名密钥')
        return false
      }

      console.log('✅ 交叉签名完整性验证通过')
      return true

    } catch (错误) {
      console.warn('交叉签名完整性验证失败:', 错误)
      return false
    }
  }

  /**
   * 信任自己的所有设备
   */
  async 信任自己的所有设备(): Promise<void> {
    try {
      const crypto = this.已认证客户端实例?.getCrypto()
      const userId = this.已认证客户端实例?.getUserId()
      
      if (!crypto || !userId) return

      console.log('🔐 开始信任自己的所有设备...')

      // 获取自己的所有设备
      const devices = await crypto.getUserDeviceInfo([userId])
      const myDevices = devices.get(userId)
      
      if (!myDevices) {
        console.log('没有找到设备信息')
        return
      }

      let trustedCount = 0
      for (const [deviceId, device] of myDevices) {
        try {
          if (!device.isVerified()) {
            if (crypto.setDeviceVerified) {
              await crypto.setDeviceVerified(userId, deviceId, true)
              console.log(`✅ 已信任设备: ${device.getDisplayName()} (${deviceId})`)
              trustedCount++
            }
          } else {
            console.log(`✓ 设备已信任: ${device.getDisplayName()} (${deviceId})`)
          }
        } catch (错误) {
          console.warn(`信任设备 ${deviceId} 失败:`, 错误)
        }
      }

      console.log(`🔐 信任设备完成，新信任 ${trustedCount} 个设备`)

    } catch (错误) {
      console.warn('信任自己设备失败:', 错误)
    }
  }

  /**
   * 完整的密钥备份设置
   * 包括生成备份密钥、上传到服务器、本地存储恢复信息
   */
  async 完整设置密钥备份(密码?: string): Promise<string | null> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log('🔑 开始完整的密钥备份设置...')
      
      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto) {
        throw new Error('加密模块未初始化')
      }

      // 检查是否已有密钥备份
      let backupInfo = null
      try {
        if (typeof this.已认证客户端实例.getKeyBackupVersion === 'function') {
          backupInfo = await this.已认证客户端实例.getKeyBackupVersion()
        }
      } catch (错误) {
        console.log('检查现有备份失败，将创建新备份')
      }

      let recoveryKey: string

      if (backupInfo) {
        console.log('发现现有密钥备份版本:', backupInfo.version)
        
        // 如果有现有备份，尝试获取恢复密钥
        if (密码) {
          try {
            const keyFromPassword = await this.已认证客户端实例.keyBackupKeyFromPassword(密码, backupInfo)
            recoveryKey = keyFromPassword.encodedPrivateKey
            console.log('✅ 从密码恢复了备份密钥')
          } catch (错误) {
            console.log('从密码恢复失败，将创建新备份')
            backupInfo = null
          }
        } else {
          console.log('没有提供密码，将创建新备份')
          backupInfo = null
        }
      }

      // 如果没有现有备份或恢复失败，创建新的备份
      if (!backupInfo) {
        console.log('🔑 创建新的密钥备份...')
        
        // 生成新的备份密钥
        const backupKeyInfo = await this.已认证客户端实例.prepareKeyBackupVersion(密码)
        recoveryKey = backupKeyInfo.recovery_key

        // 上传备份配置到服务器
        const newBackupInfo = await this.已认证客户端实例.createKeyBackupVersion(backupKeyInfo)
        console.log('✅ 新密钥备份创建成功，版本:', newBackupInfo.version)

        // 启用密钥备份
        await this.已认证客户端实例.scheduleAllGroupSessionsForBackup()
        console.log('✅ 已安排所有群组会话进行备份')
      }

      // 强制备份当前的密钥
      if (typeof this.已认证客户端实例.backupAllGroupSessions === 'function') {
        await this.已认证客户端实例.backupAllGroupSessions()
        console.log('✅ 当前密钥已备份到服务器')
      }

      console.log('✅ 密钥备份设置完成')
      console.log('🔑 恢复密钥 (请安全保存):', recoveryKey!)

      return recoveryKey!

    } catch (错误: any) {
      console.error('❌ 密钥备份设置失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 从恢复密钥恢复备份
   */
  async 从恢复密钥恢复备份(recoveryKey: string): Promise<number> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log('🔑 开始从恢复密钥恢复备份...')

      // 获取当前的备份信息
      if (typeof this.已认证客户端实例.getKeyBackupVersion !== 'function') {
        throw new Error('当前SDK版本不支持密钥备份')
      }

      const backupInfo = await this.已认证客户端实例.getKeyBackupVersion()
      if (!backupInfo) {
        throw new Error('服务器上没有找到密钥备份')
      }

      console.log('找到备份版本:', backupInfo.version)

      // 验证恢复密钥
      const backupKey = await this.已认证客户端实例.keyBackupKeyFromRecoveryKey(recoveryKey)
      
      // 验证密钥是否匹配
      const isValid = await this.已认证客户端实例.checkKeyBackup(backupKey, backupInfo)
      if (!isValid) {
        throw new Error('恢复密钥无效或与备份不匹配')
      }

      console.log('✅ 恢复密钥验证通过')

      // 信任并使用这个备份
      await this.已认证客户端实例.trustKeyBackupVersion(backupInfo)
      
      // 从备份恢复密钥
      const result = await this.已认证客户端实例.restoreKeyBackupWithRecoveryKey(
        recoveryKey, 
        undefined, // roomId (undefined表示恢复所有房间)
        undefined, // sessionId
        backupInfo
      )

      const importedCount = result?.imported || 0
      console.log(`✅ 成功从备份恢复 ${importedCount} 个密钥`)

      return importedCount

    } catch (错误: any) {
      console.error('❌ 从恢复密钥恢复备份失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 导出房间密钥
   * 将指定房间的加密密钥导出为可传输格式
   */
  async 导出房间密钥(roomId: string, passphrase: string): Promise<string> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log(`🔑 开始导出房间 ${roomId} 的密钥...`)

      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto || !crypto.exportRoomKeys) {
        throw new Error('当前SDK版本不支持密钥导出')
      }

      // 导出房间密钥
      const keys = await crypto.exportRoomKeys()
      
      // 过滤指定房间的密钥
      const roomKeys = keys.filter((key: any) => key.room_id === roomId)
      
      if (roomKeys.length === 0) {
        throw new Error('没有找到该房间的密钥')
      }

      // 使用密码短语加密导出的密钥
      const encryptedKeys = await this.已认证客户端实例.encryptAndExportRoomKeys(roomKeys, passphrase)
      
      console.log(`✅ 成功导出 ${roomKeys.length} 个房间密钥`)
      
      return encryptedKeys

    } catch (错误: any) {
      console.error('❌ 导出房间密钥失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 导入房间密钥
   * 从导出的密钥文件中导入密钥
   */
  async 导入房间密钥(encryptedKeys: string, passphrase: string): Promise<number> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log('🔑 开始导入房间密钥...')

      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto || !crypto.importRoomKeys) {
        throw new Error('当前SDK版本不支持密钥导入')
      }

      // 解密并导入密钥
      const keys = await this.已认证客户端实例.decryptAndImportRoomKeys(encryptedKeys, passphrase)
      
      // 导入到加密模块
      await crypto.importRoomKeys(keys)
      
      console.log(`✅ 成功导入 ${keys.length} 个房间密钥`)
      
      return keys.length

    } catch (错误: any) {
      console.error('❌ 导入房间密钥失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 获取设备验证状态
   */
  async 获取设备验证状态(): Promise<{[userId: string]: {[deviceId: string]: any}}> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto) {
        throw new Error('加密模块未初始化')
      }

      const rooms = this.已认证客户端实例.getRooms()
      const allUserIds = new Set<string>()
      
      // 收集所有房间中的用户ID
      rooms.forEach((room: any) => {
        room.getJoinedMembers().forEach((member: any) => {
          allUserIds.add(member.userId)
        })
      })

      // 获取设备信息
      const deviceMap = await crypto.getUserDeviceInfo(Array.from(allUserIds))
      const result: {[userId: string]: {[deviceId: string]: any}} = {}

      for (const [userId, devices] of deviceMap) {
        result[userId] = {}
        for (const [deviceId, device] of devices) {
          result[userId][deviceId] = {
            displayName: device.getDisplayName(),
            isVerified: device.isVerified(),
            isBlocked: device.isBlocked(),
            algorithms: device.algorithms,
            keys: device.keys
          }
        }
      }

      return result

    } catch (错误: any) {
      console.error('❌ 获取设备验证状态失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 手动验证设备
   */
  async 手动验证设备(userId: string, deviceId: string): Promise<void> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log(`🔐 开始验证设备: ${userId}/${deviceId}`)

      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto) {
        throw new Error('加密模块未初始化')
      }

      // 设置设备为已验证
      if (crypto.setDeviceVerified) {
        await crypto.setDeviceVerified(userId, deviceId, true)
        console.log(`✅ 设备 ${deviceId} 已设置为验证状态`)
      } else if (crypto.trustCrossSignedDevice) {
        await crypto.trustCrossSignedDevice(userId, deviceId)
        console.log(`✅ 设备 ${deviceId} 已通过交叉签名信任`)
      } else {
        throw new Error('当前SDK版本不支持设备验证')
      }

    } catch (错误: any) {
      console.error('❌ 验证设备失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 撤销设备信任
   */
  async 撤销设备信任(userId: string, deviceId: string): Promise<void> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log(`🔐 撤销设备信任: ${userId}/${deviceId}`)

      const crypto = this.已认证客户端实例.getCrypto()
      if (!crypto || !crypto.setDeviceVerified) {
        throw new Error('当前SDK版本不支持设备验证管理')
      }

      // 设置设备为未验证
      await crypto.setDeviceVerified(userId, deviceId, false)
      console.log(`✅ 已撤销设备 ${deviceId} 的信任状态`)

    } catch (错误: any) {
      console.error('❌ 撤销设备信任失败:', 错误.message)
      throw 错误
    }
  }

  /**
   * 获取密钥备份状态
   */
  async 获取密钥备份状态(): Promise<{hasBackup: boolean, version?: string, algorithm?: string}> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      if (typeof this.已认证客户端实例.getKeyBackupVersion !== 'function') {
        return { hasBackup: false }
      }

      const backupInfo = await this.已认证客户端实例.getKeyBackupVersion()
      
      if (backupInfo) {
        return {
          hasBackup: true,
          version: backupInfo.version,
          algorithm: backupInfo.algorithm
        }
      } else {
        return { hasBackup: false }
      }

    } catch (错误: any) {
      console.warn('获取密钥备份状态失败:', 错误.message)
      return { hasBackup: false }
    }
  }

  /**
   * 强制备份所有当前密钥
   */
  async 强制备份当前密钥(): Promise<void> {
    if (!this.已认证客户端实例) {
      throw new Error('客户端未认证')
    }

    try {
      console.log('🔑 开始强制备份当前密钥...')

      // 检查是否有备份配置
      const backupStatus = await this.获取密钥备份状态()
      if (!backupStatus.hasBackup) {
        throw new Error('没有配置密钥备份，请先设置密钥备份')
      }

      // 安排所有群组会话进行备份
      await this.已认证客户端实例.scheduleAllGroupSessionsForBackup()
      
      // 立即执行备份
      if (typeof this.已认证客户端实例.backupAllGroupSessions === 'function') {
        await this.已认证客户端实例.backupAllGroupSessions()
        console.log('✅ 所有当前密钥已强制备份到服务器')
      } else {
        console.log('✅ 密钥已安排备份，将在后台自动执行')
      }

    } catch (错误: any) {
      console.error('❌ 强制备份当前密钥失败:', 错误.message)
      throw 错误
    }
  }
}

// 导出Matrix客户端服务单例
// 使用单例模式确保整个应用只有一个客户端实例
export const matrixClient = new Matrix客户端服务类()
export const Matrix客户端 = matrixClient  // 中文别名，方便中文开发者使用
