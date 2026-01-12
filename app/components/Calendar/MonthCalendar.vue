<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- 헤더: 월 탐색 -->
    <div class="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <button
        @click="$emit('prev')"
        class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
      >
        <span class="text-gray-600 dark:text-gray-300">←</span>
      </button>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ year }}년 {{ monthName }}
      </h2>
      <button
        @click="$emit('next')"
        :disabled="isCurrentMonth"
        class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="text-gray-600 dark:text-gray-300">→</span>
      </button>
    </div>

    <!-- 요일 헤더 -->
    <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-600">
      <div
        v-for="day in weekDays"
        :key="day"
        class="py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
      >
        {{ day }}
      </div>
    </div>

    <!-- 날짜 그리드 -->
    <div class="grid grid-cols-7">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="min-h-[80px] border-b border-r border-gray-100 dark:border-gray-700 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        :class="{
          'bg-gray-50 dark:bg-gray-800': !day.isCurrentMonth,
          'bg-blue-50 dark:bg-blue-900/30': day.isToday,
        }"
        @click="$emit('select', day.date)"
      >
        <div class="flex items-start justify-between">
          <span
            class="text-sm font-medium"
            :class="{
              'text-gray-400 dark:text-gray-500': !day.isCurrentMonth,
              'text-blue-600 dark:text-blue-400': day.isToday && day.isCurrentMonth,
              'text-gray-900 dark:text-gray-200': !day.isToday && day.isCurrentMonth,
            }"
          >
            {{ day.day }}
          </span>
          
          <!-- 기분 표시 -->
          <span
            v-if="getEntryForDate(day.date)"
            class="w-3 h-3 rounded-full"
            :class="getMoodColor(getEntryForDate(day.date)?.mood.value)"
          />
        </div>

        <!-- 엔트리 미리보기 -->
        <div v-if="getEntryForDate(day.date)" class="mt-1">
          <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
            {{ getEntryPreview(day.date) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Entry, MoodValue } from '~/types'
import { getCalendarDays, getMonthName, getToday } from '~/utils/date'
import dayjs from 'dayjs'

const props = defineProps<{
  year: number
  month: number
  entries: Record<string, Entry>
}>()

defineEmits<{
  prev: []
  next: []
  select: [date: string]
}>()

const weekDays = ['월', '화', '수', '목', '금', '토', '일']

const monthName = computed(() => getMonthName(props.month))

const calendarDays = computed(() => getCalendarDays(props.year, props.month))

const isCurrentMonth = computed(() => {
  const today = dayjs(getToday())
  return props.year === today.year() && props.month === today.month() + 1
})

function getEntryForDate(date: string): Entry | undefined {
  return props.entries[date]
}

function getEntryPreview(date: string): string {
  const entry = props.entries[date]
  if (!entry) return ''
  if (entry.bullets.length > 0) {
    return entry.bullets[0]
  }
  return ''
}

function getMoodColor(mood?: MoodValue): string {
  if (!mood) return ''
  const colors: Record<MoodValue, string> = {
    great: 'bg-green-500',
    good: 'bg-blue-500',
    okay: 'bg-yellow-500',
    bad: 'bg-orange-500',
    awful: 'bg-red-500',
  }
  return colors[mood]
}
</script>

