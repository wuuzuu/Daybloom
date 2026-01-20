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
      great: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      good: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
      okay: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      bad: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      awful: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    }
    return classes[value]
  }

  return {
    getMoodLabel,
    getMoodClass,
  }
}

