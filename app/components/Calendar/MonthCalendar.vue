<template>
  <div class="overflow-hidden rounded-2xl border border-cream-200 dark:border-warm-600">
    <!-- 헤더: 월 탐색 -->
    <div class="flex items-center justify-between px-4 py-3 bg-lavender-100 dark:bg-warm-700 border-b border-cream-200 dark:border-warm-600">
      <button
        @click="$emit('prev')"
        class="p-2 hover:bg-lavender-200 dark:hover:bg-warm-600 rounded-xl transition-colors"
      >
        <span class="text-lavender-700 dark:text-cream-100">←</span>
      </button>
      <h2 class="text-lg font-semibold text-lavender-800 dark:text-cream-100">
        {{ year }}년 {{ monthName }}
      </h2>
      <button
        @click="$emit('next')"
        :disabled="isCurrentMonth"
        class="p-2 hover:bg-lavender-200 dark:hover:bg-warm-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="text-lavender-700 dark:text-cream-100">→</span>
      </button>
    </div>

    <!-- 요일 헤더 -->
    <div class="grid grid-cols-7 border-b border-cream-200 dark:border-warm-600 bg-cream-100 dark:bg-warm-700">
      <div
        v-for="day in weekDays"
        :key="day"
        class="py-3 text-center text-sm font-medium text-warm-600 dark:text-cream-200"
      >
        {{ day }}
      </div>
    </div>

    <!-- 날짜 그리드 -->
    <div class="grid grid-cols-7 bg-cream-50 dark:bg-warm-800">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="min-h-[80px] border-b border-r border-cream-200 dark:border-warm-600 p-2 cursor-pointer hover:bg-lavender-100 dark:hover:bg-warm-700 transition-colors"
        :class="{
          'bg-cream-100/50 dark:bg-warm-700/30': !day.isCurrentMonth && !day.isToday,
          'bg-lavender-200 dark:bg-[rgb(88,60,120)] ring-2 ring-inset ring-lavender-400 dark:ring-[rgb(192,132,252)]': day.isToday,
        }"
        @click="$emit('select', day.date)"
      >
        <div class="flex items-start justify-between">
          <span
            class="text-sm font-medium"
            :class="{
              'text-warm-400 dark:text-warm-500': !day.isCurrentMonth && !day.isToday,
              'text-lavender-700 dark:text-[rgb(216,180,254)] font-bold': day.isToday,
              'text-warm-700 dark:text-cream-100': !day.isToday && day.isCurrentMonth,
            }"
          >
            {{ day.day }}
          </span>
          
          <!-- 기분 표시 -->
          <span
            v-if="getEntryForDate(day.date)"
            class="w-2 h-2 md:w-3 md:h-3 rounded-full shadow-sm"
            :class="getMoodColor(getEntryForDate(day.date)?.mood.value)"
          />
        </div>

        <!-- 프로젝트명 표시 -->
        <div v-if="getProjectsForDate(day.date).names.length > 0" class="mt-1 space-y-0.5">
          <p 
            v-for="name in getProjectsForDate(day.date).names" 
            :key="name"
            class="text-xs text-lavender-600 dark:text-lavender-300 truncate font-medium"
          >
            {{ name }}
          </p>
          <p 
            v-if="getProjectsForDate(day.date).extra > 0"
            class="text-xs text-warm-400 dark:text-warm-500"
          >
            +{{ getProjectsForDate(day.date).extra }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Entry, MoodValue, Project } from '~/types'
import { getCalendarDays, getMonthName, getToday } from '~/utils/date'
import dayjs from 'dayjs'

const props = defineProps<{
  year: number
  month: number
  entries: Record<string, Entry>
  projects?: Project[]
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

function getProjectsForDate(date: string): { names: string[]; extra: number } {
  const entry = props.entries[date]
  if (!entry || !entry.workItems || entry.workItems.length === 0) {
    return { names: [], extra: 0 }
  }
  
  const projectNames = entry.workItems
    .map(wi => {
      const project = props.projects?.find(p => p.id === wi.projectId)
      return project?.crew || project?.title || null
    })
    .filter((name): name is string => name !== null)
  
  // 중복 제거
  const uniqueNames = [...new Set(projectNames)]
  
  // 최대 2개만 표시, 나머지는 +N으로
  const displayNames = uniqueNames.slice(0, 2)
  const extra = uniqueNames.length - 2
  
  return { names: displayNames, extra: extra > 0 ? extra : 0 }
}

function getMoodColor(mood?: MoodValue): string {
  if (!mood) return ''
  const colors: Record<MoodValue, string> = {
    great: 'bg-green-400',
    good: 'bg-sky-400',
    okay: 'bg-yellow-400',
    bad: 'bg-orange-400',
    awful: 'bg-red-400',
  }
  return colors[mood]
}
</script>

