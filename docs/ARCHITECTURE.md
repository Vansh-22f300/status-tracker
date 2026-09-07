# Architecture

High-level system design and data flow for Status Tracker.

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                   Browser (SPA)                      │
│  Nuxt 4 + Vue 3, ssr:false                          │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Pages   │  │Components│  │   Composables     │  │
│  │ (routes) │  │          │  │ useUser, useTheme │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │              │                │              │
│       └──────────────┼────────────────┘              │
│                      │                               │
│              Firebase Client SDK                     │
│         (Auth + Firestore direct reads)              │
│                      │                               │
└──────────────────────┼───────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
   ┌────────────┐ ┌────────┐ ┌──────────┐
   │  Firebase  │ │ Nuxt   │ │  Google  │
   │   Auth     │ │ Server │ │   Chat   │
   │            │ │ (Nitro)│ │ Webhook  │
   └────────────┘ └───┬────┘ └──────────┘
                      │
               Firebase Admin SDK
                      │
               ┌────────────┐
               │ Cloud      │
               │ Firestore  │
               └────────────┘
```

---

## Client Architecture

### State Management

No Pinia/Vuex. State lives in **global composables** (`app/composables/`):

| Composable | Scope | Returns |
|-----------|-------|---------|
| `useUser` | Global singleton | `{ user, profile, isLoaded }` |
| `useTheme` | Global singleton | `{ theme, toggleTheme }` |
| `useSidebar` | Global singleton | `{ isOpen, toggle, close }` |
| `useInitials` | Utility | `(name) => initials` |

`useUser` is the most critical — `user` (Firebase Auth) and `profile` (Firestore `profiles` doc) are read by nearly every page and component.

### Routing

Nuxt file-based routing. Middleware runs per-navigation:

```
/                  → auth.js → index.vue (dashboard)
/login             → auth.js (redirects to / if logged in)
/signup            → auth.js (redirects to / if logged in)
/reset             → auth.js
/welcome           → auth.js → welcome/index.vue
/welcome/create    → auth.js → welcome/create.vue
/welcome/join      → auth.js → welcome/join.vue
/team              → auth.js → manager.js → team.vue
/reports           → auth.js → reports.vue
```

### Layouts

- `default.vue` — Sidebar + topbar, used by `/`, `/team`, `/reports`
- `auth.vue` — Centered card, used by `/login`, `/signup`, `/reset`
- `welcome.vue` — Centered card, used by `/welcome/*`

### Plugin: `auth.client.js`

Listens to `onAuthStateChanged`. When a user signs in, fetches their `profiles` doc and populates the global `profile` ref. This is the bridge between Firebase Auth and the app's profile state.

---

## Server Architecture

Two Nitro server routes, both POST-only:

### `POST /api/notify`

Member check-in notification. Flow:

```
1. Validate: teamId, uid, dateKey present
2. Read teams/{teamId} → get webhookUrl
3. Read status/{uid}_{dateKey} → check duplicate + cooldown
4. If duplicate status → return { skipped: true }
5. If cooldown active → 429 with retryAfterMs
6. POST webhookUrl (Google Chat)
7. Write notifiedStatus + lastNotifiedAt to status doc
8. Return { ok: true }
```

### `POST /api/update`

Manager-initiated status change. Simpler — no cooldown, no duplicate check:

```
1. Validate: teamId, uid, dateKey present
2. Read teams/{teamId} → get webhookUrl
3. POST webhookUrl (Google Chat)
4. Write notifiedStatus + lastNotifiedAt to status doc
5. Return { ok: true }
```

### `server/utils/firebaseAdmin.js`

Initializes Firebase Admin SDK with a service account. Exposes `getAdminDb()` which returns the Firestore admin instance. This is the only place the Admin SDK is used.

---

## Data Access Pattern

| Layer | SDK | What it does |
|-------|-----|-------------|
| Client reads | Firebase Client SDK | `onSnapshot` for real-time feeds (checkin, yesterday) |
| Client writes | Firebase Client SDK | `setDoc` for status updates, profile changes |
| Server reads/writes | Firebase Admin SDK | All `/api/*` operations |

The client writes directly to Firestore for status updates — the server only handles webhook notifications. This means the webhook and the stored status are **not atomic**; the client calls the server first, then writes to Firestore on success.

---

## Auth Flow

```
User visits /
  → auth.js middleware
    → no user? redirect /login
    → user but no teamId? redirect /welcome
    → user with teamId? continue

/login or /signup
  → Firebase Auth (popup or email/password)
  → onAuthStateChanged fires
  → auth.client.js fetches profiles/{uid}
  → profile ref populated
  → auth.js middleware re-runs
    → no teamId? redirect /welcome
    → has teamId? redirect /
```

---

## Theme System

- Design tokens in `app/assets/css/theme.css` using CSS custom properties
- Light/dark via `.dark` class on `<html>`
- Pre-paint script in `nuxt.config.ts` head reads `localStorage.theme` and applies class before Vue mounts (prevents flash)
- `useTheme` composable toggles class + persists to localStorage
- `color-scheme` meta tag tells mobile browsers not to apply auto-dark

---

## Build & Deploy

- `nuxt generate` → static SPA output in `.output/public/`
- Firebase Hosting-ready (static files)
- Firebase emulators configured for Firestore, Functions, DataConnect
- No CI/CD pipeline currently
