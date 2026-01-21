<template>
  <section class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-warm-800 dark:text-cream-100">📝 이번 주 할 일</h2>
      <button
        @click="$emit('edit')"
        class="text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300 text-sm font-medium transition-colors"
      >
        ✏️ 수정
      </button>
    </div>
    
    <div v-if="todos && todos.length > 0" class="space-y-2">
      <button
        v-for="todo in todos"
        :key="todo.id"
        type="button"
        @click="toggleTodo(todo.id)"
        class="w-full flex items-center gap-3 p-3 bg-cream-50 dark:bg-warm-700 rounded-xl transition-all hover:bg-cream-100 dark:hover:bg-warm-600 text-left cursor-pointer"
        :class="{ 'opacity-60': todo.completed }"
      >
        <span
          class="flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center"
          :class="todo.completed 
            ? 'bg-lavender-500 border-lavender-500 text-white' 
            : 'border-warm-300 dark:border-warm-500'"
        >
          <svg v-if="todo.completed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span 
          class="flex-1 text-warm-800 dark:text-cream-100 transition-all"
          :class="{ 'line-through text-warm-400 dark:text-warm-500': todo.completed }"
        >
          {{ todo.text }}
        </span>
      </button>
      
      <!-- 진행률 표시 -->
      <div class="mt-4 pt-4 border-t border-cream-200 dark:border-warm-600">
        <div class="flex items-center justify-between text-sm text-warm-500 dark:text-warm-400 mb-2">
          <span>진행률</span>
          <span>{{ completedCount }}/{{ todos.length }}</span>
        </div>
        <div class="h-2 bg-cream-200 dark:bg-warm-600 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-lavender-400 to-lavender-500 rounded-full transition-all duration-500"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-warm-500 dark:text-warm-400 text-center py-8">
      <span class="text-3xl block mb-2">✅</span>
      <p>이번 주 할 일이 없어요</p>
      <p class="text-sm mt-1">수정 버튼을 눌러 할 일을 추가해보세요!</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WeeklyTodo } from '~/types'

const props = defineProps<{
  todos?: WeeklyTodo[]
}>()

const emit = defineEmits<{
  edit: []
  toggleTodo: [id: string]
}>()

const completedCount = computed(() => {
  return props.todos?.filter(t => t.completed).length || 0
})

const progressPercent = computed(() => {
  if (!props.todos?.length) return 0
  return Math.round((completedCount.value / props.todos.length) * 100)
})

const toggleTodo = (id: string) => {
  emit('toggleTodo', id)
}
</script>
