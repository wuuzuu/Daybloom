<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold dark:text-white">
        {{ isCurrentWeek ? '이번 주 요약' : `${weekRange.weekStart} ~ ${weekRange.weekEnd} 요약` }}
      </h1>
      <div class="flex items-center gap-2">
        <button
          @click="goToPreviousWeek"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
        >
          ← 이전 주
        </button>
        <button
          v-if="!isCurrentWeek"
          @click="goToCurrentWeek"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          이번 주
        </button>
        <button
          @click="goToNextWeek"
          :disabled="isCurrentWeek"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음 주 →
        </button>
      </div>
    </div>

    <div v-if="summary" class="space-y-6">
      <!-- 기본 통계 -->
      <WeeklyStats :summary="summary" />

      <!-- Top People -->
      <TopPeople :top-people="summary.topPeople" />

      <!-- 사용자 입력: Highlights & Next Experiment -->
      <WeeklyNotesView
        v-if="!isEditingNotes"
        :highlights="summary.highlights"
        :next-experiment="summary.nextExperiment"
        @edit="isEditingNotes = true"
      />
      <WeeklyNotesForm
        v-else
        :initial-highlights="summary.highlights"
        :initial-next-experiment="summary.nextExperiment"
        @save="handleSaveNotes"
      />

      <!-- 이번 주 엔트리 목록 -->
      <section>
        <h2 class="text-xl font-semibold mb-4 dark:text-white">이번 주 엔트리</h2>
        <EntryList :entries="weekEntries" />
      </section>
    </div>

    <div v-else class="text-gray-500 dark:text-gray-400">
      이번 주 데이터가 없습니다.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import { useWeeklyStore } from '~/stores/weekly'
import { getToday, getWeekRange, getPreviousWeek, getNextWeek } from '~/utils/date'
import { buildWeeklySummary } from '~/utils/summary'
import type { WeeklySummary } from '~/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const entriesStore = useEntriesStore()
const weeklyStore = useWeeklyStore()

const today = getToday()
const currentWeekRange = getWeekRange(today)

// URL 쿼리에서 주 선택 (없으면 이번 주)
const selectedWeekStart = computed(() => {
  const weekParam = route.query.week as string | undefined
  if (weekParam) {
    return weekParam
  }
  return currentWeekRange.weekStart
})

const weekRange = computed(() => getWeekRange(selectedWeekStart.value))
const isCurrentWeek = computed(() => selectedWeekStart.value === currentWeekRange.weekStart)

// 저장된 노트가 없으면 편집 모드로 시작
const savedNotes = computed(() => weeklyStore.getWeeklyNotes(weekRange.value.weekStart))
const isEditingNotes = ref(!savedNotes.value || (!savedNotes.value.highlights?.length && !savedNotes.value.nextExperiment))

// 주가 변경되면 편집 모드 초기화
watch(selectedWeekStart, () => {
  const notes = weeklyStore.getWeeklyNotes(weekRange.value.weekStart)
  isEditingNotes.value = !notes || (!notes.highlights?.length && !notes.nextExperiment)
})

function goToPreviousWeek() {
  const prevWeek = getPreviousWeek(weekRange.value.weekStart)
  router.push({ query: { week: prevWeek } })
}

function goToNextWeek() {
  if (isCurrentWeek.value) return
  const nextWeek = getNextWeek(weekRange.value.weekStart)
  router.push({ query: { week: nextWeek } })
}

function goToCurrentWeek() {
  router.push({ query: {} })
}

// 이번 주 엔트리 조회
const weekEntries = computed(() => {
  return entriesStore.listEntries({
    from: weekRange.value.weekStart,
    to: weekRange.value.weekEnd,
  })
})

// 주간 요약 계산
const summary = computed<WeeklySummary | null>(() => {
  const entries = weekEntries.value
  if (entries.length === 0) {
    return null
  }
  
  const baseSummary = buildWeeklySummary(
    entries,
    weekRange.value.weekStart,
    weekRange.value.weekEnd
  )
  
  // 저장된 노트 추가
  const savedNotes = weeklyStore.getWeeklyNotes(weekRange.value.weekStart)
  if (savedNotes) {
    baseSummary.highlights = savedNotes.highlights
    baseSummary.nextExperiment = savedNotes.nextExperiment
  }
  
  return baseSummary
})

function handleSaveNotes(data: { highlights: string[]; nextExperiment: string }) {
  weeklyStore.setWeeklyNotes(weekRange.value.weekStart, {
    highlights: data.highlights,
    nextExperiment: data.nextExperiment,
  })
  // 저장 후 읽기 모드로 전환
  isEditingNotes.value = false
}
</script>

