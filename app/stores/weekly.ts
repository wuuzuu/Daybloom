import { defineStore } from 'pinia'
import type { WeeklyNotes } from '~/types'

interface DBWeeklyNote {
  id: string
  user_id: string
  week_start: string
  reflection: string | null
  goals: string[] | null
  created_at: string
  updated_at: string
}

export const useWeeklyStore = defineStore('weekly', {
  state: () => ({
    weeklyNotesByWeekStart: {} as Record<string, WeeklyNotes>,
    isLoading: false,
    isInitialized: false,
  }),

  getters: {
    /**
     * 주간 시작일로 주간 노트 조회
     */
    getWeeklyNotes: (state) => {
      return (weekStart: string): WeeklyNotes | undefined => {
        return state.weeklyNotesByWeekStart[weekStart]
      }
    },
  },

  actions: {
    /**
     * Supabase에서 모든 주간 노트 불러오기
     */
    async fetchWeeklyNotes() {
      const supabase = useSupabaseClient()
      
      // Supabase auth에서 직접 사용자 정보 가져오기
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) {
        this.isInitialized = true
        return
      }
      
      this.isLoading = true
      
      const { data, error } = await (supabase as any)
        .from('weekly_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
      
      if (error) {
        console.error('Failed to fetch weekly notes:', error)
      } else if (data) {
        const weeklyNotesByWeekStart: Record<string, WeeklyNotes> = {}
        
        data.forEach((row: DBWeeklyNote) => {
          // DB 필드 -> 앱 필드 매핑
          // reflection (줄바꿈 문자열) -> highlights (배열)
          // goals (배열) -> nextExperiment (첫번째 요소)
          const highlights = row.reflection ? row.reflection.split('\n').filter(h => h.trim()) : undefined
          const nextExperiment = row.goals?.[0] || undefined
          
          weeklyNotesByWeekStart[row.week_start] = {
            highlights,
            nextExperiment,
            reflection: row.reflection || undefined,
            goals: row.goals || undefined,
          }
        })
        
        this.weeklyNotesByWeekStart = weeklyNotesByWeekStart
      }
      
      this.isLoading = false
      this.isInitialized = true
    },

    /**
     * 주간 노트 저장
     */
    async setWeeklyNotes(weekStart: string, payload: WeeklyNotes): Promise<boolean> {
      const supabase = useSupabaseClient()
      
      // Supabase auth에서 직접 사용자 정보 가져오기
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) return false
      
      const now = new Date().toISOString()
      
      // highlights -> reflection (배열을 줄바꿈으로 연결)
      // nextExperiment -> goals (문자열을 배열로)
      const reflection = payload.highlights?.join('\n') || payload.reflection || null
      const goals = payload.nextExperiment 
        ? [payload.nextExperiment] 
        : (payload.goals || null)
      
      // upsert 사용 (있으면 업데이트, 없으면 삽입)
      const { error } = await (supabase as any)
        .from('weekly_notes')
        .upsert({
          user_id: user.id,
          week_start: weekStart,
          reflection,
          goals,
          updated_at: now,
        }, {
          onConflict: 'user_id,week_start',
        })
      
      if (error) {
        console.error('Failed to save weekly notes:', error)
        return false
      }
      
      // 로컬 상태도 업데이트
      this.weeklyNotesByWeekStart[weekStart] = {
        highlights: payload.highlights || (reflection ? reflection.split('\n') : undefined),
        nextExperiment: payload.nextExperiment || (goals?.[0] ?? undefined),
        reflection: reflection || undefined,
        goals: goals || undefined,
      }
      return true
    },

    /**
     * 주간 노트 로드 (storage에서) - 레거시 호환
     */
    hydrate(weeklyNotesByWeekStart: Record<string, WeeklyNotes>): void {
      this.weeklyNotesByWeekStart = weeklyNotesByWeekStart
    },
  },
})
