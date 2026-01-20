<template>
  <section class="card">
    <h2 class="text-lg font-semibold mb-4 text-warm-800 dark:text-cream-100">📊 통계</h2>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
      <div class="bg-lavender-50 dark:bg-lavender-900/20 rounded-2xl p-4 border border-lavender-200 dark:border-lavender-800 text-center">
        <p class="text-sm text-lavender-600 dark:text-lavender-400 mb-1">📝 기록 수</p>
        <p class="text-2xl font-bold text-lavender-700 dark:text-lavender-300">{{ summary.entryCount }}</p>
      </div>
      <div
        v-for="(count, mood) in summary.moodCounts"
        :key="mood"
        class="text-center rounded-2xl p-4 border-2"
        :class="getMoodCardClass(mood as MoodValue)"
      >
        <p class="text-sm font-medium mb-1" :class="getMoodTextClass(mood as MoodValue)">
          {{ getMoodEmoji(mood as MoodValue) }} {{ getMoodLabel(mood as MoodValue) }}
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

const getMoodEmoji = (value: MoodValue): string => {
  const emojis: Record<MoodValue, string> = {
    great: '😄',
    good: '🙂',
    okay: '😐',
    bad: '😔',
    awful: '😢',
  }
  return emojis[value]
}

const getMoodCardClass = (value: MoodValue): string => {
  const classes: Record<MoodValue, string> = {
    great: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    good: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
    okay: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    bad: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    awful: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  }
  return classes[value]
}

const getMoodTextClass = (value: MoodValue): string => {
  const classes: Record<MoodValue, string> = {
    great: 'text-green-700 dark:text-green-400',
    good: 'text-sky-700 dark:text-sky-400',
    okay: 'text-yellow-700 dark:text-yellow-400',
    bad: 'text-orange-700 dark:text-orange-400',
    awful: 'text-red-700 dark:text-red-400',
  }
  return classes[value]
}
</script>

