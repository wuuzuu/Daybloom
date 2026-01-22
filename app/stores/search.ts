import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  // 검색 상태
  const query = ref('')
  const isSmartSearch = ref(false)
  
  // 스마트 검색 결과 캐시
  const smartSearchDates = ref<string[]>([])
  const smartSearchExplanation = ref('')
  const cachedQuery = ref('') // 캐시된 검색어 (결과가 이 검색어에 대한 것인지 확인용)
  
  // 스마트 검색 결과 저장
  const setSmartSearchResult = (searchQuery: string, dates: string[], explanation: string) => {
    cachedQuery.value = searchQuery
    smartSearchDates.value = dates
    smartSearchExplanation.value = explanation
  }
  
  // 캐시된 결과가 현재 검색어와 일치하는지 확인
  const hasCachedResult = (searchQuery: string): boolean => {
    return cachedQuery.value === searchQuery && cachedQuery.value !== ''
  }
  
  // 검색 상태 초기화
  const clearSmartSearchResult = () => {
    smartSearchDates.value = []
    smartSearchExplanation.value = ''
    cachedQuery.value = ''
  }
  
  return {
    query,
    isSmartSearch,
    smartSearchDates,
    smartSearchExplanation,
    cachedQuery,
    setSmartSearchResult,
    hasCachedResult,
    clearSmartSearchResult,
  }
})
