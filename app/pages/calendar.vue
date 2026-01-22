<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Header -->
    <header class="mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-warm-800 dark:text-cream-100">📅 캘린더</h1>
        <button
          v-if="!isCurrentMonth"
          @click="goToCurrentMonth"
          class="btn-primary text-sm"
        >
          이번 달
        </button>
      </div>
    </header>

    <!-- 범례 -->
    <div class="card mb-6">
      <div class="flex flex-wrap items-center gap-4 text-sm">
        <span class="text-warm-500 dark:text-warm-400">기분:</span>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-green-400" />
          <span class="text-warm-600 dark:text-warm-300">최고</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-sky-400" />
          <span class="text-warm-600 dark:text-warm-300">좋음</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-yellow-400" />
          <span class="text-warm-600 dark:text-warm-300">보통</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-orange-400" />
          <span class="text-warm-600 dark:text-warm-300">나쁨</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-red-400" />
          <span class="text-warm-600 dark:text-warm-300">최악</span>
        </div>
      </div>
    </div>

    <!-- 통계 -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="card text-center p-4">
        <p class="text-2xl font-bold text-lavender-500">{{ monthStats.entryCount }}</p>
        <p class="text-xs text-warm-500 dark:text-warm-400">기록한 날</p>
      </div>
      <div class="card text-center p-4">
        <p class="text-2xl font-bold text-green-500">{{ monthStats.streak }}</p>
        <p class="text-xs text-warm-500 dark:text-warm-400">연속 기록</p>
      </div>
      <div class="card text-center p-4">
        <p class="text-2xl font-bold text-warm-400">{{ monthStats.daysInMonth - monthStats.entryCount }}</p>
        <p class="text-xs text-warm-500 dark:text-warm-400">빈 날</p>
      </div>
    </div>

    <!-- 캘린더 -->
    <div class="card">
      <MonthCalendar
        :year="currentYear"
        :month="currentMonth"
        :entries="entriesStore.entriesByDate"
        :projects="projectsStore.projects"
        @prev="goToPreviousMonth"
        @next="goToNextMonth"
        @select="handleDateSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import { useProjectsStore } from '~/stores/projects'
import { getToday, getCalendarDays } from '~/utils/date'
import dayjs from 'dayjs'
import MonthCalendar from '~/components/Calendar/MonthCalendar.vue'

const router = useRouter()
const entriesStore = useEntriesStore()
const projectsStore = useProjectsStore()

const today = dayjs(getToday())
const currentYear = ref(today.year())
const currentMonth = ref(today.month() + 1)

const isCurrentMonth = computed(() => {
  return currentYear.value === today.year() && currentMonth.value === today.month() + 1
})

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

const goToPreviousMonth = (): void => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const goToNextMonth = (): void => {
  if (isCurrentMonth.value) return
  
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToCurrentMonth = (): void => {
  currentYear.value = today.year()
  currentMonth.value = today.month() + 1
}

const handleDateSelect = (date: string): void => {
  router.push(`/entry/${date}`)
}
</script>
