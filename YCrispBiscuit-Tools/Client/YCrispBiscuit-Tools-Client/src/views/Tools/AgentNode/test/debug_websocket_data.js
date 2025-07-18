// 调试WebSocket连接和数据接收流程
import WebSocket from 'ws';

console.log('🔗 开始WebSocket连接调试...');

// WebSocket连接配置
const wsUrl = 'wss://chat.zy-jn.org.cn/aagent/ws/nOjY6QANNBr';

console.log(`📡 连接到: ${wsUrl}`);

const ws = new WebSocket(wsUrl);

// 连接打开事件
ws.on('open', function open() {
    console.log('✅ WebSocket连接已建立');
    
    // 发送查询请求
    const requestData = {
        table: 'AgentTeam',
        action: 'select'
    };
    
    console.log('📤 发送请求:', JSON.stringify(requestData, null, 2));
    ws.send(JSON.stringify(requestData));
});

// 接收消息事件
ws.on('message', function message(data) {
    console.log('\n� 收到原始WebSocket数据:');
    console.log('数据类型:', typeof data);
    console.log('数据长度:', data.length);
    
    try {
        // 转换为字符串
        const rawDataStr = data.toString();
        console.log('字符串长度:', rawDataStr.length);
        
        // 解析最外层JSON
        const rawData = JSON.parse(rawDataStr);
        console.log('✅ 第一层解析成功');
        console.log('顶层字段:', Object.keys(rawData));
        
        // 解析teamBody
        if (typeof rawData.teamBody === 'string') {
            console.log('\n� 解析teamBody字符串...');
            const teamBody = JSON.parse(rawData.teamBody);
            console.log('✅ teamBody解析成功');
            console.log('teamBody字段:', Object.keys(teamBody));
            
            // 解析team_json_body
            if (typeof teamBody.team_json_body === 'string') {
                console.log('\n📋 解析team_json_body字符串...');
                console.log('team_json_body原始长度:', teamBody.team_json_body.length);
                console.log('team_json_body前100字符:', teamBody.team_json_body.substring(0, 100));
                
                try {
                    const teamData = JSON.parse(teamBody.team_json_body);
                    console.log('✅ team_json_body解析成功');
                    console.log('team_type:', teamData.team_type);
                    console.log('terminator:', teamData.terminator);
                    console.log('agents数量:', teamData.agents?.length);
                    
                    if (teamData.agents?.[0]) {
                        console.log('第一个agent名称:', teamData.agents[0].name);
                        console.log('第一个agent工具数量:', teamData.agents[0].tools?.length);
                    }
                    
                } catch (jsonError) {
                    console.log('❌ team_json_body解析失败:', jsonError.message);
                    
                    // 查找错误位置
                    const match = jsonError.message.match(/position (\d+)/);
                    if (match) {
                        const errorPos = parseInt(match[1]);
                        console.log('错误位置:', errorPos);
                        console.log('错误位置前后内容:', JSON.stringify(teamBody.team_json_body.substring(errorPos - 10, errorPos + 10)));
                        
                        // 分析具体字符
                        for (let i = errorPos - 5; i < errorPos + 5; i++) {
                            const char = teamBody.team_json_body.charAt(i);
                            const code = char.charCodeAt(0);
                            console.log(`位置${i}: "${char}" (${code})`);
                        }
                        
                        // 查看更大范围的内容来理解问题
                        console.log('\n📋 错误位置前后50字符的内容:');
                        console.log(teamBody.team_json_body.substring(errorPos - 25, errorPos + 25));
                        
                        console.log('\n📋 查找source_code字段的位置:');
                        const sourceCodeMatches = [...teamBody.team_json_body.matchAll(/"source_code":\s*"/g)];
                        sourceCodeMatches.forEach((match, index) => {
                            console.log(`source_code ${index + 1} 开始位置:`, match.index);
                        });
                    }
                    
                    // 尝试修复
                    console.log('\n🔧 尝试修复JSON格式...');
                    try {
                        // 修复策略1：处理Python代码中的换行符和引号问题
                        let fixedStr = teamBody.team_json_body;
                        
                        // 首先找到所有source_code字段并逐个修复
                        fixedStr = fixedStr.replace(/"source_code":\s*"([\s\S]*?)"/g, (match, codeContent) => {
                            console.log('🔧 修复source_code字段，原始长度:', codeContent.length);
                            
                            // 修复Python代码中的问题
                            let fixedCode = codeContent
                                // 修复f-string中的大括号和引号
                                .replace(/\\n/g, '\\\\n')  // 换行符
                                .replace(/\\"/g, '\\\\"')  // 引号
                                .replace(/\\'/g, "\\\\'")  // 单引号
                                .replace(/\\t/g, '\\\\t')  // 制表符
                                .replace(/\\r/g, '\\\\r'); // 回车符
                            
                            console.log('🔧 修复后长度:', fixedCode.length);
                            return `"source_code": "${fixedCode}"`;
                        });
                        
                        console.log('🔧 尝试修复策略1...');
                        const fixedResult = JSON.parse(fixedStr);
                        console.log('✅ 修复策略1成功!');
                        console.log('修复后agents数量:', fixedResult.agents?.length);
                        if (fixedResult.agents?.[0]) {
                            console.log('第一个agent名称:', fixedResult.agents[0].name);
                            console.log('第一个agent工具数量:', fixedResult.agents[0].tools?.length);
                        }
                        
                    } catch (fixError1) {
                        console.log('❌ 修复策略1失败:', fixError1.message);
                        
                        try {
                            // 修复策略2：完全清理source_code内容
                            let cleanedStr = teamBody.team_json_body.replace(
                                /"source_code":\s*"([\s\S]*?)"/g, 
                                '"source_code": "# Python代码已清理"'
                            );
                            
                            console.log('🔧 尝试修复策略2（完全清理source_code）...');
                            const cleanedResult = JSON.parse(cleanedStr);
                            console.log('✅ 修复策略2成功!');
                            console.log('修复后agents数量:', cleanedResult.agents?.length);
                            
                        } catch (fixError2) {
                            console.log('❌ 修复策略2也失败:', fixError2.message);
                            
                            // 输出问题数据供分析
                            console.log('\n🔍 将原始team_json_body保存到文件...');
                            import('fs').then(fs => {
                                fs.writeFileSync('problem_json.txt', teamBody.team_json_body, 'utf8');
                                console.log('✅ 已保存到 problem_json.txt');
                            });
                        }
                    }
                }
            }
        }
        
        // 关闭连接
        setTimeout(() => {
            console.log('\n🔚 关闭WebSocket连接');
            ws.close();
        }, 1000);
        
    } catch (error) {
        console.log('❌ 数据处理失败:', error.message);
        ws.close();
    }
});

// 连接错误事件
ws.on('error', function error(err) {
    console.log('❌ WebSocket连接错误:', err.message);
});

// 连接关闭事件
ws.on('close', function close() {
    console.log('🔚 WebSocket连接已关闭');
    process.exit(0);
});

// 超时处理
setTimeout(() => {
    if (ws.readyState !== WebSocket.OPEN) {
        console.log('⏰ 连接超时，退出程序');
        ws.close();
        process.exit(1);
    }
}, 10000); // 10秒超时
