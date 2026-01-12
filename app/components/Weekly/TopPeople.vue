<template>
  <section v-if="topPeople.length > 0" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4 dark:text-white">자주 만난 사람</h2>
    <div class="space-y-2">
      <div
        v-for="person in topPeople"
        :key="person.name"
        class="flex justify-between items-center"
      >
        <span class="dark:text-gray-200">{{ person.name }}</span>
        <span class="text-gray-600 dark:text-gray-400">{{ person.count }}회</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  topPeople: Array<{ name: string; count: number }>
}>()
</script>

