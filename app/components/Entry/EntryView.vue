<template>
  <div v-if="entry" class="space-y-6">
    <!-- 🆕 Work Items (Projects) -->
    <div v-if="entry.workItems && entry.workItems.length > 0" class="card">
      <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">💼 오늘 작업한 프로젝트</h3>
      <div class="space-y-3">
        <div 
          v-for="workItem in entry.workItems"
          :key="workItem.projectId"
          class="bg-cream-50 dark:bg-warm-700 rounded-2xl p-4 border border-cream-200 dark:border-warm-600"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-300 text-xs font-medium rounded-lg">
              {{ getProjectCrew(workItem.projectId) }}
            </span>
            <a 
              v-if="getProjectJiraLink(workItem.projectId)"
              :href="getProjectJiraLink(workItem.projectId)"
              target="_blank"
              class="text-xs text-lavender-600 dark:text-lavender-400 font-mono hover:underline"
            >
              🎫 {{ extractTicketFromUrl(getProjectJiraLink(workItem.projectId) || '') }}
            </a>
          </div>
          <p class="text-warm-800 dark:text-cream-100 font-medium mb-1">
            {{ getProjectTitle(workItem.projectId) }}
          </p>
          <a 
            v-if="getProjectNotionLink(workItem.projectId)"
            :href="getProjectNotionLink(workItem.projectId)"
            target="_blank"
            class="text-xs text-lavender-600 dark:text-lavender-400 hover:underline inline-block mb-2"
          >
            📎 노션 링크
          </a>
          <p v-if="workItem.dailyNote" class="text-warm-600 dark:text-warm-300 text-sm mt-2 bg-white dark:bg-warm-800 rounded-xl p-3">
            {{ workItem.dailyNote }}
          </p>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="entry.bullets.length > 0" class="card">
      <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">📝 Notes</h3>
      <ul class="space-y-2">
        <li
          v-for="(bullet, index) in entry.bullets"
          :key="index"
          class="flex items-start"
        >
          <span class="text-lavender-400 dark:text-lavender-500 mr-2">•</span>
          <span class="text-warm-800 dark:text-cream-100">{{ bullet }}</span>
        </li>
      </ul>
    </div>

    <!-- Events -->
    <div v-if="entry.events && entry.events.length > 0" class="card">
      <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">🎉 Events</h3>
      <ul class="space-y-2">
        <li
          v-for="(event, index) in entry.events"
          :key="index"
          class="flex items-start"
        >
          <span class="text-lavender-400 dark:text-lavender-500 mr-2">•</span>
          <span class="text-warm-800 dark:text-cream-100">{{ event }}</span>
        </li>
      </ul>
    </div>

    <!-- Mood -->
    <div class="card">
      <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">😊 Mood</h3>
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl">{{ getMoodEmoji(entry.mood.value) }}</span>
        <MoodBadge :value="entry.mood.value" />
      </div>
      <p v-if="entry.mood.note" class="text-warm-700 dark:text-warm-300 text-sm mt-3 bg-cream-50 dark:bg-warm-700 rounded-xl p-3">
        {{ entry.mood.note }}
      </p>
      <p v-else class="text-warm-400 dark:text-warm-500 text-sm italic mt-2">
        노트가 없습니다.
      </p>
    </div>

    <!-- People -->
    <div v-if="entry.people.length > 0" class="card">
      <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">👥 People</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          v-for="(person, index) in entry.people"
          :key="index"
          type="button"
          class="bg-cream-50 dark:bg-warm-700 rounded-2xl border border-cream-200 dark:border-warm-600 transition-all cursor-pointer aspect-square hover:shadow-md hover:border-lavender-300 dark:hover:border-lavender-600 hover:scale-[1.02] active:scale-[0.98]"
          @click="openPersonModal(person)"
        >
          <div class="p-4 flex flex-col text-center justify-center h-full">
            <img 
              :src="getAvatarUrl(getPersonName(person), 'lorelei')"
              :alt="getPersonName(person)"
              class="rounded-full bg-cream-100 dark:bg-warm-600 w-14 h-14 mb-2 mx-auto"
            />
            <span class="text-warm-800 dark:text-cream-100 font-medium text-sm">
              {{ getPersonName(person) }}
            </span>
            <p 
              v-if="typeof person !== 'string' && person.feeling" 
              class="text-warm-500 dark:text-warm-400 text-xs mt-1 line-clamp-2"
            >
              {{ person.feeling }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- Person History Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="selectedPerson" 
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closePersonModal"
        >
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-warm-900/50 dark:bg-black/60 backdrop-blur-sm" 
            @click="closePersonModal"
          />
          
          <!-- Modal Content -->
          <div class="relative bg-white dark:bg-warm-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-modal-in">
            <!-- Header -->
            <div class="flex items-center gap-4 p-5 border-b border-cream-200 dark:border-warm-600">
              <img 
                :src="getAvatarUrl(getPersonName(selectedPerson), 'lorelei')"
                :alt="getPersonName(selectedPerson)"
                class="w-14 h-14 rounded-full bg-cream-100 dark:bg-warm-600"
              />
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-warm-800 dark:text-cream-100">
                  {{ getPersonName(selectedPerson) }}
                </h3>
                <p v-if="typeof selectedPerson !== 'string' && selectedPerson.feeling" class="text-sm text-warm-500 dark:text-warm-400 mt-0.5">
                  {{ selectedPerson.feeling }}
                </p>
              </div>
              <button
                type="button"
                @click="closePersonModal"
                class="p-2 text-warm-400 hover:text-warm-600 dark:hover:text-cream-200 hover:bg-cream-100 dark:hover:bg-warm-700 rounded-xl transition-colors"
                aria-label="닫기"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- History List -->
            <div class="p-5 overflow-y-auto max-h-[calc(80vh-100px)]">
              <p class="text-xs text-warm-500 dark:text-warm-400 mb-3 font-medium">📅 최근 기록</p>
              
              <div v-if="selectedPersonHistory.length > 0" class="space-y-3">
                <div
                  v-for="history in selectedPersonHistory"
                  :key="history.date"
                  class="p-4 bg-cream-50 dark:bg-warm-700 rounded-2xl"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">{{ getMoodEmoji(history.mood) }}</span>
                    <span class="text-sm text-lavender-600 dark:text-lavender-400 font-medium">
                      {{ history.date }}
                    </span>
                  </div>
                  <p class="text-warm-700 dark:text-warm-200 text-sm">
                    {{ history.feeling }}
                  </p>
                </div>
              </div>
              
              <div v-else class="text-center py-8">
                <span class="text-4xl mb-3 block">📭</span>
                <p class="text-warm-500 dark:text-warm-400">기록이 없습니다.</p>
                <p class="text-warm-400 dark:text-warm-500 text-sm mt-1">함께한 순간을 기록해보세요!</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Tomorrow -->
    <div v-if="entry.tomorrow" class="card">
      <h3 class="text-sm font-medium text-warm-500 dark:text-warm-400 mb-3">🌅 Tomorrow</h3>
      <p class="text-warm-800 dark:text-cream-100 whitespace-pre-line">{{ entry.tomorrow }}</p>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-4 border-t border-cream-200 dark:border-warm-600">
      <button
        @click="$emit('edit')"
        :disabled="isDeleting"
        class="flex-1 btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ✏️ 수정
      </button>
      <button
        @click="handleDelete"
        :disabled="isDeleting"
        class="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-base font-medium disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span v-if="isDeleting" class="inline-flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />
          삭제 중...
        </span>
        <span v-else>삭제</span>
      </button>
    </div>
  </div>

  <div v-else class="card text-center py-12">
    <span class="text-5xl mb-4 block">📝</span>
    <p class="text-warm-600 dark:text-warm-300 font-medium mb-2">이 날짜의 기록이 없습니다.</p>
    <p class="text-warm-400 dark:text-warm-500 text-sm mb-6">오늘의 하루를 기록해보세요!</p>
    <button
      @click="$emit('create')"
      class="btn-primary inline-flex items-center gap-2"
    >
      <span>✨</span>
      <span>새로 작성하기</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Entry, Person, MoodValue } from '~/types'
import MoodBadge from '~/components/Common/MoodBadge.vue'
import { getAvatarUrl } from '~/utils/avatar'
import { useEntriesStore } from '~/stores/entries'
import { useProjectsStore } from '~/stores/projects'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { formatDate } from '~/utils/date'

const props = defineProps<{
  entry: Entry | undefined
  isDeleting?: boolean
}>()

const entriesStore = useEntriesStore()
const projectsStore = useProjectsStore()

// 🆕 프로젝트 정보 헬퍼 함수들
const getProjectCrew = (projectId: string): string => {
  return projectsStore.getProjectById(projectId)?.crew || '알 수 없음'
}

const getProjectJiraLink = (projectId: string): string | undefined => {
  return projectsStore.getProjectById(projectId)?.jiraLink
}

// URL에서 티켓 번호 추출 (마지막 / 뒤의 텍스트)
const extractTicketFromUrl = (url: string): string => {
  if (!url) return ''
  try {
    const cleanUrl = url.replace(/\/+$/, '') // 끝의 슬래시 제거
    const parts = cleanUrl.split('/')
    return parts[parts.length - 1] || ''
  } catch {
    return ''
  }
}

const getProjectTitle = (projectId: string): string => {
  return projectsStore.getProjectById(projectId)?.title || '삭제된 프로젝트'
}

const getProjectNotionLink = (projectId: string): string | undefined => {
  return projectsStore.getProjectById(projectId)?.notionLink
}

// Mood emoji helper
const getMoodEmoji = (mood: MoodValue): string => {
  const emojis: Record<MoodValue, string> = {
    great: '😄',
    good: '🙂',
    okay: '😐',
    bad: '😔',
    awful: '😢',
  }
  return emojis[mood] || '😐'
}

// 모달에 표시할 선택된 사람
const selectedPerson = ref<Person | string | null>(null)

// 모달 열릴 때 배경 스크롤 막기
const isPersonModalOpen = computed(() => selectedPerson.value !== null)
useBodyScrollLock(isPersonModalOpen)

// 사람 이름 추출 헬퍼
const getPersonName = (person: Person | string): string => {
  return typeof person === 'string' ? person : person.name
}

// 모달 열기
const openPersonModal = (person: Person | string) => {
  selectedPerson.value = person
  // 스크롤 방지
  document.body.style.overflow = 'hidden'
}

// 모달 닫기
const closePersonModal = () => {
  selectedPerson.value = null
  document.body.style.overflow = ''
}

// 선택된 사람의 히스토리 (computed)
const selectedPersonHistory = computed(() => {
  if (!selectedPerson.value) return []
  
  const personName = getPersonName(selectedPerson.value)
  const allEntries = entriesStore.listEntries()
  
  return allEntries
    .filter(entry => {
      return entry.people.some(p => getPersonName(p) === personName)
    })
    .map(entry => {
      const personData = entry.people.find(p => getPersonName(p) === personName)
      const feeling = typeof personData !== 'string' && personData?.feeling 
        ? personData.feeling 
        : null
      return {
        date: entry.date,
        feeling,
        mood: entry.mood.value,
      }
    })
    .filter(item => item.feeling !== null)
    .slice(0, 10)
})

const emit = defineEmits<{
  edit: []
  create: []
  delete: []
}>()

function handleDelete() {
  if (confirm('정말 삭제하시겠습니까?')) {
    emit('delete')
  }
}
</script>

