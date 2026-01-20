// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  
  // Supabase 설정
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/signup'],
    },
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-01-01',
  future: {
    compatibilityVersion: 4,
  },
  tailwindcss: {
    config: {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            // Soft Beige palette
            cream: {
              50: '#FDFCFA',
              100: '#FAF8F5',
              200: '#F5F1EB',
              300: '#E8E0D5',
              400: '#D4C8B8',
              500: '#BFA98F',
            },
            // Lavender palette
            lavender: {
              50: '#F8F6FB',
              100: '#F0ECF6',
              200: '#E8E4F0',
              300: '#D4CCE5',
              400: '#C5B8D9',
              500: '#9B8AC4',
              600: '#7B68A6',
            },
            // Warm neutral
            warm: {
              50: '#FEFDFB',
              100: '#FBF9F6',
              200: '#F6F3EE',
              300: '#EAE5DD',
              400: '#D6CDBF',
              500: '#B8AA96',
              600: '#8C7D68',
              700: '#5D5248',
              800: '#3D362F',
              900: '#1F1B17',
            }
          },
          fontFamily: {
            sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
          },
          borderRadius: {
            '2xl': '1rem',
            '3xl': '1.5rem',
          },
        },
      },
    },
  },
})
