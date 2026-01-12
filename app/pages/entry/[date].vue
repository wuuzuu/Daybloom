<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold dark:text-white">기록: {{ date }}</h1>
      <button
        v-if="isEditMode"
        @click="isEditMode = false"
        class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        취소
      </button>
      <button
        v-else
        @click="router.push('/')"
        class="px-3 py-1.5 text-sm rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-700"
      >
        ← 뒤로
      </button>
    </div>

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

const existingEntry = computed(() => {
  return entriesStore.getEntryByDate(date.value)
})

const entryData = computed(() => {
  const entry = existingEntry.value
  if (!entry) return undefined
  
  return {
    bullets: entry.bullets,
    events: entry.events,
    mood: entry.mood,
    people: entry.people.map((p) => {
      // 마이그레이션: string → Person
      if (typeof p === 'string') {
        return { name: p }
      }
      return p
    }),
    tomorrow: entry.tomorrow,
  }
})

// 엔트리가 없으면 바로 편집 모드로
if (!existingEntry.value) {
  isEditMode.value = true
}

function handleSave(data: {
  bullets: string[]
  events?: string[]
  mood: Mood
  people: Array<{ name: string; feeling?: string }>
  tomorrow?: string
}) {
  entriesStore.upsertEntry({
    date: date.value,
    ...data,
  })

  // 저장 후 읽기 모드로 전환
  isEditMode.value = false
}

function handleDelete() {
  entriesStore.deleteEntry(date.value)
  router.push('/')
}
</script>

