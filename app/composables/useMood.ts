import type { MoodValue } from '~/types'

/**
 * Mood 관련 유틸리티 composable
 */
export function useMood() {
  const getMoodLabel = (value: MoodValue): string => {
    const labels: Record<MoodValue, string> = {
      great: '최고',
      good: '좋음',
      okay: '보통',
      bad: '나쁨',
      awful: '최악',
    }
    return labels[value]
  }

  const getMoodClass = (value: MoodValue): string => {
    const classes: Record<MoodValue, string> = {
      great: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      okay: 'bg-yellow-100 text-yellow-800',
      bad: 'bg-orange-100 text-orange-800',
      awful: 'bg-red-100 text-red-800',
    }
    return classes[value]
  }

  return {
    getMoodLabel,
    getMoodClass,
  }
}

