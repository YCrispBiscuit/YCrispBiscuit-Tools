<template>
    <div class="markdown-body">
        <div ref="markdownRoot" v-html="renderHeadingsHrBoldQuoteTask(content || '')" />
        <!--pre>{{ filterNonHeadingsHrBoldQuoteTask(content) }}</pre-->
    </div>
</template>


<script setup lang="ts">
import { defineProps, ref, onMounted, nextTick, watch } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ content: string }>()


// 只渲染各级标题
const headingParser = new MarkdownIt({
    html: true,
    linkify: true,//把网址文本变成链接。
    typographer: true,//美化标点和符号
    breaks: true,// 支持普通换行渲染为 <br>
})

// 只渲染标题，其他内容不做处理，直接用 headingParser 默认规则即可

const renderHeadingsHrBoldQuoteTask = (md: string) => {
    const lines = md.split(/\r?\n/)
    const filteredLines = []
    let inCodeBlock = false
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (/^`{3,}/.test(line)) {
            inCodeBlock = !inCodeBlock
            filteredLines.push(line)
            continue
        }
        if (inCodeBlock) {
            filteredLines.push(line)
            continue
        }
        if (
            line.trim() === '' || // 保留空行用于分段
            /^#{1,6} /.test(line) ||
            /^\s*-{3,}\s*$/.test(line) ||
            /\*\*[\s\S]+?\*\*/.test(line) ||
            /^> /.test(line) ||
            /^- \[.\]/.test(line) ||
            /^<div\s+align=["']center["'].*?>/.test(line) || // 支持原始 HTML 居中标签
            /^<\/div>/.test(line) || // 支持闭合标签
            /^<table.*?>/.test(line) || // 保留原生 HTML 表格标签
            /^<\/table>/.test(line) ||
            /^<tr.*?>/.test(line) ||
            /^<\/tr>/.test(line) ||
            /^<td.*?>/.test(line) ||
            /^<\/td>/.test(line) ||
            /^<th.*?>/.test(line) ||
            /^<\/th>/.test(line) ||
            /^\s*[-*+] /.test(line) || // 普通无序列表
            /^\s*\d+\. /.test(line) || // 普通有序列表
            /\*[\s\S]+?\*/.test(line) || // 斜体
            /^[^#>\-\*\d<].+/.test(line) || // 普通说明文字（非特殊符号开头的行）
            /^!\[[^\]]*\]\([^\)]*\)/.test(line) || // 图片语法 ![alt](url)
            /^\[[^\]]*\]\([^\)]*\)/.test(line) || // 链接语法 [text](url)
            /^\|.*\|$/.test(line) // 表格语法（支持各种表格）
        ) {
            filteredLines.push(line)
        }
    }
    return headingParser.render(filteredLines.join('\n'))
        .replace(/<h([1-6])>(.*?)<\/h\1>/g, '<h$1>$2</h$1>')
        .replace(/<hr \/>/g, '<hr />')
}

const filterNonHeadingsHrBoldQuoteTask = (md: string) => {
    const lines = md.split(/\r?\n/)
    return lines.filter(line =>
        !(/^#{1,6} /.test(line) ||
            /^\s*-{3,}\s*$/.test(line) ||
            /\*\*[\s\S]+?\*\*/.test(line) ||
            /^> /.test(line) ||
            /^- \[.\]/.test(line))
    ).join('\n')
}












const markdownRoot = ref<HTMLElement | null>(null)

function addCopyButtons() {
  if (!markdownRoot.value) return;
  // 移除旧按钮，防止重复
  markdownRoot.value.querySelectorAll('.ycb-copy-btn').forEach(btn => btn.remove());
  // 先收集所有 pre 节点，批量处理，避免 DOM 结构变化导致只处理第一个
  const preList = Array.from(markdownRoot.value.querySelectorAll('pre'));
  // 彻底修复：cloneNode 深拷贝 pre，插入 wrapper 后不影响原 preList
  preList.forEach(pre => {
    const parent = pre.parentNode;
    const next = pre.nextSibling;
    // 创建按钮
    const btn = document.createElement('button');
    btn.className = 'ycb-copy-btn';
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><rect x="2" y="2" width="13" height="13" rx="2" ry="2"></rect></svg>';
    btn.title = '复制代码';
    btn.onclick = () => {
      const code = pre.querySelector('code');
      if (code) {
        navigator.clipboard.writeText(code.innerText).then(() => {
          btn.textContent = '已复制!';
          setTimeout(() => {
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><rect x="2" y="2" width="13" height="13" rx="2" ry="2"></rect></svg>';
          }, 1200);
        });
      }
    };
    // 固定按钮在 pre 父容器右上角，避免层级错误
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    btn.style.position = 'absolute';
    btn.style.top = '10px';
    btn.style.right = '14px';
    btn.style.zIndex = '10';
    btn.style.background = 'var(--bg-color-secondary, #f6f8fa)';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.padding = '4px 8px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '14px';
    btn.style.color = 'var(--text-color, #333)';
    btn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)';
    btn.style.transition = 'background 0.2s';
    btn.style.pointerEvents = 'auto';
    btn.onmouseenter = () => btn.style.background = 'var(--bg-color, #e6f7ff)';
    btn.onmouseleave = () => btn.style.background = 'var(--bg-color-secondary, #f6f8fa)';
    // cloneNode 深拷贝 pre，避免 DOM 移动影响后续 pre
    const preClone = pre.cloneNode(true);
    wrapper.appendChild(preClone);
    wrapper.appendChild(btn);
    if (parent) {
      parent.insertBefore(wrapper, next);
      parent.removeChild(pre);
    }
  });
}





onMounted(() => {
  nextTick(() => {
    addCopyButtons();
  });
});

// 监听 content，每次变化都插入按钮，保证按钮始终可见
watch(() => props.content, () => {
  nextTick(() => {
    addCopyButtons();
  });
});
</script>


<style scoped>
.markdown-body {
    font-size: 16px;
    color: var(--text-color, #333);
    line-height: 1.7;
    word-break: break-word;
    background: transparent;
    padding: 0;
}

/* 标题样式 */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
    font-weight: bold;
    margin: 1.2em 0 0.6em 0;
    color: var(--text-color, #222);
}

/* 加粗文本样式 */
.markdown-body :deep(strong) {
    font-weight: bold;
    color: #1890ff;
    /* 可自定义为主色 */
    background: rgba(24, 144, 255, 0.05);
    /* 可选高亮底色 */
    padding: 2px 4px;
    border-radius: 4px;
}

/* 分割线样式 */
.markdown-body :deep(hr) {
    border: none;
    border-top: 1px solid #ccc;
    margin: 24px 0;
    height: 0;
}

/* 引用样式 */
.markdown-body :deep(blockquote) {
    border-left: 4px solid #1890ff;
    background: rgba(24, 144, 255, 0.05);
    padding: 0.5em 1em;
    margin: 1em 0;
    color: #555;
    font-style: italic;
    border-radius: 6px;
}



/* 任务列表样式 */
.markdown-body :deep(.task-list-item) {
    list-style: none;
    margin-left: 0;
    padding-left: 1.8em;
    position: relative;
}

.markdown-body :deep(.task-list-item input[type="checkbox"]) {
    position: absolute;
    left: 0;
    top: 0.2em;
    width: 1.2em;
    height: 1.2em;
    accent-color: #1890ff;
    cursor: pointer;
}

.markdown-body :deep(.task-list-item input[type="checkbox"]:checked) {
    accent-color: #52c41a;
}


/* 支持 markdown 原始 HTML 标签样式，可根据需要自定义 */
.markdown-body :deep(div[align="center"]) {
    text-align: center !important;
    margin: 1.5em 0 !important;
}


/* 居中容器内图片紧邻排列，文本分行且斜体正常 */
.markdown-body :deep(div[align="center"] > img) {
    display: inline-block !important;
    margin: 0 4px !important;
    vertical-align: middle !important;
}
.markdown-body :deep(div[align="center"] > em),
.markdown-body :deep(div[align="center"] > strong),
.markdown-body :deep(div[align="center"] > span),
.markdown-body :deep(div[align="center"] > p) {
    display: block !important;
    margin: 8px 0 0 0 !important;
    text-align: center !important;
}
.markdown-body :deep(div[align="center"] > *) {
    max-width: 100% !important;
}




/* 图片样式 */
.markdown-body :deep(img) {
    max-width: 100%;
    height: auto;
    display: inline-block;
    margin: 0 4px 0 0;
    vertical-align: middle;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* 链接样式 */
.markdown-body :deep(a) {
    color: #1890ff;
    text-decoration: underline;
    transition: color 0.2s;
    word-break: break-all;
}

.markdown-body :deep(a):hover {
    color: #52c41a;
    text-decoration: underline;
}



/* 表格和代码块横向滚动样式 */
.markdown-body :deep(table) {
    width: auto;
    max-width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    overflow-x: auto;
    display: table; /* 修正为 table，保证多行多列布局 */
}


.markdown-body :deep(th),
.markdown-body :deep(td) {
    border: 1px solid #e5e5e5;
    padding: 8px 12px;
    text-align: left;
    background: var(--table-bg, #fff); /* 支持黑白主题切换 */
    vertical-align: top;
    word-break: break-word;
    min-width: 120px;
    white-space: normal;
}

/* 分类徽章横向排列，文本/分组 block，img 保持 inline-block */
.markdown-body :deep(td) img {
    display: inline-block !important;
    margin: 0 4px 0 0 !important;
    vertical-align: middle !important;
    width: auto !important;
}
.markdown-body :deep(td) p,
.markdown-body :deep(td) span,
.markdown-body :deep(td) strong {
    display: block !important;
    margin: 6px 0 !important;
    width: 100%;
}




/* 代码块支持黑白主题切换 */

.markdown-body :deep(pre) {
    background: var(--code-bg, #f6f8fa);
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
    overflow-x: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    font-size: 15px;
    line-height: 1.6;
    max-width: 100%;
    display: block;
}

.markdown-body :deep(pre code) {
    padding: 0;
    background: transparent;
    font-size: inherit;
}

.markdown-body :deep(code) {
    font-family: 'Fira Mono', 'Consolas', 'Menlo', 'Monaco', 'monospace';
    background: var(--code-bg, #f6f8fa);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 15px;
}
</style>