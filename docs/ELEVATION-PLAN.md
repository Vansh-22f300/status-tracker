# Elevation Plan

A prioritized, phased plan to take Status Tracker from a functional prototype to a production-grade application.

---

## Phase 1: Security Hardening (Critical — Do First)

These are active vulnerabilities. Nothing else matters until these are fixed.

### 1.1 Firestore Security Rules

**Problem:** `allow read, write: if true;` — anyone with the Firebase config can read/write any document in the database.

**Fix:** Replace with rules that enforce:
- Authenticated users can only read/write their own `profiles` doc
- Team members can read (not write) other members' profiles in the same team
- Only managers can write team docs
- Status docs: users can write their own, read team members' statuses

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{uid} {
      allow read: if isOwner(uid) || isTeamMember();
      allow write: if isOwner(uid);
    }
    match /teams/{teamId} {
      allow read: if isTeamMember(teamId);
      allow update: if isManager(teamId);
      allow create: if request.auth != null;
    }
    match /status/{docId} {
      allow read: if isTeamMember(resource.data.teamId);
      allow create, update: if isOwner(resource.data.uid);
    }
  }
}
```

**File:** `firestore.rules`

### 1.2 Env Var Migration for Firebase Config

**Problem:** API keys hardcoded in `firebase/config.js`. These get committed and exposed.

**Fix:** Move all Firebase config values to `.env` and reference via `process.env` (Nuxt runtime config or `import.meta.env`).

```js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

Add all `VITE_FIREBASE_*` entries to `.env.example` (without real values). Ensure `.env` is in `.gitignore`.

**File:** `firebase/config.js`, `.env`, `.gitignore`

### 1.3 Remove Committed Secrets

**Problem:** `.env` with base64-encoded service account key is committed to git.

**Fix:**
1. Remove `.env` from the repo: `git rm --cached .env`
2. Add `.env` to `.gitignore`
3. Rotate the service account key immediately (it's been exposed)
4. Provide `.env.example` with placeholder values

**File:** `.gitignore`

### 1.4 Input Validation on Server Endpoints

**Problem:** `/api/notify` and `/api/update` accept arbitrary body values with minimal validation. A malicious user could send malformed data or spam the webhook.

**Fix:**
- Validate `status` is one of the allowed values
- Validate `time` format (HH:MM)
- Validate `uid` matches the authenticated context (if auth is added to server)
- Add rate limiting per IP (Nitro middleware or a simple in-memory limiter)

**Files:** `server/api/notify.post.js`, `server/api/update.post.js`

---

## Phase 2: Bug Fixes & Reliability

### 2.1 Fix `isLoaded` Bug

**Problem:** `useUser.js` defines `isLoaded` but never sets it to `true`. Components that check `isLoaded` before rendering will wait forever.

**Fix:** Set `isLoaded = true` after the profile doc is fetched in `auth.client.js`.

**Files:** `app/composables/useUser.js`, `app/plugins/auth.client.js`

### 2.2 Atomic Webhook + Firestore Write

**Problem:** Client calls `/api/notify`, then writes to Firestore. If the webhook succeeds but the Firestore write fails, the team was notified but the status isn't stored. The cooldown timer will also be inconsistent.

**Fix:** Move the Firestore status write into the `/api/notify` endpoint itself. The client should not write to Firestore directly for status updates — it should only call the endpoint, which handles both the webhook and the Firestore write atomically.

**Files:** `server/api/notify.post.js`, `app/components/status.vue`

### 2.3 Server-Side Auth Verification

**Problem:** `/api/notify` and `/api/update` trust the `uid` from the request body. Any authenticated user could impersonate another user by sending a different `uid`.

**Fix:** Verify the request is coming from an authenticated user and that the `uid` in the body matches the authenticated user's UID. Since this is an SPA without server-side sessions, options are:
- Pass Firebase Auth ID token in the `Authorization` header and verify it server-side using Admin SDK
- Use Firebase Cloud Functions with Callable Context (more work, but more secure)

**Files:** `server/api/notify.post.js`, `server/api/update.post.js`, `server/utils/firebaseAdmin.js`

### 2.4 Webhook Error Handling

**Problem:** If the Google Chat webhook URL is invalid or the service is down, the user sees a generic error toast. No retry mechanism.

**Fix:**
- Distinguish between "webhook URL not configured" (manager error), "webhook unreachable" (retryable), and "cooldown active" (wait)
- For retryable errors, show a "Retry" button after a short delay
- Log webhook failures server-side for debugging

**Files:** `server/api/notify.post.js`, `app/components/status.vue`

---

## Phase 3: Testing

### 3.1 Unit Tests for Server Endpoints

- Test `/api/notify` with: missing teamId, missing uid, duplicate status, cooldown active, webhook success, webhook failure
- Test `/api/update` with: missing fields, webhook success
- Mock Firebase Admin SDK and `$fetch` for webhook calls

### 3.2 Unit Tests for Composables

- Test `useInitials` with various name inputs
- Test `useTheme` toggle and persistence
- Test cooldown timer logic in `status.vue`

### 3.3 Integration Tests for Critical Flows

- Full check-in flow: select status → notify → verify Firestore write
- Join team flow: enter code → verify profile update → verify team count increment
- Manager status change flow: change member status → verify webhook → verify Firestore

**Tooling:** Vitest (works natively with Nuxt) + `@nuxt/test-utils` for Nuxt-specific testing.

---

## Phase 4: Developer Experience

### 4.1 TypeScript Migration

The entire app is plain JS. Migrate to TypeScript:
- Rename `.js` → `.ts`, `.vue` files keep `<script setup lang="ts">`
- Define types for `Profile`, `Team`, `Status`, and all API request/response bodies
- Add `tsconfig.json` if not present

This catches bugs at compile time and makes the codebase self-documenting.

### 4.2 ESLint + Prettier

Add linting and formatting:
- `eslint` with Nuxt plugin
- `prettier` with consistent config
- Pre-commit hook via `husky` + `lint-staged`

### 4.3 CI/CD Pipeline

GitHub Actions workflow:
1. Lint + type-check on every push
2. Run tests on PR
3. Deploy to Firebase Hosting on merge to `master`

### 4.4 Firebase Environment Separation

- Create separate Firebase projects for `dev` and `prod`
- Use `firebase use --add` to switch between them
- Automated deploys target the right project per branch

---

## Phase 5: User Experience Improvements

### 5.1 Loading Skeletons

Replace "Loading..." text with skeleton placeholders for:
- Check-in feed
- Yesterday grid
- Team member list
- Reports history

### 5.2 Empty States

Design and implement empty states for:
- No check-ins today
- No check-ins yesterday
- No reports for selected date range
- No members in team (edge case)

### 5.3 Profile Editing

Add ability for users to:
- Change their display name
- View their email (read-only)
- See their team name and role

### 5.4 Better Error Messages

Replace generic "Something went wrong" with specific, actionable messages:
- "Team not found — check your join code"
- "You're on cooldown — wait 45 seconds"
- "Webhook not configured — ask your manager to set it up"

### 5.5 PWA

- Add `nuxt-pwa` or manual service worker
- Add `manifest.json` with app icons
- Enable Firestore offline persistence

---

## Phase 6: Feature Expansion

### 5.1 Multiple Notification Channels

Beyond Google Chat, support:
- Slack incoming webhooks
- Microsoft Teams webhooks
- Email digests (daily summary)

### 5.2 Leave Management

- Request leave with date range
- Manager approval/rejection
- Leave calendar view
- "Who's on leave today" indicator

### 5.3 Analytics Dashboard

For managers:
- Team attendance trends (weekly/monthly)
- Average check-in time per member
- Heatmap of office vs WFH vs leave

### 5.4 Daily Digest

Instead of per-check-in notifications, offer a daily summary at a configurable time:
- "Today: 5 in office, 2 WFH, 1 on leave"

---

## Implementation Priority

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| **P0** | 1.1 Firestore rules | 2 hrs | Prevents data breach |
| **P0** | 1.2 Env var migration | 1 hr | Removes hardcoded secrets |
| **P0** | 1.3 Remove committed secrets | 1 hr | Stops secret exposure |
| **P0** | 2.3 Server-side auth | 4 hrs | Prevents impersonation |
| **P1** | 2.2 Atomic webhook+write | 3 hrs | Fixes data inconsistency |
| **P1** | 2.1 Fix isLoaded bug | 30 min | Fixes broken loading state |
| **P1** | 2.4 Webhook error handling | 2 hrs | Better UX on failures |
| **P1** | 1.4 Input validation | 2 hrs | Prevents malformed data |
| **P2** | 3.x Testing | 8 hrs | Prevents regressions |
| **P2** | 4.2 ESLint + Prettier | 2 hrs | Code quality |
| **P2** | 4.3 CI/CD | 4 hrs | Automated quality gate |
| **P3** | 4.1 TypeScript | 8 hrs | Type safety |
| **P3** | 5.1-5.5 UX improvements | 6 hrs | Polish |
| **P4** | 6.x Feature expansion | 12+ hrs | New capabilities |

---

## Quick Wins (Do This Afternoon)

If you only have a few hours, do these — maximum impact for minimum effort:

1. **Fix Firestore rules** — single file change, prevents catastrophe
2. **Remove `.env` from git** + rotate service account key
3. **Move Firebase config to env vars** — `firebase/config.js` + `.env.example`
4. **Fix `isLoaded` bug** — one line in `auth.client.js`
5. **Add empty states** — huge UX improvement for almost no code
6. **Atomic webhook + Firestore write** — eliminates the inconsistency bug

Total estimated time: ~4 hours.
