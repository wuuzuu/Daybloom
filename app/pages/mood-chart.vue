<script setup lang="ts">
import { ref, computed } from 'vue'
import MoodLineChart from '~/components/Chart/MoodLineChart.vue'
import { useEntriesStore } from '~/stores/entries'

const entriesStore = useEntriesStore()

const selectedDays = ref(30)
const daysOptions = [
  { value: 7, label: '7일' },
  { value: 14, label: '14일' },
  { value: 30, label: '30일' },
  { value: 60, label: '60일' },
  { value: 90, label: '90일' },
]

const allEntries = computed(() => {
  return entriesStore.listEntries()
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-warm-800 dark:text-cream-100 mb-4">📈 기분 차트</h1>
      
      <!-- 기간 선택 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-warm-500 dark:text-warm-400">기간:</span>
        <div class="flex gap-1 flex-wrap">
          <button
            v-for="option in daysOptions"
            :key="option.value"
            @click="selectedDays = option.value"
            :class="[
              'px-3 py-1.5 text-sm rounded-xl transition-all',
              selectedDays === option.value
                ? 'bg-lavender-500 text-white shadow-sm'
                : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </header>
    
    <!-- 차트 -->
    <div class="card mb-6">
      <MoodLineChart 
        :entries="allEntries" 
        :days="selectedDays" 
      />
    </div>
    
    <!-- 안내 문구 -->
    <div class="card bg-lavender-50 dark:bg-lavender-900/20 border-lavender-200 dark:border-lavender-800">
      <h3 class="font-medium text-lavender-700 dark:text-lavender-300 mb-2">💡 팁</h3>
      <ul class="text-sm text-lavender-600 dark:text-lavender-400 space-y-1">
        <li>• 매일 기분을 기록하면 더 정확한 추이를 볼 수 있어요.</li>
        <li>• 점을 호버하면 해당 날짜의 기분을 확인할 수 있어요.</li>
        <li>• 기분이 급격히 변한 날에는 무슨 일이 있었는지 확인해보세요.</li>
      </ul>
    </div>
  </div>
</template>
