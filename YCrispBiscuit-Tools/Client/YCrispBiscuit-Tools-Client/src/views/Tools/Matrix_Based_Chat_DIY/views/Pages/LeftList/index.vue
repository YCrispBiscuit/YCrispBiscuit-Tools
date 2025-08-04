<template>
  <div class="left-function-sidebar">
    <!-- 功能列表组件 -->
    <FunctionList @function-change="emit('function-change', $event)" />
    
    <!-- 用户面板组件 -->
    <UserPanel 
      :user-initials="userInitials"
      @userInfo="emit('userInfo')"
    />
  </div>
</template>

<script setup lang="ts">
import FunctionList from './FunctionList'
import UserPanel from './UserPanel'

interface Props {
  userInitials: string
}

defineProps<Props>()

const emit = defineEmits(['userInfo', 'function-change'])
</script>

<style scoped>
.left-function-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #202225;
}
</style>
