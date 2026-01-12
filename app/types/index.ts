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

export interface Entry {
  id: string
  date: string // YYYY-MM-DD
  bullets: string[] // 최대 10개 정도
  events?: string[]
  mood: Mood
  people: Person[] // 사람 이름 + 감정
  tomorrow?: string
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

export interface WeeklyNotes {
  highlights: string[]
  nextExperiment: string
}

export interface StorageData {
  entriesByDate: Record<string, Entry>
  weeklyNotesByWeekStart: Record<string, WeeklyNotes>
}

