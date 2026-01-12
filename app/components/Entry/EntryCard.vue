<template>
  <div
    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
  >
    <NuxtLink :to="`/entry/${entry.date}`" class="block">
      <div class="flex items-center justify-between mb-2">
        <span class="font-semibold dark:text-white">{{ entry.date }}</span>
        <MoodBadge :value="entry.mood.value" />
      </div>
      <div v-if="entry.bullets.length > 0" class="text-gray-700 dark:text-gray-300">
        <p class="line-clamp-2">
          {{ entry.bullets.slice(0, 2).join(', ') }}
          <span v-if="entry.bullets.length > 2">...</span>
        </p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Entry } from '~/types'
import MoodBadge from '~/components/Common/MoodBadge.vue'

defineProps<{
  entry: Entry
}>()
</script>

