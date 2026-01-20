<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()

// 이미 로그인되어 있으면 홈으로
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// 이메일 로그인
const handleEmailLogin = async () => {
  loading.value = true
  error.value = ''
  
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  
  if (authError) {
    error.value = authError.message
  }
  
  loading.value = false
}

// 구글 로그인
const handleGoogleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const { error: authError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  })
  
  if (authError) {
    error.value = authError.message
  }
  
  loading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-cream-50 via-lavender-50 to-cream-100 dark:from-warm-900 dark:via-warm-800 dark:to-warm-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="logo-text text-3xl text-lavender-600 dark:text-lavender-400 mb-2">Daybloom</h1>
        <p class="text-warm-500 dark:text-warm-400">하루를 기록하는 공간</p>
      </div>
      
      <!-- Login Card -->
      <div class="card">
        <h2 class="text-xl font-semibold text-warm-800 dark:text-cream-100 text-center mb-6">로그인</h2>
        
        <!-- Error Message -->
        <div 
          v-if="error" 
          class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
        >
          {{ error }}
        </div>
        
        <!-- Google Login -->
        <button
          @click="handleGoogleLogin"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-3 bg-white dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-2xl px-4 py-3 text-warm-700 dark:text-cream-100 hover:bg-cream-50 dark:hover:bg-warm-600 transition-all mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="w-5 h-5 border-2 border-lavender-300 border-t-lavender-600 rounded-full animate-spin" />
          <svg v-else class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Google로 계속하기</span>
        </button>
        
        <!-- Divider -->
        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-cream-200 dark:bg-warm-600"></div>
          <span class="text-sm text-warm-400 dark:text-warm-500">또는</span>
          <div class="flex-1 h-px bg-cream-200 dark:bg-warm-600"></div>
        </div>
        
        <!-- Email Form -->
        <form @submit.prevent="handleEmailLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">이메일</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="email@example.com"
              class="w-full border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">비밀번호</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full border border-warm-300 dark:border-warm-500 bg-cream-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
            />
          </div>
          
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              로그인 중...
            </span>
            <span v-else>로그인</span>
          </button>
        </form>
        
        <!-- Sign Up Link -->
        <p class="mt-6 text-center text-sm text-warm-500 dark:text-warm-400">
          계정이 없으신가요?
          <NuxtLink to="/signup" class="text-lavender-600 dark:text-lavender-400 font-medium hover:underline">
            회원가입
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
