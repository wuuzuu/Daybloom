import { defineStore } from 'pinia'
import type { WeeklyNotes, WeeklyTodo } from '~/types'

interface DBWeeklyNote {
  id: string
  user_id: string
  week_start: string
  todos: WeeklyTodo[] | null
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
          weeklyNotesByWeekStart[row.week_start] = {
            todos: row.todos || undefined,
            // 레거시 필드도 유지
            highlights: row.reflection ? row.reflection.split('\n').filter(h => h.trim()) : undefined,
            nextExperiment: row.goals?.[0] || undefined,
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
      
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) return false
      
      const now = new Date().toISOString()
      
      const { error } = await (supabase as any)
        .from('weekly_notes')
        .upsert({
          user_id: user.id,
          week_start: weekStart,
          todos: payload.todos || null,
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
        ...this.weeklyNotesByWeekStart[weekStart],
        todos: payload.todos,
      }
      return true
    },

    /**
     * Todo 토글 (완료/미완료) - 낙관적 업데이트
     */
    async toggleTodo(weekStart: string, todoId: string): Promise<boolean> {
      const notes = this.weeklyNotesByWeekStart[weekStart]
      if (!notes?.todos) return false
      
      // 1. 즉시 로컬 상태 업데이트 (낙관적 업데이트)
      const updatedTodos = notes.todos.map(t => 
        t.id === todoId ? { ...t, completed: !t.completed } : t
      )
      this.weeklyNotesByWeekStart[weekStart] = { ...notes, todos: updatedTodos }
      
      // 2. 백그라운드에서 서버에 저장 (실패해도 UI는 이미 업데이트됨)
      const supabase = useSupabaseClient()
      const { data: { user } } = await (supabase as any).auth.getUser()
      
      if (!user?.id) return false
      
      const { error } = await (supabase as any)
        .from('weekly_notes')
        .upsert({
          user_id: user.id,
          week_start: weekStart,
          todos: updatedTodos,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,week_start',
        })
      
      if (error) {
        console.error('Failed to toggle todo:', error)
        // 실패시 롤백
        this.weeklyNotesByWeekStart[weekStart] = notes
        return false
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
