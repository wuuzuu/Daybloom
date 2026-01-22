<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Greeting -->
    <header class="mb-8 text-center">
      <p class="text-warm-400 dark:text-warm-500 text-sm mb-1">{{ formattedDate }}</p>
      <h1 class="text-2xl md:text-3xl font-semibold text-warm-800 dark:text-cream-100">
        오늘 하루 어땠어요?
      </h1>
    </header>

    <!-- Mood Picker Card -->
    <section class="card card-hover mb-6">
      <div class="text-center">
        <p class="text-warm-500 dark:text-warm-400 text-sm mb-4">지금 기분을 선택해주세요</p>
        <div class="flex justify-center gap-2 sm:gap-4 md:gap-6">
          <button
            v-for="mood in moods"
            :key="mood.value"
            type="button"
            :class="[
              'mood-emoji p-2 rounded-2xl transition-all',
              selectedMood === mood.value 
                ? 'selected bg-lavender-100 dark:bg-lavender-900/30' 
                : 'hover:bg-cream-100 dark:hover:bg-warm-700'
            ]"
            :aria-label="mood.label"
            :title="mood.label"
            @click="handleMoodSelect(mood.value)"
          >
            {{ mood.emoji }}
          </button>
        </div>
        <p 
          v-if="selectedMood" 
          class="mt-4 text-lavender-600 dark:text-lavender-400 font-medium"
        >
          {{ selectedMoodLabel }}
        </p>
      </div>
    </section>

    <!-- Mood Description Card -->
    <section class="card card-hover mb-6">
      <label class="block">
        <span class="text-warm-600 dark:text-warm-300 text-sm font-medium mb-2 block">
          {{ selectedMoodLabel ? `왜 "${selectedMoodLabel}" 인가요?` : '기분을 더 자세히 적어보세요' }} 💭
        </span>
        <textarea
          v-model="journalText"
          :placeholder="selectedMood ? '무슨 일이 있었나요? 어떤 감정이 드나요?' : '위에서 기분을 먼저 선택해주세요...'"
          class="w-full px-4 py-3 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-2xl 
                 text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500
                 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 focus:border-transparent
                 resize-none transition-all"
          rows="3"
        />
      </label>
      
      <div class="mt-4 flex justify-end">
        <button
          type="button"
          class="btn-primary inline-flex items-center gap-2"
          @click="handleGoToEntry"
        >
          <span>{{ todayEntry ? '수정하기' : '기록하기' }}</span>
          <span>→</span>
        </button>
      </div>
    </section>

    <!-- Timeline Section -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-warm-700 dark:text-cream-200">
          지난 기록
        </h2>
        <NuxtLink
          to="/calendar"
          class="text-sm text-lavender-500 hover:text-lavender-600 dark:text-lavender-400 dark:hover:text-lavender-300 transition-colors"
        >
          전체 보기 →
        </NuxtLink>
      </div>

      <!-- 로딩 중 -->
      <div v-if="isLoading" class="timeline">
        <div class="timeline-line" />
        <div class="flex flex-col gap-4">
          <div v-for="i in 3" :key="i" class="timeline-item">
            <div class="timeline-dot bg-cream-300 dark:bg-warm-600" />
            <div class="card card-hover p-4">
              <div class="flex items-start justify-between gap-3 animate-pulse">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-7 h-7 bg-cream-200 dark:bg-warm-600 rounded-lg" />
                    <div class="h-5 bg-cream-200 dark:bg-warm-600 rounded w-12" />
                  </div>
                  <div class="space-y-1.5 mt-1">
                    <div class="h-4 bg-cream-200 dark:bg-warm-600 rounded w-full" />
                    <div class="h-4 bg-cream-200 dark:bg-warm-600 rounded w-2/3" />
                  </div>
                </div>
                <span class="text-cream-300 dark:text-warm-600">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 기록 없음 (로딩 완료 후에만 표시) -->
      <div v-else-if="recentEntries.length === 0" class="card text-center py-12">
        <span class="text-4xl mb-3 block">📝</span>
        <p class="text-warm-500 dark:text-warm-400">아직 기록이 없어요</p>
        <p class="text-warm-400 dark:text-warm-500 text-sm mt-1">오늘의 첫 기록을 남겨보세요!</p>
      </div>

      <!-- Timeline -->
      <div v-else class="timeline">
        <div class="timeline-line" />
        
        <div class="flex flex-col gap-4">
          <NuxtLink
            v-for="entry in recentEntries"
            :key="entry.id"
            :to="`/entry/${entry.date}`"
            class="timeline-item"
          >
            <div :class="['timeline-dot', `mood-${entry.mood.value}`]" />
            
            <div class="card card-hover p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">{{ getMoodEmoji(entry.mood.value) }}</span>
                    <span class="text-sm text-warm-500 dark:text-warm-400">
                      {{ formatEntryDate(entry.date) }}
                    </span>
                  </div>
                  <p 
                    v-if="entry.mood.note" 
                    class="text-warm-700 dark:text-warm-300 text-sm line-clamp-2"
                  >
                    {{ entry.mood.note }}
                  </p>
                  <p 
                    v-else 
                    class="text-warm-400 dark:text-warm-500 text-sm italic"
                  >
                    기록 없음
                  </p>
                </div>
                <span class="text-warm-300 dark:text-warm-600 transition-colors timeline-arrow">
                  →
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import { getToday } from '~/utils/date'
import type { MoodValue } from '~/types'

const router = useRouter()
const entriesStore = useEntriesStore()
const today = getToday()

const selectedMood = ref<MoodValue | null>(null)
const journalText = ref('')

const moods = [
  { value: 'great' as MoodValue, emoji: '😄', label: '최고예요!' },
  { value: 'good' as MoodValue, emoji: '🙂', label: '좋아요' },
  { value: 'okay' as MoodValue, emoji: '😐', label: '그냥 그래요' },
  { value: 'bad' as MoodValue, emoji: '😔', label: '별로예요' },
  { value: 'awful' as MoodValue, emoji: '😢', label: '힘들어요' },
]

// 오늘 기록이 있는지 확인
const todayEntry = computed(() => {
  return entriesStore.getEntryByDate(today)
})

// 오늘 기록이 있으면 폼에 데이터 채우기
watch(todayEntry, (entry) => {
  if (entry) {
    selectedMood.value = entry.mood.value
    journalText.value = entry.mood.note ?? ''
  }
}, { immediate: true })

const formattedDate = computed(() => {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  }
  return date.toLocaleDateString('ko-KR', options)
})

const selectedMoodLabel = computed(() => {
  const mood = moods.find(m => m.value === selectedMood.value)
  return mood ? mood.label : ''
})

// 로딩 상태 (로딩 중인 경우만 - 초기화는 app.vue에서 처리)
const isLoading = computed(() => {
  return entriesStore.isLoading
})

const recentEntries = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const from = sevenDaysAgo.toISOString().split('T')[0]
  const to = today
  
  return entriesStore.listEntries({ from, to })
})

const handleMoodSelect = (mood: MoodValue): void => {
  selectedMood.value = mood
}

const getMoodEmoji = (mood: MoodValue): string => {
  const found = moods.find(m => m.value === mood)
  return found ? found.emoji : '😐'
}

const formatEntryDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`
  
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const handleGoToEntry = (): void => {
  const query: Record<string, string> = {}
  
  if (selectedMood.value) {
    query.mood = selectedMood.value
  }
  if (journalText.value.trim()) {
    query.text = journalText.value.trim()
  }
  
  // 오늘 기록이 있으면 수정 모드로 열기
  if (todayEntry.value) {
    query.edit = 'true'
  }
  
  router.push({
    path: `/entry/${today}`,
    query,
  })
}
</script>
