import { defineStore } from 'pinia'
import type { Entry, Person, MoodValue, Mood } from '~/types'

interface DBEntry {
  id: string
  user_id: string
  date: string
  bullets: string[]
  events: string[] | null
  mood: { value: MoodValue; note?: string }
  people: Person[]
  tomorrow: string | null
  created_at: string
  updated_at: string
}

export const useEntriesStore = defineStore('entries', {
  state: () => ({
    entriesByDate: {} as Record<string, Entry>,
    isLoading: false,
    isInitialized: false,
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
     * Supabase에서 모든 엔트리 불러오기
     */
    async fetchEntries() {
      const supabase = useSupabaseClient()
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) {
        this.isInitialized = true
        return
      }
      
      this.isLoading = true
      
      const { data, error } = await (supabase as any)
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      if (error) {
        console.error('Failed to fetch entries:', error)
      } else if (data) {
        const entriesByDate: Record<string, Entry> = {}
        
        ;(data as unknown as DBEntry[]).forEach((row) => {
          entriesByDate[row.date] = {
            id: row.id,
            date: row.date,
            bullets: row.bullets || [],
            events: row.events || undefined,
            mood: row.mood as Mood,
            people: row.people || [],
            tomorrow: row.tomorrow || undefined,
            createdAt: new Date(row.created_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
          }
        })
        
        this.entriesByDate = entriesByDate
      }
      
      this.isLoading = false
      this.isInitialized = true
    },

    /**
     * 엔트리 생성 또는 업데이트 (Supabase upsert 사용)
     */
    async upsertEntry(entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry | null> {
      const supabase = useSupabaseClient()
      
      // Supabase auth에서 직접 사용자 정보 가져오기
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) {
        console.error('No authenticated user found')
        return null
      }
      
      const now = new Date().toISOString()
      
      const upsertPayload = {
        user_id: user.id,
        date: entry.date,
        bullets: entry.bullets,
        events: entry.events || null,
        mood: entry.mood,
        people: entry.people,
        tomorrow: entry.tomorrow || null,
        updated_at: now,
      }
      
      const { data, error } = await (supabase as any)
        .from('entries')
        .upsert(upsertPayload, {
          onConflict: 'user_id,date',
        })
        .select()
        .single()
      
      if (error) {
        console.error('Failed to upsert entry:', error)
        return null
      }
      
      const row = data as unknown as DBEntry
      const savedEntry: Entry = {
        id: row.id,
        date: row.date,
        bullets: row.bullets || [],
        events: row.events || undefined,
        mood: row.mood as Mood,
        people: row.people || [],
        tomorrow: row.tomorrow || undefined,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      }
      
      this.entriesByDate[entry.date] = savedEntry
      return savedEntry
    },

    /**
     * 엔트리 삭제
     */
    async deleteEntry(date: string): Promise<boolean> {
      const supabase = useSupabaseClient()
      
      // Supabase auth에서 직접 사용자 정보 가져오기
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) return false
      
      const existing = this.entriesByDate[date]
      if (!existing) return false
      
      const { error } = await (supabase as any)
        .from('entries')
        .delete()
        .eq('id', existing.id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Failed to delete entry:', error)
        return false
      }
      
      delete this.entriesByDate[date]
      return true
    },

    /**
     * 모든 엔트리 로드 (storage에서) - 레거시 호환
     */
    hydrate(entriesByDate: Record<string, Entry>): void {
      // 마이그레이션: string[] → Person[]
      const migrated: Record<string, Entry> = {}
      Object.entries(entriesByDate).forEach(([date, entry]) => {
        migrated[date] = {
          ...entry,
          people: entry.people.map((person) => {
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
