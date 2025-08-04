// Matrix 设备管理服务
// 负责处理设备验证、信任管理、安全状态检查等功能
import { matrixClient } from './client'
import type { MatrixDevice, DeviceSecurityStatus } from '../../types'

/**
 * Matrix设备管理服务类
 * 提供完整的设备管理功能，包括设备列表获取、验证、信任管理等
 */
class Matrix设备管理服务类 {

  /**
   * 获取当前用户的所有设备列表
   * @returns 设备列表，包含设备信息和验证状态
   */
  async 获取我的设备列表(): Promise<MatrixDevice[]> {
    const client = matrixClient.getAuthedClient()
    if (!client) {
      throw new Error('客户端未登录')
    }

    const crypto = client.getCrypto()
    const userId = client.getUserId()
    
    if (!crypto || !userId) {
      throw new Error('加密功能未初始化')
    }

    try {
      // 获取设备信息
      const deviceMap = await crypto.getUserDeviceInfo(userId)
      const devices: MatrixDevice[] = []

      // 遍历设备映射，转换为我们的设备格式
      for (const [deviceId, deviceInfo] of deviceMap.entries()) {
        const isVerified = await matrixClient.检查设备信任状态(userId, deviceId)
        const isCurrent = deviceId === client.getDeviceId()
        
        devices.push({
          deviceId,
          userId,
          displayName: deviceInfo.getDisplayName() || `设备 ${deviceId.slice(-4)}`,
          keys: deviceInfo.keys || {},
          algorithms: deviceInfo.algorithms || [],
          isVerified,
          isBlocked: false, // TODO: 实现设备阻止功能
          isCurrent,
          lastSeen: new Date(), // TODO: 获取真实的最后在线时间
          fingerprint: this.生成设备指纹(deviceInfo.keys || {})
        })
      }

      console.log(`获取到 ${devices.length} 个设备`)
      return devices.sort((a, b) => {
        // 当前设备排在最前
        if (a.isCurrent) return -1
        if (b.isCurrent) return 1
        // 已验证设备优先
        if (a.isVerified && !b.isVerified) return -1
        if (b.isVerified && !a.isVerified) return 1
        // 按设备名称排序
        return a.displayName.localeCompare(b.displayName)
      })
    } catch (error) {
      console.error('获取设备列表失败:', error)
      throw new Error(`获取设备列表失败: ${(error as Error).message}`)
    }
  }

  /**
   * 获取指定房间的设备安全状态
   * @param roomId 房间ID
   * @returns 房间设备安全状态信息
   */
  async 获取房间设备状态(roomId: string): Promise<DeviceSecurityStatus> {
    const client = matrixClient.getAuthedClient()
    if (!client) {
      throw new Error('客户端未登录')
    }

    const room = client.getRoom(roomId)
    if (!room) {
      throw new Error('房间不存在')
    }

    const crypto = client.getCrypto()
    if (!crypto) {
      throw new Error('加密功能未初始化')
    }

    try {
      const members = room.getJoinedMembers()
      let totalDevices = 0
      let verifiedDevices = 0
      let blockedDevices = 0
      const unverifiedUsers: string[] = []

      // 检查每个成员的设备状态
      for (const member of members) {
        const userId = member.userId
        try {
          const deviceMap = await crypto.getUserDeviceInfo(userId)
          
          for (const [deviceId] of deviceMap.entries()) {
            totalDevices++
            const isVerified = await matrixClient.检查设备信任状态(userId, deviceId)
            
            if (isVerified) {
              verifiedDevices++
            } else {
              if (!unverifiedUsers.includes(userId)) {
                unverifiedUsers.push(userId)
              }
            }
          }
        } catch (error) {
          console.warn(`获取用户 ${userId} 的设备信息失败:`, error)
        }
      }

      const securityLevel = this.计算安全等级(verifiedDevices, totalDevices)

      return {
        roomId,
        totalDevices,
        verifiedDevices,
        blockedDevices,
        unverifiedDevices: totalDevices - verifiedDevices - blockedDevices,
        unverifiedUsers,
        securityLevel,
        isSecure: securityLevel === 'high'
      }
    } catch (error) {
      console.error('获取房间设备状态失败:', error)
      throw new Error(`获取房间设备状态失败: ${(error as Error).message}`)
    }
  }

  /**
   * 检查整体安全状态
   * @returns 安全状态摘要
   */
  async 检查房间安全状态(roomId: string): Promise<boolean> {
    try {
      const status = await this.获取房间设备状态(roomId)
      return status.isSecure
    } catch (error) {
      console.error('检查房间安全状态失败:', error)
      return false
    }
  }

  /**
   * 启动设备验证流程
   * @param userId 要验证的用户ID
   * @param deviceId 要验证的设备ID
   * @returns 验证结果
   */
  async 启动设备验证(userId: string, deviceId: string): Promise<boolean> {
    const client = matrixClient.getAuthedClient()
    if (!client) {
      throw new Error('客户端未登录')
    }

    const crypto = client.getCrypto()
    if (!crypto) {
      throw new Error('加密功能未初始化')
    }

    try {
      console.log(`启动设备验证: ${userId}/${deviceId}`)
      
      // 检查设备是否存在
      const deviceMap = await crypto.getUserDeviceInfo(userId)
      const deviceInfo = deviceMap.get(deviceId)
      
      if (!deviceInfo) {
        throw new Error('设备不存在')
      }

      // 创建验证请求
      const verificationRequest = await crypto.requestDeviceVerification(userId, deviceId)
      
      if (!verificationRequest) {
        throw new Error('无法创建验证请求')
      }

      console.log('设备验证请求已发送')
      return true
    } catch (error) {
      console.error('启动设备验证失败:', error)
      throw new Error(`设备验证失败: ${(error as Error).message}`)
    }
  }

  /**
   * 批量验证可信设备
   * 用于快速验证多个已知可信的设备
   * @param devices 要验证的设备列表
   * @returns 验证结果统计
   */
  async 批量验证可信设备(devices: { userId: string, deviceId: string }[]): Promise<{
    成功: number,
    失败: number,
    错误列表: string[]
  }> {
    let 成功 = 0
    let 失败 = 0
    const 错误列表: string[] = []

    for (const device of devices) {
      try {
        await this.启动设备验证(device.userId, device.deviceId)
        成功++
      } catch (error) {
        失败++
        错误列表.push(`${device.userId}/${device.deviceId}: ${(error as Error).message}`)
      }
    }

    console.log(`批量验证完成: ${成功} 成功, ${失败} 失败`)
    return { 成功, 失败, 错误列表 }
  }

  /**
   * 生成安全建议
   * 基于当前设备状态提供安全改进建议
   * @returns 安全建议列表
   */
  async 生成安全建议(): Promise<string[]> {
    try {
      const devices = await this.获取我的设备列表()
      const recommendations: string[] = []

      const unverifiedDevices = devices.filter(d => !d.isVerified && !d.isCurrent)
      const totalDevices = devices.length

      // 基础安全检查
      if (unverifiedDevices.length > 0) {
        recommendations.push(`您有 ${unverifiedDevices.length} 个未验证的设备，建议进行验证`)
      }

      if (totalDevices === 1) {
        recommendations.push('建议设置密钥备份，以防设备丢失时无法恢复加密消息')
      }

      // 检查交叉签名状态
      const client = matrixClient.getAuthedClient()
      if (client) {
        const crypto = client.getCrypto()
        const userId = client.getUserId()
        
        if (crypto && userId) {
          try {
            const crossSigningInfo = await crypto.getCrossSigningInfo?.(userId)
            if (!crossSigningInfo || !crossSigningInfo.getId()) {
              recommendations.push('建议启用交叉签名以提高设备管理的安全性')
            }
          } catch (error) {
            recommendations.push('无法检查交叉签名状态，建议检查加密设置')
          }
        }
      }

      // 设备数量相关建议
      if (totalDevices > 5) {
        recommendations.push('您的设备数量较多，建议定期清理不再使用的设备')
      }

      if (recommendations.length === 0) {
        recommendations.push('您的设备安全状态良好！')
      }

      return recommendations
    } catch (error) {
      console.error('生成安全建议失败:', error)
      return ['无法生成安全建议，请检查网络连接']
    }
  }

  /**
   * 计算安全等级
   * @param verifiedCount 已验证设备数
   * @param totalCount 总设备数
   * @returns 安全等级
   */
  private 计算安全等级(verifiedCount: number, totalCount: number): 'high' | 'medium' | 'low' {
    if (totalCount === 0) return 'medium'
    
    const ratio = verifiedCount / totalCount
    if (ratio >= 0.8) return 'high'
    if (ratio >= 0.5) return 'medium'
    return 'low'
  }

  /**
   * 生成设备指纹
   * @param keys 设备密钥
   * @returns 设备指纹字符串
   */
  private 生成设备指纹(keys: Record<string, string>): string {
    const ed25519Key = keys[`ed25519:${Object.keys(keys).find(k => k.startsWith('ed25519:'))?.split(':')[1] || ''}`]
    if (ed25519Key) {
      // 格式化指纹为更易读的格式
      return ed25519Key.replace(/(.{4})/g, '$1 ').trim().toUpperCase()
    }
    return '未知指纹'
  }
}

// 导出设备管理服务实例
export const deviceService = new Matrix设备管理服务类()
