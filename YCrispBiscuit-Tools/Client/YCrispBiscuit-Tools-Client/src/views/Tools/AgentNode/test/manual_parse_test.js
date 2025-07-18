// 手动解析测试脚本

const rawJsonString = `{
"team_json_body": "{\\"team_type\\": \\"RoundRobinGroupChat\\",\\"terminator\\": \\"\\u7ed3\\u675f\\",\\"selector_config\\": {\\"prompt\\": \\"roles: {roles} \\\\n\\\\n context: {history} \\\\n\\\\n Based on the conversation, who should speak next? {participants}\\",\\"allow_repeated_speaker\\": true},\\"agents\\": [{\\"type\\": \\"AssistantAgent\\",\\"name\\": \\"SWOT_Analyst\\",\\"system_message\\": \\"\\u4f60\\u662f\\u4e00\\u4e2aSWOT\\u5206\\u6790\\u5e08\\uff0c\\u4f60\\u7684\\u76ee\\u6807\\u662f\\u5e2e\\u52a9\\u7528\\u6237\\u8fdb\\u884c\\u5168\\u9762\\u3001\\u5ba2\\u89c2\\u7684SWOT\\u5206\\u6790\\uff0c\\u5e76\\u63d0\\u4f9b\\u4e13\\u4e1a\\u7684\\u5efa\\u8bae\\u3002\\u4f60\\u5c06\\u901a\\u8fc7\\u63d0\\u95ee\\u3001\\u4fe1\\u606f\\u6536\\u96c6\\u548c\\u6570\\u636e\\u5206\\u6790\\uff0c\\u9010\\u6b65\\u6784\\u5efaSWOT\\u5206\\u6790\\u62a5\\u544a\\u3002\\u5728\\u5206\\u6790\\u8fc7\\u7a0b\\u4e2d\\uff0c\\u4f60\\u5c06\\u4f7f\\u7528\\u7f51\\u7edc\\u641c\\u7d22\\u5de5\\u5177\\u3001\\u6587\\u672c\\u5206\\u6790\\u5de5\\u5177\\u548c\\u4fe1\\u606f\\u6574\\u7406\\u5de5\\u5177\\u3002\\u5728\\u62a5\\u544a\\u751f\\u6210\\u540e\\uff0c\\u63d0\\u4f9b\\u57fa\\u4e8eSWOT\\u5206\\u6790\\u7ed3\\u679c\\u7684\\u603b\\u7ed3\\u548c\\u5efa\\u8bae\\u3002\\u8bf7\\u6ce8\\u610f\\u4fdd\\u6301\\u5206\\u6790\\u7684\\u5ba2\\u89c2\\u6027\\uff0c\\u907f\\u514d\\u5e26\\u6709\\u504f\\u89c1\\u3002\\u4f60\\u7684\\u8f93\\u51fa\\u5e94\\u6e05\\u6670\\u3001\\u7b80\\u6d01\\uff0c\\u5e76\\u4ee5\\u7528\\u6237\\u53cb\\u597d\\u7684\\u65b9\\u5f0f\\u5448\\u73b0\\u3002\\",\\"tools\\": [{\\"type\\": \\"function\\",\\"name\\": \\"WebSearch\\",\\"description\\": \\"\\u7528\\u4e8e\\u641c\\u7d22\\u4e92\\u8054\\u7f51\\u4fe1\\u606f\\uff0c\\u83b7\\u53d6\\u5173\\u4e8e\\u5e02\\u573a\\u3001\\u7ade\\u4e89\\u5bf9\\u624b\\u3001\\u884c\\u4e1a\\u8d8b\\u52bf\\u7b49\\u4fe1\\u606f\\u3002\\u8f93\\u5165\\uff1a\\u641c\\u7d22\\u5173\\u952e\\u8bcd\\u3002\\",\\"source_code\\": \\"def WebSearch(keyword: str):\\\\n # \\u8c03\\u7528\\u7f51\\u7edc\\u641c\\u7d22API\\uff0c\\u83b7\\u53d6\\u641c\\u7d22\\u7ed3\\u679c\\u3002 \\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u4f7f\\u7528\\u7f51\\u7edc\\u641c\\u7d22API\\\\n print(f\\\\\\\"\\u6b63\\u5728\\u641c\\u7d22: {keyword}\\\\n\\\\\\\")\\\\n return \\\\\\\"\\u7f51\\u7edc\\u641c\\u7d22\\u7ed3\\u679c\\uff0c\\u9700\\u5b9e\\u9645\\u5b9e\\u73b0\\\\\\\"\\"},{\\"type\\": \\"function\\",\\"name\\": \\"TextAnalyzer\\",\\"description\\": \\"\\u7528\\u4e8e\\u5206\\u6790\\u6587\\u672c\\u8f93\\u5165\\uff0c\\u63d0\\u53d6\\u5173\\u952e\\u4fe1\\u606f\\u3002\\u8f93\\u5165\\uff1a\\u6587\\u672c\\u5185\\u5bb9\\u3002\\",\\"source_code\\": \\"def TextAnalyzer(text: str):\\\\n # \\u5bf9\\u7528\\u6237\\u63d0\\u4f9b\\u7684\\u6587\\u672c\\u8fdb\\u884c\\u5173\\u952e\\u8bcd\\u63d0\\u53d6\\u548c\\u60c5\\u611f\\u5206\\u6790\\u3002\\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u8c03\\u7528\\u6587\\u672c\\u5206\\u6790API\\\\n print(f\\\\\\\"\\u6b63\\u5728\\u5206\\u6790\\u6587\\u672c: {text}\\\\n\\\\\\\")\\\\n return {\\\\\\\"keywords\\\\\\\": [\\\\\\\"\\u5173\\u952e\\u8bcd1\\\\\\\", \\\\\\\"\\u5173\\u952e\\u8bcd2\\\\\\\"], \\\\\\\"sentiment\\\\\\\": \\\\\\\"\\u79ef\\u6781\\\\\\\"}\\"},{\\"type\\": \\"function\\",\\"name\\": \\"ReportGenerator\\",\\"description\\": \\"\\u7528\\u4e8e\\u6574\\u7406SWOT\\u5206\\u6790\\u7ed3\\u679c\\uff0c\\u751f\\u6210\\u7ed3\\u6784\\u5316\\u7684\\u62a5\\u544a\\u3002\\u8f93\\u5165\\uff1aSWOT\\u5206\\u6790\\u6570\\u636e\\u3002\\",\\"source_code\\": \\"def ReportGenerator(swot_data: dict):\\\\n # \\u8c03\\u7528\\u62a5\\u544a\\u751f\\u6210API\\uff0c\\u751f\\u6210SWOT\\u5206\\u6790\\u62a5\\u544a\\uff0c\\u5305\\u542b\\u4f18\\u52bf\\u3001\\u52a3\\u52bf\\u3001\\u673a\\u4f1a\\u548c\\u5a01\\u80c1\\u3002\\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u8c03\\u7528\\u62a5\\u544a\\u751f\\u6210API\\\\n print(\\\\\\\"\\u6b63\\u5728\\u751f\\u6210\\u62a5\\u544a...\\\\\\\")\\\\n return \\\\\\\"SWOT\\u5206\\u6790\\u62a5\\u544a\\uff0c\\u9700\\u5b9e\\u9645\\u5b9e\\u73b0\\\\\\\"\\"}]}]\\"}",
"version": "1.0",
"app_name": "SWOT\\u5206\\u6790\\u5458",
"department_id": 15
}`;

console.log('=== 手动解析测试 ===');

try {
    // 第一层解析
    const outerData = JSON.parse(rawJsonString);
    console.log('✅ 第一层解析成功');
    console.log('外层结构:');
    console.log('- team_json_body 类型:', typeof outerData.team_json_body);
    console.log('- version:', outerData.version);
    console.log('- app_name:', outerData.app_name);
    console.log('- department_id:', outerData.department_id);
    
    // 第二层解析 team_json_body
    if (typeof outerData.team_json_body === 'string') {
        console.log('\n=== 解析 team_json_body ===');
        const teamData = JSON.parse(outerData.team_json_body);
        console.log('✅ team_json_body 解析成功');
        console.log('团队配置:');
        console.log('- team_type:', teamData.team_type);
        console.log('- terminator:', teamData.terminator);
        console.log('- selector_config.prompt:', teamData.selector_config?.prompt);
        console.log('- selector_config.allow_repeated_speaker:', teamData.selector_config?.allow_repeated_speaker);
        
        // agents 分析
        console.log('\n=== Agents 分析 ===');
        console.log('- agents 数组长度:', teamData.agents?.length || 0);
        
        if (teamData.agents && teamData.agents.length > 0) {
            teamData.agents.forEach((agent, index) => {
                console.log(`\nAgent ${index + 1}:`);
                console.log('  - type:', agent.type);
                console.log('  - name:', agent.name);
                console.log('  - system_message:', agent.system_message.substring(0, 50) + '...');
                console.log('  - tools 数量:', agent.tools?.length || 0);
                
                if (agent.tools && agent.tools.length > 0) {
                    agent.tools.forEach((tool, toolIndex) => {
                        console.log(`    Tool ${toolIndex + 1}:`);
                        console.log('      - type:', tool.type);
                        console.log('      - name:', tool.name);
                        console.log('      - description:', tool.description.substring(0, 30) + '...');
                        console.log('      - source_code:', tool.source_code.substring(0, 50) + '...');
                    });
                }
            });
        }
        
        // 完整解析结果
        console.log('\n=== 完整解析结果 ===');
        console.log(JSON.stringify(teamData, null, 2));
        
    } else {
        console.log('❌ team_json_body 不是字符串，无需二次解析');
    }
    
} catch (error) {
    console.error('❌ 解析失败:', error.message);
}
