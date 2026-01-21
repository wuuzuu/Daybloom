export type MoodValue = 'great' | 'good' | 'okay' | 'bad' | 'awful'

export interface Mood {
  value: MoodValue
  note?: string
}

export interface Person {
  name: string
  feeling?: string // 그 사람이 한 행위에 대한 나의 심정/감상
  mood?: MoodValue // 그 사람에 대한 기분 (관계 맵에서 사용)
}

// 🆕 프로젝트 (진행 중인 작업)
export interface Project {
  id: string
  crew: string // 사용자 지정 크루명 (KCN, KWS 등)
  jiraLink?: string // 지라 티켓 전체 링크 (URL에서 티켓명 자동 추출)
  title: string // 작업 제목/설명
  notionLink?: string // 노션 링크
  status: 'active' | 'completed' | 'paused'
  createdAt: number
  updatedAt: number
}

// 🆕 일일 작업 기록
export interface WorkItem {
  projectId: string // 프로젝트 참조
  dailyNote?: string // 오늘 한 작업 내용
}

export interface Entry {
  id: string
  date: string // YYYY-MM-DD
  bullets: string[] // 최대 10개 정도
  events?: string[]
  mood: Mood
  people: Person[] // 사람 이름 + 감정
  tomorrow?: string
  workItems?: WorkItem[] // 🆕 오늘 작업한 프로젝트들
  createdAt: number // ms
  updatedAt: number // ms
}

export interface WeeklySummary {
  weekStart: string // YYYY-MM-DD, 월요일 시작 기준
  weekEnd: string
  entryCount: number
  moodCounts: Record<MoodValue, number>
  topPeople: Array<{ name: string; count: number }>
  highlights?: string[] // 사용자 입력 1~3개, optional
  nextExperiment?: string // optional
}

export interface WeeklyTodo {
  id: string
  text: string
  completed: boolean
}

export interface WeeklyNotes {
  todos?: WeeklyTodo[]
  // 레거시 필드 (마이그레이션용)
  highlights?: string[]
  nextExperiment?: string
  reflection?: string
  goals?: string[]
}

export interface StorageData {
  entriesByDate: Record<string, Entry>
  weeklyNotesByWeekStart: Record<string, WeeklyNotes>
}

