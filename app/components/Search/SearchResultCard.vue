<template>
  <div
    class="card card-hover p-4 cursor-pointer"
    @click="$emit('click')"
  >
    <!-- 날짜 및 기분 -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-lg font-semibold text-warm-800 dark:text-cream-100">{{ result.entry.date }}</span>
      <MoodBadge :value="result.entry.mood.value" />
    </div>

    <!-- 매칭된 내용들 -->
    <div class="space-y-2">
      <div
        v-for="(match, index) in result.matches.slice(0, 3)"
        :key="index"
        class="flex items-start gap-2"
      >
        <span
          class="shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium"
          :class="getTypeClass(match.type)"
        >
          {{ getTypeLabel(match.type) }}
        </span>
        <span
          class="text-warm-700 dark:text-warm-300 text-sm line-clamp-1"
          v-html="match.highlight"
        />
      </div>

      <!-- 더 많은 매칭이 있는 경우 -->
      <p v-if="result.matches.length > 3" class="text-sm text-warm-500 dark:text-warm-400">
        외 {{ result.matches.length - 3 }}개 더...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Entry } from '~/types'
import MoodBadge from '~/components/Common/MoodBadge.vue'

interface SearchMatch {
  type: 'notes' | 'events' | 'people' | 'mood' | 'crew'
  text: string
  highlight: string
}

interface SearchResult {
  entry: Entry
  matches: SearchMatch[]
}

defineProps<{
  result: SearchResult
}>()

defineEmits<{
  click: []
}>()

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    notes: 'Notes',
    events: 'Events',
    people: 'People',
    mood: 'Mood',
    crew: 'Crew',
  }
  return labels[type] || type
}

function getTypeClass(type: string): string {
  const classes: Record<string, string> = {
    notes: 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-400',
    events: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    people: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    mood: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    crew: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  }
  return classes[type] || 'bg-cream-100 dark:bg-warm-600 text-warm-600 dark:text-warm-300'
}
</script>

