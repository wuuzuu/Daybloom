<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium mb-2 dark:text-gray-200">
        Notes (최대 10개)
      </label>
      <div class="space-y-3">
        <div
          v-for="(bullet, index) in form.bullets"
          :key="index"
          class="flex gap-2"
        >
          <input
            v-model="form.bullets[index]"
            type="text"
            :placeholder="`Note ${index + 1}`"
            class="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
          <button
            type="button"
            @click="removeBullet(index)"
            class="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
        <button
          type="button"
          @click="addBullet"
          :disabled="bulletCount >= 10"
          class="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Note 추가
        </button>
        <p class="text-sm text-gray-500 dark:text-gray-400" :class="{ 'text-red-500 font-medium': bulletCount > 10 }">
          {{ bulletCount }}/10
        </p>
      </div>
    </div>

    <!-- Events -->
    <div>
      <label for="events" class="block text-sm font-medium mb-2 dark:text-gray-200">
        Events (선택)
      </label>
      <textarea
        id="events"
        v-model="form.eventsText"
        rows="3"
        class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        placeholder="특별한 이벤트나 일정을 입력하세요..."
      />
    </div>

    <!-- Mood -->
    <div>
      <label for="mood" class="block text-sm font-medium mb-2 dark:text-gray-200">
        Mood
      </label>
      <select
        id="mood"
        v-model="form.mood.value"
        class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="great">최고</option>
        <option value="good">좋음</option>
        <option value="okay">보통</option>
        <option value="bad">나쁨</option>
        <option value="awful">최악</option>
      </select>
      <input
        v-model="form.mood.note"
        type="text"
        placeholder="Mood 노트 (선택)"
        class="w-full mt-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
      />
    </div>

    <!-- People -->
    <div>
      <label class="block text-sm font-medium mb-2 dark:text-gray-200">
        People
      </label>
      <div class="space-y-3">
        <div
          v-for="(person, index) in form.people"
          :key="index"
          class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2"
        >
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <input
                :value="person.name"
                type="text"
                placeholder="이름"
                @input="handlePersonInput($event, index)"
                @focus="handlePersonFocus(index)"
                @blur="handlePersonBlur"
                class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
              <!-- Autocomplete Suggestions -->
              <div
                v-if="focusedPersonIndex === index && personSuggestions.length > 0"
                class="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden"
              >
                <button
                  v-for="suggestion in personSuggestions"
                  :key="suggestion"
                  type="button"
                  @mousedown.prevent="selectSuggestion(suggestion)"
                  class="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <img
                    :src="getAvatarUrl(suggestion, 'fun-emoji')"
                    :alt="suggestion"
                    class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-600"
                  />
                  <span class="text-gray-900 dark:text-white">{{ suggestion }}</span>
                </button>
              </div>
            </div>
            <select
              v-model="person.mood"
              class="w-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">기분</option>
              <option value="great">😊 최고</option>
              <option value="good">🙂 좋음</option>
              <option value="okay">😐 보통</option>
              <option value="bad">😕 나쁨</option>
              <option value="awful">😢 최악</option>
            </select>
            <button
              type="button"
              @click="removePerson(index)"
              class="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm"
            >
              ✕
            </button>
          </div>
          <input
            v-model="person.feeling"
            type="text"
            placeholder="감상/메모 (선택)"
            class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
          />
        </div>
        <button
          type="button"
          @click="addPerson"
          class="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          + 사람 추가
        </button>
      </div>
    </div>

    <!-- Tomorrow -->
    <div>
      <label for="tomorrow" class="block text-sm font-medium mb-2 dark:text-gray-200">
        Tomorrow (선택)
      </label>
      <textarea
        id="tomorrow"
        v-model="form.tomorrow"
        rows="3"
        class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        placeholder="내일 계획이나 목표를 입력하세요..."
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-4">
      <button
        type="submit"
        class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        저장
      </button>
      <button
        v-if="hasExistingEntry"
        type="button"
        @click="handleDelete"
        class="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
      >
        삭제
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Mood, MoodValue } from '~/types'
import { useEntriesStore } from '~/stores/entries'
import { getAvatarUrl } from '~/utils/avatar'

const entriesStore = useEntriesStore()

const props = defineProps<{
  date: string
  initialEntry?: {
    bullets: string[]
    events?: string[]
    mood: Mood
    people: Array<{ name: string; feeling?: string; mood?: MoodValue }> | string[]
    tomorrow?: string
  }
  hasExistingEntry?: boolean
}>()

const emit = defineEmits<{
  save: [data: {
    bullets: string[]
    events?: string[]
    mood: Mood
    people: Array<{ name: string; feeling?: string; mood?: MoodValue }>
    tomorrow?: string
  }]
  delete: []
}>()

const form = ref({
  bullets: props.initialEntry?.bullets && props.initialEntry.bullets.length > 0
    ? [...props.initialEntry.bullets]
    : [''],
  eventsText: props.initialEntry?.events?.join('\n') || '',
  mood: {
    value: (props.initialEntry?.mood.value || 'okay') as Mood['value'],
    note: props.initialEntry?.mood.note || '',
  },
  people: props.initialEntry?.people.map((p) => ({
    name: typeof p === 'string' ? p : p.name,
    feeling: typeof p === 'string' ? '' : (p.feeling || ''),
    mood: typeof p === 'string' ? '' : (p.mood || ''),
  })) || [],
  tomorrow: props.initialEntry?.tomorrow || '',
})

const bulletCount = computed(() => {
  return form.value.bullets.filter((b) => b.trim().length > 0).length
})

// 기존에 기록된 모든 사람 이름 목록 (고유)
const allPeopleNames = computed(() => {
  const allEntries = entriesStore.listEntries()
  const names = new Set<string>()
  
  allEntries.forEach((entry) => {
    entry.people.forEach((person) => {
      const name = typeof person === 'string' ? person : person.name
      if (name && name.trim()) {
        names.add(name.trim())
      }
    })
  })
  
  return Array.from(names).sort()
})

// 현재 focus된 사람 input의 index
const focusedPersonIndex = ref<number | null>(null)

// 현재 실시간 입력값 (한글 조합 중에도 반영)
const currentInputValue = ref('')

// 현재 입력 중인 이름에 대한 suggestions
const personSuggestions = computed(() => {
  if (focusedPersonIndex.value === null) return []
  
  const currentName = currentInputValue.value
  if (!currentName.trim()) return allPeopleNames.value.slice(0, 5) // 빈 입력이면 최근 5명 보여줌
  
  const trimmedName = currentName.trim()
  return allPeopleNames.value
    .filter((name) => name.startsWith(trimmedName) && name !== trimmedName)
    .slice(0, 5)
})

function handlePersonFocus(index: number) {
  focusedPersonIndex.value = index
  currentInputValue.value = form.value.people[index]?.name || ''
}

function handlePersonInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  currentInputValue.value = target.value
  if (form.value.people[index]) {
    form.value.people[index].name = target.value
  }
}

function handlePersonBlur() {
  // 약간의 지연을 줘서 suggestion 클릭이 먼저 처리되도록
  setTimeout(() => {
    focusedPersonIndex.value = null
    currentInputValue.value = ''
  }, 200)
}

function selectSuggestion(name: string) {
  const idx = focusedPersonIndex.value
  if (idx !== null) {
    const person = form.value.people[idx]
    if (person) {
      person.name = name
      currentInputValue.value = ''
      focusedPersonIndex.value = null
    }
  }
}

function parseEvents(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function addBullet() {
  if (bulletCount.value >= 10) {
    alert('Notes는 최대 10개까지 추가할 수 있습니다.')
    return
  }
  form.value.bullets.push('')
}

function removeBullet(index: number) {
  form.value.bullets.splice(index, 1)
}

function addPerson() {
  form.value.people.push({ name: '', feeling: '', mood: '' })
}

function removePerson(index: number) {
  form.value.people.splice(index, 1)
}

function handleSave() {
  // Notes 개수 체크
  const validBullets = form.value.bullets
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .slice(0, 10)
  
  if (form.value.bullets.filter((b) => b.trim().length > 0).length > 10) {
    alert('Notes는 최대 10개까지 저장할 수 있습니다. 초과된 항목은 제외됩니다.')
  }

  const events = parseEvents(form.value.eventsText)
  const people = form.value.people
    .filter((p) => p.name.trim().length > 0)
    .map((p) => ({
      name: p.name.trim(),
      feeling: p.feeling.trim() || undefined,
      mood: (p.mood as MoodValue) || undefined,
    }))

  emit('save', {
    bullets: validBullets,
    events: events.length > 0 ? events : undefined,
    mood: {
      value: form.value.mood.value,
      note: form.value.mood.note || undefined,
    },
    people,
    tomorrow: form.value.tomorrow || undefined,
  })
}

function handleDelete() {
  if (confirm('정말 삭제하시겠습니까?')) {
    emit('delete')
  }
}
</script>

