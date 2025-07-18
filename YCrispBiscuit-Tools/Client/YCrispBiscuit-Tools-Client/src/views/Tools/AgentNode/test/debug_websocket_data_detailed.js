// 调试WebSocket数据的详细分析脚本
// 这个脚本用于分析原始JSON字符串，找出所有可能的解析问题

// 模拟真实的后端WebSocket数据（基于最新日志）
const realWebSocketData = {
    id: 7,
    teamBody: '{\n"team_json_body": "{\\"team_type\\": \\"RoundRobinGroupChat\\",\\"terminator\\": \\"结束\\",\\"selector_config\\": {\\"prompt\\": \\"roles: {roles}\\\\ncurrent speaker: {current_speaker}\\\\nNext speaker: select the speaker from the roles list to speak next.\\",\\"allow_repeated_speaker\\": true},\\"agents\\": [{\\"type\\": \\"Agent\\",\\"name\\": \\"网络搜索员\\",\\"system_message\\": \\"你是一个专业的网络搜索专家，能够根据用户提供的关键词进行高效的网络搜索，并提供准确的搜索结果。\\",\\"tools\\": [{\\"type\\": \\"function\\",\\"name\\": \\"web_search\\",\\"description\\": \\"根据关键词进行网络搜索\\",\\"source_code\\": \\"def web_search(keyword):\\\\n    # 这是一个占位符\\\\n    # 实际实现中需要使用网络搜索API\\\\n    print(f\\\\\\"正在搜索: {keyword}\\\\n\\\\\\")\\\\n    return \\\\\\"网络搜索结果，需实际实现\\\\\\"\\"}, {\\"type\\": \\"function\\",\\"name\\": \\"text_analysis\\",\\"description\\": \\"对文本进行情感分析\\",\\"source_code\\": \\"def text_analysis(text):\\\\n    # 这是一个占位符\\\\n    # 实际实现中需要调用文本分析API\\\\n    print(f\\\\\\"正在分析文本: {text}\\\\n\\\\\\")\\\\n    return \\\\\\"文本分析结果，需实际实现\\\\\\"\\"}, {\\"type\\": \\"function\\",\\"name\\": \\"swot_analysis\\",\\"description\\": \\"生成SWOT分析报告\\",\\"source_code\\": \\"def swot_analysis():\\\\n    # 这是一个占位符，实际实现中需要调用相关API，生成SWOT分析报告，包含优势、劣势、机会和威胁。这是一个占位符\\\\n    # 实际实现中需要调用报告生成API\\\\n    print(\\\\\\"正在生成报告...\\\\\\")\\\\n    return \\\\\\"SWOT分析报告，需实际实现\\\\\\"\\""}]}]}",\n"version": "1.0",\n"app_name": "SWOT分析员",\n"department_id": 15\n}'
};

function analyzeJsonString(str) {
    console.log('=== JSON字符串分析 ===');
    console.log('字符串长度:', str.length);
    console.log('前50字符:', JSON.stringify(str.substring(0, 50)));
    console.log('后50字符:', JSON.stringify(str.substring(str.length - 50)));
    console.log();
    
    // 查找所有可能的问题模式
    const problematicPatterns = [
        {
            name: 'f-string模式1',
            pattern: /print\(f\\"[^"]*\{[^}]*\}[^"]*\\n\\"\)/g,
            description: 'print(f"...{variable}\\n")'
        },
        {
            name: 'f-string模式2', 
            pattern: /f\\"[^"]*\{[^}]*\}[^"]*\\"/g,
            description: 'f"...{variable}..."'
        },
        {
            name: '未转义花括号',
            pattern: /[^\\]\{[a-zA-Z_][a-zA-Z0-9_]*\}/g,
            description: '未正确转义的{variable}'
        },
        {
            name: '未转义换行符',
            pattern: /[^\\]\\n/g,
            description: '未正确转义的\\n'
        },
        {
            name: '未转义引号',
            pattern: /[^\\]\\"/g,
            description: '未正确转义的\\"'
        }
    ];
    
    console.log('=== 问题模式分析 ===');
    problematicPatterns.forEach(({ name, pattern, description }) => {
        const matches = str.match(pattern) || [];
        if (matches.length > 0) {
            console.log(`${name} (${description}): 发现 ${matches.length} 个匹配`);
            matches.forEach((match, index) => {
                const pos = str.indexOf(match);
                console.log(`  匹配${index + 1}: "${match}" (位置: ${pos})`);
                console.log(`  前后文: ${JSON.stringify(str.substring(pos - 10, pos + match.length + 10))}`);
            });
        } else {
            console.log(`${name}: 无匹配`);
        }
    });
    console.log();
    
    // 尝试定位JSON解析错误的具体位置
    try {
        JSON.parse(str);
        console.log('✅ JSON解析成功');
    } catch (error) {
        console.log('❌ JSON解析失败:', error.message);
        
        // 提取错误位置
        const match = error.message.match(/position (\d+)/);
        if (match) {
            const errorPos = parseInt(match[1]);
            console.log('错误位置:', errorPos);
            console.log('错误位置字符:', JSON.stringify(str.charAt(errorPos)));
            console.log('错误前20字符:', JSON.stringify(str.substring(errorPos - 20, errorPos)));
            console.log('错误后20字符:', JSON.stringify(str.substring(errorPos, errorPos + 20)));
            
            // 查找错误位置附近的源代码段
            const nearbyText = str.substring(errorPos - 100, errorPos + 100);
            if (nearbyText.includes('source_code')) {
                console.log('\n🔍 错误位置在source_code字段附近:');
                console.log(nearbyText);
            }
        }
    }
}

function testFixStrategies(originalStr) {
    console.log('\n=== 修复策略测试 ===');
    
    const strategies = [
        {
            name: '策略1: 精确修复f-string',
            fix: (str) => {
                let fixed = str;
                // 修复具体的问题模式
                fixed = fixed.replace(/print\(f\\"正在搜索: \{keyword\}\\n\\"\)/g, 'print(f\\"正在搜索: \\\\{keyword\\\\}\\\\n\\")');
                fixed = fixed.replace(/print\(f\\"正在分析文本: \{text\}\\n\\"\)/g, 'print(f\\"正在分析文本: \\\\{text\\\\}\\\\n\\")');
                return fixed;
            }
        },
        {
            name: '策略2: 全局花括号转义',
            fix: (str) => {
                return str.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, '\\\\{$1\\\\}');
            }
        },
        {
            name: '策略3: source_code字段清理',
            fix: (str) => {
                return str.replace(/"source_code":\s*"[^"]*"/g, '"source_code": "# Placeholder"');
            }
        },
        {
            name: '策略5: 彻底重写source_code',
            fix: (str) => {
                // 彻底替换所有source_code字段为简单的Python代码
                let fixed = str.replace(/"source_code":\s*"[^"]*"/g, (match) => {
                    if (match.includes('web_search')) {
                        return '"source_code": "def web_search(keyword): return \\"搜索结果\\""';
                    } else if (match.includes('text_analysis')) {
                        return '"source_code": "def text_analysis(text): return \\"分析结果\\""';
                    } else if (match.includes('swot_analysis')) {
                        return '"source_code": "def swot_analysis(): return \\"SWOT报告\\""';
                    } else {
                        return '"source_code": "def placeholder(): return \\"占位符\\""';
                    }
                });
                return fixed;
            }
        },
        {
            name: '策略6: 逐步简化修复',
            fix: (str) => {
                let fixed = str;
                
                // 步骤1：先移除所有f-string，替换为简单字符串
                fixed = fixed.replace(/print\(f\\?"[^"]*\{[^}]*\}[^"]*\\?"\)/g, 'print("Processing...")');
                
                // 步骤2：移除所有复杂的多行字符串
                fixed = fixed.replace(/\\n\s*#[^\\]*\\n/g, '\\n');
                
                // 步骤3：简化所有return语句
                fixed = fixed.replace(/return\\s*\\?"[^"]*需实际实现[^"]*\\?"/g, 'return "Result"');
                
                return fixed;
            }
        }
    ];
    
    strategies.forEach(({ name, fix }) => {
        console.log(`\n测试 ${name}:`);
        try {
            const fixedStr = fix(originalStr);
            console.log('修复后长度:', fixedStr.length);
            
            const result = JSON.parse(fixedStr);
            console.log('✅ 解析成功');
            console.log('agents数量:', result.agents?.length || 0);
            
            if (result.agents && result.agents.length > 0) {
                console.log('第一个agent:', result.agents[0].name);
                console.log('第一个agent工具数量:', result.agents[0].tools?.length || 0);
            }
        } catch (error) {
            console.log('❌ 解析失败:', error.message);
            
            const match = error.message.match(/position (\d+)/);
            if (match) {
                const errorPos = parseInt(match[1]);
                console.log('错误位置:', errorPos);
            }
        }
    });
}

// 主执行函数
async function main() {
    console.log('WebSocket数据分析工具启动...\n');
    
    // 模拟解析第一层teamBody
    const teamBodyStr = realWebSocketData.teamBody;
    console.log('=== 第一层teamBody分析 ===');
    console.log('teamBody原始字符串长度:', teamBodyStr.length);
    console.log('teamBody前100字符:', JSON.stringify(teamBodyStr.substring(0, 100)));
    console.log('teamBody后100字符:', JSON.stringify(teamBodyStr.substring(teamBodyStr.length - 100)));
    
    try {
        const teamBody = JSON.parse(teamBodyStr);
        console.log('✅ teamBody解析成功');
        console.log('包含字段:', Object.keys(teamBody));
        
        // 分析第二层team_json_body
        const teamJsonBodyStr = teamBody.team_json_body;
        console.log('\n=== 第二层team_json_body分析 ===');
        analyzeJsonString(teamJsonBodyStr);
        
        // 测试修复策略
        testFixStrategies(teamJsonBodyStr);
        
    } catch (error) {
        console.log('❌ teamBody解析失败:', error.message);
        
        // 分析teamBody的结构问题
        console.log('\n=== teamBody结构分析 ===');
        
        // 查找可能的问题
        const braceCount = (teamBodyStr.match(/\{/g) || []).length;
        const braceCloseCount = (teamBodyStr.match(/\}/g) || []).length;
        console.log('大括号平衡:', braceCount, 'vs', braceCloseCount);
        
        // 查找引号问题
        const quoteCount = (teamBodyStr.match(/"/g) || []).length;
        console.log('引号总数:', quoteCount);
        
        // 尝试修复teamBody
        console.log('\n=== 尝试修复teamBody ===');
        let fixedTeamBody = teamBodyStr;
        
        // 策略1：移除可能的额外内容
        const jsonMatch = fixedTeamBody.match(/^(\{[\s\S]*\})/);
        if (jsonMatch) {
            fixedTeamBody = jsonMatch[1];
            console.log('提取JSON部分，长度:', fixedTeamBody.length);
            
            try {
                const parsed = JSON.parse(fixedTeamBody);
                console.log('✅ 修复后teamBody解析成功');
                console.log('包含字段:', Object.keys(parsed));
                
                if (parsed.team_json_body) {
                    console.log('\n=== 第二层team_json_body分析 ===');
                    analyzeJsonString(parsed.team_json_body);
                    testFixStrategies(parsed.team_json_body);
                }
            } catch (secondError) {
                console.log('❌ 修复后仍失败:', secondError.message);
            }
        }
    }
}

main().catch(console.error);
