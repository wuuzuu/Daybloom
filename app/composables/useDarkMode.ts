import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    updateDarkClass()
    saveTolocalStorage()
  }

  const setDarkMode = (value: boolean) => {
    isDark.value = value
    updateDarkClass()
    saveTolocalStorage()
  }

  const updateDarkClass = () => {
    if (typeof document !== 'undefined') {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const saveTolocalStorage = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('trace-dark-mode', isDark.value ? 'dark' : 'light')
    }
  }

  const initDarkMode = () => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('trace-dark-mode')
      if (saved) {
        isDark.value = saved === 'dark'
      } else {
        // 시스템 설정 감지
        if (typeof window !== 'undefined' && window.matchMedia) {
          isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
      }
      updateDarkClass()
    }
  }

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    initDarkMode,
  }
}

