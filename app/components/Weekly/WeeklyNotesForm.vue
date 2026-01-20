<template>
  <section class="card">
    <h2 class="text-lg font-semibold mb-4 text-warm-800 dark:text-cream-100">📝 이번 주 노트</h2>
    
    <div class="space-y-4">
      <!-- Highlights -->
      <div>
        <label for="highlights" class="block text-sm font-medium mb-2 text-warm-700 dark:text-cream-200">
          ✨ Highlights (1~3개, 줄바꿈으로 구분)
        </label>
        <textarea
          id="highlights"
          v-model="highlightsText"
          rows="4"
          class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 resize-none transition-all"
          placeholder="이번 주 하이라이트를 입력하세요..."
        />
      </div>

      <!-- Next Experiment -->
      <div>
        <label for="nextExperiment" class="block text-sm font-medium mb-2 text-warm-700 dark:text-cream-200">
          🔬 Next Experiment
        </label>
        <textarea
          id="nextExperiment"
          v-model="nextExperiment"
          rows="3"
          class="w-full border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 resize-none transition-all"
          placeholder="다음 주 시도해볼 것을 입력하세요..."
        />
      </div>

      <button
        @click="handleSave"
        class="btn-primary w-full py-4 text-base"
      >
        ✨ 노트 저장
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

