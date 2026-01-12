<template>
  <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4 dark:text-white">이번 주 노트</h2>
    
    <div class="space-y-4">
      <!-- Highlights -->
      <div>
        <label for="highlights" class="block text-sm font-medium mb-2 dark:text-gray-200">
          Highlights (1~3개, 줄바꿈으로 구분)
        </label>
        <textarea
          id="highlights"
          v-model="highlightsText"
          rows="4"
          class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          placeholder="이번 주 하이라이트를 입력하세요..."
        />
      </div>

      <!-- Next Experiment -->
      <div>
        <label for="nextExperiment" class="block text-sm font-medium mb-2 dark:text-gray-200">
          Next Experiment
        </label>
        <textarea
          id="nextExperiment"
          v-model="nextExperiment"
          rows="3"
          class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          placeholder="다음 주 시도해볼 것을 입력하세요..."
        />
      </div>

      <button
        @click="handleSave"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        노트 저장
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  initialHighlights?: string[]
  initialNextExperiment?: string
}>()

const emit = defineEmits<{
  save: [data: { highlights: string[]; nextExperiment: string }]
}>()

const highlightsText = ref(props.initialHighlights?.join('\n') || '')
const nextExperiment = ref(props.initialNextExperiment || '')

watch(
  () => [props.initialHighlights, props.initialNextExperiment],
  ([highlights, experiment]) => {
    highlightsText.value = highlights?.join('\n') || ''
    nextExperiment.value = experiment || ''
  }
)

function parseHighlights(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 3)
}

function handleSave() {
  const highlights = parseHighlights(highlightsText.value)
  
  emit('save', {
    highlights,
    nextExperiment: nextExperiment.value.trim(),
  })
}
</script>

