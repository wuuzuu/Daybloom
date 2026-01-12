// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-01-01',
  future: {
    compatibilityVersion: 4,
  },
  tailwindcss: {
    config: {
      darkMode: 'class',
    },
  },
})

