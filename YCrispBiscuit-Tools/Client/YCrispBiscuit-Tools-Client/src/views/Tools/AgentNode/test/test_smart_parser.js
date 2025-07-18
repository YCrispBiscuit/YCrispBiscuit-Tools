// 测试最新修复的解析函数
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
        console.warn('[Parser] 直接解析失败，尝试控制字符修复:', e?.message || e);
        
        try {
            // 方法1：智能字符串内容替换
            // 只在字符串值内部替换控制字符，保持JSON结构完整
            let fixed = str.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (_match, content) => {
                // 在字符串内容中处理控制字符
                const cleanContent = content
                    .replace(/\n/g, '\\n')      // 换行符
                    .replace(/\r/g, '\\r')      // 回车符  
                    .replace(/\t/g, '\\t')      // 制表符
                    .replace(/\f/g, '\\f')      // 换页符
                    .replace(/\b/g, '\\b')      // 退格符
                    .replace(/\x00/g, '\\u0000'); // 空字符
                return `"${cleanContent}"`;
            });
            
            let result = JSON.parse(fixed);
            while (typeof result === 'string') {
                result = parseWithControlCharFix(result);
                if (typeof result === 'string') {
                    result = JSON.parse(result);
                }
            }
            console.log('[Parser] 控制字符修复成功');
            return result;
            
        } catch (e2) {
            console.warn('[Parser] 方法1失败，尝试方法2:', e2?.message || e2);
            
            try {
                // 方法2：简单替换控制字符为空格
                const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
                let result = JSON.parse(cleaned);
                while (typeof result === 'string') {
                    result = JSON.parse(result);
                }
                console.log('[Parser] 方法2解析成功');
                return result;
                
            } catch (e3) {
                console.error('[Parser] 所有修复方法都失败了:', e3?.message || e3);
                console.error('[Parser] 原始数据片段:', str.substring(0, 200));
                return str; // 返回原字符串避免崩溃
            }
        }
    }
}

// 用户提供的实际出错的JSON字符串
const problemJson = `{"team_type": "RoundRobinGroupChat","terminator": "结束","selector_config": {"prompt": "roles: {roles} \n\n context: {history} \n\n Based on the conversation, who should speak next? {participants}","allow_repeated_speaker": true},"agents": [{"type": "AssistantAgent","name": "SWOT_Analyst","system_message": "你是一个SWOT分析师，你的目标是帮助用户进行全面、客观的SWOT分析，并提供专业的建议。你将通过提问、信息收集和数据分析，逐步构建SWOT分析报告。在分析过程中，你将使用网络搜索工具、文本分析工具和信息整理工具。在报告生成后，提供基于SWOT分析结果的总结和建议。请注意保持分析的客观性，避免带有偏见。你的输出应清晰、简洁，并以用户友好的方式呈现。","tools": [{"type": "function","name": "WebSearch","description": "用于搜索互联网信息，获取关于市场、竞争对手、行业趋势等信息。输入：搜索关键词。","source_code": "def WebSearch(keyword: str):\n # 调用网络搜索API，获取搜索结果。 这是一个占位符\n # 实际实现中需要使用网络搜索API\n print(f\"正在搜索: {keyword}\n\")\n return \"网络搜索结果，需实际实现\""},{"type": "function","name": "TextAnalyzer","description": "用于分析文本输入，提取关键信息。输入：文本内容。","source_code": "def TextAnalyzer(text: str):\n # 对用户提供的文本进行关键词提取和情感分析。这是一个占位符\n # 实际实现中需要调用文本分析API\n print(f\"正在分析文本: {text}\n\")\n return {\"keywords\": [\"关键词1\", \"关键词2\"], \"sentiment\": \"积极\"}"},{"type": "function","name": "ReportGenerator","description": "用于整理SWOT分析结果，生成结构化的报告。输入：SWOT分析数据。","source_code": "def ReportGenerator(swot_data: dict):\n # 调用报告生成API，生成SWOT分析报告，包含优势、劣势、机会和威胁。这是一个占位符\n # 实际实现中需要调用报告生成API\n print(\"正在生成报告...\")\n return \"SWOT分析报告，需实际实现\""}]}]}`;

console.log('🔧 测试最新的智能修复版本...');

// 测试修复后的解析
const result = parseWithControlCharFix(problemJson);
if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
    console.log('✅ parseWithControlCharFix 成功解析为对象!');
    console.log('- team_type:', result.team_type);
    console.log('- terminator:', result.terminator);
    console.log('- selector_config.prompt 长度:', result.selector_config?.prompt?.length);
    console.log('- agents数量:', result.agents?.length);
    if (result.agents?.[0]) {
        console.log('- 第一个agent name:', result.agents[0].name);
        console.log('- 第一个agent tools数量:', result.agents[0].tools?.length);
        console.log('- 第一个tool name:', result.agents[0].tools?.[0]?.name);
    }
} else {
    console.log('⚠️ parseWithControlCharFix 返回了非预期结果:', typeof result);
}
