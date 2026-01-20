<script setup lang="ts">
const router = useRouter()
const supabase = useSupabaseClient()

onMounted(async () => {
  // URL에서 OAuth 토큰을 처리하고 세션 설정
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Session error:', error)
    router.push('/login')
    return
  }
  
  if (data.session) {
    // 세션이 있으면 홈으로 이동
    router.push('/')
  } else {
    // 세션이 없으면 잠시 대기 후 다시 확인 (OAuth callback 처리 시간)
    setTimeout(async () => {
      const { data: retryData } = await supabase.auth.getSession()
      if (retryData.session) {
        router.push('/')
      } else {
        router.push('/login')
      }
    }, 1000)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-cream-50 via-lavender-50 to-cream-100 dark:from-warm-900 dark:via-warm-800 dark:to-warm-900 flex items-center justify-center p-4">
    <div class="text-center">
      <div class="animate-spin w-8 h-8 border-4 border-lavender-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-warm-600 dark:text-warm-300">로그인 확인 중...</p>
    </div>
  </div>
</template>
