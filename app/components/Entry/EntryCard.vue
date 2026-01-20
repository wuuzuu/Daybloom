<template>
  <NuxtLink 
    :to="`/entry/${entry.date}`" 
    class="block card card-hover p-4 group"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xl">{{ moodEmoji }}</span>
          <span class="text-sm font-medium text-warm-700 dark:text-warm-300">
            {{ entry.date }}
          </span>
        </div>
        <p 
          v-if="entry.bullets.length > 0" 
          class="text-warm-600 dark:text-warm-400 text-sm line-clamp-2"
        >
          {{ entry.bullets.slice(0, 2).join(', ') }}
          <span v-if="entry.bullets.length > 2" class="text-warm-400">...</span>
        </p>
        <p 
          v-else 
          class="text-warm-400 dark:text-warm-500 text-sm italic"
        >
          기록 없음
        </p>
      </div>
      <span class="text-warm-300 dark:text-warm-600 group-hover:text-lavender-400 transition-colors">
        →
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Entry, MoodValue } from '~/types'

const props = defineProps<{
  entry: Entry
}>()

const moodEmojis: Record<MoodValue, string> = {
  great: '😄',
  good: '🙂',
  okay: '😐',
  bad: '😔',
  awful: '😢',
}

const moodEmoji = computed(() => moodEmojis[props.entry.mood.value] || '😐')
</script>
