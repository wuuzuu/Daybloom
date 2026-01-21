<template>
  <section class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-warm-800 dark:text-cream-100">📝 이번 주 할 일</h2>
      <button
        v-if="hasExistingTodos"
        @click="$emit('cancel')"
        class="text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 text-sm transition-colors"
      >
        취소
      </button>
    </div>
    
    <div class="space-y-3">
      <!-- Todo List -->
      <div
        v-for="(todo, index) in localTodos"
        :key="todo.id"
        class="flex items-center gap-2"
      >
        <button
          type="button"
          @click="toggleTodo(index)"
          class="flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center"
          :class="todo.completed 
            ? 'bg-lavender-500 border-lavender-500 text-white' 
            : 'border-warm-300 dark:border-warm-500 hover:border-lavender-400'"
        >
          <svg v-if="todo.completed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <input
          v-model="todo.text"
          type="text"
          placeholder="할 일을 입력하세요..."
          class="flex-1 border border-warm-300 dark:border-warm-500 bg-cream-50 dark:bg-warm-700 text-warm-800 dark:text-cream-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender-300 dark:focus:ring-lavender-500 placeholder-warm-400 dark:placeholder-warm-500 transition-all"
          :class="{ 'line-through opacity-60': todo.completed }"
        />
        <button
          type="button"
          @click="removeTodo(index)"
          class="px-3 py-2 text-warm-400 dark:text-warm-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
        >
          ✕
        </button>
      </div>
      
      <!-- Add Button -->
      <button
        type="button"
        @click="addTodo"
        class="w-full border-2 border-dashed border-cream-300 dark:border-warm-600 rounded-xl px-4 py-3 text-warm-500 dark:text-warm-400 hover:border-lavender-400 hover:text-lavender-600 dark:hover:text-lavender-400 transition-all"
      >
        + 할 일 추가
      </button>

      <!-- Save Button -->
      <button
        @click="handleSave"
        :disabled="isSaving"
        class="btn-primary w-full py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        <span v-if="isSaving" class="inline-flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          저장 중...
        </span>
        <span v-else>✨ 저장하기</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { WeeklyTodo } from '~/types'
import { generateUUID } from '~/utils/uuid'

const props = defineProps<{
  initialTodos?: WeeklyTodo[]
  isSaving?: boolean
}>()

const emit = defineEmits<{
  save: [data: { todos: WeeklyTodo[] }]
  cancel: []
}>()

const localTodos = ref<WeeklyTodo[]>([])

const hasExistingTodos = computed(() => {
  return props.initialTodos && props.initialTodos.length > 0
})

// 초기값 설정
const initTodos = () => {
  if (props.initialTodos && props.initialTodos.length > 0) {
    localTodos.value = props.initialTodos.map(t => ({ ...t }))
  } else {
    localTodos.value = [{ id: generateUUID(), text: '', completed: false }]
  }
}

initTodos()

watch(
  () => props.initialTodos,
  () => initTodos(),
  { deep: true }
)

const addTodo = () => {
  localTodos.value.push({
    id: generateUUID(),
    text: '',
    completed: false,
  })
}

const removeTodo = (index: number) => {
  localTodos.value.splice(index, 1)
  if (localTodos.value.length === 0) {
    addTodo()
  }
}

const toggleTodo = (index: number) => {
  const todo = localTodos.value[index]
  if (todo) {
    todo.completed = !todo.completed
  }
}

const handleSave = () => {
  // 빈 항목 제외
  const validTodos = localTodos.value.filter(t => t.text.trim().length > 0)
  emit('save', { todos: validTodos })
}
</script>
