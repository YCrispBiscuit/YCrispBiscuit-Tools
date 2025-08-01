<template>
  <div class="calendar-panel">
    <div class="calendar-header">
      <div class="calendar-nav">
        <button @click="previousMonth" class="nav-btn">‹</button>
        <h3>{{ currentMonthYear }}</h3>
        <button @click="nextMonth" class="nav-btn">›</button>
      </div>
      <div class="calendar-actions">
        <button @click="goToToday" class="today-btn">今天</button>
        <button @click="showEventForm = true" class="add-event-btn">添加事件</button>
      </div>
    </div>

    <div class="calendar-view">
      <!-- 周标题 -->
      <div class="week-header">
        <div v-for="day in weekDays" :key="day" class="week-day">
          {{ day }}
        </div>
      </div>

      <!-- 日期网格 -->
      <div class="calendar-grid">
        <div 
          v-for="date in calendarDates" 
          :key="date.key"
          :class="[
            'calendar-date',
            {
              'other-month': date.isOtherMonth,
              'today': date.isToday,
              'selected': date.isSelected,
              'has-events': date.events.length > 0
            }
          ]"
          @click="selectDate(date)"
        >
          <div class="date-number">{{ date.date }}</div>
          <div class="date-events">
            <div 
              v-for="event in date.events.slice(0, 3)" 
              :key="event.id"
              :class="['event-indicator', `event-${event.type}`]"
              :title="event.title"
            >
              {{ event.title }}
            </div>
            <div v-if="date.events.length > 3" class="more-events">
              +{{ date.events.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中日期的事件列表 -->
    <div v-if="selectedDate" class="selected-date-events">
      <h4>{{ formatSelectedDate }} 的事件</h4>
      <div v-if="selectedDateEvents.length === 0" class="no-events">
        暂无事件
      </div>
      <div v-else class="events-list">
        <div 
          v-for="event in selectedDateEvents" 
          :key="event.id"
          :class="['event-item', `event-${event.type}`]"
        >
          <div class="event-time">{{ event.time }}</div>
          <div class="event-content">
            <div class="event-title">{{ event.title }}</div>
            <div class="event-description">{{ event.description }}</div>
          </div>
          <div class="event-actions">
            <button @click="editEvent(event)" class="edit-btn">编辑</button>
            <button @click="deleteEvent(event.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑事件弹窗 -->
    <div v-if="showEventForm" class="event-form-overlay" @click="closeEventForm">
      <div class="event-form" @click.stop>
        <div class="form-header">
          <h3>{{ editingEvent ? '编辑事件' : '添加事件' }}</h3>
          <button @click="closeEventForm" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="saveEvent">
          <div class="form-group">
            <label>标题</label>
            <input 
              type="text" 
              v-model="eventForm.title" 
              required 
              placeholder="输入事件标题"
            >
          </div>
          
          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="eventForm.description" 
              placeholder="输入事件描述"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>日期</label>
              <input 
                type="date" 
                v-model="eventForm.date" 
                required
              >
            </div>
            
            <div class="form-group">
              <label>时间</label>
              <input 
                type="time" 
                v-model="eventForm.time" 
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label>类型</label>
            <select v-model="eventForm.type">
              <option value="meeting">会议</option>
              <option value="reminder">提醒</option>
              <option value="deadline">截止日期</option>
              <option value="personal">个人</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeEventForm" class="cancel-btn">
              取消
            </button>
            <button type="submit" class="save-btn">
              {{ editingEvent ? '更新' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: 'meeting' | 'reminder' | 'deadline' | 'personal'
}

interface CalendarDate {
  key: string
  date: number
  fullDate: string
  isOtherMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: CalendarEvent[]
}

const chatContext = inject('chatContext') as any

const currentDate = ref(new Date())
const selectedDate = ref<string | null>(null)
const events = ref<CalendarEvent[]>([])
const showEventForm = ref(false)
const editingEvent = ref<CalendarEvent | null>(null)

const eventForm = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  type: 'personal' as CalendarEvent['type']
})

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 当前月份年份显示
const currentMonthYear = computed(() => {
  return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`
})

// 格式化选中日期
const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

// 选中日期的事件
const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return []
  return events.value
    .filter(event => event.date === selectedDate.value)
    .sort((a, b) => a.time.localeCompare(b.time))
})

// 生成日历日期
const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // 本月第一天
  const firstDay = new Date(year, month, 1)
  // 本月最后一天
  const lastDay = new Date(year, month + 1, 0)
  
  // 日历开始日期（可能包含上月日期）
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // 日历结束日期（可能包含下月日期）
  const endDate = new Date(lastDay)
  const remainingDays = 6 - lastDay.getDay()
  endDate.setDate(endDate.getDate() + remainingDays)
  
  const dates: CalendarDate[] = []
  const currentDateStr = new Date().toISOString().split('T')[0]
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0]
    const isOtherMonth = date.getMonth() !== month
    const isToday = dateStr === currentDateStr
    const isSelected = dateStr === selectedDate.value
    const dayEvents = events.value.filter(event => event.date === dateStr)
    
    dates.push({
      key: dateStr,
      date: date.getDate(),
      fullDate: dateStr,
      isOtherMonth,
      isToday,
      isSelected,
      events: dayEvents
    })
  }
  
  return dates
})

// 上一月
const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

// 下一月
const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// 回到今天
const goToToday = () => {
  const today = new Date()
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedDate.value = today.toISOString().split('T')[0]
}

// 选择日期
const selectDate = (date: CalendarDate) => {
  selectedDate.value = date.fullDate
}

// 编辑事件
const editEvent = (event: CalendarEvent) => {
  editingEvent.value = event
  eventForm.value = { ...event }
  showEventForm.value = true
}

// 删除事件
const deleteEvent = (eventId: string) => {
  if (confirm('确定要删除这个事件吗？')) {
    const index = events.value.findIndex(e => e.id === eventId)
    if (index > -1) {
      events.value.splice(index, 1)
      saveEventsToStorage()
    }
  }
}

// 保存事件
const saveEvent = () => {
  if (editingEvent.value) {
    // 更新现有事件
    const index = events.value.findIndex(e => e.id === editingEvent.value!.id)
    if (index > -1) {
      events.value[index] = { ...eventForm.value, id: editingEvent.value.id }
    }
  } else {
    // 添加新事件
    const newEvent: CalendarEvent = {
      ...eventForm.value,
      id: Date.now().toString()
    }
    events.value.push(newEvent)
  }
  
  saveEventsToStorage()
  closeEventForm()
}

// 关闭事件表单
const closeEventForm = () => {
  showEventForm.value = false
  editingEvent.value = null
  eventForm.value = {
    title: '',
    description: '',
    date: selectedDate.value || new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'personal'
  }
}

// 保存事件到本地存储
const saveEventsToStorage = () => {
  localStorage.setItem('calendar-events', JSON.stringify(events.value))
}

// 从本地存储加载事件
const loadEventsFromStorage = () => {
  const savedEvents = localStorage.getItem('calendar-events')
  if (savedEvents) {
    events.value = JSON.parse(savedEvents)
  }
}

// 初始化
onMounted(() => {
  loadEventsFromStorage()
  
  // 设置今天为选中日期
  selectedDate.value = new Date().toISOString().split('T')[0]
  
  // 初始化事件表单日期
  eventForm.value.date = selectedDate.value
  
  // 添加一些示例事件
  if (events.value.length === 0) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    events.value = [
      {
        id: '1',
        title: '团队会议',
        description: '讨论项目进展',
        date: today.toISOString().split('T')[0],
        time: '14:00',
        type: 'meeting'
      },
      {
        id: '2',
        title: '项目截止',
        description: '完成功能开发',
        date: tomorrow.toISOString().split('T')[0],
        time: '18:00',
        type: 'deadline'
      }
    ]
    saveEventsToStorage()
  }
})

// 监听选中日期变化，自动设置表单日期
const updateFormDate = () => {
  if (selectedDate.value) {
    eventForm.value.date = selectedDate.value
  }
}

// 暴露方法给父组件
defineExpose({
  addEvent: (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    }
    events.value.push(newEvent)
    saveEventsToStorage()
  },
  getEventsForDate: (date: string) => {
    return events.value.filter(event => event.date === date)
  }
})
</script>

<style scoped>
.calendar-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background: #f8f9fa;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 16px;
}

.nav-btn:hover {
  background: #f0f0f0;
}

.calendar-nav h3 {
  margin: 0;
  min-width: 120px;
  text-align: center;
  color: #333;
}

.calendar-actions {
  display: flex;
  gap: 8px;
}

.today-btn, .add-event-btn {
  padding: 8px 12px;
  border: 1px solid #007bff;
  border-radius: 4px;
  background: white;
  color: #007bff;
  cursor: pointer;
}

.add-event-btn {
  background: #007bff;
  color: white;
}

.today-btn:hover, .add-event-btn:hover {
  opacity: 0.8;
}

.calendar-view {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.week-day {
  padding: 12px;
  text-align: center;
  font-weight: bold;
  color: #666;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #ddd;
}

.calendar-date {
  min-height: 80px;
  padding: 8px;
  background: white;
  cursor: pointer;
  position: relative;
}

.calendar-date:hover {
  background: #f8f9fa;
}

.calendar-date.other-month {
  color: #ccc;
  background: #f9f9f9;
}

.calendar-date.today {
  background: #e3f2fd;
}

.calendar-date.selected {
  background: #007bff;
  color: white;
}

.calendar-date.has-events .date-number {
  font-weight: bold;
}

.date-number {
  font-size: 14px;
  margin-bottom: 4px;
}

.date-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-indicator {
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meeting {
  background: #007bff;
  color: white;
}

.event-reminder {
  background: #28a745;
  color: white;
}

.event-deadline {
  background: #dc3545;
  color: white;
}

.event-personal {
  background: #6c757d;
  color: white;
}

.more-events {
  font-size: 10px;
  color: #666;
  text-align: center;
}

.selected-date-events {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  max-height: 300px;
  overflow-y: auto;
}

.selected-date-events h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.no-events {
  color: #666;
  text-align: center;
  padding: 20px;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  border-left: 4px solid;
}

.event-item.event-meeting {
  border-left-color: #007bff;
}

.event-item.event-reminder {
  border-left-color: #28a745;
}

.event-item.event-deadline {
  border-left-color: #dc3545;
}

.event-item.event-personal {
  border-left-color: #6c757d;
}

.event-time {
  font-weight: bold;
  color: #333;
  min-width: 50px;
}

.event-content {
  flex: 1;
}

.event-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #333;
}

.event-description {
  color: #666;
  font-size: 14px;
}

.event-actions {
  display: flex;
  gap: 4px;
}

.edit-btn, .delete-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn {
  color: #dc3545;
  border-color: #dc3545;
}

.event-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.event-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn, .save-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: white;
  color: #666;
}

.save-btn {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.cancel-btn:hover, .save-btn:hover {
  opacity: 0.8;
}
</style>
