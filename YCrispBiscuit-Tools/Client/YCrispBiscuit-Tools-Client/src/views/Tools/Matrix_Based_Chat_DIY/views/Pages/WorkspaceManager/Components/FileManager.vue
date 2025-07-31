<template>
  <div class="file-manager-component">
    <div class="fm-header">
      <h3>📁 文件管理</h3>
    </div>
    <div class="fm-content">
      <div class="folder-tree">
        <div class="folder-item">📁 Documents</div>
        <div class="folder-item">📁 Downloads</div>
        <div class="folder-item">📁 Pictures</div>
        <div class="folder-item">📁 Projects</div>
      </div>
      <div class="file-list">
        <div class="file-item">📄 readme.txt</div>
        <div class="file-item">🖼️ image.png</div>
        <div class="file-item">📊 data.xlsx</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 文件管理组件的基本实现
</script>

<style scoped>
.file-manager-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #fff;
}

.fm-header {
  padding: 10px;
  border-bottom: 1px solid #333;
}

.fm-header h3 {
  margin: 0;
  font-size: 16px;
}

.fm-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.folder-tree, .file-list {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.folder-tree {
  border-right: 1px solid #333;
}

.folder-item, .file-item {
  padding: 8px;
  margin: 2px 0;
  background: #2d2d2d;
  border-radius: 4px;
  cursor: pointer;
}

.folder-item:hover, .file-item:hover {
  background: #333;
}
</style>
