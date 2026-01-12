<script setup lang="ts">
import { ref, computed } from 'vue'
import MoodLineChart from '~/components/Chart/MoodLineChart.vue'
import { useEntriesStore } from '~/stores/entries'

const entriesStore = useEntriesStore()

// 기간 선택
const selectedDays = ref(30)
const daysOptions = [
  { value: 7, label: '7일' },
  { value: 14, label: '14일' },
  { value: 30, label: '30일' },
  { value: 60, label: '60일' },
  { value: 90, label: '90일' },
]

// 모든 entries 가져오기
const allEntries = computed(() => {
  return entriesStore.listEntries()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold dark:text-white">📈 기분 차트</h1>
      
      <!-- 기간 선택 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">기간:</span>
        <div class="flex gap-1">
          <button
            v-for="option in daysOptions"
            :key="option.value"
            @click="selectedDays = option.value"
            :class="[
              'px-3 py-1 text-sm rounded-full transition-colors',
              selectedDays === option.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 차트 -->
    <MoodLineChart 
      :entries="allEntries" 
      :days="selectedDays" 
    />
    
    <!-- 안내 문구 -->
    <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 class="font-medium text-blue-800 dark:text-blue-300 mb-2">💡 팁</h3>
      <ul class="text-sm text-blue-700 dark:text-blue-400 space-y-1">
        <li>• 매일 기분을 기록하면 더 정확한 추이를 볼 수 있어요.</li>
        <li>• 점을 호버하면 해당 날짜의 기분을 확인할 수 있어요.</li>
        <li>• 기분이 급격히 변한 날에는 무슨 일이 있었는지 확인해보세요.</li>
      </ul>
    </div>
  </div>
</template>

