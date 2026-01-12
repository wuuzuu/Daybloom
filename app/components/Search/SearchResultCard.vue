<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900 transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
    <!-- 날짜 및 기분 -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ result.entry.date }}</span>
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
          class="shrink-0 px-2 py-0.5 rounded text-xs font-medium"
          :class="getTypeClass(match.type)"
        >
          {{ getTypeLabel(match.type) }}
        </span>
        <span
          class="text-gray-700 dark:text-gray-300 text-sm line-clamp-1"
          v-html="match.highlight"
        />
      </div>

      <!-- 더 많은 매칭이 있는 경우 -->
      <p v-if="result.matches.length > 3" class="text-sm text-gray-500 dark:text-gray-400">
        외 {{ result.matches.length - 3 }}개 더...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Entry } from '~/types'
import MoodBadge from '~/components/Common/MoodBadge.vue'

interface SearchMatch {
  type: 'notes' | 'events' | 'people' | 'mood'
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
  }
  return labels[type] || type
}

function getTypeClass(type: string): string {
  const classes: Record<string, string> = {
    notes: 'bg-blue-100 text-blue-700',
    events: 'bg-purple-100 text-purple-700',
    people: 'bg-green-100 text-green-700',
    mood: 'bg-orange-100 text-orange-700',
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}
</script>

