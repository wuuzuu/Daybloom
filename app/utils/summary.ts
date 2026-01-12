import type { Entry, WeeklySummary, MoodValue } from '~/types'
import { getDatesInRange } from './date'

/**
 * 주어진 엔트리들로부터 주간 요약을 생성
 */
export function buildWeeklySummary(
  entries: Entry[],
  weekStart: string,
  weekEnd: string
): WeeklySummary {
  // moodCounts 초기화
  const moodCounts: Record<MoodValue, number> = {
    great: 0,
    good: 0,
    okay: 0,
    bad: 0,
    awful: 0,
  }
  
  // people 카운트
  const peopleCount: Record<string, number> = {}
  
  entries.forEach((entry) => {
    // mood 카운트
    moodCounts[entry.mood.value] = (moodCounts[entry.mood.value] || 0) + 1
    
    // people 카운트
    entry.people.forEach((person) => {
      const name = typeof person === 'string' ? person : person.name
      peopleCount[name] = (peopleCount[name] || 0) + 1
    })
  })
  
  // topPeople 정렬 (상위 5개)
  const topPeople = Object.entries(peopleCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  return {
    weekStart,
    weekEnd,
    entryCount: entries.length,
    moodCounts,
    topPeople,
  }
}

