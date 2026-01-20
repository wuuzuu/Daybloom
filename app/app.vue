<template>
  <div class="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-lavender-50 dark:from-warm-900 dark:via-warm-800 dark:to-warm-900 transition-colors">
    <!-- Mobile-first Navigation -->
    <nav class="sticky top-0 z-50 bg-white/70 dark:bg-warm-800/70 backdrop-blur-md border-b border-cream-200/50 dark:border-warm-700/50">
      <div class="container mx-auto px-4 py-3 max-w-2xl">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-2xl">🌸</span>
            <span class="logo-text text-warm-800 dark:text-cream-100">Daybloom</span>
          </NuxtLink>
          
          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-6">
            <NuxtLink
              v-for="nav in navItems"
              :key="nav.path"
              :to="nav.path"
              :class="[
                'text-sm font-medium transition-colors',
                isActiveRoute(nav.path)
                  ? 'text-lavender-600 dark:text-lavender-400'
                  : 'text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-cream-100'
              ]"
            >
              {{ nav.label }}
            </NuxtLink>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-xl bg-cream-100 dark:bg-warm-700 hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
              :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
            >
              <span class="text-lg">{{ isDark ? '☀️' : '🌙' }}</span>
            </button>
            
            <!-- Logout Button (Desktop) -->
            <button
              v-if="user"
              @click="handleLogout"
              class="hidden md:block p-2 rounded-xl bg-cream-100 dark:bg-warm-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label="로그아웃"
              title="로그아웃"
            >
              <span class="text-lg">🚪</span>
            </button>
            
            <!-- Mobile Menu Button -->
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="md:hidden p-2 rounded-xl bg-cream-100 dark:bg-warm-700 hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
              aria-label="메뉴 열기"
            >
              <span class="text-lg">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
            </button>
          </div>
        </div>
        
        <!-- Mobile Menu -->
        <div
          v-show="isMobileMenuOpen"
          class="md:hidden mt-3 pt-3 border-t border-cream-200/50 dark:border-warm-700/50"
        >
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-for="nav in navItems"
              :key="nav.path"
              :to="nav.path"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                isActiveRoute(nav.path)
                  ? 'bg-lavender-100 text-lavender-600 dark:bg-lavender-900/30 dark:text-lavender-400'
                  : 'text-warm-600 hover:bg-cream-100 dark:text-warm-300 dark:hover:bg-warm-700'
              ]"
              @click="isMobileMenuOpen = false"
            >
              {{ nav.emoji }} {{ nav.label }}
            </NuxtLink>
            
            <!-- Logout Button (Mobile) -->
            <button
              v-if="user"
              @click="handleLogout"
              class="px-4 py-2 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
            >
              🚪 로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="pb-20">
      <!-- 앱 로딩 중 -->
      <div v-if="isAppLoading" class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center">
          <div class="animate-spin w-12 h-12 border-4 border-lavender-200 border-t-lavender-500 rounded-full mx-auto mb-4" />
          <p class="text-warm-500 dark:text-warm-400">로딩 중...</p>
        </div>
      </div>
      
      <!-- 메인 콘텐츠 -->
      <NuxtPage v-else />
    </main>
    
    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav">
      <div class="mobile-nav-container">
        <!-- Left items -->
        <NuxtLink
          v-for="nav in mobileNavLeft"
          :key="nav.path"
          :to="nav.path"
          :class="['mobile-nav-item', { active: isActiveRoute(nav.path) }]"
        >
          <span class="mobile-nav-icon">{{ nav.emoji }}</span>
          <span class="mobile-nav-label">{{ nav.label }}</span>
        </NuxtLink>
        
        <!-- Center FAB button -->
        <div class="mobile-nav-fab-wrapper">
          <NuxtLink :to="`/entry/${today}`" class="mobile-nav-fab">
            <span class="text-2xl text-white">+</span>
          </NuxtLink>
        </div>
        
        <!-- Right items -->
        <NuxtLink
          v-for="nav in mobileNavRight"
          :key="nav.path"
          :to="nav.path"
          :class="['mobile-nav-item', { active: isActiveRoute(nav.path) }]"
        >
          <span class="mobile-nav-icon">{{ nav.emoji }}</span>
          <span class="mobile-nav-label">{{ nav.label }}</span>
        </NuxtLink>
      </div>
    </nav>
    
    <!-- Logout Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showLogoutModal" 
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-warm-900/50 dark:bg-black/60 backdrop-blur-sm" 
            @click="cancelLogout"
          />
          
          <!-- Modal Content -->
          <div class="relative bg-white dark:bg-warm-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-in">
            <div class="p-6 text-center">
              <span class="text-5xl mb-4 block">👋</span>
              <h3 class="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-2">
                로그아웃 하시겠어요?
              </h3>
              <p class="text-warm-500 dark:text-warm-400 text-sm mb-6">
                다음에 또 만나요!
              </p>
              
              <div class="flex gap-3">
                <button
                  @click="cancelLogout"
                  class="flex-1 px-4 py-3 bg-cream-100 dark:bg-warm-700 text-warm-700 dark:text-cream-200 rounded-2xl font-medium hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                >
                  취소
                </button>
                <button
                  @click="confirmLogout"
                  class="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDarkMode } from '~/composables/useDarkMode'
import { useEntriesStore } from '~/stores/entries'
import { useWeeklyStore } from '~/stores/weekly'

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const entriesStore = useEntriesStore()
const weeklyStore = useWeeklyStore()

const { isDark, toggleDarkMode, initDarkMode } = useDarkMode()

const isMobileMenuOpen = ref(false)
const showLogoutModal = ref(false)
const isAppLoading = ref(true) // 앱 전체 로딩 상태 (처음엔 로딩 중)

const navItems = [
  { path: '/', label: 'Home', emoji: '🏠' },
  { path: '/calendar', label: 'Calendar', emoji: '📅' },
  { path: '/weekly', label: 'Weekly', emoji: '📊' },
  { path: '/mood-chart', label: 'Mood', emoji: '📈' },
  { path: '/people', label: 'People', emoji: '👥' },
  { path: '/search', label: 'Search', emoji: '🔍' },
]

const mobileNavLeft = [
  { path: '/', label: 'Today', emoji: '☀️' },
  { path: '/calendar', label: 'Calendar', emoji: '📅' },
]

const mobileNavRight = [
  { path: '/weekly', label: 'Weekly', emoji: '📊' },
  { path: '/search', label: 'Search', emoji: '🔍' },
]

const today = new Date().toISOString().split('T')[0]

const isActiveRoute = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/' || route.path.startsWith('/entry/')
  }
  return route.path === path
}

// 로그아웃 모달 열기
const handleLogout = () => {
  showLogoutModal.value = true
  isMobileMenuOpen.value = false
}

// 로그아웃 확인
const confirmLogout = async () => {
  await supabase.auth.signOut()
  showLogoutModal.value = false
  navigateTo('/login')
}

// 로그아웃 취소
const cancelLogout = () => {
  showLogoutModal.value = false
}

// 앱 초기화 및 데이터 로드
const initializeApp = async () => {
  if (entriesStore.isInitialized) return
  
  isAppLoading.value = true
  
  if (user.value?.id) {
    await Promise.all([
      entriesStore.fetchEntries(),
      weeklyStore.fetchWeeklyNotes()
    ])
  }
  
  isAppLoading.value = false
}

// 로그인 상태 변경 감지 (클라이언트에서만)
watch(user, async (newUser, oldUser) => {
  if (import.meta.server) return
  
  if (newUser?.id) {
    const isNewUser = !oldUser?.id || oldUser.id !== newUser.id
    if (isNewUser || !entriesStore.isInitialized) {
      await initializeApp()
    }
  }
})

onMounted(async () => {
  initDarkMode()
  
  const { data: { session } } = await (supabase as any).auth.getSession()
  
  if (session?.user?.id && !entriesStore.isInitialized) {
    await Promise.all([
      entriesStore.fetchEntries(),
      weeklyStore.fetchWeeklyNotes()
    ])
  }
  
  isAppLoading.value = false
})
</script>
