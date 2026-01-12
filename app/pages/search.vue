<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">검색</h1>

    <!-- 검색 입력 -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Notes, Events, People, Mood 내용을 검색하세요..."
          class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg placeholder-gray-400 dark:placeholder-gray-500"
          @input="handleSearch"
        />
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
          🔍
        </span>
      </div>
    </div>

    <!-- 필터 옵션 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="filter in filters"
        :key="filter.key"
        @click="toggleFilter(filter.key)"
        class="px-4 py-2 rounded-full text-sm transition-colors"
        :class="activeFilters.includes(filter.key)
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 검색 결과 -->
    <div v-if="searchQuery.length > 0" class="space-y-4">
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchResults.length }}개의 결과
      </p>

      <div v-if="searchResults.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
        검색 결과가 없습니다.
      </div>

      <div v-else class="space-y-4">
        <SearchResultCard
          v-for="result in searchResults"
          :key="result.entry.id"
          :result="result"
          @click="goToEntry(result.entry.date)"
        />
      </div>
    </div>

    <!-- 검색 전 상태 -->
    <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
      <p class="text-6xl mb-4">🔍</p>
      <p>검색어를 입력하세요</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import type { Entry } from '~/types'
import SearchResultCard from '~/components/Search/SearchResultCard.vue'

const router = useRouter()
const entriesStore = useEntriesStore()

const searchQuery = ref('')
const activeFilters = ref<string[]>(['notes', 'events', 'people', 'mood'])

const filters = [
  { key: 'notes', label: 'Notes' },
  { key: 'events', label: 'Events' },
  { key: 'people', label: 'People' },
  { key: 'mood', label: 'Mood' },
]

interface SearchResult {
  entry: Entry
  matches: {
    type: 'notes' | 'events' | 'people' | 'mood'
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

    // Notes 검색
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

    // Events 검색
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

    // People 검색
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

    // Mood 검색
    if (activeFilters.value.includes('mood') && entry.mood.note) {
      if (entry.mood.note.toLowerCase().includes(query)) {
        matches.push({
          type: 'mood',
          text: entry.mood.note,
          highlight: highlightText(entry.mood.note, query),
        })
      }
    }

    if (matches.length > 0) {
      results.push({ entry, matches })
    }
  }

  // 날짜 내림차순 정렬
  results.sort((a, b) => b.entry.date.localeCompare(a.entry.date))

  return results
})

function highlightText(text: string, query: string): string {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toggleFilter(key: string) {
  const index = activeFilters.value.indexOf(key)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(key)
  }
}

function handleSearch() {
  // 실시간 검색 (debounce 필요시 추가)
}

function goToEntry(date: string) {
  router.push(`/entry/${date}`)
}
</script>

