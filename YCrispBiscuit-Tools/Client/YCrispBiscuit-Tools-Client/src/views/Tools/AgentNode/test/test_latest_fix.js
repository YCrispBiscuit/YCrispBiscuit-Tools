// 测试最新修复版本
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
        console.warn('[Parser] 直接解析失败，尝试修复方案:', e?.message || e);
        
        try {
            // 方案1：临时清空source_code内容，避免复杂字符串解析问题
            let tempFixed = str.replace(/"source_code":\s*"[^"]*"/g, '"source_code": "TEMP_CLEANED"');
            
            // 然后处理其他字段的控制字符
            tempFixed = tempFixed.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            
            let result = JSON.parse(tempFixed);
            while (typeof result === 'string') {
                result = JSON.parse(result);
            }
            
            // 解析成功后，恢复source_code的原始内容（但清理控制字符）
            if (typeof result === 'object' && result.agents) {
                const sourceCodeMatches = str.match(/"source_code":\s*"([^"]*)"/g) || [];
                let sourceIndex = 0;
                
                const restoreSourceCode = (obj) => {
                    if (Array.isArray(obj)) {
                        return obj.map(restoreSourceCode);
                    } else if (typeof obj === 'object' && obj !== null) {
                        const newObj = {};
                        for (const [key, value] of Object.entries(obj)) {
                            if (key === 'source_code' && value === 'TEMP_CLEANED' && sourceIndex < sourceCodeMatches.length) {
                                // 恢复原始source_code内容，但清理控制字符
                                const match = sourceCodeMatches[sourceIndex++];
                                const content = match.match(/"source_code":\s*"([^"]*)"/)?.[1] || '';
                                newObj[key] = content.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
                            } else {
                                newObj[key] = restoreSourceCode(value);
                            }
                        }
                        return newObj;
                    }
                    return obj;
                };
                
                result = restoreSourceCode(result);
            }
            
            console.log('[Parser] 修复方案1成功');
            return result;
            
        } catch (e2) {
            console.warn('[Parser] 方案1失败，尝试方案2:', e2?.message || e2);
            
            try {
                // 方案2：完全移除source_code字段
                const cleaned = str
                    .replace(/"source_code":\s*"[^"]*",?/g, '')  // 移除source_code字段
                    .replace(/,\s*}/g, '}')                      // 修复可能的尾随逗号
                    .replace(/,\s*]/g, ']')                      // 修复数组中的尾随逗号
                    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' '); // 移除控制字符
                
                let result = JSON.parse(cleaned);
                while (typeof result === 'string') {
                    result = JSON.parse(result);
                }
                console.log('[Parser] 方案2解析成功（已移除source_code字段）');
                return result;
                
            } catch (e3) {
                console.error('[Parser] 所有修复方案都失败了:', e3?.message || e3);
                console.error('[Parser] 返回原始字符串避免程序崩溃');
                return str; // 返回原字符串避免崩溃
            }
        }
    }
}

console.log('🔧 测试最新修复版本...');

const result = parseWithControlCharFix(problemJson);
if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
    console.log('🎉 解析成功!');
    console.log('- team_type:', result.team_type);
    console.log('- terminator:', result.terminator);
    console.log('- agents数量:', result.agents?.length);
    if (result.agents?.[0]) {
        console.log('- 第一个agent name:', result.agents[0].name);
        console.log('- 第一个agent tools数量:', result.agents[0].tools?.length);
        if (result.agents[0].tools?.[0]) {
            console.log('- 第一个tool name:', result.agents[0].tools[0].name);
            console.log('- 第一个tool source_code类型:', typeof result.agents[0].tools[0].source_code);
            console.log('- 第一个tool source_code长度:', result.agents[0].tools[0].source_code?.length);
        }
    }
} else {
    console.log('⚠️ 返回了非预期结果:', typeof result);
}
