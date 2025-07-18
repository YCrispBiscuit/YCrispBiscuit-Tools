// src/views/AgentNode/data.ts

// 1. Agent 列表（简化版）
export const agentList = [
  {
    type: 'AssistantAgent',
    name: 'Planner_Agent',
    system_message: '负责规划的Agent',
    tools: [],
  },
  {
    type: 'AssistantAgent',
    name: 'Writer_Agent',
    system_message: '负责写作的Agent',
    tools: [],
  },
  {
    type: 'AssistantAgent',
    name: 'Reviewer_Agent',
    system_message: '负责审核的Agent',
    tools: [],
  },
  {
    type: 'AssistantAgent',
    name: 'Publisher_Agent',
    system_message: '负责发布的Agent',
    tools: [],
  },
  {
    type: 'AssistantAgent',
    name: 'Searcher_Agent',
    system_message: '负责搜索的Agent',
    tools: [],
  },
  {
    type: 'AssistantAgent',
    name: 'Calculator_Agent',
    system_message: '负责计算的Agent',
    tools: [],
  }
]

// 2. Model 列表
export const modelList = [
  {
    name: 'ChatGPT-4.0',
    value: 'gpt-4.0',
    description: 'OpenAI GPT-4.0',
  },
  {
    name: 'ChatGPT-4.1',
    value: 'gpt-4.1',
    description: 'OpenAI GPT-4.1',
  },
  {
    name: 'DeepSeek-v3',
    value: 'deepseek-v3-250324',
    description: 'DeepSeek v3 大模型',
  },
]

// 3. Tool 列表
export const toolList = [
  {
    type: 'function',
    name: 'WebSearch',
    description: '互联网搜索',
    source_code: '',
  },
  {
    type: 'function',
    name: 'Calculator',
    description: '数学计算',
    source_code: '',
  },
  {
    type: 'function',
    name: 'KnowledgeBase',
    description: '企业知识库检索',
    source_code: '',
  },
]

// 4. Termination 列表
export const terminationList = [
  {
    type: 'TextMentionTermination',
    description: '当对话中出现指定文本时终止',
    config: { text: 'PUBLISH' },
  },
  {
    type: 'MaxTurnTermination',
    description: '达到最大轮数时终止',
    config: { max_turns: 10 },
  },
]

// 4个 API 模拟（实际开发中应为异步请求）
export function fetchAgentList() {
  return Promise.resolve(agentList)
}
export function fetchModelList() {
  return Promise.resolve(modelList)
}
export function fetchToolList() {
  return Promise.resolve(toolList)
}
export function fetchTerminationList() {
  return Promise.resolve(terminationList)
}
