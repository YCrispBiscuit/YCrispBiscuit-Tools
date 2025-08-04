// Matrix 相关类型定义
// 这个文件定义了整个Matrix聊天应用中使用的所有数据结构

/**
 * Matrix登录配置接口
 * 包含用户登录Matrix服务器所需的所有信息
 */
export interface MatrixLoginConfig {
  /** Matrix服务器地址，例如: https://matrix.org */
  homeserver: string
  
  /** 用户名（不包含@符号和服务器名），例如: myusername */
  username: string
  
  /** 用户密码 */
  password: string
}

/**
 * Matrix用户信息接口
 * 代表一个Matrix用户的基本信息
 */
export interface MatrixUser {
  /** 完整的Matrix用户ID，格式: @username:server.com */
  userId: string
  
  /** 用户显示名称（可选），如果没有设置则为空 */
  displayName?: string
  
  /** 用户头像URL（可选），指向用户头像图片的链接 */
  avatarUrl?: string
}

/**
 * Matrix房间信息接口
 * 代表一个Matrix房间的完整信息
 */
export interface MatrixRoom {
  /** 房间唯一标识符，格式: !roomId:server.com */
  roomId: string
  
  /** 房间显示名称，如果房间没有设置名称则显示房间ID */
  name: string
  
  /** 房间主题/描述（可选），房间的简短描述信息 */
  topic?: string
  
  /** 最后活动时间戳，用于排序房间列表（最近活动的房间排在前面） */
  lastActivity: number
  
  /** 是否启用端到端加密，true表示这是一个加密房间 */
  encrypted: boolean
  
  /** 未读消息数量（可选），显示房间中的未读消息数 */
  unreadCount?: number
  
  /** 房间头像URL（可选），指向房间头像图片的链接 */
  avatarUrl?: string
}

/**
 * Matrix消息接口
 * 代表一条Matrix消息的完整信息
 */
export interface MatrixMessage {
  /** 消息事件唯一标识符，Matrix中每个事件都有唯一ID */
  eventId: string
  
  /** 消息发送者的Matrix用户ID，格式: @username:server.com */
  sender: string
  
  /** 消息内容，对于文本消息就是消息文本 */
  content: string
  
  /** 消息所属的房间ID */
  roomId: string
  
  /** 消息发送时间戳，Unix时间戳格式 */
  timestamp: number
  
  /** 是否为加密消息，true表示这条消息是端到端加密的 */
  encrypted: boolean
  
  /** 消息类型（可选），区分文本、图片、文件等不同类型的消息 */
  messageType?: 'm.text' | 'm.image' | 'm.file' | 'm.audio' | 'm.video'
}

/**
 * Matrix客户端状态接口
 * 跟踪Matrix客户端的连接和同步状态
 */
export interface MatrixClientState {
  /** 是否已连接到Matrix服务器 */
  isConnected: boolean
  
  /** 是否已成功登录 */
  isLoggedIn: boolean
  
  /** 是否正在与服务器同步数据 */
  isSyncing: boolean
  
  /** 当前登录的用户信息（可选），只有登录后才有值 */
  currentUser?: MatrixUser
  
  /** 端到端加密是否已初始化 */
  cryptoInitialized?: boolean
  
  /** 交叉签名是否已设置 */
  crossSigningReady?: boolean
  
  /** 密钥备份是否可用 */
  keyBackupAvailable?: boolean
}

/**
 * 设备信息接口
 * 描述Matrix设备的详细信息和验证状态
 */
export interface MatrixDeviceInfo {
  /** 设备ID */
  deviceId: string
  
  /** 设备显示名称 */
  displayName?: string
  
  /** 设备是否已验证 */
  isVerified: boolean
  
  /** 设备是否被阻止 */
  isBlocked: boolean
  
  /** 设备所属用户ID */
  userId: string
  
  /** 设备的加密密钥 */
  keys?: Record<string, string>
}

/**
 * 完整设备信息接口（扩展版）
 * 提供更详细的设备管理信息
 */
export interface MatrixDevice {
  /** 设备ID */
  deviceId: string
  
  /** 设备所属用户ID */
  userId: string
  
  /** 设备显示名称 */
  displayName: string
  
  /** 设备的加密密钥 */
  keys: Record<string, string>
  
  /** 支持的加密算法 */
  algorithms: string[]
  
  /** 设备是否已验证 */
  isVerified: boolean
  
  /** 设备是否被阻止 */
  isBlocked: boolean
  
  /** 是否为当前设备 */
  isCurrent: boolean
  
  /** 最后在线时间 */
  lastSeen: Date
  
  /** 设备指纹 */
  fingerprint: string
}

/**
 * 设备安全状态接口
 * 用于描述房间或用户的设备安全情况
 */
export interface DeviceSecurityStatus {
  /** 房间ID */
  roomId: string
  
  /** 总设备数 */
  totalDevices: number
  
  /** 已验证设备数 */
  verifiedDevices: number
  
  /** 被阻止设备数 */
  blockedDevices: number
  
  /** 未验证设备数 */
  unverifiedDevices: number
  
  /** 未验证用户列表 */
  unverifiedUsers: string[]
  
  /** 安全等级 */
  securityLevel: 'high' | 'medium' | 'low'
  
  /** 是否安全 */
  isSecure: boolean
}

/**
 * 密钥请求接口
 * 用于请求缺失的加密密钥
 */
export interface MatrixKeyRequest {
  /** 房间ID */
  roomId: string
  
  /** 会话ID */
  sessionId: string
  
  /** 加密算法 */
  algorithm: string
  
  /** 请求的发送者 */
  requestingUserId: string
  
  /** 请求的设备ID */
  requestingDeviceId: string
}

// ===== 以下是一些常用的辅助类型 =====

/**
 * Matrix消息类型枚举
 * Matrix协议中定义的标准消息类型
 */
export type Matrix消息类型 = 
  | 'm.text'    // 纯文本消息
  | 'm.image'   // 图片消息  
  | 'm.file'    // 文件消息
  | 'm.audio'   // 音频消息
  | 'm.video'   // 视频消息

/**
 * Matrix房间可见性类型
 * 定义房间对外的可见性
 */
export type Matrix房间可见性 = 
  | 'public'    // 公开房间，任何人都可以加入
  | 'private'   // 私有房间，需要邀请才能加入

/**
 * Matrix用户权限级别
 * 定义用户在房间中的权限等级
 */
export type Matrix用户权限 = 
  | 0   // 普通用户
  | 50  // 管理员  
  | 100 // 房间创建者/超级管理员

/**
 * 登录错误类型
 * Matrix登录可能遇到的各种错误情况
 */
export type Matrix登录错误类型 = 
  | 'M_FORBIDDEN'        // 用户名或密码错误
  | 'M_USER_DEACTIVATED' // 账户被停用
  | 'M_LIMIT_EXCEEDED'   // 登录尝试过于频繁
  | 'NETWORK_ERROR'      // 网络连接错误
  | 'UNKNOWN_ERROR'      // 未知错误
