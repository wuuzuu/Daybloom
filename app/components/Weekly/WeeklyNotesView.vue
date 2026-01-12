<template>
  <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold dark:text-white">이번 주 노트</h2>
      <button
        @click="$emit('edit')"
        class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
      >
        수정
      </button>
    </div>
    
    <div class="space-y-4">
      <!-- Highlights -->
      <div v-if="highlights && highlights.length > 0">
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Highlights</h3>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <ul class="space-y-2">
            <li
              v-for="(highlight, index) in highlights"
              :key="index"
              class="flex items-start"
            >
              <span class="text-gray-400 mr-2">•</span>
              <span class="text-gray-900 dark:text-gray-100">{{ highlight }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Next Experiment -->
      <div v-if="nextExperiment">
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Next Experiment</h3>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p class="text-gray-900 dark:text-gray-100 whitespace-pre-line">{{ nextExperiment }}</p>
        </div>
      </div>

      <div v-if="!highlights?.length && !nextExperiment" class="text-gray-500 dark:text-gray-400 text-center py-4">
        노트가 없습니다.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  highlights?: string[]
  nextExperiment?: string
}>()

defineEmits<{
  edit: []
}>()
</script>

