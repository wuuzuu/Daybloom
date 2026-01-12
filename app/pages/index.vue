<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 dark:text-white">Dashboard</h1>
    
    <!-- 오늘 기록하기 버튼 -->
    <div class="mb-8">
      <NuxtLink
        :to="`/entry/${today}`"
        class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        오늘 기록하기
      </NuxtLink>
    </div>

    <!-- 최근 7일 엔트리 리스트 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 dark:text-white">최근 7일</h2>
      <div v-if="recentEntries.length === 0" class="text-gray-500 dark:text-gray-400">
        기록이 없습니다.
      </div>
      <div v-else class="flex flex-col gap-4">
        <EntryCard
          v-for="entry in recentEntries"
          :key="entry.id"
          :entry="entry"
        />
      </div>
    </section>

    <!-- 이번 주 요약 링크 -->
    <section>
      <NuxtLink
        to="/weekly"
        class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        이번 주 요약 보기 →
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEntriesStore } from '~/stores/entries'
import { getToday } from '~/utils/date'
import EntryCard from '~/components/Entry/EntryCard.vue'

const entriesStore = useEntriesStore()
const today = getToday()

// 최근 7일 엔트리 조회
const recentEntries = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const from = sevenDaysAgo.toISOString().split('T')[0]
  const to = today
  
  return entriesStore.listEntries({ from, to })
})
</script>

