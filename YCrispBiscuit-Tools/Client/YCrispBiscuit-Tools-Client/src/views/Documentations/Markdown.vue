<template>
    <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue';
import MarkdownIt from 'markdown-it' // 核心解析器
//import markdownItAnchor from 'markdown-it-anchor' // 自动为标题生成锚点
//import markdownItTOC from 'markdown-it-toc-done-right' // 自动生成目录（TOC）
//import markdownItTaskLists from 'markdown-it-task-lists' // 支持 - [ ]、- [x] 任务列表
//import markdownItFootnote from 'markdown-it-footnote' // 支持脚注语法
//import markdownItHighlightjs from 'markdown-it-highlightjs' // 代码块高亮（highlight.js）
//import * as markdownItEmoji from 'markdown-it-emoji' // 支持 :smile: 等 emoji
//import markdownItContainer from 'markdown-it-container' // 支持 info/warning/note 等自定义块
//import markdownItSub from 'markdown-it-sub' // 下标 ~sub~
//import markdownItSup from 'markdown-it-sup' // 上标 ^sup^
//import markdownItDeflist from 'markdown-it-deflist' // 支持定义列表
//import markdownItMark from 'markdown-it-mark' // ==高亮==
//import markdownItIns from 'markdown-it-ins' // ++插入++
// import markdownItKatex from 'markdown-it-katex' // 支持 LaTeX 数学公式（KaTeX 渲染）
// import markdownItMathjax from 'markdown-it-mathjax3' // 支持 LaTeX 数学公式（MathJax 渲染）
// import markdownItImsize from 'markdown-it-imsize' // 支持 ![img](url =WxH)
// import markdownItMermaid from 'markdown-it-mermaid' // 支持流程图、时序图等
// import markdownItAttrs from 'markdown-it-attrs' // 支持为元素添加 class/id 等属性
// import markdownItLinkAttributes from 'markdown-it-link-attributes' // 支持为链接自动添加属性
// import markdownItCheckbox from 'markdown-it-checkbox' // 支持复选框语法
// import markdownItAdmonition from 'markdown-it-admonition' // 支持提示块
// import markdownItPlantuml from 'markdown-it-plantuml' // UML 图支持
// import markdownItTexmath from 'markdown-it-texmath' // 数学公式扩展
// import markdownItGithubHeadings from 'markdown-it-github-headings' // GitHub 风格标题锚点
// import markdownItCopy from 'markdown-it-copy' // 代码块一键复制
// import markdownItPageBreak from 'markdown-it-page-break' // 分页符支持
// import markdownItMetadata from 'markdown-it-metadata' // 元数据解析
// import markdownItInclude from 'markdown-it-include' // include 语法
// import markdownItHtml5Embed from 'markdown-it-html5-embed' // HTML5 嵌入
// import markdownItImplicitFigures from 'markdown-it-implicit-figures' // 图片转 figure
// import markdownItVideo from 'markdown-it-video' // 视频嵌入
// import markdownItAudio from 'markdown-it-audio' // 音频嵌入
// import markdownItForInline from 'markdown-it-for-inline' // 自定义内联渲染
// import markdownItForBlock from 'markdown-it-for-block' // 自定义块级渲染

const props = defineProps<{ content: string }>()
const emit = defineEmits<{
    (e: 'updateToc', toc: { id: string, text: string }[]): void
    (e: 'updateLinks', links: { url: string, text: string }[]): void
}>()

const renderedHtml = ref('')

console.log('Markdown.vue content:', props.content)

// 目录和链接提取
function extractTocAndLinks(md: MarkdownIt, content: string) {
    const tokens = md.parse(content, {})
    // 目录：只提取标题（h1~h6）
    const toc: { id: string, text: string }[] = []
    // 链接：提取所有 link_open
    const links: { url: string, text: string }[] = []
    let lastLinkText = ''
    tokens.forEach((token, idx) => {
        // TOC
        if (token.type === 'heading_open') {
            const level = token.tag
            const next = tokens[idx + 1]
            if (next && next.type === 'inline') {
                // markdown-it-anchor 默认生成 id
                const id = next.children?.find(t => t.type === 'text')?.content?.replace(/\s+/g, '-') || ''
                toc.push({ id: token.attrs?.find(a => a[0] === 'id')?.[1] || id, text: next.content })
            }
        }
        // Links
        if (token.type === 'link_open') {
            const href = token.attrs?.find(a => a[0] === 'href')?.[1]
            // 获取链接文本
            const next = tokens[idx + 1]
            if (href && next && next.type === 'text') {
                lastLinkText = next.content
                links.push({ url: href, text: lastLinkText })
            }
        }
    })
    emit('updateToc', toc)
    emit('updateLinks', links)
}

function renderMarkdown() {
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
    })


    renderedHtml.value = md.render(props.content || '')
    extractTocAndLinks(md, props.content || '')
}

watch(() => props.content, () => {
    renderMarkdown()
}, { immediate: true })

onMounted(() => {
    renderMarkdown()
})
</script>

<style scoped>
.markdown-body {
    font-size: 1rem;
    color: var(--text-color);
    line-height: 1.7;
    word-break: break-word;
    background: transparent;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
    margin-top: 1.2em;
    margin-bottom: 0.6em;
    font-weight: bold;
}

.markdown-body p {
    margin: 0.6em 0;
}

.markdown-body ul,
.markdown-body ol {
    margin: 0.6em 0 0.6em 1.2em;
}

.markdown-body code {
    background: var(--bg-color-secondary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.95em;
}

.markdown-body pre {
    background: var(--bg-color-secondary);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.95em;
}
</style>
