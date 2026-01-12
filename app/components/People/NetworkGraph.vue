<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import type { Entry, Person } from '~/types'
import { getAvatarUrl } from '~/utils/avatar'

const props = defineProps<{
  entries: Entry[]
}>()

const networkContainer = ref<HTMLElement | null>(null)
let network: Network | null = null

// 선택된 사람
const selectedPerson = ref<string | null>(null)

// 사람 이름 추출 헬퍼
const getPersonName = (person: Person | string): string => {
  return typeof person === 'string' ? person : person.name
}

// 기분 점수 변환
const moodToScore = (mood: string): number => {
  const scores: Record<string, number> = {
    great: 5,
    good: 4,
    okay: 3,
    bad: 2,
    awful: 1,
  }
  return scores[mood] || 3
}

// 점수에 따른 색상
const getScoreColor = (avgScore: number): { border: string; background: string } => {
  if (avgScore >= 4.5) return { border: '#22C55E', background: '#DCFCE7' } // 초록
  if (avgScore >= 3.5) return { border: '#3B82F6', background: '#DBEAFE' } // 파랑
  if (avgScore >= 2.5) return { border: '#EAB308', background: '#FEF9C3' } // 노랑
  if (avgScore >= 1.5) return { border: '#F97316', background: '#FFEDD5' } // 주황
  return { border: '#EF4444', background: '#FEE2E2' } // 빨강
}

// 사람별 통계 계산
const peopleStats = computed(() => {
  const stats = new Map<string, { count: number; feelings: string[]; moods: string[]; avgScore: number }>()
  
  props.entries.forEach(entry => {
    entry.people.forEach(person => {
      const name = getPersonName(person)
      const existing = stats.get(name) || { count: 0, feelings: [], moods: [], avgScore: 3 }
      existing.count++
      
      // 사람별 mood가 있으면 우선 사용, 없으면 그날 전체 mood 사용
      const personMood = typeof person !== 'string' && person.mood ? person.mood : null
      existing.moods.push(personMood || entry.mood.value)
      
      if (typeof person !== 'string' && person.feeling) {
        existing.feelings.push(person.feeling)
      }
      stats.set(name, existing)
    })
  })
  
  // 평균 점수 계산
  stats.forEach((stat, name) => {
    if (stat.moods.length > 0) {
      const total = stat.moods.reduce((sum, mood) => sum + moodToScore(mood), 0)
      stat.avgScore = total / stat.moods.length
    }
    stats.set(name, stat)
  })
  
  return stats
})

// 기분 이모지
const getMoodEmoji = (mood: string): string => {
  const emojis: Record<string, string> = {
    great: '😊',
    good: '🙂',
    okay: '😐',
    bad: '😕',
    awful: '😢',
  }
  return emojis[mood] || '😐'
}

// 선택된 사람의 상세 기록
const selectedPersonRecords = computed(() => {
  if (!selectedPerson.value) return []
  
  const records: Array<{ date: string; feeling: string | null; personMood: string | null; entryMood: string }> = []
  
  props.entries.forEach(entry => {
    const person = entry.people.find(p => getPersonName(p) === selectedPerson.value)
    if (person) {
      records.push({
        date: entry.date,
        feeling: typeof person !== 'string' && person.feeling ? person.feeling : null,
        personMood: typeof person !== 'string' && person.mood ? person.mood : null,
        entryMood: entry.mood.value,
      })
    }
  })
  
  return records.sort((a, b) => b.date.localeCompare(a.date))
})

// 선택된 사람의 통계
const selectedPersonStats = computed(() => {
  if (!selectedPerson.value) return null
  return peopleStats.value.get(selectedPerson.value)
})

// 네트워크 데이터 생성
const createNetworkData = () => {
  const nodes: any[] = []
  const edges: any[] = []
  
  // 중심 노드: "나"
  nodes.push({
    id: '__ME__',
    label: '나',
    shape: 'circularImage',
    image: getAvatarUrl('나', 'avataaars'),
    size: 50,
    font: { 
      size: 16,
      color: '#1F2937',
      face: 'system-ui',
      bold: true,
    },
    fixed: { x: false, y: false },
    color: {
      border: '#3B82F6',
      background: '#EFF6FF',
    },
    borderWidth: 3,
    title: '나',
  })
  
  // 다른 사람 노드 생성
  peopleStats.value.forEach((stats, name) => {
    const size = Math.min(25 + stats.count * 3, 45)
    const colors = getScoreColor(stats.avgScore)
    
    nodes.push({
      id: name,
      label: name,
      shape: 'circularImage',
      image: getAvatarUrl(name, 'fun-emoji'),
      size: size,
      font: { 
        size: 14,
        color: '#374151',
        face: 'system-ui',
      },
      color: {
        border: colors.border,
        background: colors.background,
        highlight: {
          border: colors.border,
          background: colors.background,
        },
        hover: {
          border: colors.border,
          background: colors.background,
        },
      },
      borderWidth: 3,
      title: `${name}\n기록: ${stats.count}회\n평균 기분: ${stats.avgScore.toFixed(1)}\n(클릭하여 상세 보기)`,
    })
    
    // "나"와 연결하는 엣지
    edges.push({
      from: '__ME__',
      to: name,
      width: Math.min(1 + stats.count * 0.5, 8),
      color: { 
        color: '#93C5FD',
        highlight: '#3B82F6',
        hover: '#60A5FA',
      },
      title: `${stats.count}회 기록`,
    })
  })
  
  return { nodes: new DataSet(nodes), edges: new DataSet(edges) }
}

// 네트워크 초기화
const initNetwork = () => {
  if (!networkContainer.value) return
  
  const data = createNetworkData()
  
  const options = {
    nodes: {
      borderWidth: 2,
      borderWidthSelected: 3,
      color: {
        border: '#E5E7EB',
        background: '#F9FAFB',
        highlight: {
          border: '#3B82F6',
          background: '#EFF6FF',
        },
        hover: {
          border: '#60A5FA',
          background: '#F0F9FF',
        },
      },
    },
    edges: {
      smooth: true,
    },
    physics: {
      stabilization: {
        iterations: 100,
      },
      barnesHut: {
        gravitationalConstant: -3000,
        springLength: 150,
        springConstant: 0.04,
      },
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
    },
  }
  
  network = new Network(networkContainer.value, data, options)
  
  // 노드 클릭 이벤트
  network.on('click', (params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      if (nodeId === '__ME__') {
        selectedPerson.value = null
      } else {
        selectedPerson.value = nodeId
      }
    } else {
      selectedPerson.value = null
    }
  })
}

// 사이드 패널 닫기
const closePanel = () => {
  selectedPerson.value = null
}

// 데이터 변경 시 네트워크 업데이트
watch(() => props.entries, () => {
  if (network) {
    network.destroy()
  }
  initNetwork()
}, { deep: true })

onMounted(() => {
  initNetwork()
})

onUnmounted(() => {
  if (network) {
    network.destroy()
  }
})

// 줌 컨트롤
const zoomIn = () => {
  if (!network) return
  const scale = network.getScale()
  network.moveTo({ scale: scale * 1.3, animation: true })
}

const zoomOut = () => {
  if (!network) return
  const scale = network.getScale()
  network.moveTo({ scale: scale / 1.3, animation: true })
}

const resetView = () => {
  if (!network) return
  network.fit({ animation: true })
}

// 통계
const totalPeople = computed(() => peopleStats.value.size)
const totalRecords = computed(() => {
  let total = 0
  peopleStats.value.forEach(stats => {
    total += stats.count
  })
  return total
})
</script>

<template>
  <div class="space-y-4">
    <!-- 통계 -->
    <div class="flex gap-4 text-sm">
      <div class="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
        <span class="text-blue-600 dark:text-blue-400 font-medium">{{ totalPeople }}</span>
        <span class="text-gray-600 dark:text-gray-400 ml-1">명의 사람</span>
      </div>
      <div class="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
        <span class="text-purple-600 dark:text-purple-400 font-medium">{{ totalRecords }}</span>
        <span class="text-gray-600 dark:text-gray-400 ml-1">회 기록</span>
      </div>
    </div>
    
    <!-- 메인 컨텐츠: 그래프 + 사이드 패널 -->
    <div class="relative">
      <!-- 네트워크 그래프 -->
      <div 
        ref="networkContainer" 
        class="w-full h-[400px] md:h-[500px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
      />
      
      <!-- 줌 컨트롤 -->
      <div class="absolute top-3 right-3 flex flex-col gap-1">
        <button
          @click="zoomIn"
          class="w-8 h-8 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold transition-colors"
          title="확대"
        >
          +
        </button>
        <button
          @click="zoomOut"
          class="w-8 h-8 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold transition-colors"
          title="축소"
        >
          −
        </button>
        <button
          @click="resetView"
          class="w-8 h-8 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-lg transition-colors"
          title="전체 보기"
        >
          ⊙
        </button>
      </div>
      
      <!-- 사이드 패널 (오버레이) -->
      <div 
        v-if="selectedPerson"
        class="absolute top-0 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 h-[400px] md:h-[500px] overflow-hidden flex flex-col"
      >
        <!-- 헤더 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <img 
              :src="getAvatarUrl(selectedPerson, 'fun-emoji')"
              :alt="selectedPerson"
              class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700"
            />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ selectedPerson }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedPersonStats?.count || 0 }}회 기록
              </p>
            </div>
          </div>
          <button 
            @click="closePanel"
            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <!-- 기록 목록 -->
        <div class="flex-1 overflow-y-auto space-y-3">
          <div
            v-for="record in selectedPersonRecords"
            :key="record.date"
            class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ record.date }}</span>
              <span 
                class="text-lg" 
                :title="record.personMood ? '이 사람에 대한 기분' : '그날 전체 기분'"
              >
                {{ getMoodEmoji(record.personMood || record.entryMood) }}
              </span>
            </div>
            <p 
              v-if="record.feeling"
              class="text-sm text-gray-700 dark:text-gray-300"
            >
              {{ record.feeling }}
            </p>
            <p 
              v-else
              class="text-sm text-gray-400 dark:text-gray-500 italic"
            >
              (감상 없음)
            </p>
          </div>
          
          <div 
            v-if="selectedPersonRecords.length === 0"
            class="text-center text-gray-400 dark:text-gray-500 py-4"
          >
            기록이 없습니다.
          </div>
        </div>
      </div>
    </div>
    
    <!-- 힌트 -->
    <p 
      v-if="!selectedPerson && totalPeople > 0" 
      class="text-center text-sm text-gray-400 dark:text-gray-500"
    >
      💡 사람 노드를 클릭하면 상세 기록을 볼 수 있어요
    </p>
    
    <!-- 범례 -->
    <div class="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-blue-200 border-2 border-blue-500"></div>
        <span>나 (중심)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-green-100 border-2 border-green-500"></div>
        <span>좋음</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
        <span>보통+</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-500"></div>
        <span>보통</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-orange-100 border-2 border-orange-500"></div>
        <span>나쁨</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-red-100 border-2 border-red-500"></div>
        <span>최악</span>
      </div>
    </div>
    
    <!-- 빈 상태 -->
    <div 
      v-if="totalPeople === 0" 
      class="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80 rounded-xl"
    >
      <div class="text-center text-gray-500 dark:text-gray-400">
        <p class="text-lg mb-2">👥</p>
        <p>기록된 사람이 없습니다.</p>
        <p class="text-sm">Entry에서 사람을 추가해보세요!</p>
      </div>
    </div>
  </div>
</template>
