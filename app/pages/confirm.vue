<script setup lang="ts">
const router = useRouter()
const user = useSupabaseUser()

// 로그인 완료되면 홈으로 이동
watchEffect(() => {
  if (user.value) {
    router.push('/')
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
