// 分析具体的问题模式
const problematicString = `print(f"正在搜索: {keyword}\\n")`;
console.log('原始问题字符串:', problematicString);

// 当前的修复逻辑测试
let fixed = problematicString;

// 测试当前的修复策略
console.log('=== 测试当前修复策略 ===');

// 修复1：专门处理 print(f"...{variable}\n") 这种模式
fixed = fixed.replace(/print\(f"([^"]*?)\{([^}]+?)\}\\n"\)/g, (match, before, variable) => {
    console.log('匹配到print f-string模式:', match);
    console.log('before:', before);
    console.log('variable:', variable);
    return `print(f"${before}\\\\{${variable}\\\\}\\\\n")`;
});

console.log('修复1后:', fixed);

// 测试实际的问题字符串（从日志中提取）
const realProblem = `print(f"正在搜索: {keyword}\\n")`;
console.log('\\n=== 测试实际问题字符串 ===');
console.log('实际问题:', realProblem);

// 尝试不同的修复策略
let strategy1 = realProblem.replace(/print\(f"([^"]*?)\{([^}]+?)\}\\n"\)/g, (match, before, variable) => {
    console.log('策略1匹配:', match);
    return `print(f"${before}\\\\{${variable}\\\\}\\\\n")`;
});
console.log('策略1结果:', strategy1);

// 策略2：更宽泛的匹配
let strategy2 = realProblem.replace(/\{([^}]+?)\}\\n"/g, (match, variable) => {
    console.log('策略2匹配:', match);
    return `\\\\{${variable}\\\\}\\\\n"`;
});
console.log('策略2结果:', strategy2);

// 策略3：直接替换problematic pattern
let strategy3 = realProblem.replace(/\{keyword\}\\n"/g, '\\\\{keyword\\\\}\\\\n"');
console.log('策略3结果:', strategy3);

// 测试JSON上下文中的完整模式
const jsonContext = `"source_code": "def WebSearch(keyword: str):\\n # 调用网络搜索API，获取搜索结果。 这是一个占位符\\n # 实际实现中需要使用网络搜索API\\n print(f\\"正在搜索: {keyword}\\n\\")\\n return \\"网络搜索结果，需实际实现\\""`;

console.log('\\n=== 测试JSON上下文 ===');
console.log('JSON上下文:', jsonContext);

// 在JSON上下文中应用修复
let fixedJson = jsonContext.replace(/print\(f\\"([^"]*?)\{([^}]+?)\}\\n\\"\)/g, (match, before, variable) => {
    console.log('JSON中匹配:', match);
    return `print(f\\"${before}\\\\{${variable}\\\\}\\\\n\\")`;
});
console.log('JSON修复结果:', fixedJson);
