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
  async 获取房间历史消息(房间ID: string): Promise<MatrixMessage[]> {
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

      // 过滤出消息事件（包括加密和非加密消息）
      const 消息事件列表 = 所有事件.filter((事件: any) => {
        const 事件类型 = 事件.getType()
        // 包含普通消息和加密消息
        return 事件类型 === 'm.room.message' || 事件类型 === 'm.room.encrypted'
      })

      // 使用 Promise.all 处理异步消息解析
      const 历史消息列表 = await Promise.all(
        消息事件列表.map(async (消息事件: any) => {
          const 事件类型 = 消息事件.getType()

          // 对加密消息进行解密尝试
          if (事件类型 === 'm.room.encrypted') {
            try {
              await 客户端实例.decryptEvent(消息事件)
            } catch (e) {
              // 这里捕获错误，以防单个消息解密失败导致整个列表失败
              console.warn(`事件 ${消息事件.getId()} 解密失败，可能是缺少密钥`, e)
            }
          }

          const 消息明文内容 = 消息事件.getClearContent()
          const 消息内容 = 消息明文内容 || 消息事件.getContent()

          // --- 调试日志 ---
          if (消息内容.msgtype === 'm.file' || 消息内容.msgtype === 'm.image') {
            console.log(`[文件调试] 开始处理事件 ${消息事件.getId()}`);
            console.log(`[文件调试] 事件类型: ${事件类型}`);
            console.log(`[文件调试] 解密后的明文内容:`, 消息明文内容);
            if (消息明文内容) {
              console.log(`[文件调试] 明文内容中的 .file 对象:`, 消息明文内容.file);
              console.log(`[文件调试] 明文内容中的 .file.key 对象:`, 消息明文内容.file?.key);
            }
          }
          // --- 调试日志结束 ---
          
          // 关键判断：一个文件消息是否被加密，取决于其解密后的内容是否包含加密元数据（如key）
          const isFileEncrypted = !!(消息明文内容 && 消息明文内容.file && 消息明文内容.file.key);

          const messageData: MatrixMessage = {
            eventId: 消息事件.getId(),
            sender: 消息事件.getSender(),
            content: 消息内容.body || '[无内容]',
            roomId: 房间ID,
            timestamp: 消息事件.getTs(),
            encrypted: isFileEncrypted || (事件类型 === 'm.room.encrypted'), // 更可靠的加密状态判断
            messageType: this.获取消息类型(消息内容),
            messageInfo: this.解析消息信息(消息事件) // 始终解析 messageInfo
          }
          
          // 关键步骤：为加密文件附加解密元数据
          // 新的、更可靠的逻辑：只要判断为加密文件，就附加信息
          if (isFileEncrypted) {
            // 确保 messageInfo 对象存在
            if (!messageData.messageInfo) {
              messageData.messageInfo = {}
            }
            console.log(`[文件调试] 成功为事件 ${消息事件.getId()} 附加 encryptionInfo (新逻辑)`);
            messageData.messageInfo.encryptionInfo = 消息明文内容.file
          }
          
          return messageData
        })
      )

      // 按时间排序
      历史消息列表.sort((消息A: MatrixMessage, 消息B: MatrixMessage) => 消息A.timestamp - 消息B.timestamp)

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
   * 解析消息的额外信息
   * @param 消息事件 - Matrix消息事件
   * @returns 消息额外信息对象
   */
  private 解析消息信息(消息事件: any): MatrixMessage['messageInfo'] {
    const 消息内容 = 消息事件.getClearContent() || 消息事件.getContent();
    const 消息类型 = 消息内容.msgtype;
    const 消息信息: any = {};
    const client = matrixClient.getAuthedClient();

    // 对于加密文件，URL位于'file'对象内；对于未加密文件，URL在顶层。
    // 统一获取 mxcUrl
    const mxcUrl = 消息内容?.file?.url || 消息内容.url;

    switch (消息类型) {
      case 'm.image':
        if (消息内容.info) {
          消息信息.width = 消息内容.info.w;
          消息信息.height = 消息内容.info.h;
          消息信息.size = 消息内容.info.size;
          消息信息.mimetype = 消息内容.info.mimetype;
        }
        if (mxcUrl && client) {
          消息信息.url = client.mxcUrlToHttp(mxcUrl);
          消息信息.mxcUrl = mxcUrl;
        }
        break;
      case 'm.file':
      case 'm.audio':
      case 'm.video':
        消息信息.filename = 消息内容.body;
        if (消息内容.info) {
          消息信息.size = 消息内容.info.size;
          消息信息.mimetype = 消息内容.info.mimetype;
        }
        // 同时处理加密（从 file 对象）和非加密（直接从 content）的 URL
        if (mxcUrl && client) {
          消息信息.url = client.mxcUrlToHttp(mxcUrl);
          消息信息.mxcUrl = mxcUrl;
        }
        break;
    }

    return Object.keys(消息信息).length > 0 ? 消息信息 : undefined;
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
      const 事件类型 = 新消息事件.getType()
      // 处理消息类型的事件（包括加密和非加密）
      if (事件类型 === "m.room.message" || 事件类型 === "m.room.encrypted") {
        let 是否加密消息 = false
        let 消息内容文本 = ''
        
        // 处理加密消息
        if (事件类型 === "m.room.encrypted") {
          是否加密消息 = true
          try {
            // 获取原始内容
            const 原始内容 = 新消息事件.getContent()
            console.log(`实时加密消息原始内容:`, 原始内容)
            
            // 尝试获取解密后的明文内容
            if (新消息事件.getDecryptedContent) {
              const 解密内容 = 新消息事件.getDecryptedContent()
              消息内容文本 = 解密内容.body || '[实时已解密但无内容]'
              console.log(`实时消息解密成功:`, 解密内容)
            } else if (原始内容.body) {
              消息内容文本 = 原始内容.body
            } else {
              消息内容文本 = '[实时加密消息 - 等待解密或需要密钥]'
            }
          } catch (解密错误) {
            console.warn(`实时加密消息处理失败:`, 解密错误)
            消息内容文本 = '[无法解密的实时消息 - 可能缺少密钥]'
          }
        } else {
          // 处理普通消息
          try {
            是否加密消息 = 新消息事件.isEncrypted && 新消息事件.isEncrypted()
          } catch (检测异常) {
            是否加密消息 = false
          }
          const 消息内容 = 新消息事件.getContent()
          消息内容文本 = 消息内容.body || '[空实时消息]'
        }

        // 构造标准化消息对象
        const 标准化消息对象: MatrixMessage = {
          eventId: 新消息事件.getId(),
          sender: 新消息事件.getSender(),
          content: 消息内容文本,
          roomId: 所属房间.roomId,
          timestamp: 新消息事件.getTs(),
          encrypted: 是否加密消息,
          messageType: this.获取消息类型(新消息事件.getContent())
        }

        console.log(`收到新消息来自房间 ${所属房间.roomId}: ${消息内容文本}`)
        
        // 调用回调函数通知上层
        消息回调函数(标准化消息对象)
      }
    })

    console.log('消息监听器已设置，开始监听新消息')
  }

  /**
   * 请求缺失的加密密钥
   * 当无法解密消息时，主动向其他设备请求密钥
   * @param 房间ID - 消息所属房间
   * @param 消息事件 - 无法解密的消息事件
   */
  private async 请求缺失密钥(房间ID: string, 消息事件: any): Promise<void> {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      return
    }

    try {
      const crypto = 客户端实例.getCrypto()
      if (!crypto) {
        console.log('加密模块未初始化，无法请求密钥')
        return
      }

      // 获取消息的加密内容
      const 加密内容 = 消息事件.getWireContent()
      if (!加密内容 || !加密内容.session_id) {
        console.log('无法获取消息会话ID，无法请求密钥')
        return
      }

      console.log(`🔑 请求房间 ${房间ID} 会话 ${加密内容.session_id} 的密钥`)

      // 构建密钥请求参数
      const 密钥请求参数 = {
        algorithm: 'm.megolm.v1.aes-sha2',
        room_id: 房间ID,
        session_id: 加密内容.session_id,
        sender_key: 加密内容.sender_key
      }

      // 请求房间密钥
      if (crypto.requestRoomKey) {
        await crypto.requestRoomKey(密钥请求参数)
        console.log('🔑 密钥请求已发送，等待其他设备响应...')
        
        // 设置延迟重试机制
        setTimeout(() => {
          this.检查密钥请求结果(房间ID, 加密内容.session_id, 消息事件)
        }, 5000) // 5秒后检查是否收到密钥
        
      } else if (crypto.sendRoomKeyRequest) {
        // 兼容旧版本API
        await crypto.sendRoomKeyRequest(密钥请求参数)
        console.log('🔑 密钥请求已发送（使用兼容API）')
      } else {
        console.log('🔑 当前SDK版本不支持密钥请求')
      }
    } catch (错误) {
      console.warn('🔑 请求密钥失败:', 错误)
    }
  }

  /**
   * 检查密钥请求结果
   * @param 房间ID - 房间ID
   * @param 会话ID - 会话ID
   * @param 消息事件 - 原始消息事件
   */
  private async 检查密钥请求结果(房间ID: string, 会话ID: string, 消息事件: any): Promise<void> {
    try {
      const 客户端实例 = matrixClient.getAuthedClient()
      if (!客户端实例) return

      const crypto = 客户端实例.getCrypto()
      if (!crypto) return

      // 尝试重新解密消息
      if (crypto.decryptEvent) {
        await crypto.decryptEvent(消息事件)
        
        if (消息事件.isDecrypted && 消息事件.isDecrypted()) {
          console.log(`🔑 密钥请求成功！消息 ${消息事件.getId()} 已解密`)
          
          // 通知UI更新消息显示
          this.通知消息解密成功(房间ID, 消息事件)
        } else {
          console.log(`🔑 密钥请求暂未成功，消息 ${消息事件.getId()} 仍无法解密`)
          
          // 可以考虑再次请求或提示用户
          this.处理密钥请求失败(房间ID, 会话ID)
        }
      }
    } catch (错误) {
      console.warn('🔑 检查密钥请求结果失败:', 错误)
    }
  }

  /**
   * 通知消息解密成功
   * @param 房间ID - 房间ID
   * @param 消息事件 - 已解密的消息事件
   */
  private 通知消息解密成功(房间ID: string, 消息事件: any): void {
    console.log(`🔑 [解密成功] 房间 ${房间ID} 中的消息已解密`)
    
    // 这里可以发射事件通知UI层更新
    // 例如：eventBus.emit('messageDecrypted', { roomId: 房间ID, event: 消息事件 })
    
    // 或者通过回调函数通知
    if (this.消息解密回调) {
      this.消息解密回调(房间ID, 消息事件)
    }
  }

  /**
   * 处理密钥请求失败
   * @param 房间ID - 房间ID
   * @param 会话ID - 会话ID
   */
  private 处理密钥请求失败(房间ID: string, 会话ID: string): void {
    console.log(`🔑 [密钥请求失败] 房间 ${房间ID} 会话 ${会话ID} 的密钥请求未成功`)
    
    // 可以考虑：
    // 1. 再次尝试请求
    // 2. 提示用户验证更多设备
    // 3. 记录失败的消息以便后续重试
    
    // 记录失败的密钥请求
    this.记录失败的密钥请求(房间ID, 会话ID)
  }

  /**
   * 记录失败的密钥请求
   * @param 房间ID - 房间ID
   * @param 会话ID - 会话ID
   */
  private 记录失败的密钥请求(房间ID: string, 会话ID: string): void {
    // 这里可以实现持久化存储失败的请求
    // 以便在新设备验证后重新尝试
    console.log(`🔑 记录失败的密钥请求: 房间=${房间ID}, 会话=${会话ID}`)
  }

  // 消息解密成功回调函数
  private 消息解密回调?: (房间ID: string, 消息事件: any) => void

  /**
   * 设置消息解密成功回调
   * @param 回调函数 - 当消息解密成功时调用的函数
   */
  设置消息解密回调(回调函数: (房间ID: string, 消息事件: any) => void): void {
    this.消息解密回调 = 回调函数
  }

  /**
   * 检查并处理待解密消息
   * 定期检查是否有新的密钥可以解密之前失败的消息
   * @param 房间ID - 要检查的房间ID
   */
  async 重试解密消息(房间ID: string): Promise<void> {
    const 客户端实例 = matrixClient.getAuthedClient()
    if (!客户端实例) {
      return
    }

    try {
      const 房间对象 = 客户端实例.getRoom(房间ID)
      if (!房间对象) {
        return
      }

      const 时间线 = 房间对象.getLiveTimeline()
      const 所有事件 = 时间线.getEvents()

      // 找出所有加密事件
      const 加密事件列表 = 所有事件.filter((事件: any) => 
        事件.getType() === 'm.room.encrypted' && !事件.isDecrypted()
      )

      console.log(`房间 ${房间ID} 有 ${加密事件列表.length} 条待解密消息`)

      // 尝试重新解密
      for (const 事件 of 加密事件列表) {
        try {
          const crypto = 客户端实例.getCrypto()
          if (crypto) {
            await crypto.decryptEvent(事件)
            console.log(`成功解密消息: ${事件.getId()}`)
          }
        } catch (解密错误) {
          console.log(`消息 ${事件.getId()} 仍无法解密`)
        }
      }
    } catch (错误) {
      console.warn('重试解密失败:', 错误)
    }
  }
}

// 导出消息服务单例，使用中文别名以便理解
export const messageService = new 消息服务类()
export const 消息服务 = messageService  // 中文别名，方便中文开发者使用
