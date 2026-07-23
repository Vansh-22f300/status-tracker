export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/theme.css'],

  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  build: {
    transpile: ['vue-toastification']
  },

  app: {
    head: {
      title: 'Status Tracker',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent'
        },
        // Tells the browser this site handles light/dark itself, so
        // mobile browsers (Android Chrome's "Force Dark" in particular)
        // don't apply their own auto-dark override on top of ours.
        { name: 'color-scheme', content: 'light dark' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap'
        }
      ],
      script: [
        {
          // Applies the saved theme before Vue mounts, so returning
          // dark-mode users don't see a flash of the light theme first.
          innerHTML: `
            try {
              var t = localStorage.getItem('theme');
              var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              var isDark = t === 'dark' || (!t && prefersDark);
              if (isDark) {
                document.documentElement.classList.add('dark');
              }
              document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
            } catch (e) {}
          `
        }
      ]
    }
  }
});
