<template>
  <div v-if="entries.length === 0" class="card text-center py-8">
    <span class="text-3xl mb-2 block">📭</span>
    <p class="text-warm-500 dark:text-warm-400">기록이 없습니다.</p>
  </div>
  <div v-else class="space-y-3">
    <NuxtLink
      v-for="entry in entries"
      :key="entry.id"
      :to="`/entry/${entry.date}`"
      class="card card-hover block p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ getMoodEmoji(entry.mood.value) }}</span>
          <span class="font-semibold text-warm-800 dark:text-cream-100">{{ entry.date }}</span>
        </div>
        <MoodBadge :value="entry.mood.value" />
      </div>
      <p v-if="entry.bullets.length > 0" class="text-sm text-warm-600 dark:text-warm-300 mt-2 line-clamp-1 pl-8">
        {{ entry.bullets[0] }}
      </p>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Entry, MoodValue } from '~/types'
import MoodBadge from '~/components/Common/MoodBadge.vue'

defineProps<{
  entries: Entry[]
}>()

const getMoodEmoji = (mood: MoodValue): string => {
  const emojis: Record<MoodValue, string> = {
    great: '😄',
    good: '🙂',
    okay: '😐',
    bad: '😔',
    awful: '😢',
  }
  return emojis[mood] || '😐'
}
</script>

