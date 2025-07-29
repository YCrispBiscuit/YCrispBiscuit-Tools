# Matrix 聊天应用 - 组件化结构方案

## 📁 文件夹结构

```
Matrix_Based_Chat_DIY/
├── index.vue                    # 主应用容器
├── index.ts                     # 导出
├── 
├── components/                  # 可复用组件
│   ├── Common/                  # 通用组件
│   │   ├── Loading/
│   │   │   ├── index.vue       # 加载动画
│   │   │   └── index.ts
│   │   ├── Avatar/
│   │   │   ├── index.vue       # 用户头像
│   │   │   └── index.ts
│   │   └── Tooltip/
│   │       ├── index.vue       # 工具提示
│   │       └── index.ts
│   │
│   ├── Message/                 # 消息相关组件
│   │   ├── MessageItem/
│   │   │   ├── index.vue       # 单条消息
│   │   │   └── index.ts
│   │   ├── MessageInput/
│   │   │   ├── index.vue       # 消息输入框
│   │   │   └── index.ts
│   │   ├── MessageList/
│   │   │   ├── index.vue       # 消息列表
│   │   │   └── index.ts
│   │   └── MediaMessage/
│   │       ├── index.vue       # 媒体消息（图片/文件）
│   │       └── index.ts
│   │
│   └── Room/                    # 房间相关组件
│       ├── RoomItem/
│       │   ├── index.vue       # 单个房间项
│       │   └── index.ts
│       ├── RoomList/
│       │   ├── index.vue       # 房间列表
│       │   └── index.ts
│       └── RoomHeader/
│           ├── index.vue       # 房间头部信息
│           └── index.ts
│
├── layouts/                     # 布局组件
│   ├── ChatLayout/
│   │   ├── index.vue           # 主聊天布局
│   │   └── index.ts
│   ├── Sidebar/
│   │   ├── index.vue           # 侧边栏布局
│   │   └── index.ts
│   └── MainContent/
│       ├── index.vue           # 主内容区域
│       └── index.ts
│
├── views/                       # 页面视图
│   ├── Login/
│   │   ├── index.vue           # 登录页面 ✅已存在
│   │   └── index.ts
│   ├── Chat/
│   │   ├── index.vue           # 聊天主页面
│   │   └── index.ts
│   ├── RoomSettings/
│   │   ├── index.vue           # 房间设置页面
│   │   └── index.ts
│   └── UserProfile/
│       ├── index.vue           # 用户资料页面
│       └── index.ts
│
├── services/                    # 业务逻辑服务
│   ├── matrix/
│   │   ├── client.ts           # Matrix客户端管理
│   │   ├── auth.ts             # 认证服务
│   │   ├── rooms.ts            # 房间服务
│   │   ├── messages.ts         # 消息服务
│   │   ├── encryption.ts       # 加密服务
│   │   └── types.ts            # Matrix类型定义
│   └── utils/
│       ├── time.ts             # 时间工具
│       ├── format.ts           # 格式化工具
│       └── validation.ts       # 验证工具
│
├── stores/                      # 状态管理
│   ├── auth.ts                 # 认证状态
│   ├── rooms.ts                # 房间状态
│   ├── messages.ts             # 消息状态
│   ├── ui.ts                   # UI状态
│   └── index.ts                # Store入口
│
├── composables/                 # 组合式函数
│   ├── useMatrix.ts            # Matrix相关hooks
│   ├── useAuth.ts              # 认证hooks
│   ├── useRooms.ts             # 房间hooks
│   ├── useMessages.ts          # 消息hooks
│   └── useWebSocket.ts         # WebSocket hooks
│
├── types/                       # 类型定义
│   ├── matrix.ts               # Matrix相关类型
│   ├── user.ts                 # 用户类型
│   ├── room.ts                 # 房间类型
│   ├── message.ts              # 消息类型
│   └── index.ts                # 类型导出
│
└── styles/                      # 样式文件
    ├── variables.scss          # SCSS变量
    ├── mixins.scss             # SCSS混入
    ├── components.scss         # 组件样式
    └── layout.scss             # 布局样式
```

## 🎯 组件职责划分

### **1. 页面级组件 (views/)**
- **单一职责**: 负责页面整体逻辑和数据流
- **不含样式**: 主要负责组合子组件
- **状态管理**: 连接Store和组合式函数

### **2. 布局组件 (layouts/)**
- **结构定义**: 定义页面整体布局结构
- **响应式**: 处理不同屏幕尺寸的适配
- **插槽设计**: 提供灵活的内容插槽

### **3. 业务组件 (components/)**
- **功能专一**: 每个组件只处理一个具体功能
- **可复用**: 在多个页面中可以复用
- **props/emit**: 通过props接收数据，通过emit向上通信

### **4. 服务层 (services/)**
- **API封装**: 封装Matrix SDK的复杂调用
- **业务逻辑**: 处理具体的业务逻辑
- **错误处理**: 统一的错误处理机制

### **5. 状态管理 (stores/)**
- **全局状态**: 管理跨组件的状态
- **持久化**: 处理需要持久化的数据
- **响应式**: 基于Pinia的响应式状态

## 🔄 数据流向

```
User Action → Component → Composable → Service → Matrix SDK
                ↓              ↓          ↓
             UI Update ← Store Update ← Response
```

## 📝 命名规范

- **组件**: PascalCase (MessageItem)
- **文件夹**: PascalCase (Message/)
- **服务**: camelCase (matrix/client.ts)
- **类型**: PascalCase + Interface/Type (MessageInterface)
- **组合式函数**: camelCase + use前缀 (useMatrix)
