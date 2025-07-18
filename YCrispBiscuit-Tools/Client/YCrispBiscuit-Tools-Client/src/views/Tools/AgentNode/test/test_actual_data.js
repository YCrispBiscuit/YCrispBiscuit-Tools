// 测试实际后端返回的数据结构
const actualBackendData = {
    createdAt: '2025-07-15T08:19:14.183Z',
    updatedAt: '2025-07-15T08:19:14.183Z',
    id: 7,
    version: '',
    application_id: "nOjY6QANNBr",
    createdById: 1,
    teamBody: "{\n\"team_json_body\": \"{\\\"team_type\\\": \\\"RoundRobinGroupChat\\\",\\\"terminator\\\": \\\"\\u7ed3\\u675f\\\",\\\"selector_config\\\": {\\\"prompt\\\": \\\"roles: {roles} \\\\n\\\\n context: {history} \\\\n\\\\n Based on the conversation, who should speak next? {participants}\\\",\\\"allow_repeated_speaker\\\": true},\\\"agents\\\": [{\\\"type\\\": \\\"AssistantAgent\\\",\\\"name\\\": \\\"SWOT_Analyst\\\",\\\"system_message\\\": \\\"\\u4f60\\u662f\\u4e00\\u4e2aSWOT\\u5206\\u6790\\u5e08\\uff0c\\u4f60\\u7684\\u76ee\\u6807\\u662f\\u5e2e\\u52a9\\u7528\\u6237\\u8fdb\\u884c\\u5168\\u9762\\u3001\\u5ba2\\u89c2\\u7684SWOT\\u5206\\u6790\\uff0c\\u5e76\\u63d0\\u4f9b\\u4e13\\u4e1a\\u7684\\u5efa\\u8bae\\u3002\\u4f60\\u5c06\\u901a\\u8fc7\\u63d0\\u95ee\\u3001\\u4fe1\\u606f\\u6536\\u96c6\\u548c\\u6570\\u636e\\u5206\\u6790\\uff0c\\u9010\\u6b65\\u6784\\u5efaSWOT\\u5206\\u6790\\u62a5\\u544a\\u3002\\u5728\\u5206\\u6790\\u8fc7\\u7a0b\\u4e2d\\uff0c\\u4f60\\u5c06\\u4f7f\\u7528\\u7f51\\u7edc\\u641c\\u7d22\\u5de5\\u5177\\u3001\\u6587\\u672c\\u5206\\u6790\\u5de5\\u5177\\u548c\\u4fe1\\u606f\\u6574\\u7406\\u5de5\\u5177\\u3002\\u5728\\u62a5\\u544a\\u751f\\u6210\\u540e\\uff0c\\u63d0\\u4f9b\\u57fa\\u4e8eSWOT\\u5206\\u6790\\u7ed3\\u679c\\u7684\\u603b\\u7ed3\\u548c\\u5efa\\u8bae\\u3002\\u8bf7\\u6ce8\\u610f\\u4fdd\\u6301\\u5206\\u6790\\u7684\\u5ba2\\u89c2\\u6027\\uff0c\\u907f\\u514d\\u5e26\\u6709\\u504f\\u89c1\\u3002\\u4f60\\u7684\\u8f93\\u51fa\\u5e94\\u6e05\\u6670\\u3001\\u7b80\\u6d01\\uff0c\\u5e76\\u4ee5\\u7528\\u6237\\u53cb\\u597d\\u7684\\u65b9\\u5f0f\\u5448\\u73b0\\u3002\\\",\\\"tools\\\": [{\\\"type\\\": \\\"function\\\",\\\"name\\\": \\\"WebSearch\\\",\\\"description\\\": \\\"\\u7528\\u4e8e\\u641c\\u7d22\\u4e92\\u8054\\u7f51\\u4fe1\\u606f\\uff0c\\u83b7\\u53d6\\u5173\\u4e8e\\u5e02\\u573a\\u3001\\u7ade\\u4e89\\u5bf9\\u624b\\u3001\\u884c\\u4e1a\\u8d8b\\u52bf\\u7b49\\u4fe1\\u606f\\u3002\\u8f93\\u5165\\uff1a\\u641c\\u7d22\\u5173\\u952e\\u8bcd\\u3002\\\",\\\"source_code\\\": \\\"def WebSearch(keyword: str):\\\\n # \\u8c03\\u7528\\u7f51\\u7edc\\u641c\\u7d22API\\uff0c\\u83b7\\u53d6\\u641c\\u7d22\\u7ed3\\u679c\\u3002 \\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u4f7f\\u7528\\u7f51\\u7edc\\u641c\\u7d22API\\\\n print(f\\\\\\\"\\u6b63\\u5728\\u641c\\u7d22: {keyword}\\\\n\\\\\\\")\\\\n return \\\\\\\"\\u7f51\\u7edc\\u641c\\u7d22\\u7ed3\\u679c\\uff0c\\u9700\\u5b9e\\u9645\\u5b9e\\u73b0\\\\\\\"\\\"},{\\\"type\\\": \\\"function\\\",\\\"name\\\": \\\"TextAnalyzer\\\",\\\"description\\\": \\\"\\u7528\\u4e8e\\u5206\\u6790\\u6587\\u672c\\u8f93\\u5165\\uff0c\\u63d0\\u53d6\\u5173\\u952e\\u4fe1\\u606f\\u3002\\u8f93\\u5165\\uff1a\\u6587\\u672c\\u5185\\u5bb9\\u3002\\\",\\\"source_code\\\": \\\"def TextAnalyzer(text: str):\\\\n # \\u5bf9\\u7528\\u6237\\u63d0\\u4f9b\\u7684\\u6587\\u672c\\u8fdb\\u884c\\u5173\\u952e\\u8bcd\\u63d0\\u53d6\\u548c\\u60c5\\u611f\\u5206\\u6790\\u3002\\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u8c03\\u7528\\u6587\\u672c\\u5206\\u6790API\\\\n print(f\\\\\\\"\\u6b63\\u5728\\u5206\\u6790\\u6587\\u672c: {text}\\\\n\\\\\\\")\\\\n return {\\\\\\\"keywords\\\\\\\": [\\\\\\\"\\u5173\\u952e\\u8bcd1\\\\\\\", \\\\\\\"\\u5173\\u952e\\u8bcd2\\\\\\\"], \\\\\\\"sentiment\\\\\\\": \\\\\\\"\\u79ef\\u6781\\\\\\\"}\\\"},{\\\"type\\\": \\\"function\\\",\\\"name\\\": \\\"ReportGenerator\\\",\\\"description\\\": \\\"\\u7528\\u4e8e\\u6574\\u7406SWOT\\u5206\\u6790\\u7ed3\\u679c\\uff0c\\u751f\\u6210\\u7ed3\\u6784\\u5316\\u7684\\u62a5\\u544a\\u3002\\u8f93\\u5165\\uff1aSWOT\\u5206\\u6790\\u6570\\u636e\\u3002\\\",\\\"source_code\\\": \\\"def ReportGenerator(swot_data: dict):\\\\n # \\u8c03\\u7528\\u62a5\\u544a\\u751f\\u6210API\\uff0c\\u751f\\u6210SWOT\\u5206\\u6790\\u62a5\\u544a\\uff0c\\u5305\\u542b\\u4f18\\u52bf\\u3001\\u52a3\\u52bf\\u3001\\u673a\\u4f1a\\u548c\\u5a01\\u80c1\\u3002\\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u8c03\\u7528\\u62a5\\u544a\\u751f\\u6210API\\\\n print(\\\\\\\"\\u6b63\\u5728\\u751f\\u6210\\u62a5\\u544a...\\\\\\\")\\\\n return \\\\\\\"SWOT\\u5206\\u6790\\u62a5\\u544a\\uff0c\\u9700\\u5b9e\\u9645\\u5b9e\\u73b0\\\\\\\"\\\"}]}]}\",\n\"version\": \"1.0\",\n\"app_name\": \"SWOT\\u5206\\u6790\\u5458\",\n\"department_id\": 15\n}",
    teamBody_copy_by_my_hand: "{\n\"team_json_body\": \"{\\\"team_type\\\": \\\"RoundRobinGroupChat\\\",\\\"terminator\\\": \\\"\\u7ed3\\u675f\\\",\\\"selector_config\\\": {\\\"prompt\\\": \\\"roles: {roles} \\\\n\\\\n context: {history} \\\\n\\\\n Based on the conversation, who should speak next? {participants}\\\",\\\"allow_repeated_speaker\\\": true},\\\"agents\\\": [{\\\"type\\\": \\\"AssistantAgent\\\",\\\"name\\\": \\\"SWOT_Analyst\\\",\\\"system_message\\\": \\\"\\u4f60\\u662f\\u4e00\\u4e2aSWOT\\u5206\\u6790\\u5e08\\uff0c\\u4f60\\u7684\\u76ee\\u6807\\u662f\\u5e2e\\u52a9\\u7528\\u6237\\u8fdb\\u884c\\u5168\\u9762\\u3001\\u5ba2\\u89c2\\u7684SWOT\\u5206\\u6790\\uff0c\\u5e76\\u63d0\\u4f9b\\u4e13\\u4e1a\\u7684\\u5efa\\u8bae\\u3002\\u4f60\\u5c06\\u901a\\u8fc7\\u63d0\\u95ee\\u3001\\u4fe1\\u606f\\u6536\\u96c6\\u548c\\u6570\\u636e\\u5206\\u6790\\uff0c\\u9010\\u6b65\\u6784\\u5efaSWOT\\u5206\\u6790\\u62a5\\u544a\\u3002\\u5728\\u5206\\u6790\\u8fc7\\u7a0b\\u4e2d\\uff0c\\u4f60\\u5c06\\u4f7f\\u7528\\u7f51\\u7edc\\u641c\\u7d22\\u5de5\\u5177\\u3001\\u6587\\u672c\\u5206\\u6790\\u5de5\\u5177\\u548c\\u4fe1\\u606f\\u6574\\u7406\\u5de5\\u5177\\u3002\\u5728\\u62a5\\u544a\\u751f\\u6210\\u540e\\uff0c\\u63d0\\u4f9b\\u57fa\\u4e8eSWOT\\u5206\\u6790\\u7ed3\\u679c\\u7684\\u603b\\u7ed3\\u548c\\u5efa\\u8bae\\u3002\\u8bf7\\u6ce8\\u610f\\u4fdd\\u6301\\u5206\\u6790\\u7684\\u5ba2\\u89c2\\u6027\\uff0c\\u907f\\u514d\\u5e26\\u6709\\u504f\\u89c1\\u3002\\u4f60\\u7684\\u8f93\\u51fa\\u5e94\\u6e05\\u6670\\u3001\\u7b80\\u6d01\\uff0c\\u5e76\\u4ee5\\u7528\\u6237\\u53cb\\u597d\\u7684\\u65b9\\u5f0f\\u5448\\u73b0\\u3002\\\",\\\"tools\\\": [{\\\"type\\\": \\\"function\\\",\\\"name\\\": \\\"WebSearch\\\",\\\"description\\\": \\\"\\u7528\\u4e8e\\u641c\\u7d22\\u4e92\\u8054\\u7f51\\u4fe1\\u606f\\uff0c\\u83b7\\u53d6\\u5173\\u4e8e\\u5e02\\u573a\\u3001\\u7ade\\u4e89\\u5bf9\\u624b\\u3001\\u884c\\u4e1a\\u8d8b\\u52bf\\u7b49\\u4fe1\\u606f\\u3002\\u8f93\\u5165\\uff1a\\u641c\\u7d22\\u5173\\u952e\\u8bcd\\u3002\\\",\\\"source_code\\\": \\\"def WebSearch(keyword: str):\\\\n # \\u8c03\\u7528\\u7f51\\u7edc\\u641c\\u7d22API\\uff0c\\u83b7\\u53d6\\u641c\\u7d22\\u7ed3\\u679c\\u3002 \\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u4f7f\\u7528\\u7f51\\u7edc\\u641c\\u7d22API\\\\n print(f\\\\\\\"\\u6b63\\u5728\\u641c\\u7d22: {keyword}\\\\n\\\")\\\\n return \\\\\\\"\\u7f51\\u7edc\\u641c\\u7d22\\u7ed3\\u679c\\uff0c\\u9700\\u5b9e\\u9645\\u5b9e\\u73b0\\\\\\\"\\\"},{\\\"type\\\": \\\"function\\\",\\\"name\\\": \\\"TextAnalyzer\\\",\\\"description\\\": \\\"\\u7528\\u4e8e\\u5206\\u6790\\u6587\\u672c\\u8f93\\u5165\\uff0c\\u63d0\\u53d6\\u5173\\u952e\\u4fe1\\u606f\\u3002\\u8f93\\u5165\\uff1a\\u6587\\u672c\\u5185\\u5bb9\\u3002\\\",\\\"source_code\\\": \\\"def TextAnalyzer(text: str):\\\\n # \\u5bf9\\u7528\\u6237\\u63d0\\u4f9b\\u7684\\u6587\\u672c\\u8fdb\\u884c\\u5173\\u952e\\u8bcd\\u63d0\\u53d6\\u548c\\u60c5\\u611f\\u5206\\u6790\\u3002\\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u8c03\\u7528\\u6587\\u672c\\u5206\\u6790API\\\\n print(f\\\\\\\"\\u6b63\\u5728\\u5206\\u6790\\u6587\\u672c: {text}\\\\n\\\")\\\\n return {\\\\\\\"keywords\\\\\\\": [\\\\\\\"\\u5173\\u952e\\u8bcd1\\\\\\\", \\\\\\\"\\u5173\\u952e\\u8bcd2\\\\\\\"], \\\\\\\"sentiment\\\\\\\": \\\\\\\"\\u79ef\\u6781\\\\\\\"}\\\"},{\\\"type\\\": \\\"function\\\",\\\"name\\\": \\\"ReportGenerator\\\",\\\"description\\\": \\\"\\u7528\\u4e8e\\u6574\\u7406SWOT\\u5206\\u6790\\u7ed3\\u679c\\uff0c\\u751f\\u6210\\u7ed3\\u6784\\u5316\\u7684\\u62a5\\u544a\\u3002\\u8f93\\u5165\\uff1aSWOT\\u5206\\u6790\\u6570\\u636e\\u3002\\\",\\\"source_code\\\": \\\"def ReportGenerator(swot_data: dict):\\\\n # \\u8c03\\u7528\\u62a5\\u544a\\u751f\\u6210API\\uff0c\\u751f\\u6210SWOT\\u5206\\u6790\\u62a5\\u544a\\uff0c\\u5305\\u542b\\u4f18\\u52bf\\u3001\\u52a3\\u52bf\\u3001\\u673a\\u4f1a\\u548c\\u5a01\\u80c1\\u3002\\u8fd9\\u662f\\u4e00\\u4e2a\\u5360\\u4f4d\\u7b26\\\\n # \\u5b9e\\u9645\\u5b9e\\u73b0\\u4e2d\\u9700\\u8981\\u8c03\\u7528\\u62a5\\u544a\\u751f\\u6210API\\\\n print(\\\\\\\"\\u6b63\\u5728\\u751f\\u6210\\u62a5\\u544a...\\\\\\\")\\\\n return \\\\\\\"SWOT\\u5206\\u6790\\u62a5\\u544a\\uff0c\\u9700\\u5b9e\\u9645\\u5b9e\\u73b0\\\\\\\"\\\"}]}]}\",\n\"version\": \"1.0\",\n\"app_name\": \"SWOT\\u5206\\u6790\\u5458\",\n\"department_id\": 15\n}",

    updatedById: 1
};

console.log('🔍 分析实际后端数据结构...');

try {
    // 步骤1：解析第一层 teamBody
    console.log('\n📋 步骤1：解析 teamBody 字符串');
    const teamBody = JSON.parse(actualBackendData.teamBody);
    console.log('✅ teamBody 解析成功');
    console.log('- team_json_body 类型:', typeof teamBody.team_json_body);
    console.log('- version:', teamBody.version);
    console.log('- app_name:', teamBody.app_name);
    console.log('- department_id:', teamBody.department_id);
    
    // 步骤2：解析第二层 team_json_body
    console.log('\n📋 步骤2：解析 team_json_body 字符串');
    const teamData = JSON.parse(teamBody.team_json_body);
    console.log('✅ team_json_body 解析成功');
    console.log('- team_type:', teamData.team_type);
    console.log('- terminator:', teamData.terminator);
    console.log('- agents 数量:', teamData.agents?.length);
    
    if (teamData.agents?.[0]) {
        const firstAgent = teamData.agents[0];
        console.log('- 第一个 agent name:', firstAgent.name);
        console.log('- 第一个 agent tools 数量:', firstAgent.tools?.length);
        
        if (firstAgent.tools?.[0]) {
            const firstTool = firstAgent.tools[0];
            console.log('- 第一个 tool name:', firstTool.name);
            console.log('- source_code 长度:', firstTool.source_code?.length);
            console.log('- source_code 前50字符:', firstTool.source_code?.substring(0, 50) + '...');
        }
    }
    
    console.log('\n🎉 所有层级解析都成功！数据结构正常。');
    
} catch (error) {
    console.log('❌ 解析失败:', error.message);
    console.log('错误位置:', error.stack);
}
