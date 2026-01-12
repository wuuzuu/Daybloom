<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold dark:text-white">캘린더</h1>
      <button
        v-if="!isCurrentMonth"
        @click="goToCurrentMonth"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        이번 달
      </button>
    </div>

    <!-- 범례 -->
    <div class="flex items-center gap-4 mb-6 text-sm">
      <span class="text-gray-600 dark:text-gray-400">기분:</span>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-green-500" />
        <span class="text-gray-700 dark:text-gray-300">최고</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-blue-500" />
        <span class="text-gray-700 dark:text-gray-300">좋음</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-yellow-500" />
        <span class="text-gray-700 dark:text-gray-300">보통</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-orange-500" />
        <span class="text-gray-700 dark:text-gray-300">나쁨</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-3 h-3 rounded-full bg-red-500" />
        <span class="text-gray-700 dark:text-gray-300">최악</span>
      </div>
    </div>

    <!-- 통계 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ monthStats.entryCount }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">기록한 날</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ monthStats.streak }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">연속 기록</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ monthStats.daysInMonth - monthStats.entryCount }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">빈 날</p>
      </div>
    </div>

    <!-- 캘린더 -->
    <MonthCalendar
      :year="currentYear"
      :month="currentMonth"
      :entries="entriesStore.entriesByDate"
      @prev="goToPreviousMonth"
      @next="goToNextMonth"
      @select="handleDateSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import { getToday, getCalendarDays } from '~/utils/date'
import dayjs from 'dayjs'
import MonthCalendar from '~/components/Calendar/MonthCalendar.vue'

const router = useRouter()
const entriesStore = useEntriesStore()

const today = dayjs(getToday())
const currentYear = ref(today.year())
const currentMonth = ref(today.month() + 1) // 1-12

const isCurrentMonth = computed(() => {
  return currentYear.value === today.year() && currentMonth.value === today.month() + 1
})

// 월별 통계
const monthStats = computed(() => {
  const days = getCalendarDays(currentYear.value, currentMonth.value)
    .filter(d => d.isCurrentMonth)
  
  let entryCount = 0
  let currentStreak = 0
  let maxStreak = 0
  
  for (const day of days) {
    if (entriesStore.entriesByDate[day.date]) {
      entryCount++
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }
  
  return {
    entryCount,
    streak: maxStreak,
    daysInMonth: days.length,
  }
})

function goToPreviousMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function goToNextMonth() {
  if (isCurrentMonth.value) return
  
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function goToCurrentMonth() {
  currentYear.value = today.year()
  currentMonth.value = today.month() + 1
}

function handleDateSelect(date: string) {
  router.push(`/entry/${date}`)
}
</script>

