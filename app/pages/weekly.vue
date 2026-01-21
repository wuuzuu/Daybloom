<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Header -->
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-warm-800 dark:text-cream-100 mb-4">
        📊 {{ isCurrentWeek ? '이번 주 요약' : '주간 요약' }}
      </h1>
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
import { getToday, getWeekRange, getPreviousWeek, getNextWeek } from '~/utils/date'
import { buildWeeklySummary } from '~/utils/summary'
import type { WeeklySummary, WeeklyTodo } from '~/types'

const route = useRoute()
const router = useRouter()
const entriesStore = useEntriesStore()
const weeklyStore = useWeeklyStore()

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
</script>
