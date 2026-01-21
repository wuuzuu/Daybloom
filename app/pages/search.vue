<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-warm-800 dark:text-cream-100">🔍 검색</h1>
    </header>

    <!-- 검색 입력 -->
    <div class="card mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="기록, 이벤트, 사람, 기분을 검색하세요..."
          class="w-full bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 
                 text-warm-800 dark:text-cream-100 rounded-2xl px-4 py-3 pl-12 
                 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 
                 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
          @input="handleSearch"
        />
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-xl">
          🔍
        </span>
      </div>

      <!-- 필터 옵션 -->
      <div class="flex flex-wrap gap-2 mt-4">
        <button
          v-for="filter in filters"
          :key="filter.key"
          @click="toggleFilter(filter.key)"
          :class="[
            'px-4 py-1.5 rounded-xl text-sm transition-all',
            activeFilters.includes(filter.key)
              ? 'bg-lavender-500 text-white'
              : 'bg-cream-100 dark:bg-warm-600 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-500'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- 검색 결과 -->
    <div v-if="searchQuery.length > 0" class="space-y-4">
      <p class="text-sm text-warm-500 dark:text-warm-400">
        {{ searchResults.length }}개의 결과
      </p>

      <div v-if="searchResults.length === 0" class="card text-center py-12">
        <span class="text-4xl mb-3 block">😕</span>
        <p class="text-warm-500 dark:text-warm-400">검색 결과가 없어요</p>
        <p class="text-warm-400 dark:text-warm-500 text-sm mt-1">다른 키워드로 검색해보세요</p>
      </div>

      <div v-else class="space-y-3">
        <SearchResultCard
          v-for="result in searchResults"
          :key="result.entry.id"
          :result="result"
          @click="goToEntry(result.entry.date)"
        />
      </div>
    </div>

    <!-- 검색 전 상태 -->
    <div v-else class="card text-center py-12">
      <span class="text-5xl mb-4 block">✨</span>
      <p class="text-warm-600 dark:text-warm-300 font-medium">무엇을 찾고 계세요?</p>
      <p class="text-warm-400 dark:text-warm-500 text-sm mt-1">기록, 감정, 사람 등을 검색해보세요</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import { useProjectsStore } from '~/stores/projects'
import type { Entry } from '~/types'
import SearchResultCard from '~/components/Search/SearchResultCard.vue'

const router = useRouter()
const entriesStore = useEntriesStore()
const projectsStore = useProjectsStore()

const searchQuery = ref('')
const activeFilters = ref<string[]>(['notes', 'events', 'people', 'mood', 'crew'])

const filters = [
  { key: 'notes', label: '📝 Notes' },
  { key: 'events', label: '📅 Events' },
  { key: 'people', label: '👥 People' },
  { key: 'mood', label: '😊 Mood' },
  { key: 'crew', label: '🚀 Crew' },
]

interface SearchResult {
  entry: Entry
  matches: {
    type: 'notes' | 'events' | 'people' | 'mood' | 'crew'
    text: string
    highlight: string
  }[]
}

const searchResults = computed<SearchResult[]>(() => {
  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase().trim()
  const results: SearchResult[] = []
  const entries = Object.values(entriesStore.entriesByDate)

  for (const entry of entries) {
    const matches: SearchResult['matches'] = []

    if (activeFilters.value.includes('notes')) {
      for (const bullet of entry.bullets) {
        if (bullet.toLowerCase().includes(query)) {
          matches.push({
            type: 'notes',
            text: bullet,
            highlight: highlightText(bullet, query),
          })
        }
      }
    }

    if (activeFilters.value.includes('events') && entry.events) {
      for (const event of entry.events) {
        if (event.toLowerCase().includes(query)) {
          matches.push({
            type: 'events',
            text: event,
            highlight: highlightText(event, query),
          })
        }
      }
    }

    if (activeFilters.value.includes('people')) {
      for (const person of entry.people) {
        const personText = person.feeling 
          ? `${person.name} - ${person.feeling}`
          : person.name
        if (personText.toLowerCase().includes(query)) {
          matches.push({
            type: 'people',
            text: personText,
            highlight: highlightText(personText, query),
          })
        }
      }
    }

    if (activeFilters.value.includes('mood') && entry.mood.note) {
      if (entry.mood.note.toLowerCase().includes(query)) {
        matches.push({
          type: 'mood',
          text: entry.mood.note,
          highlight: highlightText(entry.mood.note, query),
        })
      }
    }

    // Crew 검색 (workItems의 project crew 및 title)
    if (activeFilters.value.includes('crew') && entry.workItems) {
      for (const workItem of entry.workItems) {
        const project = projectsStore.getProjectById(workItem.projectId)
        if (project) {
          const crewText = `[${project.crew}] ${project.title}`
          if (crewText.toLowerCase().includes(query) || project.crew.toLowerCase().includes(query)) {
            matches.push({
              type: 'crew',
              text: crewText,
              highlight: highlightText(crewText, query),
            })
          }
        }
      }
    }

    if (matches.length > 0) {
      results.push({ entry, matches })
    }
  }

  results.sort((a, b) => b.entry.date.localeCompare(a.entry.date))
  return results
})

const highlightText = (text: string, query: string): string => {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark class="bg-lavender-200 dark:bg-lavender-700 rounded px-0.5">$1</mark>')
}

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const toggleFilter = (key: string): void => {
  const index = activeFilters.value.indexOf(key)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(key)
  }
}

const handleSearch = (): void => {
  // 실시간 검색
}

const goToEntry = (date: string): void => {
  router.push(`/entry/${date}`)
}
</script>
