<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { Entry, MoodValue } from '~/types'
import { useDarkMode } from '~/composables/useDarkMode'

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  entries: Entry[]
  days?: number
}>()

const { isDark } = useDarkMode()

// 기분을 숫자로 변환
const moodToNumber = (mood: MoodValue): number => {
  const values: Record<MoodValue, number> = {
    awful: 1,
    bad: 2,
    okay: 3,
    good: 4,
    great: 5,
  }
  return values[mood]
}

// 기분 레이블
const moodLabels: Record<number, string> = {
  1: '최악',
  2: '나쁨',
  3: '보통',
  4: '좋음',
  5: '최고',
}

// 기분 색상
const getMoodColor = (value: number): string => {
  const colors: Record<number, string> = {
    1: 'rgb(239, 68, 68)',   // red
    2: 'rgb(249, 115, 22)',  // orange
    3: 'rgb(234, 179, 8)',   // yellow
    4: 'rgb(59, 130, 246)',  // blue
    5: 'rgb(34, 197, 94)',   // green
  }
  return colors[value] || 'rgb(156, 163, 175)'
}

// 최근 N일 날짜 배열 생성
const generateDateLabels = (days: number): string[] => {
  const dates: string[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

// 차트 데이터
const chartData = computed(() => {
  const days = props.days || 30
  const dateLabels = generateDateLabels(days)
  
  // entries를 날짜별로 매핑
  const entriesByDate = new Map<string, Entry>()
  props.entries.forEach(entry => {
    entriesByDate.set(entry.date, entry)
  })
  
  // 각 날짜의 기분 값 (없으면 null)
  const moodValues = dateLabels.map(date => {
    const entry = entriesByDate.get(date)
    return entry?.mood?.value ? moodToNumber(entry.mood.value) : null
  })
  
  // 포인트 색상
  const pointColors = moodValues.map(value => 
    value ? getMoodColor(value) : 'transparent'
  )
  
  // 날짜 포맷 (MM/DD)
  const formattedLabels = dateLabels.map(date => {
    const [, month, day] = date.split('-')
    return `${parseInt(month)}/${parseInt(day)}`
  })
  
  return {
    labels: formattedLabels,
    datasets: [
      {
        label: '기분',
        data: moodValues,
        borderColor: isDark.value ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)',
        backgroundColor: isDark.value ? 'rgba(147, 197, 253, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: true,
        spanGaps: true, // null 값이 있어도 선 연결
      },
    ],
  }
})

// 차트 옵션
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.raw
          return value ? `기분: ${moodLabels[value]}` : '기록 없음'
        },
      },
    },
  },
  scales: {
    y: {
      min: 0.5,
      max: 5.5,
      ticks: {
        stepSize: 1,
        callback: (value: number) => moodLabels[value] || '',
        color: isDark.value ? 'rgb(209, 213, 219)' : 'rgb(107, 114, 128)',
      },
      grid: {
        color: isDark.value ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 1)',
      },
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        color: isDark.value ? 'rgb(209, 213, 219)' : 'rgb(107, 114, 128)',
      },
      grid: {
        display: false,
      },
    },
  },
}))

// 통계 계산
const stats = computed(() => {
  const days = props.days || 30
  const dateLabels = generateDateLabels(days)
  
  const entriesByDate = new Map<string, Entry>()
  props.entries.forEach(entry => {
    entriesByDate.set(entry.date, entry)
  })
  
  const moodValues = dateLabels
    .map(date => {
      const entry = entriesByDate.get(date)
      return entry?.mood?.value ? moodToNumber(entry.mood.value) : null
    })
    .filter((v): v is number => v !== null)
  
  if (moodValues.length === 0) {
    return { average: 0, highest: 0, lowest: 0, count: 0 }
  }
  
  const sum = moodValues.reduce((a, b) => a + b, 0)
  const average = sum / moodValues.length
  const highest = Math.max(...moodValues)
  const lowest = Math.min(...moodValues)
  
  return {
    average: Math.round(average * 10) / 10,
    highest,
    lowest,
    count: moodValues.length,
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 통계 요약 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.count }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">기록 일수</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.average }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">평균 기분</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ moodLabels[stats.highest] || '-' }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">최고 기분</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ moodLabels[stats.lowest] || '-' }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">최저 기분</div>
      </div>
    </div>
    
    <!-- 차트 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div class="h-[300px] md:h-[400px]">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
    
    <!-- 범례 -->
    <div class="flex flex-wrap justify-center gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <span class="text-gray-600 dark:text-gray-400">최고 (5)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
        <span class="text-gray-600 dark:text-gray-400">좋음 (4)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
        <span class="text-gray-600 dark:text-gray-400">보통 (3)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-orange-500"></div>
        <span class="text-gray-600 dark:text-gray-400">나쁨 (2)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-500"></div>
        <span class="text-gray-600 dark:text-gray-400">최악 (1)</span>
      </div>
    </div>
  </div>
</template>

