export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',

  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  build: {
    transpile: ["vue-toastification"]
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ]
    }
  }
})
