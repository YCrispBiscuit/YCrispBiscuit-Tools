// 测试最新修复的解析函数
function parseWithControlCharFix(str) {
    if (typeof str !== 'string') {
        return str;
    }

    try {
        // 步骤 1: 简单但有效的控制字符处理
        // 直接替换所有可能的控制字符为对应的转义序列
        let sanitizedString = str
            .replace(/\\/g, "\\\\")     // 首先处理反斜杠（必须最先处理）
            .replace(/"/g, '\\"')       // 处理双引号
            .replace(/\n/g, "\\n")      // 换行符
            .replace(/\r/g, "\\r")      // 回车符
            .replace(/\t/g, "\\t")      // 制表符
            .replace(/\f/g, "\\f")      // 换页符
            .replace(/\b/g, "\\b");     // 退格符
        
        // 修复因为过度转义而破坏的JSON结构
        // 恢复JSON结构中应该保留的字符
        sanitizedString = sanitizedString
            .replace(/\\\\"/g, '\\"')   // 修复过度转义的引号
            .replace(/\\\\\\\\/g, '\\\\'); // 修复过度转义的反斜杠
        
        // 步骤 2: 使用循环处理多层 stringify
        let result = JSON.parse(sanitizedString);
        while (typeof result === 'string') {
            // 对嵌套的字符串递归处理
            try {
                const nextResult = JSON.parse(result);
                result = nextResult;
            } catch {
                // 如果无法继续解析，尝试再次清理控制字符
                result = parseWithControlCharFix(result);
                break;
            }
        }
        return result;

    } catch (e) {
        console.error('[Parser] 第一次解析失败，尝试备用方案。', e);
        
        // 备用方案1：移除所有非打印字符
        try {
            const cleanedString = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
            let result = JSON.parse(cleanedString);
            while (typeof result === 'string') {
                result = JSON.parse(result);
            }
            console.warn('[Parser] 备用方案1解析成功');
            return result;
        } catch (e2) {
            console.error('[Parser] 备用方案1失败，尝试备用方案2:', e2);
        }
        
        // 备用方案2：更激进的字符替换
        try {
            let fallbackString = str
                .replace(/[\r\n\t]/g, ' ')  // 所有控制字符替换为空格
                .replace(/\s+/g, ' ')       // 多个空格合并为单个空格
                .replace(/,\s*}/g, '}')     // 修复可能的尾随逗号
                .replace(/,\s*]/g, ']');    // 修复数组中的尾随逗号
            
            let result = JSON.parse(fallbackString);
            while (typeof result === 'string') {
                result = JSON.parse(result);
            }
            console.warn('[Parser] 备用方案2解析成功');
            return result;
        } catch (e3) {
            console.error('[Parser] 所有解析方案都失败了，返回原始字符串:', e3);
            console.error('[Parser] 失败的字符串内容:', str.substring(0, 200) + '...');
            return str; // 返回原始字符串，避免程序崩溃
        }
    }
}

// 用户提供的实际出错的JSON字符串
const problemJson = `{"team_type": "RoundRobinGroupChat","terminator": "结束","selector_config": {"prompt": "roles: {roles} \n\n context: {history} \n\n Based on the conversation, who should speak next? {participants}","allow_repeated_speaker": true},"agents": [{"type": "AssistantAgent","name": "SWOT_Analyst","system_message": "你是一个SWOT分析师，你的目标是帮助用户进行全面、客观的SWOT分析，并提供专业的建议。你将通过提问、信息收集和数据分析，逐步构建SWOT分析报告。在分析过程中，你将使用网络搜索工具、文本分析工具和信息整理工具。在报告生成后，提供基于SWOT分析结果的总结和建议。请注意保持分析的客观性，避免带有偏见。你的输出应清晰、简洁，并以用户友好的方式呈现。","tools": [{"type": "function","name": "WebSearch","description": "用于搜索互联网信息，获取关于市场、竞争对手、行业趋势等信息。输入：搜索关键词。","source_code": "def WebSearch(keyword: str):\n # 调用网络搜索API，获取搜索结果。 这是一个占位符\n # 实际实现中需要使用网络搜索API\n print(f\"正在搜索: {keyword}\n\")\n return \"网络搜索结果，需实际实现\""},{"type": "function","name": "TextAnalyzer","description": "用于分析文本输入，提取关键信息。输入：文本内容。","source_code": "def TextAnalyzer(text: str):\n # 对用户提供的文本进行关键词提取和情感分析。这是一个占位符\n # 实际实现中需要调用文本分析API\n print(f\"正在分析文本: {text}\n\")\n return {\"keywords\": [\"关键词1\", \"关键词2\"], \"sentiment\": \"积极\"}"},{"type": "function","name": "ReportGenerator","description": "用于整理SWOT分析结果，生成结构化的报告。输入：SWOT分析数据。","source_code": "def ReportGenerator(swot_data: dict):\n # 调用报告生成API，生成SWOT分析报告，包含优势、劣势、机会和威胁。这是一个占位符\n # 实际实现中需要调用报告生成API\n print(\"正在生成报告...\")\n return \"SWOT分析报告，需实际实现\""}]}]}`;

console.log('🔧 测试最新的修复版本...');
console.log('原始字符串长度:', problemJson.length);

// 测试修复后的解析
try {
    const result = parseWithControlCharFix(problemJson);
    if (typeof result === 'object' && result !== null) {
        console.log('✅ parseWithControlCharFix 成功解析为对象!');
        console.log('- team_type:', result.team_type);
        console.log('- terminator:', result.terminator);
        console.log('- agents数量:', result.agents?.length);
        if (result.agents?.[0]) {
            console.log('- 第一个agent name:', result.agents[0].name);
            console.log('- 第一个agent tools数量:', result.agents[0].tools?.length);
        }
    } else {
        console.log('⚠️ parseWithControlCharFix 返回了非对象结果:', typeof result);
    }
} catch (e) {
    console.log('❌ parseWithControlCharFix 抛出异常:', e.message);
}
