<script setup lang="ts">
import { ref, computed } from 'vue'
import NetworkGraph from '~/components/People/NetworkGraph.vue'
import MoodHeatmap from '~/components/People/MoodHeatmap.vue'
import { useEntriesStore } from '~/stores/entries'
import { getAvatarUrl } from '~/utils/avatar'
import type { Person } from '~/types'

const entriesStore = useEntriesStore()

const filterOptions = [
  { value: 7, label: '7일' },
  { value: 30, label: '30일' },
  { value: 90, label: '90일' },
  { value: 0, label: '전체' },
]
const selectedFilter = ref(0)

const allEntries = computed(() => entriesStore.listEntries())

const filteredEntries = computed(() => {
  if (selectedFilter.value === 0) return allEntries.value
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - selectedFilter.value)
  const cutoffStr = cutoffDate.toISOString().split('T')[0] || ''
  
  return allEntries.value.filter(entry => entry.date >= cutoffStr)
})

const getPersonName = (person: Person | string): string => {
  return typeof person === 'string' ? person : person.name
}

const topPeople = computed(() => {
  const counts = new Map<string, number>()
  
  allEntries.value.forEach(entry => {
    entry.people.forEach(person => {
      const name = getPersonName(person)
      counts.set(name, (counts.get(name) || 0) + 1)
    })
  })
  
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))
})

const recentPeople = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0] || ''
  
  const counts = new Map<string, { count: number; lastDate: string }>()
  
  allEntries.value.forEach(entry => {
    if (entry.date >= thirtyDaysAgoStr) {
      entry.people.forEach(person => {
        const name = getPersonName(person)
        const existing = counts.get(name)
        if (!existing || entry.date > existing.lastDate) {
          counts.set(name, { count: (existing?.count || 0) + 1, lastDate: entry.date })
        } else {
          counts.set(name, { ...existing, count: existing.count + 1 })
        }
      })
    }
  })
  
  return Array.from(counts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, data]) => ({ name, ...data }))
})

const newPeopleThisWeek = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0] || ''
  
  const allPeopleBefore = new Set<string>()
  const newPeople = new Set<string>()
  
  allEntries.value.forEach(entry => {
    entry.people.forEach(person => {
      const name = getPersonName(person)
      if (entry.date < oneWeekAgoStr) {
        allPeopleBefore.add(name)
      }
    })
  })
  
  allEntries.value.forEach(entry => {
    if (entry.date >= oneWeekAgoStr) {
      entry.people.forEach(person => {
        const name = getPersonName(person)
        if (!allPeopleBefore.has(name)) {
          newPeople.add(name)
        }
      })
    }
  })
  
  return Array.from(newPeople)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-warm-800 dark:text-cream-100">👥 관계 맵</h1>
    </header>
    
    <!-- 통계 카드들 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- 가장 자주 만난 사람 Top 5 -->
      <div class="card">
        <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">🏆 자주 만난 사람</h3>
        <div class="space-y-2">
          <div
            v-for="(person, index) in topPeople"
            :key="person.name"
            class="flex items-center gap-3"
          >
            <span class="text-lg">{{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '　' }}</span>
            <img 
              :src="getAvatarUrl(person.name, 'lorelei')"
              :alt="person.name"
              class="w-8 h-8 rounded-full bg-cream-100 dark:bg-warm-700"
            />
            <span class="flex-1 text-sm text-warm-700 dark:text-warm-200 truncate">{{ person.name }}</span>
            <span class="text-xs text-warm-400 dark:text-warm-500">{{ person.count }}회</span>
          </div>
          <p v-if="topPeople.length === 0" class="text-sm text-warm-400 dark:text-warm-500 text-center py-2">
            기록이 없어요
          </p>
        </div>
      </div>
      
      <!-- 최근 30일 만난 사람 -->
      <div class="card">
        <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">📅 최근 30일</h3>
        <div class="space-y-2">
          <div
            v-for="person in recentPeople.slice(0, 5)"
            :key="person.name"
            class="flex items-center gap-3"
          >
            <img 
              :src="getAvatarUrl(person.name, 'lorelei')"
              :alt="person.name"
              class="w-8 h-8 rounded-full bg-cream-100 dark:bg-warm-700"
            />
            <span class="flex-1 text-sm text-warm-700 dark:text-warm-200 truncate">{{ person.name }}</span>
            <span class="text-xs text-warm-400 dark:text-warm-500">{{ person.count }}회</span>
          </div>
          <p v-if="recentPeople.length === 0" class="text-sm text-warm-400 dark:text-warm-500 text-center py-2">
            기록이 없어요
          </p>
          <p v-else-if="recentPeople.length > 5" class="text-xs text-warm-400 dark:text-warm-500 text-center">
            +{{ recentPeople.length - 5 }}명 더
          </p>
        </div>
      </div>
      
      <!-- 이번 주 새로 만난 사람 -->
      <div class="card">
        <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">✨ 이번 주 새로운 사람</h3>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="name in newPeopleThisWeek"
            :key="name"
            class="flex items-center gap-2 bg-lavender-50 dark:bg-lavender-900/20 px-3 py-1.5 rounded-full"
          >
            <img 
              :src="getAvatarUrl(name, 'lorelei')"
              :alt="name"
              class="w-6 h-6 rounded-full bg-cream-100 dark:bg-warm-700"
            />
            <span class="text-sm text-lavender-600 dark:text-lavender-400">{{ name }}</span>
          </div>
          <p v-if="newPeopleThisWeek.length === 0" class="text-sm text-warm-400 dark:text-warm-500 w-full text-center py-2">
            새로운 사람 없음
          </p>
        </div>
      </div>
    </div>
    
    <!-- 네트워크 그래프 -->
    <section class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 class="text-lg font-semibold text-warm-700 dark:text-cream-200">네트워크 그래프</h2>
          <p class="text-sm text-warm-500 dark:text-warm-400">
            노드를 드래그하거나 줌/패닝할 수 있어요
          </p>
        </div>
        
        <!-- 기간 필터 -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-warm-500 dark:text-warm-400">기간:</span>
          <div class="flex gap-1">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              @click="selectedFilter = option.value"
              :class="[
                'px-3 py-1.5 text-sm rounded-xl transition-all',
                selectedFilter === option.value
                  ? 'bg-lavender-500 text-white'
                  : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
      
      <p class="text-xs text-warm-400 dark:text-warm-500 mb-2">
        {{ filteredEntries.length }}개의 기록에서 {{ new Set(filteredEntries.flatMap(e => e.people.map(p => typeof p === 'string' ? p : p.name))).size }}명 표시 중
      </p>
      
      <div class="card p-0 overflow-hidden">
        <NetworkGraph :entries="filteredEntries" />
      </div>
    </section>
    
    <!-- 감정 히트맵 -->
    <section>
      <h2 class="text-lg font-semibold text-warm-700 dark:text-cream-200 mb-2">🎨 감정 히트맵</h2>
      <p class="text-sm text-warm-500 dark:text-warm-400 mb-4">
        각 사람과 함께했을 때의 기분 분포예요
      </p>
      <div class="card">
        <MoodHeatmap :entries="filteredEntries" />
      </div>
    </section>
  </div>
</template>
