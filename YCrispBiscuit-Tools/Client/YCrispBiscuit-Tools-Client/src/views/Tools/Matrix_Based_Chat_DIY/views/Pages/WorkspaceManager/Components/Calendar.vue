<template>
  <div class="calendar-component">
    <div class="cal-header">
      <h3>📅 日历</h3>
    </div>
    <div class="cal-content">
      <div class="calendar-grid">
        <div class="day-header">日</div>
        <div class="day-header">一</div>
        <div class="day-header">二</div>
        <div class="day-header">三</div>
        <div class="day-header">四</div>
        <div class="day-header">五</div>
        <div class="day-header">六</div>
        
        <div v-for="day in 35" :key="day" class="day-cell">
          {{ day <= 31 ? day : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 日历组件的基本实现
</script>

<style scoped>
.calendar-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #fff;
}

.cal-header {
  padding: 10px;
  border-bottom: 1px solid #333;
}

.cal-header h3 {
  margin: 0;
  font-size: 16px;
}

.cal-content {
  flex: 1;
  padding: 10px;
  overflow: hidden;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  height: 100%;
}

.day-header {
  background: #333;
  padding: 8px;
  text-align: center;
  font-weight: bold;
}

.day-cell {
  background: #2d2d2d;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  min-height: 30px;
}

.day-cell:hover {
  background: #333;
}
</style>
