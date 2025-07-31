<template>
  <div class="notes-component">
    <div class="notes-header">
      <h3>📝 笔记</h3>
    </div>
    <div class="notes-content">
      <div class="notes-toolbar">
        <button>新建</button>
        <button>保存</button>
        <button>删除</button>
      </div>
      <textarea 
        class="notes-editor"
        placeholder="在这里编写笔记..."
        v-model="noteContent"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const noteContent = ref('# 我的笔记\n\n这是一个简单的笔记编辑器...')
</script>

<style scoped>
.notes-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #fff;
}

.notes-header {
  padding: 10px;
  border-bottom: 1px solid #333;
}

.notes-header h3 {
  margin: 0;
  font-size: 16px;
}

.notes-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notes-toolbar {
  padding: 10px;
  border-bottom: 1px solid #333;
  display: flex;
  gap: 8px;
}

.notes-toolbar button {
  padding: 6px 12px;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.notes-toolbar button:hover {
  background: #444;
}

.notes-editor {
  flex: 1;
  padding: 15px;
  background: #1e1e1e;
  color: #fff;
  border: none;
  resize: none;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.notes-editor:focus {
  outline: none;
}
</style>
