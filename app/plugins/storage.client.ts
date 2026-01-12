import type { StorageData } from '~/types'
import { useEntriesStore } from '~/stores/entries'
import { useWeeklyStore } from '~/stores/weekly'

const STORAGE_KEY = 'trace-app-data'
const DEBOUNCE_MS = 300

let saveTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Storage adapter - localStorage 기반
 * 나중에 IndexedDB로 교체 가능하도록 adapter 패턴으로 분리
 */
class StorageAdapter {
  /**
   * 모든 데이터 로드
   */
  async loadAll(): Promise<StorageData> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return this.getEmptyData()
      }
      
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return this.getEmptyData()
      }
      
      const data = JSON.parse(stored) as StorageData
      return {
        entriesByDate: data.entriesByDate || {},
        weeklyNotesByWeekStart: data.weeklyNotesByWeekStart || {},
      }
    } catch (error) {
      console.warn('Failed to load storage data:', error)
      return this.getEmptyData()
    }
  }

  /**
   * 모든 데이터 저장 (debounced)
   */
  async saveAll(payload: StorageData): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    
    // 기존 타이머 취소
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
    
    // Debounce 저장
    saveTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch (error) {
        console.warn('Failed to save storage data:', error)
      }
      saveTimer = null
    }, DEBOUNCE_MS)
  }

  /**
   * 빈 데이터 구조 반환
   */
  private getEmptyData(): StorageData {
    return {
      entriesByDate: {},
      weeklyNotesByWeekStart: {},
    }
  }
}

const adapter = new StorageAdapter()

export default defineNuxtPlugin(async () => {
  // 앱 시작 시 storage 로드 → store hydrate
  const entriesStore = useEntriesStore()
  const weeklyStore = useWeeklyStore()
  
  try {
    const data = await adapter.loadAll()
    entriesStore.hydrate(data.entriesByDate)
    weeklyStore.hydrate(data.weeklyNotesByWeekStart)
  } catch (error) {
    console.warn('Failed to hydrate stores from storage:', error)
  }

  // store 변경 감지하여 자동 저장
  const saveToStorage = () => {
    adapter.saveAll({
      entriesByDate: entriesStore.entriesByDate,
      weeklyNotesByWeekStart: weeklyStore.weeklyNotesByWeekStart,
    })
  }
  
  // entries 변경 감지
  entriesStore.$subscribe(saveToStorage)
  
  // weekly 변경 감지
  weeklyStore.$subscribe(saveToStorage)
})

// TODO: 다음 단계
// - IndexedDB로 마이그레이션 (더 큰 데이터 용량 지원)
// - 검색 기능 (엔트리 내용, 태그 검색)
// - 자동화 (리마인더, 템플릿, 자동 태그 추출)

