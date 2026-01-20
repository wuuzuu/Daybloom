/**
 * Storage plugin - Supabase로 마이그레이션 완료
 * 
 * 이전에는 localStorage를 사용했지만, 이제 Supabase에서 데이터를 관리합니다.
 * 로컬스토리지 데이터 정리만 수행합니다.
 */

const STORAGE_KEY = 'trace-app-data'

export default defineNuxtPlugin(() => {
  // 기존 로컬스토리지 데이터 정리 (한 번만 실행)
  if (typeof window !== 'undefined' && window.localStorage) {
    const oldData = window.localStorage.getItem(STORAGE_KEY)
    if (oldData) {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }
  
  // 이제 Supabase가 데이터를 관리하므로 추가 작업 없음
  // entries와 weekly 데이터는 app.vue에서 fetchEntries/fetchWeeklyNotes로 로드됨
})

