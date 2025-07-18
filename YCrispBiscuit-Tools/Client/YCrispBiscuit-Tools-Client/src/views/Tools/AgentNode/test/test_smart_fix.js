// 测试最新的智能修复版本
const problemJson = `{"team_type": "RoundRobinGroupChat","terminator": "结束","selector_config": {"prompt": "roles: {roles} \n\n context: {history} \n\n Based on the conversation, who should speak next? {participants}","allow_repeated_speaker": true},"agents": [{"type": "AssistantAgent","name": "SWOT_Analyst","system_message": "你是一个SWOT分析师，你的目标是帮助用户进行全面、客观的SWOT分析，并提供专业的建议。你将通过提问、信息收集和数据分析，逐步构建SWOT分析报告。在分析过程中，你将使用网络搜索工具、文本分析工具和信息整理工具。在报告生成后，提供基于SWOT分析结果的总结和建议。请注意保持分析的客观性，避免带有偏见。你的输出应清晰、简洁，并以用户友好的方式呈现。","tools": [{"type": "function","name": "WebSearch","description": "用于搜索互联网信息，获取关于市场、竞争对手、行业趋势等信息。输入：搜索关键词。","source_code": "def WebSearch(keyword: str):\n # 调用网络搜索API，获取搜索结果。 这是一个占位符\n # 实际实现中需要使用网络搜索API\n print(f\"正在搜索: {keyword}\n\")\n return \"网络搜索结果，需实际实现\""},{"type": "function","name": "TextAnalyzer","description": "用于分析文本输入，提取关键信息。输入：文本内容。","source_code": "def TextAnalyzer(text: str):\n # 对用户提供的文本进行关键词提取和情感分析。这是一个占位符\n # 实际实现中需要调用文本分析API\n print(f\"正在分析文本: {text}\n\")\n return {\"keywords\": [\"关键词1\", \"关键词2\"], \"sentiment\": \"积极\"}"},{"type": "function","name": "ReportGenerator","description": "用于整理SWOT分析结果，生成结构化的报告。输入：SWOT分析数据。","source_code": "def ReportGenerator(swot_data: dict):\n # 调用报告生成API，生成SWOT分析报告，包含优势、劣势、机会和威胁。这是一个占位符\n # 实际实现中需要调用报告生成API\n print(\"正在生成报告...\")\n return \"SWOT分析报告，需实际实现\""}]}]}`;

function parseWithControlCharFix(str) {
    if (typeof str !== 'string') {
        return str;
    }

    try {
        // 首先尝试直接解析
        let result = JSON.parse(str);
        while (typeof result === 'string') {
            result = JSON.parse(result);
        }
        return result;
    } catch (e) {
        console.warn('[Parser] 直接解析失败，尝试智能修复:', e?.message || e);
        
        try {
            // 智能修复：专门处理source_code字段中的复杂内容
            let fixed = str;
            
            // 第一步：修复source_code字段中的Python f-string和其他问题
            fixed = fixed.replace(/"source_code":\s*"([^"]*(?:\\.[^"]*)*)"/g, (_match, content) => {
                // 处理source_code内容中的各种问题字符
                let cleanContent = content
                    .replace(/\n/g, '\\n')           // 换行符
                    .replace(/\r/g, '\\r')           // 回车符
                    .replace(/\t/g, '\\t')           // 制表符
                    .replace(/\{/g, '\\{')           // Python f-string中的大括号
                    .replace(/\}/g, '\\}')           // Python f-string中的大括号
                    .replace(/\"/g, '\\"')           // 内部双引号
                    .replace(/\\/g, '\\\\');         // 反斜杠
                
                // 修复过度转义
                cleanContent = cleanContent
                    .replace(/\\\\\\\\/g, '\\\\')    // 修复四个反斜杠变成两个
                    .replace(/\\\\\{/g, '\\{')       // 修复过度转义的大括号
                    .replace(/\\\\\}/g, '\\}');      // 修复过度转义的大括号
                
                return `"source_code": "${cleanContent}"`;
            });
            
            // 第二步：修复其他字符串字段中的控制字符
            fixed = fixed.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (_match, content) => {
                // 跳过已经处理过的source_code字段
                if (_match.startsWith('"source_code"')) {
                    return _match;
                }
                
                // 处理其他字段的控制字符
                const cleanContent = content
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t');
                
                return `"${cleanContent}"`;
            });
            
            let result = JSON.parse(fixed);
            while (typeof result === 'string') {
                result = parseWithControlCharFix(result);
                if (typeof result === 'string') {
                    result = JSON.parse(result);
                }
            }
            console.log('[Parser] 智能修复成功');
            return result;
            
        } catch (e2) {
            console.warn('[Parser] 智能修复失败，尝试清理方法:', e2?.message || e2);
            
            try {
                // 最后的清理方法：移除所有source_code内容
                const cleaned = str.replace(/"source_code":\s*"[^"]*"/g, '"source_code": ""')
                                 .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
                let result = JSON.parse(cleaned);
                while (typeof result === 'string') {
                    result = JSON.parse(result);
                }
                console.log('[Parser] 清理方法解析成功');
                return result;
                
            } catch (e3) {
                console.error('[Parser] 所有修复方法都失败了:', e3?.message || e3);
                console.error('[Parser] 原始数据片段:', str.substring(0, 200));
                return str; // 返回原字符串避免崩溃
            }
        }
    }
}

console.log('🔧 测试最新智能修复版本...');

const result = parseWithControlCharFix(problemJson);
if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
    console.log('✅ 解析成功!');
    console.log('- team_type:', result.team_type);
    console.log('- terminator:', result.terminator);
    console.log('- agents数量:', result.agents?.length);
    if (result.agents?.[0]) {
        console.log('- 第一个agent name:', result.agents[0].name);
        console.log('- 第一个agent tools数量:', result.agents[0].tools?.length);
        console.log('- 第一个tool name:', result.agents[0].tools?.[0]?.name);
        console.log('- 第一个tool source_code长度:', result.agents[0].tools?.[0]?.source_code?.length);
    }
} else {
    console.log('⚠️ 返回了非预期结果:', typeof result);
}
