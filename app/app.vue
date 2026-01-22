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
            
            <!-- Profile Dropdown (Desktop) -->
            <div v-if="user" class="hidden md:block relative">
              <button
                @click="isProfileOpen = !isProfileOpen"
                class="p-2 rounded-xl bg-cream-100 dark:bg-warm-700 hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                aria-label="프로필 메뉴"
              >
                <span class="text-lg">👤</span>
              </button>
              
              <!-- Dropdown Menu -->
              <Transition name="dropdown">
                <div 
                  v-if="isProfileOpen"
                  class="absolute right-0 mt-2 w-64 bg-white dark:bg-warm-800 rounded-2xl shadow-xl border border-cream-200 dark:border-warm-600 overflow-hidden z-50"
                >
                  <!-- User Info -->
                  <div class="px-4 py-3 border-b border-cream-200 dark:border-warm-600">
                    <div class="flex items-center gap-2">
                      <!-- Google Icon if Google login -->
                      <svg v-if="isGoogleUser" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span class="text-sm text-warm-800 dark:text-cream-100 truncate">
                        {{ user.email }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Export Data Button -->
                  <button
                    @click="handleExportData"
                    class="w-full px-4 py-3 text-left text-sm text-warm-600 dark:text-warm-300 hover:bg-cream-50 dark:hover:bg-warm-700 transition-colors flex items-center gap-2"
                  >
                    <span>📦</span>
                    <span>데이터 내보내기</span>
                  </button>
                  
                  <!-- Logout Button -->
                  <button
                    @click="handleLogout"
                    class="w-full px-4 py-3 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <span>🚪</span>
                    <span>로그아웃</span>
                  </button>
                </div>
              </Transition>
            </div>
            
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
        
      </div>
    </nav>
    
    <!-- Mobile Full Screen Menu -->
    <Teleport to="body">
      <Transition name="mobile-menu">
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden fixed inset-0 z-[90] bg-cream-50 dark:bg-warm-900"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-cream-200/50 dark:border-warm-700/50 bg-white/70 dark:bg-warm-800/70 backdrop-blur-md">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🌸</span>
              <span class="logo-text text-warm-800 dark:text-cream-100">Daybloom</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="toggleDarkMode"
                class="p-2 rounded-xl bg-cream-100 dark:bg-warm-700 hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
              >
                <span class="text-lg">{{ isDark ? '☀️' : '🌙' }}</span>
              </button>
              <button
                @click="isMobileMenuOpen = false"
                class="p-2 rounded-xl bg-cream-100 dark:bg-warm-700 hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                aria-label="메뉴 닫기"
              >
                <span class="text-lg">✕</span>
              </button>
            </div>
          </div>
          
          <!-- Menu Content -->
          <div class="flex flex-col p-4 gap-2">
            <NuxtLink
              v-for="nav in navItems"
              :key="nav.path"
              :to="nav.path"
              :class="[
                'px-4 py-3 rounded-xl text-base font-medium transition-colors',
                isActiveRoute(nav.path)
                  ? 'bg-lavender-100 text-lavender-600 dark:bg-lavender-900/30 dark:text-lavender-400'
                  : 'text-warm-600 hover:bg-cream-100 dark:text-warm-300 dark:hover:bg-warm-700'
              ]"
              @click="isMobileMenuOpen = false"
            >
              {{ nav.emoji }} {{ nav.label }}
            </NuxtLink>
            
            <!-- User Info (Mobile) -->
            <div v-if="user" class="border-t border-cream-200/50 dark:border-warm-700/50 mt-4 pt-4">
              <div class="flex items-center gap-2 text-sm text-warm-600 dark:text-warm-300 px-4 mb-3">
                <svg v-if="isGoogleUser" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span class="truncate">{{ user.email }}</span>
              </div>
              <button
                @click="handleExportData"
                class="w-full px-4 py-3 rounded-xl text-base font-medium text-warm-600 dark:text-warm-300 hover:bg-cream-100 dark:hover:bg-warm-700 transition-colors text-left flex items-center gap-2 mb-1"
              >
                <span>📦</span>
                <span>데이터 내보내기</span>
              </button>
              <button
                @click="handleLogout"
                class="w-full px-4 py-3 rounded-xl text-base font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left flex items-center gap-2"
              >
                <span>🚪</span>
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
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
                  :disabled="isLoggingOut"
                  class="flex-1 px-4 py-3 bg-cream-100 dark:bg-warm-700 text-warm-700 dark:text-cream-200 rounded-2xl font-medium hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  @click="confirmLogout"
                  :disabled="isLoggingOut"
                  class="flex-1 px-4 py-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span v-if="isLoggingOut" class="inline-flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    로그아웃 중...
                  </span>
                  <span v-else>로그아웃</span>
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDarkMode } from '~/composables/useDarkMode'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useEntriesStore } from '~/stores/entries'
import { useWeeklyStore } from '~/stores/weekly'
import { useProjectsStore } from '~/stores/projects'

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const entriesStore = useEntriesStore()
const weeklyStore = useWeeklyStore()
const projectsStore = useProjectsStore()

const { isDark, toggleDarkMode, initDarkMode } = useDarkMode()

const isMobileMenuOpen = ref(false)
const showLogoutModal = ref(false)

// 모달 열릴 때 배경 스크롤 막기
useBodyScrollLock(showLogoutModal)
useBodyScrollLock(isMobileMenuOpen)
const isLoggingOut = ref(false)
const isAppLoading = ref(true) // 앱 전체 로딩 상태 (처음엔 로딩 중)
const isProfileOpen = ref(false)

// Google 로그인 여부 확인
const isGoogleUser = computed(() => {
  return user.value?.app_metadata?.provider === 'google' || 
         user.value?.app_metadata?.providers?.includes('google')
})

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

// 프로필 드롭다운 외부 클릭 시 닫기
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isProfileOpen.value = false
  }
}

// 로그아웃 모달 열기
const handleLogout = () => {
  showLogoutModal.value = true
  isMobileMenuOpen.value = false
  isProfileOpen.value = false
}

// 데이터 내보내기
const handleExportData = () => {
  isProfileOpen.value = false
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    entries: Object.values(entriesStore.entriesByDate),
    weeklyNotes: weeklyStore.weeklyNotesByWeekStart,
    projects: projectsStore.projects,
  }
  
  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `daybloom-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 스토어 초기화 (데이터 클리어)
const clearAllStores = () => {
  entriesStore.$reset()
  weeklyStore.$reset()
  projectsStore.$reset()
}

// 로그아웃 확인
const confirmLogout = async () => {
  isLoggingOut.value = true
  try {
    clearAllStores() // 로그아웃 시 데이터 클리어
    await supabase.auth.signOut()
    showLogoutModal.value = false
    navigateTo('/login')
  } finally {
    isLoggingOut.value = false
  }
}

// 로그아웃 취소
const cancelLogout = () => {
  showLogoutModal.value = false
}

// 앱 초기화 및 데이터 로드
const initializeApp = async (forceRefresh = false) => {
  if (entriesStore.isInitialized && !forceRefresh) return
  
  isAppLoading.value = true
  
  if (user.value?.id) {
    await Promise.all([
      entriesStore.fetchEntries(),
      weeklyStore.fetchWeeklyNotes(),
      projectsStore.fetchProjects()
    ])
  }
  
  isAppLoading.value = false
}

// 마지막으로 초기화한 사용자 ID 추적
const lastInitializedUserId = ref<string | null>(null)

// 데이터 로드 함수
const loadUserData = async (userId: string) => {
  if (lastInitializedUserId.value === userId && entriesStore.isInitialized) {
    isAppLoading.value = false
    return // 이미 이 사용자로 초기화됨
  }
  
  lastInitializedUserId.value = userId
  isAppLoading.value = true
  
  try {
    await Promise.all([
      entriesStore.fetchEntries(),
      weeklyStore.fetchWeeklyNotes(),
      projectsStore.fetchProjects()
    ])
  } catch (error) {
    console.error('Failed to load user data:', error)
  } finally {
    isAppLoading.value = false
  }
}

// Auth state change 구독 해제 함수
let authSubscription: { unsubscribe: () => void } | null = null

onMounted(async () => {
  initDarkMode()
  document.addEventListener('click', handleClickOutside)
  
  try {
    // 먼저 초기 세션 확인 (페이지 새로고침 시)
    const { data: { session } } = await (supabase as any).auth.getSession()
    
    if (session?.user?.id) {
      await loadUserData(session.user.id)
    } else {
      isAppLoading.value = false
    }
    
    // 이후 Auth 상태 변화 리스너 등록 (로그인/로그아웃 이벤트만 처리)
    const { data: { subscription } } = (supabase as any).auth.onAuthStateChange(
      async (event: string, session: any) => {
        // INITIAL_SESSION은 이미 위에서 처리했으므로 스킵
        if (event === 'INITIAL_SESSION') {
          return
        }
        
        if (event === 'SIGNED_IN' && session?.user?.id) {
          // 새 로그인 이벤트 (다른 탭에서 로그인 등)
          if (lastInitializedUserId.value !== session.user.id) {
            await loadUserData(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          // 로그아웃 이벤트
          lastInitializedUserId.value = null
          clearAllStores()
          isAppLoading.value = false
        }
      }
    )
    authSubscription = subscription
  } catch (error) {
    console.error('Failed to initialize app:', error)
    isAppLoading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // Auth 리스너 해제
  if (authSubscription) {
    authSubscription.unsubscribe()
  }
})
</script>
