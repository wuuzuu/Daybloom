<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Header -->
    <header class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold text-warm-800 dark:text-cream-100">
          📊 {{ isCurrentWeek ? '이번 주 요약' : '주간 요약' }}
        </h1>
        <button
          v-if="weekEntries.length > 0"
          @click="generateAISummary"
          :disabled="isGeneratingSummary"
          class="btn-primary text-sm px-4 py-2 flex items-center gap-2"
        >
          <span v-if="isGeneratingSummary" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span v-else>✨</span>
          <span>{{ isGeneratingSummary ? 'AI 분석 중...' : 'AI 요약' }}</span>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="goToPreviousWeek"
          class="btn-secondary text-sm px-3 py-2"
        >
          ← 이전
        </button>
        <span class="flex-1 text-center text-sm text-warm-500 dark:text-warm-400">
          {{ weekRange.weekStart }} ~ {{ weekRange.weekEnd }}
        </span>
        <button
          v-if="!isCurrentWeek"
          @click="goToCurrentWeek"
          class="btn-primary text-sm px-3 py-2"
        >
          이번 주
        </button>
        <button
          @click="goToNextWeek"
          :disabled="isCurrentWeek"
          class="btn-secondary text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음 →
        </button>
      </div>
    </header>

    <!-- AI Summary Modal -->
    <Teleport to="body">
      <div
        v-if="showAISummaryModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAISummaryModal = false" />
        <div class="relative bg-white dark:bg-warm-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div class="px-6 py-4 border-b border-cream-200 dark:border-warm-600 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-warm-800 dark:text-cream-100">
              ✨ AI 주간 요약
            </h3>
            <button
              @click="showAISummaryModal = false"
              class="p-2 hover:bg-cream-100 dark:hover:bg-warm-700 rounded-xl transition-colors"
            >
              ✕
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[60vh]">
            <div 
              v-if="aiSummaryContent"
              class="prose prose-warm dark:prose-invert max-w-none text-warm-700 dark:text-cream-200"
              v-html="renderMarkdown(aiSummaryContent)"
            />
            <div v-else-if="aiSummaryError" class="text-red-500 dark:text-red-400">
              {{ aiSummaryError }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="space-y-6">
      <!-- 기본 통계 -->
      <WeeklyStats v-if="summary" :summary="summary" />

      <!-- Top People -->
      <TopPeople v-if="summary" :top-people="summary.topPeople" />

      <!-- 할 일 체크리스트 -->
      <WeeklyNotesView
        v-if="!isEditingNotes"
        :todos="savedNotes?.todos"
        @edit="isEditingNotes = true"
        @toggle-todo="handleToggleTodo"
      />
      <WeeklyNotesForm
        v-else
        :initial-todos="savedNotes?.todos"
        :is-saving="isSavingNotes"
        @save="handleSaveNotes"
        @cancel="handleCancelEdit"
      />

      <!-- 이번 주 엔트리 목록 -->
      <section v-if="weekEntries.length > 0">
        <h2 class="text-lg font-semibold text-warm-700 dark:text-cream-200 mb-4">이번 주 기록</h2>
        <EntryList :entries="weekEntries" />
      </section>
      
      <div v-else-if="!summary" class="card text-center py-12">
        <span class="text-4xl mb-3 block">📭</span>
        <p class="text-warm-500 dark:text-warm-400">이번 주 데이터가 없어요</p>
        <p class="text-warm-400 dark:text-warm-500 text-sm mt-1">기록을 시작해보세요!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import { useWeeklyStore } from '~/stores/weekly'
import { useProjectsStore } from '~/stores/projects'
import { getToday, getWeekRange, getPreviousWeek, getNextWeek } from '~/utils/date'
import { buildWeeklySummary } from '~/utils/summary'
import type { WeeklySummary, WeeklyTodo } from '~/types'

const route = useRoute()
const router = useRouter()
const entriesStore = useEntriesStore()
const weeklyStore = useWeeklyStore()
const projectsStore = useProjectsStore()

// AI Summary 상태
const isGeneratingSummary = ref(false)
const showAISummaryModal = ref(false)
const aiSummaryContent = ref('')
const aiSummaryError = ref('')

const today = getToday()
const currentWeekRange = getWeekRange(today)

const selectedWeekStart = computed(() => {
  const weekParam = route.query.week as string | undefined
  return weekParam || currentWeekRange.weekStart
})

const weekRange = computed(() => getWeekRange(selectedWeekStart.value))
const isCurrentWeek = computed(() => selectedWeekStart.value === currentWeekRange.weekStart)

const savedNotes = computed(() => weeklyStore.getWeeklyNotes(weekRange.value.weekStart))
const isEditingNotes = ref(!savedNotes.value?.todos?.length)
const isSavingNotes = ref(false)

watch(selectedWeekStart, () => {
  const notes = weeklyStore.getWeeklyNotes(weekRange.value.weekStart)
  isEditingNotes.value = !notes?.todos?.length
})

const goToPreviousWeek = (): void => {
  const prevWeek = getPreviousWeek(weekRange.value.weekStart)
  router.push({ query: { week: prevWeek } })
}

const goToNextWeek = (): void => {
  if (isCurrentWeek.value) return
  const nextWeek = getNextWeek(weekRange.value.weekStart)
  router.push({ query: { week: nextWeek } })
}

const goToCurrentWeek = (): void => {
  router.push({ query: {} })
}

const weekEntries = computed(() => {
  return entriesStore.listEntries({
    from: weekRange.value.weekStart,
    to: weekRange.value.weekEnd,
  })
})

const summary = computed<WeeklySummary | null>(() => {
  const entries = weekEntries.value
  if (entries.length === 0) return null
  
  return buildWeeklySummary(
    entries,
    weekRange.value.weekStart,
    weekRange.value.weekEnd
  )
})

const handleSaveNotes = async (data: { todos: WeeklyTodo[] }): Promise<void> => {
  isSavingNotes.value = true
  try {
    await weeklyStore.setWeeklyNotes(weekRange.value.weekStart, {
      todos: data.todos,
    })
    isEditingNotes.value = false
  } finally {
    isSavingNotes.value = false
  }
}

const handleToggleTodo = async (todoId: string): Promise<void> => {
  await weeklyStore.toggleTodo(weekRange.value.weekStart, todoId)
}

const handleCancelEdit = (): void => {
  if (savedNotes.value?.todos?.length) {
    isEditingNotes.value = false
  }
}

// AI 요약 생성
const generateAISummary = async (): Promise<void> => {
  if (weekEntries.value.length === 0) return
  
  isGeneratingSummary.value = true
  aiSummaryContent.value = ''
  aiSummaryError.value = ''
  
  try {
    // 엔트리에 프로젝트 정보 추가
    const entriesWithProjects = weekEntries.value.map(entry => ({
      ...entry,
      workItems: entry.workItems?.map(w => ({
        ...w,
        project: projectsStore.getProjectById(w.projectId)
      }))
    }))
    
    const response = await $fetch<{ success: boolean; summary: string }>('/api/ai/summary', {
      method: 'POST',
      body: {
        entries: entriesWithProjects,
        weekStart: weekRange.value.weekStart,
        weekEnd: weekRange.value.weekEnd,
      }
    })
    
    if (response?.success) {
      aiSummaryContent.value = response.summary
      showAISummaryModal.value = true
    } else {
      aiSummaryError.value = '요약 생성에 실패했습니다.'
      showAISummaryModal.value = true
    }
  } catch (error: any) {
    console.error('AI Summary error:', error)
    aiSummaryError.value = error.data?.message || '요약 생성 중 오류가 발생했습니다.'
    showAISummaryModal.value = true
  } finally {
    isGeneratingSummary.value = false
  }
}

// 마크다운을 HTML로 변환 (간단한 버전)
const renderMarkdown = (text: string): string => {
  return text
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph
    .replace(/^/, '<p class="mb-3">')
    .replace(/$/, '</p>')
}
</script>
