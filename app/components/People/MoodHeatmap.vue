<script setup lang="ts">
import { computed } from 'vue'
import type { Entry, Person, MoodValue } from '~/types'
import { getAvatarUrl } from '~/shared/utils/avatar'

const props = defineProps<{
  entries: Entry[]
}>()

// 사람 이름 추출 헬퍼
const getPersonName = (person: Person | string): string => {
  return typeof person === 'string' ? person : person.name
}

// 기분 종류
const moodTypes: MoodValue[] = ['great', 'good', 'okay', 'bad', 'awful']

const moodLabels: Record<MoodValue, string> = {
  great: '최고',
  good: '좋음',
  okay: '보통',
  bad: '나쁨',
  awful: '최악',
}

const moodEmojis: Record<MoodValue, string> = {
  great: '😊',
  good: '🙂',
  okay: '😐',
  bad: '😕',
  awful: '😢',
}

const moodColors: Record<MoodValue, string> = {
  great: 'bg-green-400',
  good: 'bg-sky-400',
  okay: 'bg-yellow-400',
  bad: 'bg-orange-400',
  awful: 'bg-red-400',
}

const moodBgColors: Record<MoodValue, string> = {
  great: 'bg-green-100 dark:bg-green-900/30',
  good: 'bg-sky-100 dark:bg-sky-900/30',
  okay: 'bg-yellow-100 dark:bg-yellow-900/30',
  bad: 'bg-orange-100 dark:bg-orange-900/30',
  awful: 'bg-red-100 dark:bg-red-900/30',
}

// 사람별 기분 분포 계산
const peopleHeatmapData = computed(() => {
  const data = new Map<string, Record<MoodValue, number>>()
  
  props.entries.forEach(entry => {
    entry.people.forEach(person => {
      const name = getPersonName(person)
      
      if (!data.has(name)) {
        data.set(name, { great: 0, good: 0, okay: 0, bad: 0, awful: 0 })
      }
      
      // 사람별 mood가 있으면 사용, 없으면 그날 전체 mood 사용
      const mood = (typeof person !== 'string' && person.mood) 
        ? person.mood 
        : entry.mood.value
      
      const counts = data.get(name)!
      counts[mood]++
    })
  })
  
  // 총 기록 수로 정렬
  return Array.from(data.entries())
    .map(([name, counts]) => ({
      name,
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.total - a.total)
})

// 최대값 (히트맵 강도 계산용)
const maxCount = computed(() => {
  let max = 1
  peopleHeatmapData.value.forEach(person => {
    Object.values(person.counts).forEach(count => {
      if (count > max) max = count
    })
  })
  return max
})

// 히트맵 셀 스타일 계산
const getCellOpacity = (count: number): number => {
  if (count === 0) return 0
  return 0.3 + (count / maxCount.value) * 0.7
}
</script>

<template>
  <div class="space-y-4">
    <!-- 범례 -->
    <div class="flex flex-wrap items-center gap-4 text-sm">
      <span class="text-warm-600 dark:text-warm-400">범례:</span>
      <div 
        v-for="mood in moodTypes" 
        :key="mood"
        class="flex items-center gap-1"
      >
        <div :class="[moodColors[mood], 'w-4 h-4 rounded-lg']"></div>
        <span class="text-warm-600 dark:text-warm-400">{{ moodEmojis[mood] }} {{ moodLabels[mood] }}</span>
      </div>
    </div>
    
    <!-- 히트맵 테이블 -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="text-left p-2 text-sm font-medium text-warm-600 dark:text-warm-400 w-40">사람</th>
            <th 
              v-for="mood in moodTypes" 
              :key="mood"
              class="p-2 text-center text-sm font-medium text-warm-600 dark:text-warm-400 w-20"
            >
              {{ moodEmojis[mood] }}
            </th>
            <th class="p-2 text-center text-sm font-medium text-warm-600 dark:text-warm-400 w-16">총계</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="person in peopleHeatmapData" 
            :key="person.name"
            class="border-t border-cream-200 dark:border-warm-600"
          >
            <!-- 사람 이름 -->
            <td class="p-2">
              <div class="flex items-center gap-2">
                <img 
                  :src="getAvatarUrl(person.name, 'lorelei')"
                  :alt="person.name"
                  class="w-8 h-8 rounded-full bg-cream-100 dark:bg-warm-600"
                />
                <span class="text-sm text-warm-800 dark:text-cream-100 truncate">{{ person.name }}</span>
              </div>
            </td>
            
            <!-- 기분별 셀 -->
            <td 
              v-for="mood in moodTypes" 
              :key="mood"
              class="p-1 text-center"
            >
              <div 
                :class="[
                  'w-full h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all',
                  person.counts[mood] > 0 ? moodBgColors[mood] : 'bg-cream-50 dark:bg-warm-700'
                ]"
                :style="person.counts[mood] > 0 ? { opacity: getCellOpacity(person.counts[mood]) } : {}"
                :title="`${moodLabels[mood]}: ${person.counts[mood]}회`"
              >
                <span v-if="person.counts[mood] > 0" class="text-warm-700 dark:text-cream-200">
                  {{ person.counts[mood] }}
                </span>
                <span v-else class="text-warm-300 dark:text-warm-600">-</span>
              </div>
            </td>
            
            <!-- 총계 -->
            <td class="p-2 text-center">
              <span class="text-sm font-medium text-lavender-600 dark:text-lavender-400">{{ person.total }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 빈 상태 -->
    <div 
      v-if="peopleHeatmapData.length === 0"
      class="text-center py-8 text-warm-500 dark:text-warm-400"
    >
      <p class="text-lg mb-2">🎨</p>
      <p>표시할 데이터가 없습니다.</p>
      <p class="text-sm">Entry에서 사람을 추가해보세요!</p>
    </div>
    
    <!-- 도움말 -->
    <p class="text-xs text-warm-500 dark:text-warm-400 text-center">
      💡 색상이 진할수록 해당 기분으로 더 많이 기록됨
    </p>
  </div>
</template>

