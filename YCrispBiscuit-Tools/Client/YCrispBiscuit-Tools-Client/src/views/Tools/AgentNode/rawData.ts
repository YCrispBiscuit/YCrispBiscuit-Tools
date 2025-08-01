// src/views/AgentNode/rawData.ts

// 类型定义（可根据实际需求扩展）


// 通用类型定义，支持后端所有字段
export interface AgentTool {
  type: string;
  name: string;
  description: string;
  source_code: string;
}

export interface Agent {
  type: string;
  name: string;
  system_message: string;
  tools: AgentTool[];
}


// 完全还原后端 JSON 层级结构，类型定义为 any
export type Team = any;



export const rawData: Team = {}


/*
// mock 数据完全还原后端 JSON 层级结构
export const rawData: Team = {
  createdAt: "2025-07-15T08:19:14.183Z",
  updatedAt: "2025-07-15T08:19:14.183Z",
  id: 7,
  teamBody: {
    version: "1.0",
    app_name: "SWOT分析员",
    department_id: 15,
    team_json_body: {
      team_type: "RoundRobinGroupChat",
      terminator: "结束",
      selector_config: {
        prompt: "roles: {roles} \n\n context: {history} \n\n Based on the conversation, who should speak next? {participants}",
        allow_repeated_speaker: true
      },
      agents: [
        {
          type: "AssistantAgent",
          name: "SWOT_Analyst",
          system_message: "你是一个SWOT分析师，你的目标是帮助用户进行全面、客观的SWOT分析，并提供专业的建议。你将通过提问、信息收集和数据分析，逐步构建SWOT分析报告。在分析过程中，你将使用网络搜索工具、文本分析工具和信息整理工具。在报告生成后，提供基于SWOT分析结果的总结和建议。请注意保持分析的客观性，避免带有偏见。你的输出应清晰、简洁，并以用户友好的方式呈现。",
          tools: [
            {
              type: "function",
              name: "WebSearch",
              description: "用于搜索互联网信息，获取关于市场、竞争对手、行业趋势等信息。输入：搜索关键词。",
              source_code: "def WebSearch(keyword: str):\n # 调用网络搜索API，获取搜索结果。 这是一个占位符\n # 实际实现中需要使用网络搜索API\n print(f\"正在搜索: {keyword}\n\")\n return \"网络搜索结果，需实际实现\""
            },
            {
              type: "function",
              name: "TextAnalyzer",
              description: "用于分析文本输入，提取关键信息。输入：文本内容。",
              source_code: "def TextAnalyzer(text: str):\n # 对用户提供的文本进行关键词提取和情感分析。这是一个占位符\n # 实际实现中需要调用文本分析API\n print(f\"正在分析文本: {text}\n\")\n return {\"keywords\": [\"关键词1\", \"关键词2\"], \"sentiment\": \"积极\"}"
            },
            {
              type: "function",
              name: "ReportGenerator",
              description: "用于整理SWOT分析结果，生成结构化的报告。输入：SWOT分析数据。",
              source_code: "def ReportGenerator(swot_data: dict):\n # 调用报告生成API，生成SWOT分析报告，包含优势、劣势、机会和威胁。这是一个占位符\n # 实际实现中需要调用报告生成API\n print(\"正在生成报告...\")\n return \"SWOT分析报告，需实际实现\""
            }
          ]
        }
      ]
    }
  }
};

*/
















