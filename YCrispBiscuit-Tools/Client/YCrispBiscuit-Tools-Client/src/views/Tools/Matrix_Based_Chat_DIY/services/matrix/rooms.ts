// Matrix 房间相关服务
// 负责处理所有与房间相关的操作：获取房间列表、加入房间、离开房间等
import type { MatrixRoom } from '../../types'
import { matrixClient } from './client'

/**
 * 房间服务类
 * 提供房间管理的所有功能
 */
class 房间服务类 {
  
  /**
   * 获取用户已加入的所有房间列表
   * @returns 房间数组，按最后活动时间倒序排列
   */
  获取房间列表(): MatrixRoom[] {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      console.warn('Matrix客户端未初始化，无法获取房间列表')
      return []
    }

    // 从Matrix SDK获取原始房间数据
    const 原始房间列表 = 客户端实例.getRooms()
    
    // 转换为我们的标准房间格式
    const 标准化房间列表 = 原始房间列表.map((原始房间对象: any) => {
      // 检测房间是否启用了端到端加密 (E2EE)
      let 是否加密房间 = false
      try {
        // 只检查房间状态中是否有端到端加密配置
        const 端到端加密事件 = 原始房间对象.currentState?.getStateEvents('m.room.encryption', '')
        if (端到端加密事件 && 端到端加密事件.getContent()) {
          const 加密配置 = 端到端加密事件.getContent()
          // 检查是否有有效的端到端加密算法（如 m.megolm.v1.aes-sha2）
          if (加密配置.algorithm && 加密配置.algorithm.includes('megolm')) {
            是否加密房间 = true
            console.log(`房间 ${原始房间对象.roomId} 启用端到端加密，算法: ${加密配置.algorithm}`)
          }
        }
        
        if (!是否加密房间) {
          console.log(`房间 ${原始房间对象.roomId} 未启用端到端加密（使用传输加密）`)
        }
      } catch (检测异常) {
        console.warn(`检测房间 ${原始房间对象.roomId} 端到端加密状态失败:`, 检测异常)
        是否加密房间 = false
      }

      // 获取房间主题
      let 房间主题 = ''
      try {
        const 主题事件 = 原始房间对象.currentState?.getStateEvents('m.room.topic', '')
        房间主题 = 主题事件?.getContent()?.topic || ''
      } catch (获取主题异常) {
        // 如果获取房间主题失败，使用空字符串
        房间主题 = ''
      }

      // 构造标准化房间对象
      return {
        roomId: 原始房间对象.roomId,
        name: 原始房间对象.name || 原始房间对象.roomId, // 如果没有房间名就用ID
        lastActivity: 原始房间对象.getLastActiveTimestamp(), // 最后活动时间
        encrypted: 是否加密房间,
        topic: 房间主题,
        unreadCount: 0 // TODO: 后续可以添加未读消息计数
      }
    })

    // 按最后活动时间降序排列（最新的在前面）
    const 排序后房间列表 = 标准化房间列表.sort((房间A: MatrixRoom, 房间B: MatrixRoom) => 
      房间B.lastActivity - 房间A.lastActivity
    )

    console.log(`成功获取 ${排序后房间列表.length} 个房间`)
    return 排序后房间列表
  }

  /**
   * 加入指定的房间
   * @param 房间ID或别名 - 可以是房间ID(!roomid:server.com)或房间别名(#roomalias:server.com)
   * @throws 如果客户端未初始化或加入失败则抛出错误
   */
  async 加入房间(房间ID或别名: string): Promise<void> {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      throw new Error('Matrix客户端未初始化，请先登录')
    }

    try {
      console.log(`尝试加入房间: ${房间ID或别名}`)
      await 客户端实例.joinRoom(房间ID或别名)
      console.log(`成功加入房间: ${房间ID或别名}`)
    } catch (加入失败原因: any) {
      const 错误信息 = 加入失败原因.message || 加入失败原因.toString()
      
      // 根据不同错误类型提供友好提示
      if (错误信息.includes('M_FORBIDDEN')) {
        throw new Error('无权限加入此房间，可能是私有房间或需要邀请')
      } else if (错误信息.includes('M_NOT_FOUND')) {
        throw new Error('找不到此房间，请检查房间ID或别名是否正确')
      } else if (错误信息.includes('M_ROOM_IN_USE')) {
        throw new Error('您已经在此房间中了')
      } else {
        throw new Error(`加入房间失败: ${错误信息}`)
      }
    }
  }

  /**
   * 获取指定房间的详细信息
   * @param 房间ID - 要获取详情的房间ID
   * @returns 房间对象，如果不存在则返回null
   */
  获取房间详情(房间ID: string) {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      console.warn('Matrix客户端未初始化，无法获取房间详情')
      return null
    }

    const 房间对象 = 客户端实例.getRoom(房间ID)
    if (!房间对象) {
      console.warn(`找不到房间: ${房间ID}`)
      return null
    }

    console.log(`成功获取房间详情: ${房间ID}`)
    return 房间对象
  }

  /**
   * 离开指定房间
   * @param 房间ID - 要离开的房间ID
   * @throws 如果客户端未初始化或离开失败则抛出错误
   */
  async 离开房间(房间ID: string): Promise<void> {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      throw new Error('Matrix客户端未初始化，请先登录')
    }

    try {
      console.log(`尝试离开房间: ${房间ID}`)
      await 客户端实例.leave(房间ID)
      console.log(`成功离开房间: ${房间ID}`)
    } catch (离开失败原因: any) {
      const 错误信息 = 离开失败原因.message || 离开失败原因.toString()
      throw new Error(`离开房间失败: ${错误信息}`)
    }
  }

  /**
   * 根据房间ID获取房间显示名称
   * @param 房间ID - 房间标识符
   * @returns 房间名称，如果获取失败则返回房间ID
   */
  获取房间显示名称(房间ID: string): string {
    const 房间对象 = this.获取房间详情(房间ID)
    if (!房间对象) {
      return 房间ID // 如果找不到房间，就用ID作为显示名称
    }

    // 优先使用房间设置的名称，否则使用房间ID
    return 房间对象.name || 房间ID
  }
}

// 导出房间服务单例，提供中英文两种引用方式
export const roomService = new 房间服务类()
export const 房间服务 = roomService  // 中文别名，方便中文开发者使用