<template>
  <div v-if="entry" class="space-y-6">
    <!-- Notes -->
    <div v-if="entry.bullets.length > 0">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Notes</h3>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <ul class="space-y-2">
          <li
            v-for="(bullet, index) in entry.bullets"
            :key="index"
            class="flex items-start"
          >
            <span class="text-gray-400 mr-2">•</span>
            <span class="text-gray-900 dark:text-gray-100">{{ bullet }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Events -->
    <div v-if="entry.events && entry.events.length > 0">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Events</h3>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <ul class="space-y-2">
          <li
            v-for="(event, index) in entry.events"
            :key="index"
            class="flex items-start"
          >
            <span class="text-gray-400 mr-2">•</span>
            <span class="text-gray-900 dark:text-gray-100">{{ event }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Mood -->
    <div>
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Mood</h3>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div class="flex items-center gap-3 mb-2">
          <MoodBadge :value="entry.mood.value" />
        </div>
        <p v-if="entry.mood.note" class="text-gray-700 dark:text-gray-300 text-sm mt-2">
          {{ entry.mood.note }}
        </p>
        <p v-else class="text-gray-400 text-sm italic">
          노트가 없습니다.
        </p>
      </div>
    </div>

    <!-- People -->
    <div v-if="entry.people.length > 0">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">People</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="(person, index) in entry.people"
          :key="index"
          :class="[
            'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all cursor-pointer',
            expandedPerson === getPersonName(person) 
              ? 'col-span-2 sm:col-span-3 shadow-lg' 
              : 'aspect-square hover:shadow-md'
          ]"
          @click="togglePerson(getPersonName(person))"
        >
          <!-- 기본 카드 (접힌 상태) -->
          <div 
            :class="[
              'p-4 flex items-center',
              expandedPerson === getPersonName(person) 
                ? 'border-b border-gray-200 dark:border-gray-700' 
                : 'flex-col text-center justify-center h-full'
            ]"
          >
            <img 
              :src="getAvatarUrl(getPersonName(person), 'fun-emoji')"
              :alt="getPersonName(person)"
              :class="[
                'rounded-full bg-gray-100 dark:bg-gray-700',
                expandedPerson === getPersonName(person) ? 'w-10 h-10 mr-3' : 'w-14 h-14 mb-2'
              ]"
            />
            <div :class="expandedPerson === getPersonName(person) ? 'flex-1' : ''">
              <span class="text-gray-900 dark:text-gray-100 font-medium text-sm">
                {{ getPersonName(person) }}
              </span>
              <p 
                v-if="typeof person !== 'string' && person.feeling && expandedPerson !== getPersonName(person)" 
                class="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2"
              >
                {{ person.feeling }}
              </p>
            </div>
            <span 
              v-if="expandedPerson === getPersonName(person)"
              class="text-gray-400 text-sm"
            >
              ▲ 접기
            </span>
          </div>
          
          <!-- 확장된 히스토리 -->
          <div 
            v-if="expandedPerson === getPersonName(person)"
            class="p-4 max-h-64 overflow-y-auto"
            @click.stop
          >
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">최근 기록</p>
            <div class="space-y-2">
              <div
                v-for="history in getPersonHistory(getPersonName(person))"
                :key="history.date"
                class="flex items-start gap-3 p-2 bg-white dark:bg-gray-700 rounded-lg"
              >
                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ history.date }}
                </span>
                <p class="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {{ history.feeling }}
                </p>
              </div>
              <p 
                v-if="getPersonHistory(getPersonName(person)).length === 0"
                class="text-sm text-gray-400 dark:text-gray-500 text-center py-2"
              >
                기록이 없습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tomorrow -->
    <div v-if="entry.tomorrow">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tomorrow</h3>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p class="text-gray-900 dark:text-gray-100 whitespace-pre-line">{{ entry.tomorrow }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        @click="$emit('edit')"
        class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        수정
      </button>
      <button
        @click="handleDelete"
        class="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
      >
        삭제
      </button>
    </div>
  </div>

  <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
    <p class="mb-4">이 날짜의 기록이 없습니다.</p>
    <button
      @click="$emit('create')"
      class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
    >
      새로 작성하기
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Entry, Person } from '~/types'
import MoodBadge from '~/components/Common/MoodBadge.vue'
import { getAvatarUrl } from '~/utils/avatar'
import { useEntriesStore } from '~/stores/entries'
import { formatDate } from '~/utils/date'

const props = defineProps<{
  entry: Entry | undefined
}>()

const entriesStore = useEntriesStore()

// 확장된 사람 (한 번에 하나만)
const expandedPerson = ref<string | null>(null)

// 사람 이름 추출 헬퍼
const getPersonName = (person: Person | string): string => {
  return typeof person === 'string' ? person : person.name
}

// 카드 클릭 핸들러
const togglePerson = (personName: string) => {
  if (expandedPerson.value === personName) {
    expandedPerson.value = null
  } else {
    expandedPerson.value = personName
  }
}

// 특정 사람의 모든 기록 가져오기 (감상이 있는 것만)
const getPersonHistory = (personName: string) => {
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
    .filter(item => item.feeling !== null) // 감상이 있는 것만 표시
    .slice(0, 10) // 최근 10개만
}

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

