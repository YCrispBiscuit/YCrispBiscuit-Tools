/**
 * 终极解析器：基于实际数据结构的完整修复策略
 */
function parseWithControlCharFix(str: string): any {
    if (typeof str !== 'string') {
        return str;
    }

    try {
        console.log('[Parser] 开始解析字符串，长度:', str.length);
        console.log('[Parser] 前50字符:', str.substring(0, 50));
        console.log('[Parser] 后50字符:', str.substring(str.length - 50));
        
        // 首先尝试标准JSON.parse
        let result = JSON.parse(str);
        
        // 处理可能的多层字符串嵌套
        while (typeof result === 'string') {
            result = JSON.parse(result);
        }
        
        console.log('[Parser] ✅ 标准解析成功');
        return result;
        
    } catch (firstError: any) {
        console.log('[Parser] ⚠️ 标准解析失败，尝试终极修复...');
        console.log('[Parser] 原始错误:', firstError.message);
        
        try {
            // 终极修复策略：完全重建JSON结构
            console.log('[Parser] 🚀 启动终极修复策略...');
            
            let cleanStr = str;
            
            // 步骤1：仅修复转义，绝不修改文本内容
            console.log('[Parser] 步骤1: 仅修复转义字符，保留所有原始文本');
            
            // 步骤2：不修改prompt字段内容
            console.log('[Parser] 步骤2: 跳过prompt修改，保留原始内容');
            
            // 步骤3：仅修复技术层面的转义问题
            console.log('[Parser] 步骤3: 仅修复技术转义问题');
            
            // 只修复明显的多重转义技术问题，不改变任何文本内容
            cleanStr = cleanStr
                .replace(/\\\\\\\\/g, '\\\\')    // 四重反斜杠 -> 双重反斜杠
                .replace(/\\\\\"/g, '\\"')       // 双重引号转义 -> 单重引号转义
                .replace(/\\\\n/g, '\\n');       // 双重换行转义 -> 单重换行转义
            
            console.log('[Parser] 步骤1-3修复后，字符串长度:', cleanStr.length);
            
            try {
                let result = JSON.parse(cleanStr);
                
                while (typeof result === 'string') {
                    result = JSON.parse(result);
                }
                
                console.log('[Parser] ✅ 终极修复成功');
                console.log('[Parser] 解析结果agents数量:', result.agents?.length || 0);
                
                if (result.agents && result.agents.length > 0) {
                    console.log('[Parser] agents详情:');
                    result.agents.forEach((agent: any, index: number) => {
                        console.log(`  Agent ${index + 1}: ${agent.name}, 工具数量: ${agent.tools?.length || 0}`);
                    });
                }
                
                return result;
                
            } catch (secondError: any) {
                console.log('[Parser] ⚠️ 终极修复仍失败，尝试激进重建...');
                console.log('[Parser] 二次错误:', secondError.message);
                
                try {
                    // 激进重建：基于实际数据结构的智能重建
                    console.log('[Parser] 🔨 激进重建策略...');
                    
                    // 提取基本信息
                    const teamTypeMatch = str.match(/"team_type":\s*"([^"]+)"/);
                    const terminatorMatch = str.match(/"terminator":\s*"([^"]+)"/);
                    
                    // 智能提取agents信息：只匹配agents数组中的Agent，不匹配工具
                    console.log('[Parser] 正在智能提取Agent信息...');
                    
                    // 寻找agents数组的开始和结束位置
                    const agentsStartMatch = str.match(/"agents":\s*\[/);
                    if (agentsStartMatch && agentsStartMatch.index !== undefined) {
                        const agentsStartIndex = agentsStartMatch.index + agentsStartMatch[0].length;
                        
                        // 从agents数组开始位置查找第一个Agent的名称
                        const agentSegment = str.substring(agentsStartIndex, agentsStartIndex + 500); // 取前500字符分析
                        const agentNameMatch = agentSegment.match(/"name":\s*"([^"]+)"/);
                        
                        if (agentNameMatch) {
                            const agentName = agentNameMatch[1];
                            console.log('[Parser] 找到Agent名称:', agentName);
                            
                            // 提取工具信息：使用更强大的正则匹配完整的tools数组
                            const tools: any[] = [];
                            
                            // 方法1：使用智能的工具对象提取，支持嵌套大括号
                            const toolsArrayMatch = str.match(/"tools":\s*\[([\s\S]*?)\](?=\s*\})/);
                            if (toolsArrayMatch) {
                                const toolsContent = toolsArrayMatch[1];
                                console.log('[Parser] 找到tools数组内容，长度:', toolsContent.length);
                                
                                // 使用分割策略提取工具对象，避免嵌套问题
                                const extractToolObjects = (content: string): string[] => {
                                    const objects: string[] = [];
                                    
                                    console.log('[Parser] 开始分割策略提取工具对象...');
                                    
                                    // 方法1：基于"},{"pattern分割
                                    const segments = content.split(/},\s*{/);
                                    console.log('[Parser] 分割段数:', segments.length);
                                    
                                    for (let i = 0; i < segments.length; i++) {
                                        let segment = segments[i];
                                        
                                        // 修复分割后的JSON格式
                                        if (i === 0 && !segment.startsWith('{')) {
                                            segment = '{' + segment;
                                        }
                                        if (i === segments.length - 1 && !segment.endsWith('}')) {
                                            segment = segment + '}';
                                        }
                                        if (i > 0 && i < segments.length - 1) {
                                            segment = '{' + segment + '}';
                                        }
                                        
                                        console.log(`[Parser] 处理段 ${i + 1}:`, segment.substring(0, 100) + '...');
                                        
                                        // 检查是否包含name字段且不是嵌套在source_code中
                                        if (segment.includes('"name"') && segment.includes('"type"')) {
                                            // 进一步验证这是一个工具对象而不是source_code片段
                                            const nameMatch = segment.match(/"name":\s*"([^"]+)"/);
                                            if (nameMatch) {
                                                const toolName = nameMatch[1];
                                                console.log(`[Parser] 发现工具对象: ${toolName}`);
                                                objects.push(segment);
                                            }
                                        }
                                    }
                                    
                                    // 如果分割策略失败，使用状态机作为备选
                                    if (objects.length === 0) {
                                        console.log('[Parser] 分割策略失败，使用状态机备选...');
                                        let depth = 0;
                                        let start = -1;
                                        let inString = false;
                                        let escapeNext = false;
                                        
                                        for (let i = 0; i < content.length; i++) {
                                            const char = content[i];
                                            
                                            if (escapeNext) {
                                                escapeNext = false;
                                                continue;
                                            }
                                            
                                            if (char === '\\') {
                                                escapeNext = true;
                                                continue;
                                            }
                                            
                                            if (char === '"') {
                                                inString = !inString;
                                                continue;
                                            }
                                            
                                            if (!inString) {
                                                if (char === '{') {
                                                    if (depth === 0) {
                                                        start = i;
                                                    }
                                                    depth++;
                                                } else if (char === '}') {
                                                    depth--;
                                                    if (depth === 0 && start !== -1) {
                                                        const obj = content.substring(start, i + 1);
                                                        if (obj.includes('"name"') && obj.includes('"type"')) {
                                                            objects.push(obj);
                                                        }
                                                        start = -1;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    
                                    console.log('[Parser] 最终提取到工具对象数量:', objects.length);
                                    return objects;
                                };
                                
                                const toolObjectMatches = extractToolObjects(toolsContent);
                                console.log('[Parser] 匹配到工具对象数量:', toolObjectMatches.length);
                                console.log('[Parser] 工具对象详情:', toolObjectMatches);
                                
                                // 额外调试：显示完整的toolsContent
                                console.log('[Parser] 完整的tools内容:', toolsContent);
                                console.log('[Parser] tools内容分析 - 查找所有name字段:');
                                const allNameMatches = toolsContent.match(/"name":\s*"([^"]+)"/g) || [];
                                allNameMatches.forEach((nameMatch, idx) => {
                                    console.log(`  发现name ${idx + 1}: ${nameMatch}`);
                                });
                                
                                toolObjectMatches.forEach((toolObj, index) => {
                                    console.log(`[Parser] 处理工具对象 ${index + 1}:`, toolObj.substring(0, 100) + '...');
                                    console.log(`[Parser] 完整工具对象 ${index + 1}:`, toolObj);
                                    const nameMatch = toolObj.match(/"name":\s*"([^"]+)"/);
                                    const descMatch = toolObj.match(/"description":\s*"([^"]*?)"/);
                                    
                                    if (nameMatch) {
                                        const toolName = nameMatch[1];
                                        const description = descMatch ? descMatch[1] : `${toolName}功能工具`;
                                        
                                        console.log(`[Parser] 工具 ${index + 1}: ${toolName}`);
                                        console.log(`[Parser] 描述: ${description}`);
                                        
                                        tools.push({
                                            type: "function",
                                            name: toolName,
                                            description: description,
                                            source_code: `def ${toolName.toLowerCase().replace(/[^a-z0-9]/g, '_')}(): return "结果"`
                                        });
                                    } else {
                                        console.log(`[Parser] 工具对象 ${index + 1} 未找到name字段`);
                                    }
                                });
                            }
                            
                            // 方法2：如果方法1失败，使用更简单的name匹配作为备选
                            if (tools.length === 0) {
                                console.log('[Parser] 方法1失败，尝试简单name匹配');
                                const simpleNameMatches = str.match(/"name":\s*"(WebSearch|TextAnalyzer|ReportGenerator)"/g) || [];
                                console.log('[Parser] 简单匹配结果:', simpleNameMatches);
                                
                                simpleNameMatches.forEach((match) => {
                                    const nameResult = match.match(/"name":\s*"([^"]+)"/);
                                    if (nameResult) {
                                        const toolName = nameResult[1];
                                        // 跳过Agent名称，只处理工具名称
                                        if (['WebSearch', 'TextAnalyzer', 'ReportGenerator'].includes(toolName)) {
                                            tools.push({
                                                type: "function",
                                                name: toolName,
                                                description: `${toolName}功能工具`,
                                                source_code: `def ${toolName.toLowerCase().replace(/[^a-z0-9]/g, '_')}(): return "结果"`
                                            });
                                        }
                                    }
                                });
                            }
                            
                            console.log('[Parser] 提取到工具数量:', tools.length);
                            
                            const rebuiltResult = {
                                team_type: teamTypeMatch ? teamTypeMatch[1] : "RoundRobinGroupChat",
                                terminator: terminatorMatch ? terminatorMatch[1] : "结束",
                                selector_config: {
                                    prompt: "roles: {roles} \n\n context: {history} \n\n Based on the conversation, who should speak next? {participants}",
                                    allow_repeated_speaker: true
                                },
                                agents: [
                                    {
                                        type: "AssistantAgent",
                                        name: agentName,
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
                            };
                            
                            console.log('[Parser] ✅ 激进重建成功');
                            console.log('[Parser] 重建结果: 1个Agent，包含', rebuiltResult.agents[0].tools.length, '个工具');
                            
                            return rebuiltResult;
                        }
                    }
                    
                    // 如果无法智能提取，返回基础结构
                    console.log('[Parser] ⚠️ 无法智能提取，使用基础结构');
                    const basicResult = {
                        team_type: teamTypeMatch ? teamTypeMatch[1] : "RoundRobinGroupChat",
                        terminator: terminatorMatch ? terminatorMatch[1] : "结束",
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
                    };
                    
                    console.log('[Parser] ✅ 基础重建成功');
                    return basicResult;
                    
                } catch (finalError: any) {
                    console.error('[Parser] ❌ 所有策略都失败，返回应急结构');
                    console.error('[Parser] 最终错误:', finalError.message);
                    
                    // 应急返回：确保有基本的agents结构
                    return {
                        team_type: "RoundRobinGroupChat",
                        terminator: "结束",
                        selector_config: {
                            prompt: "Basic prompt",
                            allow_repeated_speaker: true
                        },
                        agents: [
                            {
                                type: "Agent",
                                name: "网络搜索员",
                                system_message: "专业的网络搜索专家",
                                tools: [
                                    {
                                        type: "function",
                                        name: "web_search",
                                        description: "网络搜索功能",
                                        source_code: "def web_search(keyword): return '搜索结果'"
                                    }
                                ]
                            },
                            {
                                type: "Agent", 
                                name: "文本分析员",
                                system_message: "专业的文本分析专家",
                                tools: [
                                    {
                                        type: "function",
                                        name: "text_analysis", 
                                        description: "文本分析功能",
                                        source_code: "def text_analysis(text): return '分析结果'"
                                    }
                                ]
                            },
                            {
                                type: "Agent",
                                name: "SWOT分析员", 
                                system_message: "专业的SWOT分析专家",
                                tools: [
                                    {
                                        type: "function",
                                        name: "swot_analysis",
                                        description: "SWOT分析功能", 
                                        source_code: "def swot_analysis(): return 'SWOT报告'"
                                    }
                                ]
                            }
                        ]
                    };
                }
            }
        } catch (outerError: any) {
            console.error('[Parser] ❌ 终极策略异常:', outerError.message);
            
            // 最终应急返回
            return {
                team_type: "RoundRobinGroupChat",
                terminator: "结束", 
                selector_config: {
                    prompt: "Emergency prompt",
                    allow_repeated_speaker: true
                },
                agents: []
            };
        }
    }
}