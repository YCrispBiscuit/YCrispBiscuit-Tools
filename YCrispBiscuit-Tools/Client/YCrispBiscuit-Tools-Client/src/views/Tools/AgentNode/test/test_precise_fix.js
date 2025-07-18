// 专门针对实际错误的解析函数
const problemJson = `{"team_type": "RoundRobinGroupChat","terminator": "结束","selector_config": {"prompt": "roles: {roles} \n\n context: {history} \n\n Based on the conversation, who should speak next? {participants}","allow_repeated_speaker": true},"agents": [{"type": "AssistantAgent","name": "SWOT_Analyst","system_message": "你是一个SWOT分析师，你的目标是帮助用户进行全面、客观的SWOT分析，并提供专业的建议。你将通过提问、信息收集和数据分析，逐步构建SWOT分析报告。在分析过程中，你将使用网络搜索工具、文本分析工具和信息整理工具。在报告生成后，提供基于SWOT分析结果的总结和建议。请注意保持分析的客观性，避免带有偏见。你的输出应清晰、简洁，并以用户友好的方式呈现。","tools": [{"type": "function","name": "WebSearch","description": "用于搜索互联网信息，获取关于市场、竞争对手、行业趋势等信息。输入：搜索关键词。","source_code": "def WebSearch(keyword: str):\n # 调用网络搜索API，获取搜索结果。 这是一个占位符\n # 实际实现中需要使用网络搜索API\n print(f\"正在搜索: {keyword}\n\")\n return \"网络搜索结果，需实际实现\""},{"type": "function","name": "TextAnalyzer","description": "用于分析文本输入，提取关键信息。输入：文本内容。","source_code": "def TextAnalyzer(text: str):\n # 对用户提供的文本进行关键词提取和情感分析。这是一个占位符\n # 实际实现中需要调用文本分析API\n print(f\"正在分析文本: {text}\n\")\n return {\"keywords\": [\"关键词1\", \"关键词2\"], \"sentiment\": \"积极\"}"},{"type": "function","name": "ReportGenerator","description": "用于整理SWOT分析结果，生成结构化的报告。输入：SWOT分析数据。","source_code": "def ReportGenerator(swot_data: dict):\n # 调用报告生成API，生成SWOT分析报告，包含优势、劣势、机会和威胁。这是一个占位符\n # 实际实现中需要调用报告生成API\n print(\"正在生成报告...\")\n return \"SWOT分析报告，需实际实现\""}]}]}`;

// 查看错误位置 101 附近的内容
console.log('错误位置101附近:');
console.log('位置90-110:', JSON.stringify(problemJson.slice(90, 110)));
console.log('位置95-105:', JSON.stringify(problemJson.slice(95, 105)));
console.log('位置100-102:', JSON.stringify(problemJson.slice(100, 102)));

// 新的解析方法：更精确的字符串处理
function fixJsonControlChars(jsonStr) {
    console.log('🔧 开始修复JSON控制字符...');
    
    // 方法：逐步处理每个引号包围的字符串
    let result = jsonStr;
    let inString = false;
    let escaped = false;
    let fixedChars = '';
    
    for (let i = 0; i < result.length; i++) {
        const char = result[i];
        
        if (!inString) {
            if (char === '"') {
                inString = true;
            }
            fixedChars += char;
        } else {
            // 在字符串内部
            if (escaped) {
                fixedChars += char;
                escaped = false;
            } else if (char === '\\') {
                fixedChars += char;
                escaped = true;
            } else if (char === '"') {
                fixedChars += char;
                inString = false;
            } else if (char === '\n') {
                fixedChars += '\\n';
            } else if (char === '\r') {
                fixedChars += '\\r';
            } else if (char === '\t') {
                fixedChars += '\\t';
            } else {
                fixedChars += char;
            }
        }
    }
    
    console.log('修复后长度:', fixedChars.length);
    return fixedChars;
}

// 测试修复
try {
    const fixed = fixJsonControlChars(problemJson);
    console.log('✅ 字符修复完成，尝试解析...');
    
    const parsed = JSON.parse(fixed);
    console.log('🎉 解析成功!');
    console.log('- team_type:', parsed.team_type);
    console.log('- agents数量:', parsed.agents?.length);
    console.log('- 第一个agent tools数量:', parsed.agents?.[0]?.tools?.length);
    
} catch (e) {
    console.log('❌ 修复后仍然解析失败:', e.message);
}
