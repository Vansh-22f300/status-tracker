export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/theme.css'],

  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  build: {
    transpile: ["vue-toastification"]
  },

  app: {
    head: {
      title:'Status Tracker',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap'
        }
      ]
    }
  }
})
