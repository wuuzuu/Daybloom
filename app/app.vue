<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-4 max-w-6xl">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="text-2xl font-bold text-gray-900 dark:text-white">
            TRACE
          </NuxtLink>
          <div class="flex items-center gap-4">
            <NuxtLink
              to="/"
              :class="[
                'transition-colors',
                isDashboardActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/calendar"
              :class="[
                'transition-colors',
                isCalendarActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              Calendar
            </NuxtLink>
            <NuxtLink
              to="/weekly"
              :class="[
                'transition-colors',
                isWeeklyActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              Weekly
            </NuxtLink>
            <NuxtLink
              to="/mood-chart"
              :class="[
                'transition-colors',
                isMoodChartActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              📈 Mood
            </NuxtLink>
            <NuxtLink
              to="/people"
              :class="[
                'transition-colors',
                isPeopleActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              👥 People
            </NuxtLink>
            <NuxtLink
              to="/search"
              :class="[
                'transition-colors',
                isSearchActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              🔍 Search
            </NuxtLink>
            
            <!-- 다크 모드 토글 -->
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
            >
              <span v-if="isDark" class="text-xl">☀️</span>
              <span v-else class="text-xl">🌙</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDarkMode } from '~/composables/useDarkMode'

const route = useRoute()
const { isDark, toggleDarkMode, initDarkMode } = useDarkMode()

onMounted(() => {
  initDarkMode()
})

const isDashboardActive = computed(() => {
  return route.path === '/' || route.path.startsWith('/entry/')
})

const isCalendarActive = computed(() => {
  return route.path === '/calendar'
})

const isWeeklyActive = computed(() => {
  return route.path === '/weekly'
})

const isMoodChartActive = computed(() => {
  return route.path === '/mood-chart'
})

const isPeopleActive = computed(() => {
  return route.path === '/people'
})

const isSearchActive = computed(() => {
  return route.path === '/search'
})
</script>

