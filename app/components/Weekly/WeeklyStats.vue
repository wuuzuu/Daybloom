<template>
  <section class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4 dark:text-white">통계</h2>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
      <div class="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">기록 수</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ summary.entryCount }}</p>
      </div>
      <div
        v-for="(count, mood) in summary.moodCounts"
        :key="mood"
        class="text-center rounded-lg p-4 border-2"
        :class="getMoodCardClass(mood as MoodValue)"
      >
        <p class="text-sm font-medium mb-1" :class="getMoodTextClass(mood as MoodValue)">
          {{ getMoodLabel(mood as MoodValue) }}
        </p>
        <p class="text-2xl font-bold" :class="getMoodTextClass(mood as MoodValue)">
          {{ count }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WeeklySummary, MoodValue } from '~/types'
import { useMood } from '~/composables/useMood'

defineProps<{
  summary: WeeklySummary
}>()

const { getMoodLabel, getMoodClass } = useMood()

const getMoodCardClass = (value: MoodValue): string => {
  const classes: Record<MoodValue, string> = {
    great: 'bg-green-50 border-green-200',
    good: 'bg-blue-50 border-blue-200',
    okay: 'bg-yellow-50 border-yellow-200',
    bad: 'bg-orange-50 border-orange-200',
    awful: 'bg-red-50 border-red-200',
  }
  return classes[value]
}

const getMoodTextClass = (value: MoodValue): string => {
  const classes: Record<MoodValue, string> = {
    great: 'text-green-800',
    good: 'text-blue-800',
    okay: 'text-yellow-800',
    bad: 'text-orange-800',
    awful: 'text-red-800',
  }
  return classes[value]
}
</script>

