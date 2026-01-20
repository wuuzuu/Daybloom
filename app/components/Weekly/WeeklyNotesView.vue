<template>
  <section class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-warm-800 dark:text-cream-100">📝 이번 주 노트</h2>
      <button
        @click="$emit('edit')"
        class="text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300 text-sm font-medium transition-colors"
      >
        ✏️ 수정
      </button>
    </div>
    
    <div class="space-y-4">
      <!-- Highlights -->
      <div v-if="highlights && highlights.length > 0">
        <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-2">✨ Highlights</h3>
        <div class="bg-cream-50 dark:bg-warm-700 rounded-2xl p-4">
          <ul class="space-y-2">
            <li
              v-for="(highlight, index) in highlights"
              :key="index"
              class="flex items-start"
            >
              <span class="text-lavender-400 dark:text-lavender-500 mr-2">•</span>
              <span class="text-warm-800 dark:text-cream-100">{{ highlight }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Next Experiment -->
      <div v-if="nextExperiment">
        <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-2">🔬 Next Experiment</h3>
        <div class="bg-cream-50 dark:bg-warm-700 rounded-2xl p-4">
          <p class="text-warm-800 dark:text-cream-100 whitespace-pre-line">{{ nextExperiment }}</p>
        </div>
      </div>

      <div v-if="!highlights?.length && !nextExperiment" class="text-warm-500 dark:text-warm-400 text-center py-4">
        <span class="text-2xl block mb-2">📭</span>
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

