import { defineStore } from 'pinia'
import type { Entry } from '~/types'
import { generateUUID } from '~/utils/uuid'

export const useEntriesStore = defineStore('entries', {
  state: () => ({
    entriesByDate: {} as Record<string, Entry>,
  }),

  getters: {
    /**
     * 날짜로 엔트리 조회
     */
    getEntryByDate: (state) => {
      return (date: string): Entry | undefined => {
        return state.entriesByDate[date]
      }
    },

    /**
     * 날짜 범위로 엔트리 목록 조회
     * from/to가 없으면 모든 엔트리 반환
     */
    listEntries: (state) => {
      return (options?: { from?: string; to?: string }): Entry[] => {
        const entries: Entry[] = Object.values(state.entriesByDate)
        
        // 날짜 범위가 지정된 경우 필터링
        if (options?.from || options?.to) {
          const fromDate = options.from ? new Date(options.from) : new Date('1970-01-01')
          const toDate = options.to ? new Date(options.to) : new Date('2099-12-31')
          
          const filtered = entries.filter((entry) => {
            const entryDate = new Date(entry.date)
            return entryDate >= fromDate && entryDate <= toDate
          })
          
          // 날짜순 정렬 (최신순)
          return filtered.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          })
        }
        
        // 날짜순 정렬 (최신순)
        return entries.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
      }
    },
  },

  actions: {
    /**
     * 엔트리 생성 또는 업데이트
     */
    upsertEntry(entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Entry {
      const existing = this.entriesByDate[entry.date]
      const now = Date.now()
      
      if (existing) {
        // 업데이트
        const updated: Entry = {
          ...existing,
          ...entry,
          updatedAt: now,
        }
        this.entriesByDate[entry.date] = updated
        return updated
      } else {
        // 생성
        const newEntry: Entry = {
          ...entry,
          id: generateUUID(),
          createdAt: now,
          updatedAt: now,
        }
        this.entriesByDate[entry.date] = newEntry
        return newEntry
      }
    },

    /**
     * 엔트리 삭제
     */
    deleteEntry(date: string): void {
      delete this.entriesByDate[date]
    },

    /**
     * 모든 엔트리 로드 (storage에서)
     * 기존 string[] 형태의 people을 Person[]로 마이그레이션
     */
    hydrate(entriesByDate: Record<string, Entry>): void {
      // 마이그레이션: string[] → Person[]
      const migrated: Record<string, Entry> = {}
      Object.entries(entriesByDate).forEach(([date, entry]) => {
        migrated[date] = {
          ...entry,
          people: entry.people.map((person) => {
            // 이미 Person 형태면 그대로, string이면 변환
            if (typeof person === 'string') {
              return { name: person }
            }
            return person
          }),
        }
      })
      this.entriesByDate = migrated
    },
  },
})

