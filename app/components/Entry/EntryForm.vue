<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        📝 오늘의 기록 (최대 10개)
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
            :placeholder="`${index + 1}번째 기록...`"
            class="flex-1 border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
          />
          <button
            type="button"
            @click="removeBullet(index)"
            class="px-3 py-2 text-warm-500 dark:text-warm-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            ✕
          </button>
        </div>
        <button
          type="button"
          @click="addBullet"
          :disabled="bulletCount >= 10"
          class="w-full border-2 border-dashed border-cream-300 dark:border-warm-600 rounded-xl px-4 py-3 text-warm-500 dark:text-warm-400 hover:border-lavender-400 hover:text-lavender-600 dark:hover:text-lavender-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + 기록 추가
        </button>
        <p class="text-sm text-warm-400 dark:text-warm-500 text-right" :class="{ 'text-red-500 dark:text-red-400 font-medium': bulletCount > 10 }">
          {{ bulletCount }}/10
        </p>
      </div>
    </div>

    <!-- Events -->
    <div>
      <label for="events" class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        🎉 오늘의 이벤트 (선택)
      </label>
      <textarea
        id="events"
        v-model="form.eventsText"
        rows="3"
        class="w-full border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 resize-none transition-all"
        placeholder="특별한 이벤트나 일정을 입력하세요..."
      />
    </div>

    <!-- Mood -->
    <div>
      <label class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        😊 오늘의 기분
      </label>
      
      <!-- Emoji Mood Picker -->
      <div class="flex justify-center gap-2 md:gap-3 mb-3">
        <button
          v-for="mood in moodOptions"
          :key="mood.value"
          type="button"
          :class="[
            'text-2xl p-2 rounded-xl transition-all duration-200',
            form.mood.value === mood.value 
              ? 'bg-lavender-200 dark:bg-lavender-800/60 ring-2 ring-lavender-500 dark:ring-lavender-400 scale-110 shadow-md' 
              : 'hover:bg-cream-100 dark:hover:bg-warm-700 hover:scale-105'
          ]"
          :aria-label="mood.label"
          :title="mood.label"
          @click="handleMoodSelect(mood.value)"
        >
          {{ mood.emoji }}
        </button>
      </div>
      
      <!-- Selected Mood Label -->
      <p 
        v-if="selectedMoodLabel" 
        class="text-center text-lavender-600 dark:text-lavender-400 font-medium text-sm mb-3"
      >
        {{ selectedMoodLabel }}
      </p>
      
      <!-- Mood Note -->
      <input
        v-model="form.mood.note"
        type="text"
        placeholder="기분에 대한 한마디 (선택)"
        class="w-full border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
      />
    </div>

    <!-- People -->
    <div>
      <label class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        👥 함께한 사람
      </label>
      <div class="space-y-3">
        <div
          v-for="(person, index) in form.people"
          :key="index"
          class="p-4 bg-cream-50 dark:bg-warm-800 rounded-2xl space-y-3 border border-cream-100 dark:border-warm-700"
        >
          <div class="flex gap-2">
            <div class="flex-1 relative">
              <input
                :value="person.name"
                type="text"
                placeholder="이름을 입력하세요"
                @input="handlePersonInput($event, index)"
                @focus="handlePersonFocus(index)"
                @blur="handlePersonBlur"
                class="w-full border border-warm-300 dark:border-warm-500 bg-white dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
              />
              <!-- Autocomplete Suggestions -->
              <div
                v-if="focusedPersonIndex === index && personSuggestions.length > 0"
                class="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-warm-700 border border-warm-300 dark:border-warm-500 rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  v-for="suggestion in personSuggestions"
                  :key="suggestion"
                  type="button"
                  @mousedown.prevent="selectSuggestion(suggestion)"
                  class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-lavender-50 dark:hover:bg-lavender-900/20 transition-colors"
                >
                  <img
                    :src="getAvatarUrl(suggestion, 'lorelei')"
                    :alt="suggestion"
                    class="w-7 h-7 rounded-full bg-cream-100 dark:bg-warm-600"
                  />
                  <span class="text-warm-700 dark:text-cream-100">{{ suggestion }}</span>
                </button>
              </div>
            </div>
            <!-- Custom Mood Dropdown -->
            <div class="relative">
              <button
                type="button"
                @click="togglePersonMoodDropdown(index)"
                class="w-14 h-12 border border-warm-300 dark:border-warm-500 bg-white dark:bg-warm-700 rounded-xl flex items-center justify-center text-xl hover:bg-cream-50 dark:hover:bg-warm-600 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 transition-all"
                :class="person.mood ? 'ring-2 ring-lavender-400 dark:ring-lavender-500 bg-lavender-50 dark:bg-lavender-900/30' : ''"
                :aria-label="person.mood ? getPersonMoodLabel(person.mood) : '기분 선택'"
              >
                <span v-if="person.mood">{{ getPersonMoodEmoji(person.mood) }}</span>
                <span v-else class="text-warm-400 dark:text-warm-500">😶</span>
              </button>
              
              <!-- Dropdown Menu -->
              <div
                v-if="openPersonMoodIndex === index"
                class="absolute z-50 top-full right-0 mt-2 bg-white dark:bg-warm-700 border border-warm-300 dark:border-warm-500 rounded-xl shadow-lg p-2"
              >
                <div class="flex gap-1">
                  <button
                    v-for="mood in personMoodOptions"
                    :key="mood.value"
                    type="button"
                    @click="selectPersonMood(index, mood.value)"
                    :class="[
                      'text-xl p-2 rounded-lg transition-all duration-200',
                      person.mood === mood.value 
                        ? 'bg-lavender-200 dark:bg-lavender-800/60 ring-2 ring-lavender-500 dark:ring-lavender-400 scale-110' 
                        : 'hover:bg-cream-100 dark:hover:bg-warm-600 hover:scale-105'
                    ]"
                    :aria-label="mood.label"
                    :title="mood.label"
                  >
                    {{ mood.emoji }}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="removePerson(index)"
              class="px-3 py-2 text-warm-400 dark:text-warm-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              ✕
            </button>
          </div>
          <input
            v-model="person.feeling"
            type="text"
            placeholder="함께한 순간에 대한 메모 (선택)"
            class="w-full border border-warm-300 dark:border-warm-500 bg-white dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 text-sm transition-all"
          />
        </div>
        <button
          type="button"
          @click="addPerson"
          class="w-full border-2 border-dashed border-cream-300 dark:border-warm-600 rounded-xl px-4 py-3 text-warm-500 dark:text-warm-400 hover:border-lavender-400 hover:text-lavender-600 dark:hover:text-lavender-400 transition-all"
        >
          + 사람 추가
        </button>
      </div>
    </div>

    <!-- Tomorrow -->
    <div>
      <label for="tomorrow" class="block text-sm font-medium mb-3 text-warm-700 dark:text-cream-200">
        🌅 내일의 다짐 (선택)
      </label>
      <textarea
        id="tomorrow"
        v-model="form.tomorrow"
        rows="3"
        class="w-full border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 resize-none transition-all"
        placeholder="내일의 계획이나 목표를 입력하세요..."
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-2">
      <button
        type="submit"
        class="flex-1 btn-primary py-4 text-base"
      >
        ✨ 저장하기
      </button>
      <button
        v-if="hasExistingEntry"
        type="button"
        @click="handleDelete"
        class="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-base font-medium"
      >
        삭제
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Mood, MoodValue } from '~/types'
import { useEntriesStore } from '~/stores/entries'
import { getAvatarUrl } from '~/utils/avatar'

const entriesStore = useEntriesStore()

// Mood options with emojis
const moodOptions = [
  { value: 'great' as const, emoji: '😄', label: '최고예요!' },
  { value: 'good' as const, emoji: '🙂', label: '좋아요' },
  { value: 'okay' as const, emoji: '😐', label: '그냥 그래요' },
  { value: 'bad' as const, emoji: '😔', label: '별로예요' },
  { value: 'awful' as const, emoji: '😢', label: '힘들어요' },
]

// Person mood options (same as main mood but for people)
const personMoodOptions = [
  { value: 'great' as const, emoji: '😊', label: '최고' },
  { value: 'good' as const, emoji: '🙂', label: '좋음' },
  { value: 'okay' as const, emoji: '😐', label: '보통' },
  { value: 'bad' as const, emoji: '😕', label: '나쁨' },
  { value: 'awful' as const, emoji: '😢', label: '최악' },
]

// State for person mood dropdown
const openPersonMoodIndex = ref<number | null>(null)

const togglePersonMoodDropdown = (index: number): void => {
  if (openPersonMoodIndex.value === index) {
    openPersonMoodIndex.value = null
  } else {
    openPersonMoodIndex.value = index
  }
}

const selectPersonMood = (index: number, moodValue: string): void => {
  if (form.value.people[index]) {
    form.value.people[index].mood = moodValue
  }
  openPersonMoodIndex.value = null
}

const getPersonMoodEmoji = (moodValue: string): string => {
  const mood = personMoodOptions.find(m => m.value === moodValue)
  return mood ? mood.emoji : '😶'
}

const getPersonMoodLabel = (moodValue: string): string => {
  const mood = personMoodOptions.find(m => m.value === moodValue)
  return mood ? mood.label : '기분'
}

// Click outside handler to close person mood dropdown
const handleClickOutside = (event: MouseEvent): void => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    openPersonMoodIndex.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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

const selectedMoodLabel = computed(() => {
  const mood = moodOptions.find(m => m.value === form.value.mood.value)
  return mood ? mood.label : ''
})

const handleMoodSelect = (moodValue: MoodValue): void => {
  form.value.mood.value = moodValue
}

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

