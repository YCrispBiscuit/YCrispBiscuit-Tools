// Matrix 客户端管理服务
// 负责处理Matrix客户端的创建、登录、认证、加密初始化等核心功能
import * as sdk from "matrix-js-sdk";
import type { MatrixLoginConfig, MatrixUser } from '../../types'

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
    return `LingJing_${用户名}_CLIENT`
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
    
    // 🧹 清除浏览器中的Matrix相关存储，确保完全重新开始
    try {
      // 清除localStorage中的Matrix数据
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && (key.includes('matrix') || key.includes('crypto') || key.includes('device'))) {
          localStorage.removeItem(key)
          console.log(`清除localStorage: ${key}`)
        }
      }
      
      // 清除sessionStorage中的Matrix数据
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('matrix') || key.includes('crypto') || key.includes('device'))) {
          sessionStorage.removeItem(key)
          console.log(`清除sessionStorage: ${key}`)
        }
      }
      
      console.log('✅ 浏览器存储清理完成')
    } catch (清理错误) {
      console.warn('清理浏览器存储时出错:', 清理错误)
    }
    
    // 每次登录都重新创建基础客户端，确保使用正确的服务器地址
    console.log(`准备登录到服务器: ${登录配置.homeserver}`)
    this.创建基础客户端(登录配置.homeserver)

    // 生成完整的Matrix用户ID格式：@username:server.com
    const 完整用户ID = this.生成完整用户ID(登录配置.username, 登录配置.homeserver)
    
    console.log(`开始登录Matrix账户: ${完整用户ID}`)
    console.log(`基础客户端baseUrl: ${this.基础客户端实例?.baseUrl}`)

    try {
      // 🔑 为每个用户生成唯一的设备ID
      const 用户设备ID = this.生成用户设备ID(完整用户ID)
      const 设备显示名 = `LingJing Matrix 客户端 - ${登录配置.username}`
      
      // 调用Matrix SDK的登录接口
      const 登录结果 = await this.基础客户端实例.loginRequest({
        type: "m.login.password",  // 使用密码登录方式
        identifier: {
          type: "m.id.user",
          user: 完整用户ID
        },
        password: 登录配置.password,
        device_id: 用户设备ID, // 🔑 每个用户独有的设备ID
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

      // 加密初始化成功后，尝试启用密钥备份恢复
      this.初始化密钥备份()
      
    } catch (加密初始化错误: any) {
      const 错误详情 = 加密初始化错误.message || 加密初始化错误.toString()
      console.warn("⚠️ 加密初始化失败，继续使用非加密模式:", 错误详情)
      console.warn("   这意味着您可能无法在启用了端到端加密的房间中发送消息")
    }
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
      
      // 检查是否有可用的密钥备份
      const 备份信息 = await this.已认证客户端实例.getKeyBackupVersion()
      
      if (备份信息) {
        console.log('🔑 发现密钥备份版本:', 备份信息.version)
        
        // 尝试信任并恢复备份
        try {
          await this.已认证客户端实例.trustKeyBackupVersion(备份信息)
          const 恢复结果 = await this.已认证客户端实例.restoreKeyBackupWithCache()
          
          if (恢复结果&& 恢复结果.imported > 0) {
            console.log(`🔑 成功恢复 ${恢复结果.imported} 个密钥`)
          } else {
            console.log('🔑 没有新的密钥需要恢复')
          }
        } catch (恢复错误) {
          console.log('🔑 密钥备份恢复失败:', 恢复错误)
        }
      } else {
        console.log('🔑 没有发现密钥备份')
      }
    } catch (错误) {
      console.log('🔑 密钥备份检查失败:', 错误)
    }
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
    this.已认证客户端实例.startClient()
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
   */
  用户登出(): void {
    console.log('开始登出Matrix账户...')
    
    // 如果有已认证的客户端，先执行登出操作
    if (this.已认证客户端实例) {
      try {
        this.已认证客户端实例.logout()
        console.log('已向服务器发送登出请求')
      } catch (登出错误) {
        console.warn('登出过程中出现错误:', 登出错误)
      }
      this.已认证客户端实例 = null
    }
    
    // 清理基础客户端
    this.基础客户端实例 = null
    
    console.log('✅ 登出完成，所有客户端实例已清理')
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
}

// 导出Matrix客户端服务单例
// 使用单例模式确保整个应用只有一个客户端实例
export const matrixClient = new Matrix客户端服务类()
export const Matrix客户端 = matrixClient  // 中文别名，方便中文开发者使用
