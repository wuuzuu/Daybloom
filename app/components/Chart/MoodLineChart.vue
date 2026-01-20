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
    1: 'rgb(248, 113, 113)',   // red-400
    2: 'rgb(251, 146, 60)',    // orange-400
    3: 'rgb(250, 204, 21)',    // yellow-400
    4: 'rgb(56, 189, 248)',    // sky-400
    5: 'rgb(74, 222, 128)',    // green-400
  }
  return colors[value] || 'rgb(180, 170, 150)'
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
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="bg-lavender-50 dark:bg-lavender-900/20 rounded-2xl p-4 text-center">
        <div class="text-2xl font-bold text-lavender-600 dark:text-lavender-400">{{ stats.count }}</div>
        <div class="text-sm text-lavender-500 dark:text-lavender-500">기록 일수</div>
      </div>
      <div class="bg-cream-50 dark:bg-warm-700 rounded-2xl p-4 text-center">
        <div class="text-2xl font-bold text-warm-700 dark:text-cream-200">{{ stats.average }}</div>
        <div class="text-sm text-warm-500 dark:text-warm-400">평균 기분</div>
      </div>
      <div class="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ moodLabels[stats.highest] || '-' }}</div>
        <div class="text-sm text-green-500 dark:text-green-500">최고 기분</div>
      </div>
      <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ moodLabels[stats.lowest] || '-' }}</div>
        <div class="text-sm text-red-500 dark:text-red-500">최저 기분</div>
      </div>
    </div>
    
    <!-- 차트 -->
    <div class="bg-cream-50 dark:bg-warm-700 rounded-2xl p-4">
      <div class="h-[300px] md:h-[400px]">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
    
    <!-- 범례 -->
    <div class="flex flex-wrap justify-center gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="text-warm-600 dark:text-warm-400">최고 (5)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-sky-400"></div>
        <span class="text-warm-600 dark:text-warm-400">좋음 (4)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <span class="text-warm-600 dark:text-warm-400">보통 (3)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-orange-400"></div>
        <span class="text-warm-600 dark:text-warm-400">나쁨 (2)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <span class="text-warm-600 dark:text-warm-400">최악 (1)</span>
      </div>
    </div>
  </div>
</template>

