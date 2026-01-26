<template>
  <section v-if="topPeople.length > 0" class="card">
    <h2 class="text-lg font-semibold mb-4 text-warm-800 dark:text-cream-100">🏆 자주 만난 사람</h2>
    <div class="space-y-3">
      <div
        v-for="(person, index) in topPeople"
        :key="person.name"
        class="flex justify-between items-center p-3 bg-cream-50 dark:bg-warm-700 rounded-xl"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '　' }}</span>
          <img 
            :src="getAvatarUrl(person.name, 'lorelei')"
            :alt="person.name"
            class="w-8 h-8 rounded-full bg-cream-100 dark:bg-warm-600"
          />
          <span class="text-warm-800 dark:text-cream-100 font-medium">{{ person.name }}</span>
        </div>
        <span class="text-lavender-600 dark:text-lavender-400 font-medium">{{ person.count }}회</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getAvatarUrl } from '~/shared/utils/avatar'

defineProps<{
  topPeople: Array<{ name: string; count: number }>
}>()
</script>

