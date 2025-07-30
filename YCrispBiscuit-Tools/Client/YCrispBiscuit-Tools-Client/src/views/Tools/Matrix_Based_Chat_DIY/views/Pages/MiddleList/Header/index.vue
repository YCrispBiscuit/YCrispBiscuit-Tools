<template>
  <div class="middle-header">
    <div class="header-content">
      <h3>Matrix 频道</h3>
      <span class="user-id">{{ userId }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  userId: string
}

defineProps<Props>()
</script>

<style scoped>
.middle-header {
  padding: 16px;
  border-bottom: 1px solid #36393f;
  background-color: #2f3136;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-content h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.user-id {
  font-size: 12px;
  color: #96989d;
}
</style>
