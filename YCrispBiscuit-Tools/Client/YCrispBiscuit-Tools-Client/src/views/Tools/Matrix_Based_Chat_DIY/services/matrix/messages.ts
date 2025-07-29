// Matrix 消息相关服务
// 负责处理所有与消息相关的操作：发送消息、获取历史消息、监听新消息等
import type { MatrixMessage } from '../../types'
import { matrixClient } from './client'

/**
 * 消息服务类
 * 提供消息发送、接收、历史记录等功能
 */
class 消息服务类 {
  
  /**
   * 发送文本消息到指定房间
   * @param 房间ID - 目标房间的ID
   * @param 消息内容 - 要发送的文本内容
   * @throws 如果客户端未初始化或发送失败则抛出错误
   */
  async 发送文本消息(房间ID: string, 消息内容: string): Promise<void> {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      throw new Error('Matrix客户端未初始化，请先登录')
    }

    try {
      // 调用Matrix SDK发送消息
      await 客户端实例.sendTextMessage(房间ID, 消息内容)
      console.log(`消息发送成功到房间 ${房间ID}: ${消息内容}`)
    } catch (错误信息: any) {
      const 错误描述 = 错误信息.message || 错误信息.toString()
      
      // 根据不同的错误类型提供友好的错误提示
      if (错误描述.includes('encryption') || 错误描述.includes('crypto')) {
        throw new Error('此房间启用了端到端加密。当前使用基础模式，可能无法在加密房间发送消息。建议使用Element等完整客户端。')
      } else if (错误描述.includes('M_FORBIDDEN')) {
        throw new Error('没有权限发送消息到此房间，可能需要管理员邀请或房间是私有的')
      } else if (错误描述.includes('M_LIMIT_EXCEEDED')) {
        throw new Error('发送消息过于频繁，请稍后再试（触发了频率限制）')
      } else {
        throw new Error(`发送消息失败: ${错误描述}`)
      }
    }
  }

  /**
   * 获取指定房间的历史消息
   * @param 房间ID - 要获取消息的房间ID
   * @returns 消息数组，按时间顺序排列
   */
  获取房间历史消息(房间ID: string): MatrixMessage[] {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      console.warn('Matrix客户端未初始化，无法获取历史消息')
      return []
    }

    try {
      // 获取房间对象
      const 房间对象 = 客户端实例.getRoom(房间ID)
      if (!房间对象) {
        console.warn(`找不到房间: ${房间ID}`)
        return []
      }

      // 获取房间的时间线（包含所有事件）
      const 时间线 = 房间对象.getLiveTimeline()
      const 所有事件 = 时间线.getEvents()

      // 过滤出消息事件并转换为我们的消息格式
      const 历史消息列表 = 所有事件
        .filter((事件: any) => 事件.getType() === 'm.room.message') // 只要消息事件
        .map((消息事件: any) => {
          // 检测消息是否加密
          let 是否加密 = false
          try {
            是否加密 = 消息事件.isEncrypted && 消息事件.isEncrypted()
          } catch (检测错误) {
            // 兼容性检测：如果isEncrypted方法不存在，通过事件类型判断
            是否加密 = 消息事件.getType() === 'm.room.encrypted'
          }

          // 构造标准化的消息对象
          return {
            eventId: 消息事件.getId(),
            sender: 消息事件.getSender(),
            content: 消息事件.getContent().body,
            roomId: 房间ID,
            timestamp: 消息事件.getTs(),
            encrypted: 是否加密,
            messageType: this.获取消息类型(消息事件.getContent())
          }
        })
        .sort((消息A: MatrixMessage, 消息B: MatrixMessage) => 消息A.timestamp - 消息B.timestamp) // 按时间排序

      console.log(`成功获取房间 ${房间ID} 的 ${历史消息列表.length} 条历史消息`)
      return 历史消息列表
      
    } catch (获取错误) {
      console.error('获取房间历史消息失败:', 获取错误)
      return []
    }
  }

  /**
   * 根据消息内容判断消息类型
   * @param 消息内容对象 - Matrix消息的content对象
   * @returns 消息类型枚举值
   */
  private 获取消息类型(消息内容对象: any): MatrixMessage['messageType'] {
    const 消息类型标识 = 消息内容对象.msgtype
    
    // 根据Matrix的消息类型标识返回对应类型
    switch (消息类型标识) {
      case 'm.image': return 'm.image'   // 图片消息
      case 'm.file': return 'm.file'     // 文件消息
      case 'm.audio': return 'm.audio'   // 音频消息
      case 'm.video': return 'm.video'   // 视频消息
      default: return 'm.text'           // 默认文本消息
    }
  }

  /**
   * 设置实时消息监听器
   * 当房间收到新消息时会调用回调函数
   * @param 消息回调函数 - 收到新消息时执行的回调函数
   */
  设置消息监听器(消息回调函数: (message: MatrixMessage) => void): void {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      console.warn('Matrix客户端未初始化，无法设置消息监听器')
      return
    }

    // 监听Room.timeline事件，这是Matrix中新消息到达的事件
    客户端实例.on("Room.timeline" as any, (新消息事件: any, 所属房间: any) => {
      // 只处理消息类型的事件
      if (新消息事件.getType() === "m.room.message") {
        const 消息内容 = 新消息事件.getContent()
        
        // 检测是否为加密消息
        let 是否加密消息 = false
        try {
          是否加密消息 = 新消息事件.isEncrypted && 新消息事件.isEncrypted()
        } catch (检测异常) {
          // 兼容性处理
          是否加密消息 = 新消息事件.getType() === 'm.room.encrypted'
        }

        // 构造标准化消息对象
        const 标准化消息对象: MatrixMessage = {
          eventId: 新消息事件.getId(),
          sender: 新消息事件.getSender(),
          content: 消息内容.body,
          roomId: 所属房间.roomId,
          timestamp: 新消息事件.getTs(),
          encrypted: 是否加密消息,
          messageType: this.获取消息类型(消息内容)
        }

        console.log(`收到新消息来自房间 ${所属房间.roomId}: ${消息内容.body}`)
        
        // 调用回调函数通知上层
        消息回调函数(标准化消息对象)
      }
    })

    console.log('消息监听器已设置，开始监听新消息')
  }
}

// 导出消息服务单例，使用中文别名以便理解
export const messageService = new 消息服务类()
export const 消息服务 = messageService  // 中文别名，方便中文开发者使用
