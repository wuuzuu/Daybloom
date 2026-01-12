<template>
  <span
    class="px-3 py-1 rounded-full text-sm"
    :class="moodClass"
  >
    {{ moodLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MoodValue } from '~/types'
import { useMood } from '~/composables/useMood'

const props = defineProps<{
  value: MoodValue
}>()

const { getMoodLabel, getMoodClass } = useMood()

const moodLabel = computed(() => {
  if (!props.value) return ''
  return getMoodLabel(props.value)
})

const moodClass = computed(() => {
  if (!props.value) return ''
  return getMoodClass(props.value)
})
</script>

