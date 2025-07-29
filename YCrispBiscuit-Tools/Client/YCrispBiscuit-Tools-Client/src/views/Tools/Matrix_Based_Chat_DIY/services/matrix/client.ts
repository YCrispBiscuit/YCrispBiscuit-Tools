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
    console.log(`创建Matrix基础客户端，连接服务器: ${服务器地址}`)
    this.基础客户端实例 = sdk.createClient({ baseUrl: 服务器地址 })
    return this.基础客户端实例
  }

  /**
   * 用户登录到Matrix服务器
   * @param 登录配置 - 包含服务器地址、用户名、密码的配置对象
   * @returns 登录成功的用户信息
   * @throws 如果登录失败则抛出详细错误信息
   */
  async 用户登录(登录配置: MatrixLoginConfig): Promise<MatrixUser> {
    // 如果没有基础客户端，先创建一个
    if (!this.基础客户端实例) {
      this.创建基础客户端(登录配置.homeserver)
    }

    // 生成完整的Matrix用户ID格式：@username:server.com
    const 完整用户ID = this.生成完整用户ID(登录配置.username, 登录配置.homeserver)
    
    console.log(`开始登录Matrix账户: ${完整用户ID}`)

    try {
      // 调用Matrix SDK的登录接口
      const 登录结果 = await this.基础客户端实例.loginRequest({
        type: "m.login.password",  // 使用密码登录方式
        identifier: {
          type: "m.id.user",
          user: 完整用户ID
        },
        password: 登录配置.password
      })

      console.log(`登录成功! 用户ID: ${登录结果.user_id}`)

      // 使用登录获得的访问令牌创建已认证的客户端
      this.已认证客户端实例 = sdk.createClient({
        baseUrl: 登录配置.homeserver,
        accessToken: 登录结果.access_token,  // 这是关键：访问令牌
        userId: 登录结果.user_id,
        useAuthorizationHeader: true  // 使用Authorization头而不是查询参数
      })

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
      } else if (错误信息.includes('M_LIMIT_EXCEEDED')) {
        throw new Error('登录尝试过于频繁，请稍后再试')
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
      // 尝试使用新版本的加密初始化方法
      if (typeof this.已认证客户端实例.initCrypto === 'function') {
        await this.已认证客户端实例.initCrypto()
        console.log("✅ 端到端加密初始化成功 (使用 initCrypto)")
      } 
      // 如果上面的方法不存在，尝试Rust版本的加密
      else if (typeof this.已认证客户端实例.initRustCrypto === 'function') {
        await this.已认证客户端实例.initRustCrypto()
        console.log("✅ 端到端加密初始化成功 (使用 initRustCrypto)")
      } 
      // 如果都没有，说明当前SDK版本不支持加密
      else {
        console.log("⚠️ 当前Matrix SDK版本不支持加密功能，将使用基础模式")
        console.log("   在基础模式下可以发送和接收明文消息，但无法处理加密房间")
      }
    } catch (加密初始化错误: any) {
      const 错误详情 = 加密初始化错误.message || 加密初始化错误.toString()
      console.warn("⚠️ 加密初始化失败，继续使用非加密模式:", 错误详情)
      console.warn("   这意味着您可能无法在启用了端到端加密的房间中发送消息")
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
