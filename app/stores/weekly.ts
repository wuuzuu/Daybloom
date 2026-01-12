import { defineStore } from 'pinia'
import type { WeeklyNotes } from '~/types'

export const useWeeklyStore = defineStore('weekly', {
  state: () => ({
    weeklyNotesByWeekStart: {} as Record<string, WeeklyNotes>,
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
     * 주간 노트 설정
     */
    setWeeklyNotes(weekStart: string, payload: WeeklyNotes): void {
      this.weeklyNotesByWeekStart[weekStart] = payload
    },

    /**
     * 주간 노트 로드 (storage에서)
     */
    hydrate(weeklyNotesByWeekStart: Record<string, WeeklyNotes>): void {
      this.weeklyNotesByWeekStart = weeklyNotesByWeekStart
    },
  },
})

