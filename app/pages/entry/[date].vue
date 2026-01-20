<template>
  <div class="container mx-auto px-4 py-6 max-w-2xl lg:max-w-3xl">
    <!-- Header -->
    <header class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-warm-400 dark:text-warm-500 text-sm">{{ formattedDate }}</p>
          <h1 class="text-2xl font-semibold text-warm-800 dark:text-cream-100">
            {{ isEditMode ? '✏️ 기록 작성' : '📝 기록 보기' }}
          </h1>
        </div>
        <button
          v-if="isEditMode && existingEntry"
          @click="isEditMode = false"
          class="text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-cream-100 transition-colors"
        >
          취소
        </button>
        <button
          v-else-if="!isEditMode"
          @click="router.push('/')"
          class="btn-secondary text-sm px-3 py-2"
        >
          ← 뒤로
        </button>
      </div>
    </header>

    <!-- 읽기 모드 -->
    <EntryView
      v-if="!isEditMode"
      :entry="existingEntry"
      @edit="isEditMode = true"
      @create="isEditMode = true"
      @delete="handleDelete"
    />

    <!-- 편집 모드 -->
    <EntryForm
      v-else
      :date="date"
      :initial-entry="entryData"
      :has-existing-entry="!!existingEntry"
      @save="handleSave"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import type { Mood } from '~/types'

const route = useRoute()
const router = useRouter()
const entriesStore = useEntriesStore()

const date = computed(() => route.params.date as string)
const isEditMode = ref(false)

const queryMood = computed(() => route.query.mood as string | undefined)
const queryText = computed(() => route.query.text as string | undefined)
const queryEdit = computed(() => route.query.edit === 'true')

const formattedDate = computed(() => {
  const d = new Date(date.value)
  return d.toLocaleDateString('ko-KR', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  })
})

const existingEntry = computed(() => {
  return entriesStore.getEntryByDate(date.value)
})

const entryData = computed(() => {
  const entry = existingEntry.value
  
  if (entry) {
    // 기존 기록이 있을 때, 쿼리 파라미터가 있으면 해당 값으로 덮어쓰기
    const mood = queryMood.value 
      ? { value: queryMood.value as 'great' | 'good' | 'okay' | 'bad' | 'awful', note: entry.mood.note }
      : entry.mood
    
    const bullets = queryText.value 
      ? [queryText.value, ...entry.bullets.slice(1)]
      : entry.bullets
    
    return {
      bullets,
      events: entry.events,
      mood,
      people: entry.people.map((p) => {
        if (typeof p === 'string') {
          return { name: p }
        }
        return p
      }),
      tomorrow: entry.tomorrow,
    }
  }
  
  if (queryMood.value || queryText.value) {
    return {
      bullets: queryText.value ? [queryText.value] : [],
      events: [],
      mood: {
        value: (queryMood.value || 'okay') as 'great' | 'good' | 'okay' | 'bad' | 'awful',
        note: '',
      },
      people: [],
      tomorrow: '',
    }
  }
  
  return undefined
})

// 기록이 없거나, edit 쿼리가 있으면 편집 모드로 시작
if (!existingEntry.value || queryEdit.value) {
  isEditMode.value = true
}

const handleSave = async (data: {
  bullets: string[]
  events?: string[]
  mood: Mood
  people: Array<{ name: string; feeling?: string }>
  tomorrow?: string
}): Promise<void> => {
  await entriesStore.upsertEntry({
    date: date.value,
    ...data,
  })
  isEditMode.value = false
}

const handleDelete = async (): Promise<void> => {
  await entriesStore.deleteEntry(date.value)
  router.push('/')
}
</script>
