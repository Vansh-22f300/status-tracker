import { ref } from 'vue';

// module-scope ref = singleton state shared across every component that
// calls useTheme(), same pattern as useUser.js
const theme = ref('light');
let initialized = false;

function applyClass(value) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', value === 'dark');
  // Explicitly tell the browser which color scheme we're using. Without
  // this, some mobile browsers (notably Android Chrome's "Force Dark")
  // apply their own auto-dark heuristic on top of ours after a short
  // delay, which is what causes light mode to flash correctly for a
  // moment and then get overridden to a flat black.
  document.documentElement.style.colorScheme = value;
}

function initTheme() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const stored = window.localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    theme.value = stored;
  } else {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  applyClass(theme.value);
}

function setTheme(value) {
  theme.value = value;
  applyClass(value);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('theme', value);
  }
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark');
}

export function useTheme() {
  initTheme(); // idempotent - safe to call from every component that uses this
  return { theme, toggleTheme, setTheme };
}
