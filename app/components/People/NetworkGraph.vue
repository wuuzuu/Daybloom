<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import type { Entry, Person } from '~/types'
import { getAvatarUrl } from '~/shared/utils/avatar'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

const props = defineProps<{
  entries: Entry[]
}>()

const networkContainer = ref<HTMLElement | null>(null)
let network: Network | null = null

// 선택된 사람
const selectedPerson = ref<string | null>(null)

// 모달 열릴 때 배경 스크롤 막기
const isPersonModalOpen = computed(() => selectedPerson.value !== null)
useBodyScrollLock(isPersonModalOpen)

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
  if (avgScore >= 4.5) return { border: '#22C55E', background: '#DCFCE7' } // 초록 (great)
  if (avgScore >= 3.5) return { border: '#38BDF8', background: '#E0F2FE' } // 하늘 (good)
  if (avgScore >= 2.5) return { border: '#EAB308', background: '#FEF9C3' } // 노랑 (okay)
  if (avgScore >= 1.5) return { border: '#F97316', background: '#FFEDD5' } // 주황 (bad)
  return { border: '#EF4444', background: '#FEE2E2' } // 빨강 (awful)
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
    image: getAvatarUrl('나', 'lorelei'),
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
      image: getAvatarUrl(name, 'lorelei'),
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
  
  // 노드 호버 시 커서 변경
  network.on('hoverNode', () => {
    if (networkContainer.value) {
      networkContainer.value.style.cursor = 'pointer'
    }
  })
  
  network.on('blurNode', () => {
    if (networkContainer.value) {
      networkContainer.value.style.cursor = 'default'
    }
  })
}

// 모달 닫기
const closeModal = () => {
  selectedPerson.value = null
  document.body.style.overflow = ''
}

// 모달 열기 시 body 스크롤 방지
watch(selectedPerson, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

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
      <div class="bg-lavender-50 dark:bg-lavender-900/20 px-4 py-2 rounded-xl">
        <span class="text-lavender-600 dark:text-lavender-400 font-medium">{{ totalPeople }}</span>
        <span class="text-warm-600 dark:text-warm-400 ml-1">명의 사람</span>
      </div>
      <div class="bg-cream-100 dark:bg-warm-700 px-4 py-2 rounded-xl">
        <span class="text-warm-700 dark:text-cream-200 font-medium">{{ totalRecords }}</span>
        <span class="text-warm-600 dark:text-warm-400 ml-1">회 기록</span>
      </div>
    </div>
    
    <!-- 메인 컨텐츠: 그래프 + 사이드 패널 -->
    <div class="relative">
      <!-- 네트워크 그래프 -->
      <div 
        ref="networkContainer" 
        class="w-full h-[400px] md:h-[500px] bg-cream-50 dark:bg-warm-700 rounded-2xl"
      />
      
      <!-- 줌 컨트롤 -->
      <div class="absolute top-3 right-3 flex flex-col gap-1">
        <button
          @click="zoomIn"
          class="w-8 h-8 bg-white dark:bg-warm-600 border border-cream-200 dark:border-warm-500 rounded-xl shadow-sm hover:bg-cream-50 dark:hover:bg-warm-500 flex items-center justify-center text-warm-600 dark:text-cream-200 font-bold transition-colors"
          title="확대"
        >
          +
        </button>
        <button
          @click="zoomOut"
          class="w-8 h-8 bg-white dark:bg-warm-600 border border-cream-200 dark:border-warm-500 rounded-xl shadow-sm hover:bg-cream-50 dark:hover:bg-warm-500 flex items-center justify-center text-warm-600 dark:text-cream-200 font-bold transition-colors"
          title="축소"
        >
          −
        </button>
        <button
          @click="resetView"
          class="w-8 h-8 bg-white dark:bg-warm-600 border border-cream-200 dark:border-warm-500 rounded-xl shadow-sm hover:bg-cream-50 dark:hover:bg-warm-500 flex items-center justify-center text-warm-600 dark:text-cream-200 text-lg transition-colors"
          title="전체 보기"
        >
          ⊙
        </button>
      </div>
      
    </div>
    
    <!-- Person Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="selectedPerson" 
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-warm-900/50 dark:bg-black/60 backdrop-blur-sm" 
            @click="closeModal"
          />
          
          <!-- Modal Content -->
          <div class="relative bg-white dark:bg-warm-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-modal-in">
            <!-- Header -->
            <div class="flex items-center gap-4 p-5 border-b border-cream-200 dark:border-warm-600">
              <img 
                :src="getAvatarUrl(selectedPerson, 'lorelei')"
                :alt="selectedPerson"
                class="w-14 h-14 rounded-full bg-cream-100 dark:bg-warm-600"
              />
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-warm-800 dark:text-cream-100">
                  {{ selectedPerson }}
                </h3>
                <p class="text-sm text-warm-500 dark:text-warm-400">
                  {{ selectedPersonStats?.count || 0 }}회 기록
                </p>
              </div>
              <button
                type="button"
                @click="closeModal"
                class="p-2 text-warm-400 hover:text-warm-600 dark:hover:text-cream-200 hover:bg-cream-100 dark:hover:bg-warm-700 rounded-xl transition-colors"
                aria-label="닫기"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Records List -->
            <div class="p-5 overflow-y-auto max-h-[calc(80vh-100px)]">
              <p class="text-xs text-warm-500 dark:text-warm-400 mb-3 font-medium">📅 최근 기록</p>
              
              <div v-if="selectedPersonRecords.length > 0" class="space-y-3">
                <div
                  v-for="record in selectedPersonRecords"
                  :key="record.date"
                  class="p-4 bg-cream-50 dark:bg-warm-700 rounded-2xl"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-lavender-600 dark:text-lavender-400 font-medium">
                      {{ record.date }}
                    </span>
                    <span 
                      class="text-xl" 
                      :title="record.personMood ? '이 사람에 대한 기분' : '그날 전체 기분'"
                    >
                      {{ getMoodEmoji(record.personMood || record.entryMood) }}
                    </span>
                  </div>
                  <p 
                    v-if="record.feeling"
                    class="text-warm-700 dark:text-warm-200 text-sm"
                  >
                    {{ record.feeling }}
                  </p>
                  <p 
                    v-else
                    class="text-sm text-warm-400 dark:text-warm-500 italic"
                  >
                    (감상 없음)
                  </p>
                </div>
              </div>
              
              <div 
                v-else
                class="text-center py-8"
              >
                <span class="text-4xl mb-3 block">📭</span>
                <p class="text-warm-500 dark:text-warm-400">기록이 없습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <!-- 힌트 -->
    <p 
      v-if="!selectedPerson && totalPeople > 0" 
      class="text-center text-sm text-warm-400 dark:text-warm-500"
    >
      💡 사람 노드를 클릭하면 상세 기록을 볼 수 있어요
    </p>
    
    <!-- 범례 -->
    <div class="flex flex-wrap gap-4 text-xs text-warm-500 dark:text-warm-400">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full bg-lavender-200 border-2 border-lavender-500"></div>
        <span>나 (중심)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-green-100 border-2 border-green-400"></div>
        <span>최고</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-sky-100 border-2 border-sky-400"></div>
        <span>좋음</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-400"></div>
        <span>보통</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-orange-100 border-2 border-orange-400"></div>
        <span>나쁨</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-red-100 border-2 border-red-400"></div>
        <span>최악</span>
      </div>
    </div>
    
    <!-- 빈 상태 -->
    <div 
      v-if="totalPeople === 0" 
      class="absolute inset-0 flex items-center justify-center bg-cream-50 dark:bg-warm-800 rounded-2xl z-10"
    >
      <div class="text-center text-warm-500 dark:text-warm-400">
        <p class="text-4xl mb-3">👥</p>
        <p class="text-lg font-medium mb-1">기록된 사람이 없습니다</p>
        <p class="text-sm">Entry에서 사람을 추가해보세요!</p>
      </div>
    </div>
  </div>
</template>
