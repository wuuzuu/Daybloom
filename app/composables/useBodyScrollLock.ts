import { watch, onUnmounted, type Ref } from 'vue'

export function useBodyScrollLock(isOpen: Ref<boolean>) {
  watch(isOpen, (open) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  })

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  })
}
