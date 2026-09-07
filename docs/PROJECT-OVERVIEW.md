# Status Tracker — Project Overview

**Status Tracker** is a team check-in web app where team members report their daily work status (In Office, WFH, On Leave) and managers get a real-time view of the team. Notifications are sent to a Google Chat space via webhook.

---

## What It Does

1. **Sign up / Log in** — Email/password or Google Sign-In via Firebase Auth.
2. **Create or join a team** — First-time users pick: create a team (becomes Manager) or join with a 6-digit code (becomes Member).
3. **Daily check-in** — Members pick a status (Office / WFH / Leave), optionally set a posting time, and notify the team. A Google Chat message fires on the team's webhook.
4. **Team dashboard** — Managers see all members, their current status, can change a member's status, or remove members.
5. **Reports** — Members see their personal check-in history with weekly/monthly filters and counts.
6. **Yesterday's overview** — A read-only grid of yesterday's check-ins for the team.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **Nuxt 4** (Vue 3, SPA mode — `ssr: false`) |
| Backend / API | **Nuxt server routes** (Nitro) — 2 endpoints |
| Auth | **Firebase Auth** (email/password + Google) |
| Database | **Cloud Firestore** (NoSQL) |
| Server-side DB | **Firebase Admin SDK** (Nitro server utils) |
| Notifications | **Google Chat incoming webhook** (REST POST) |
| UI | Custom CSS with design tokens (light/dark theme) |
| Toast | `vue-toastification` |
| Deployment target | Firebase (Firestore, Functions, Hosting-ready) |

---

## Key Files

```
status-tracker/
├── app/
│   ├── pages/              # Routes (Nuxt file-based routing)
│   │   ├── index.vue       # Home — status + check-in + yesterday
│   │   ├── login.vue       # Login (email + Google)
│   │   ├── signup.vue      # Sign-up (email + Google)
│   │   ├── reset.vue       # Password reset
│   │   ├── team.vue        # Manager team management
│   │   ├── reports.vue     # Personal check-in history
│   │   └── welcome/
│   │       ├── index.vue   # Choose: create or join
│   │       ├── create.vue  # Create a team
│   │       └── join.vue    # Join with code
│   ├── components/
│   │   ├── status.vue      # Status card selector + notify button
│   │   ├── checkin.vue     # Today's check-in feed
│   │   ├── yesterday.vue   # Yesterday's overview grid
│   │   ├── sidebar.vue     # Navigation sidebar
│   │   └── topbar.vue      # Top bar with user info
│   ├── composables/
│   │   ├── useUser.js      # Auth state + profile (global refs)
│   │   ├── useTheme.js     # Light/dark theme toggle
│   │   ├── useSidebar.js   # Sidebar open/close
│   │   └── useInitials.js  # Name → initials helper
│   ├── middleware/
│   │   ├── auth.js         # Route guard: require auth + team
│   │   └── manager.js      # Route guard: require Manager role
│   ├── layouts/
│   │   ├── default.vue     # App layout (sidebar + topbar)
│   │   ├── auth.vue        # Centered auth layout
│   │   └── welcome.vue     # Centered welcome layout
│   ├── plugins/
│   │   ├── auth.client.js  # Bootstrap auth listener
│   │   └── toast.client.js # Toast plugin
│   └── assets/css/theme.css # Design tokens (colors, spacing, etc.)
├── server/
│   ├── api/
│   │   ├── notify.post.js  # POST /api/notify — member check-in webhook
│   │   └── update.post.js  # POST /api/update — manager status-change webhook
│   └── utils/
│       └── firebaseAdmin.js # Admin SDK init (server-only)
├── firebase/
│   └── config.js           # Client Firebase init (hardcoded keys)
├── dataconnect/            # Firebase Data Connect (GraphQL schema, example ops)
├── src/dataconnect-generated/ # Auto-generated Data Connect client SDK
├── functions/              # Firebase Cloud Functions (empty scaffold)
├── firestore.rules         # Firestore security rules (currently open)
├── firestore.indexes.json  # Firestore composite indexes
├── firebase.json           # Firebase project config
└── nuxt.config.ts          # Nuxt config (SPA, CSS, head, build)
```

---

## How Auth Works

- `useUser()` exposes global `user` and `profile` refs.
- `auth.client.js` plugin calls `onAuthStateChanged`. On sign-in, it fetches the user's `profiles` doc from Firestore and populates `profile`.
- `auth.js` middleware enforces:
  - No user + private route → redirect to `/login`
  - User without `teamId` → redirect to `/welcome`
  - User with `teamId` on login/signup → redirect to `/`
- `manager.js` middleware: only `role === "Manager"` can access `/team`.

---

## How Check-in Works (Data Flow)

```
Member selects status
  → status.vue: notified()
    → duplicate? → toast, stop
    → already notified today with different status? → confirm modal
    → doNotify()
      → POST /api/notify  { name, status, time, teamId, uid, dateKey }
        → server reads team's webhookUrl
        → checks cooldown (1 min) + duplicate status
        → POST webhookUrl (Google Chat)
        → writes notifiedStatus + lastNotifiedAt to Firestore
      → setDoc status/{uid}_{YYYY-MM-DD}  (merge)
      → toast success
```

Manager changing a member's status follows the same flow but calls `/api/update` (no cooldown, no duplicate check).

---

## Current Limitations / Tech Debt

- **Firestore rules are open** (`allow read, write: if true`) — anyone can read/write any doc.
- **Firebase API keys are hardcoded** in `firebase/config.js` — should use env vars.
- **No tests** — zero unit or integration tests.
- **No error boundary / global error handler**.
- **No loading skeletons** — only text "Loading...".
- **No PWA manifest** — despite mobile-web-app-capable meta tags.
- **No CI/CD** — no GitHub Actions or similar.
- **Data Connect is scaffolded but unused** — the app uses the Firestore SDK directly.
- **Functions folder is empty** — no cloud functions deployed.
- **No pagination** on reports or check-in feeds.
- **No offline support** — Firestore offline persistence not enabled.
