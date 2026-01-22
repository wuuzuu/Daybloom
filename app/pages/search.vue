<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-warm-800 dark:text-cream-100">🔍 검색</h1>
    </header>

    <!-- 검색 모드 토글 -->
    <div class="flex gap-2 mb-4">
      <button
        @click="switchToKeywordSearch"
        :class="[
          'flex-1 px-4 py-2.5 rounded-xl font-medium transition-all text-sm',
          !isSmartSearch
            ? 'bg-lavender-500 text-white'
            : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
        ]"
      >
        🔍 키워드 검색
      </button>
      <button
        @click="switchToSmartSearch"
        :class="[
          'flex-1 px-4 py-2.5 rounded-xl font-medium transition-all text-sm',
          isSmartSearch
            ? 'bg-gradient-to-r from-lavender-500 to-purple-500 text-white'
            : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
        ]"
      >
        ✨ 스마트 검색
      </button>
    </div>

    <!-- 검색 입력 -->
    <div class="card mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="isSmartSearch 
            ? '자연어로 검색하세요... (예: 지난달 KCN에서 버그 수정한 날)' 
            : '기록, 이벤트, 사람, 기분을 검색하세요...'"
          class="w-full bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 
                 text-warm-800 dark:text-cream-100 rounded-2xl px-4 py-3 pl-12 
                 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 
                 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
          :class="{ 'pr-24': isSmartSearch }"
          @input="handleSearch"
          @keydown.enter="handleEnterKey"
        />
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-xl">
          {{ isSmartSearch ? '✨' : '🔍' }}
        </span>
        
        <!-- 스마트 검색 버튼 -->
        <button
          v-if="isSmartSearch && searchQuery.trim()"
          @click="handleSmartSearch"
          :disabled="isSearching"
          class="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-lavender-500 text-white text-sm rounded-xl hover:bg-lavender-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSearching" class="inline-flex items-center gap-1">
            <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </span>
          <span v-else>검색</span>
        </button>
      </div>

      <!-- 필터 옵션 (키워드 검색 전용) -->
      <div v-if="!isSmartSearch" class="flex flex-wrap gap-2 mt-4">
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
      
      <!-- 스마트 검색 예시 -->
      <div v-else class="mt-4 space-y-2">
        <p class="text-xs text-warm-400 dark:text-warm-500">예시 검색어:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="example in smartSearchExamples"
            :key="example"
            @click="searchQuery = example; handleSmartSearch()"
            class="px-3 py-1.5 bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 rounded-lg text-xs hover:bg-lavender-100 dark:hover:bg-lavender-900/30 transition-all"
          >
            {{ example }}
          </button>
        </div>
      </div>
    </div>

    <!-- AI 검색 결과 설명 -->
    <div v-if="isSmartSearch && smartSearchExplanation" class="card mb-4 bg-lavender-50 dark:bg-lavender-900/20 border-lavender-200 dark:border-lavender-800">
      <p class="text-sm text-lavender-700 dark:text-lavender-300">
        <span class="font-medium">✨ AI:</span> {{ smartSearchExplanation }}
      </p>
    </div>

    <!-- 검색 결과 -->
    <div v-if="showResults" class="space-y-4">
      <p class="text-sm text-warm-500 dark:text-warm-400">
        {{ searchResults.length }}개의 결과
      </p>

      <div v-if="searchResults.length === 0 && !isSearching" class="card text-center py-12">
        <span class="text-4xl mb-3 block">😕</span>
        <p class="text-warm-500 dark:text-warm-400">검색 결과가 없어요</p>
        <p class="text-warm-400 dark:text-warm-500 text-sm mt-1">
          {{ isSmartSearch ? '다른 방식으로 질문해보세요' : '다른 키워드로 검색해보세요' }}
        </p>
      </div>

      <div v-else-if="searchResults.length > 0" class="space-y-3">
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
      <span class="text-5xl mb-4 block">{{ isSmartSearch ? '🤖' : '✨' }}</span>
      <p class="text-warm-600 dark:text-warm-300 font-medium">
        {{ isSmartSearch ? '자연어로 검색해보세요!' : '무엇을 찾고 계세요?' }}
      </p>
      <p class="text-warm-400 dark:text-warm-500 text-sm mt-1">
        {{ isSmartSearch ? '"지난달 KCN에서 작업한 날" 처럼 말해보세요' : '기록, 감정, 사람 등을 검색해보세요' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import { useProjectsStore } from '~/stores/projects'
import { useSearchStore } from '~/stores/search'
import type { Entry } from '~/types'
import SearchResultCard from '~/components/Search/SearchResultCard.vue'

const route = useRoute()
const router = useRouter()
const entriesStore = useEntriesStore()
const projectsStore = useProjectsStore()
const searchStore = useSearchStore()

const searchQuery = ref('')
const activeFilters = ref<string[]>(['notes', 'events', 'people', 'mood', 'crew'])

// 스마트 검색 상태
const isSmartSearch = ref(false)
const isSearching = ref(false)
const smartSearchDates = ref<string[]>([])
const smartSearchExplanation = ref('')

const smartSearchExamples = [
  '지난주 기분 좋았던 날',
  '버그 수정한 기록',
  '회의 참석한 날',
  '기분이 나빴던 이유',
]

// URL 쿼리에서 검색어 복원 + Pinia 캐시 복원
onMounted(() => {
  const q = route.query.q as string | undefined
  const mode = route.query.mode as string | undefined
  
  if (q) {
    searchQuery.value = q
  }
  if (mode === 'smart') {
    isSmartSearch.value = true
    // Pinia에서 캐시된 결과 복원 (API 재호출 없이)
    if (q && searchStore.hasCachedResult(q)) {
      smartSearchDates.value = [...searchStore.smartSearchDates]
      smartSearchExplanation.value = searchStore.smartSearchExplanation
    }
  }
})

// 검색어 변경 시 URL 업데이트
const updateQueryParams = () => {
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value
  }
  if (isSmartSearch.value) {
    query.mode = 'smart'
  }
  router.replace({ query })
}

// 결과 표시 여부
const showResults = computed(() => {
  if (isSmartSearch.value) {
    return smartSearchDates.value.length > 0 || (searchQuery.value.trim() && !isSearching.value && smartSearchExplanation.value)
  }
  return searchQuery.value.length > 0
})

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
  // 스마트 검색 결과
  if (isSmartSearch.value && smartSearchDates.value.length > 0) {
    const results: SearchResult[] = []
    for (const date of smartSearchDates.value) {
      const entry = entriesStore.entriesByDate[date]
      if (entry) {
        results.push({
          entry,
          matches: [{ type: 'notes', text: 'AI 검색 결과', highlight: 'AI 검색 결과' }]
        })
      }
    }
    return results
  }

  // 스마트 검색 모드인데 결과가 없으면 빈 배열
  if (isSmartSearch.value) return []

  // 일반 키워드 검색
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

// 키워드 검색 탭으로 전환
const switchToKeywordSearch = (): void => {
  isSmartSearch.value = false
  // 스마트 검색 결과 및 검색어 초기화
  searchQuery.value = ''
  smartSearchDates.value = []
  smartSearchExplanation.value = ''
  searchStore.clearSmartSearchResult()
  // URL 초기화
  router.replace({ query: {} })
}

// 스마트 검색 탭으로 전환
const switchToSmartSearch = (): void => {
  if (!isSmartSearch.value) {
    isSmartSearch.value = true
    updateQueryParams()
  }
}

const handleSearch = (): void => {
  // 키워드 검색은 실시간 (스마트 검색 모드가 아닐 때만 URL 업데이트)
  if (!isSmartSearch.value) {
    smartSearchDates.value = []
    smartSearchExplanation.value = ''
    // 디바운스 효과: 입력 완료 후 URL 업데이트
    updateQueryParams()
  }
  // 스마트 검색 모드에서는 버튼 클릭 시에만 URL 업데이트 (handleSmartSearch에서 처리)
}

// Enter 키 처리 (한글 IME 조합 중에는 무시)
const handleEnterKey = (event: KeyboardEvent): void => {
  // isComposing이 true면 한글 조합 중이므로 무시
  if (event.isComposing) return
  if (isSmartSearch.value) {
    handleSmartSearch()
  }
}

// 스마트 검색 실행
const handleSmartSearch = async (): Promise<void> => {
  if (!searchQuery.value.trim() || isSearching.value) return
  
  const currentQuery = searchQuery.value.trim() // 검색어 미리 저장
  isSearching.value = true
  smartSearchDates.value = []
  smartSearchExplanation.value = ''
  
  try {
    const entries = Object.values(entriesStore.entriesByDate).map(entry => ({
      date: entry.date,
      mood: entry.mood,
      bullets: entry.bullets,
      events: entry.events,
      people: entry.people,
      workItems: entry.workItems?.map(w => ({
        projectId: w.projectId,
        dailyNote: w.dailyNote,
        project: projectsStore.getProjectById(w.projectId),
      })),
    }))
    
    const response = await $fetch<{ success: boolean; dates: string[]; explanation: string }>('/api/ai/search', {
      method: 'POST',
      body: {
        query: searchQuery.value,
        entries,
      },
    })
    
    if (response.success) {
      smartSearchDates.value = response.dates
      smartSearchExplanation.value = response.explanation
      // Pinia에 결과 캐시 저장
      searchStore.setSmartSearchResult(currentQuery, response.dates, response.explanation)
      // 검색 성공 후 URL 업데이트 (currentQuery 사용)
      const query: Record<string, string> = { q: currentQuery, mode: 'smart' }
      router.replace({ query })
    }
  } catch (error: any) {
    console.error('Smart search error:', error)
    smartSearchExplanation.value = '검색 중 오류가 발생했습니다. 다시 시도해주세요.'
  } finally {
    isSearching.value = false
  }
}

const goToEntry = (date: string): void => {
  router.push(`/entry/${date}`)
}
</script>
