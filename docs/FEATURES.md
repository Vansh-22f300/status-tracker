# Features

Complete feature inventory with implementation status and notes.

---

## Authentication

### Sign Up
- **Status:** Implemented
- **Location:** `app/pages/signup.vue`
- **What it does:** Email/password signup. Creates Firebase Auth user, then creates a `profiles` doc with `role: null, teamId: null`.
- **Smart error handling:** Detects `auth/email-already-in-use` and checks if the email is Google-linked, shows "This email is linked to a Google account. Please sign in with Google instead."

### Sign In
- **Status:** Implemented
- **Location:** `app/pages/login.vue`
- **What it does:** Email/password login or Google Sign-In popup (`signInWithPopup` with Google provider).

### Password Reset
- **Status:** Implemented
- **Location:** `app/pages/reset.vue`

### Route Protection
- **Status:** Implemented
- **Location:** `app/middleware/auth.js`, `app/middleware/manager.js`
- **What it does:** Redirects unauthenticated users to `/login`, users without a team to `/welcome`, non-managers away from `/team`.

---

## Team Management

### Create Team
- **Status:** Implemented
- **Location:** `app/pages/welcome/create.vue`
- **What it does:** Creates a `teams` doc with auto-generated 6-digit join code. Sets creator's profile to `role: "Manager"`.

### Join Team
- **Status:** Implemented
- **Location:** `app/pages/welcome/join.vue`
- **What it does:** Looks up team by 6-digit join code. Sets user's profile to `role: "Member"` with `teamId` and `teamName`. Increments team `count`.

### View Team
- **Status:** Implemented
- **Location:** `app/pages/team.vue`
- **What it does:** Managers see team name, join code, webhook URL input, and member list with status badges.

### Change Member Status
- **Status:** Implemented
- **Location:** `app/pages/team.vue` + `server/api/update.post.js`
- **What it does:** Manager can change any member's status. Calls `/api/update` which fires the webhook. No cooldown/dedup (manager override).

### Remove Member
- **Status:** Implemented
- **Location:** `app/pages/team.vue`
- **What it does:** Manager removes a member — clears their `teamId`, `teamName`, `role` in profile. Decrements team `count`.

### Copy Join Code
- **Status:** Implemented
- **Location:** `app/pages/team.vue`
- **What it does:** One-click copy of the 6-digit join code.

---

## Daily Check-In

### Status Selection
- **Status:** Implemented
- **Location:** `app/components/status.vue`
- **What it does:** Three cards — In Office, Work From Home, On Leave. Click to select, selected state shows time picker + notify button.

### Custom Posting Time
- **Status:** Implemented
- **Location:** `app/components/status.vue`
- **What it does:** Time picker input lets user change the posting time before notifying. Defaults to current time. Resets to current time on card selection.

### Notify Team
- **Status:** Implemented
- **Location:** `app/components/status.vue` + `server/api/notify.post.js`
- **What it does:** Sends the status to Google Chat via the team's incoming webhook URL. Message format: `"{name}\n{status} checked in at {time}"`.

### Cooldown
- **Status:** Implemented
- **Location:** `app/components/status.vue` (client timer), `server/api/notify.post.js` (server enforces)
- **What it does:** 1-minute minimum gap between webhook sends for the same person/day. Client shows countdown timer; server returns 429 with `retryAfterMs` if violated.

### Duplicate Suppression
- **Status:** Implemented
- **Location:** `app/components/status.vue` (client), `server/api/notify.post.js` (server)
- **What it does:** If the same status value was already notified today, the client shows a toast and stops. Server also checks and returns `{ skipped: true }`.

### Repeat-Confirm Modal
- **Status:** Implemented
- **Location:** `app/components/status.vue`
- **What it does:** When the user already notified a *different* status today, shows "Send another update?" modal before proceeding.

### Cooldown Persistence
- **Status:** Implemented
- **Location:** `app/components/status.vue`
- **What it does:** On page load, reads `lastNotifiedAt` from today's status doc and restores the cooldown timer if still active.

---

## Team Feed

### Today's Check-Ins
- **Status:** Implemented
- **Location:** `app/components/checkin.vue`
- **What it does:** Real-time feed of today's check-ins for the team using `onSnapshot`. Filters by `teamId` and today's date.

### Yesterday's Overview
- **Status:** Implemented
- **Location:** `app/components/yesterday.vue`
- **What it does:** Read-only grid of yesterday's check-ins. Shows each member's name and status badge.

---

## Reports

### Personal History
- **Status:** Implemented
- **Location:** `app/pages/reports.vue`
- **What it does:** Shows logged-in user's check-in history. Summary counts (total WFO/WFH/Leave) + history list.

### Date Range Filters
- **Status:** Implemented
- **Location:** `app/pages/reports.vue`
- **What it does:** Preset ranges — this week, last week, this month, last month. Custom start/end date pickers.

---

## UI / UX

### Light/Dark Theme
- **Status:** Implemented
- **Location:** `app/assets/css/theme.css`, `app/composables/useTheme.js`
- **What it does:** CSS custom properties for design tokens. `.dark` class on `<html>` switches palette. Pre-paint script prevents flash.

### Toast Notifications
- **Status:** Implemented
- **Location:** `app/plugins/toast.client.js`
- **What it does:** `vue-toastification` for success/error/warning/info toasts.

### Responsive Layout
- **Status:** Implemented
- **Location:** Component-level scoped styles
- **What it does:** Cards stack vertically on mobile. Sidebar collapses. Modals are mobile-friendly.

---

## Not Yet Implemented

| Feature | Notes |
|---------|-------|
| Email verification | No email verification flow after signup |
| Profile editing | No way to change name/email after signup |
| Team renaming | Team name cannot be changed after creation |
| Leave tracking / calendar | No calendar view of who's on leave when |
| Multi-team support | One team per user only |
| Slack/Teams notifications | Only Google Chat webhook supported |
| Push notifications | No browser push notifications |
| Offline support | Firestore offline persistence not enabled |
| PWA | No service worker or manifest |
| Admin panel | No super-admin view across teams |
| Analytics | No aggregate team analytics |
| Export | No CSV/PDF export of reports |
| Search | No search in reports or team feed |
| Pagination | Reports and feeds load all data at once |
