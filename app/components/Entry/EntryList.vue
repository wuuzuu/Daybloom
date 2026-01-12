<template>
  <div v-if="entries.length === 0" class="text-gray-500 dark:text-gray-400">
    기록이 없습니다.
  </div>
  <div v-else class="space-y-2">
    <NuxtLink
      v-for="entry in entries"
      :key="entry.id"
      :to="`/entry/${entry.date}`"
      class="block border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div class="flex items-center justify-between">
        <span class="font-semibold dark:text-white">{{ entry.date }}</span>
        <MoodBadge :value="entry.mood.value" />
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Entry } from '~/types'
import MoodBadge from '~/components/Common/MoodBadge.vue'

defineProps<{
  entries: Entry[]
}>()
</script>

