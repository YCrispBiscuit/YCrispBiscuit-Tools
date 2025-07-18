// src/views/AgentNode/parseRawDataToFlow.ts
// 数据驱动+事件流+响应式刷新骨架：rawData 解析为 VueFlow 节点/边
import type { Team, Agent } from './rawData'


// 支持 metaData 元数据合并
export function parseRawDataToFlow(rawData: Team, metaData?: any) {
  // 直接使用team_json_body JSON对象，无需解析
  let team = rawData
  if (rawData.teamBody && rawData.teamBody.team_json_body) {
    // 后端现在直接返回JSON对象
    if (typeof rawData.teamBody.team_json_body === 'object') {
      team = rawData.teamBody.team_json_body
    } else {
      // 兼容性警告
      console.warn('[parseRawDataToFlow] ⚠️ team_json_body 仍为字符串格式，后端可能未完成JSON格式切换')
      team = rawData
    }
  }
  const nodes: any[] = []
  const edges: any[] = []

  // 1. 团队节点，合并顶层元数据和 team_json_body 字段
  nodes.push({
    id: 'team',
    label: team.team_type,
    type: 'customNode',
    position: { x: 400, y: 200 },
    data: {
      ...rawData,
      ...team,
      agents: team.agents?.map(a => ({
        name: a.name,
        type: a.type,
        system_message: a.system_message,
        tools: a.tools
      })) || [],
      ...(metaData ? {
        id: metaData.id ?? '-',
        version: metaData.version ?? '-',
        app_name: metaData.app_name ?? '-',
        department_id: metaData.department_id ?? '-'
      } : {})
    }
  })

  // 2. Agent 节点
  const agentCount = team.agents?.length || 0
  const verticalGap = 400
  const horizontalGap = 500
  const startY = 200 - ((agentCount - 1) * verticalGap) / 2
  const startX = 400 + horizontalGap
  team.agents?.forEach((agent, idx) => {
    const agentId = agent.name
    nodes.push({
      id: agentId,
      label: agent.name,
      type: 'customNode',
      position: { x: startX, y: startY + idx * verticalGap },
      data: {
        type: agent.type,
        name: agent.name,
        system_message: agent.system_message,
        tools: agent.tools,
        ...(metaData ? {
          id: metaData.id ?? '-',
          version: metaData.version ?? '-',
          app_name: metaData.app_name ?? '-',
          department_id: metaData.department_id ?? '-'
        } : {})
      }
    })
    edges.push({
      id: `e-team-${agentId}`,
      source: 'team',
      target: agentId,
      label: ''
    })
  })

  return { nodes, edges }
}
