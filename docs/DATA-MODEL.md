# Data Model

Cloud Firestore collections and their document shapes.

---

## Collections

### `profiles`

One document per authenticated user. Document ID = Firebase Auth UID.

```js
{
  name: string,            // Display name
  email: string,           // From Firebase Auth
  role: "Manager" | "Member" | null,
  teamId: string | null,   // FK → teams/{teamId}
  teamName: string | null, // Denormalized team name for display
  createdAt: timestamp
}
```

**Used by:** Every page — `useUser` exposes the current user's profile globally. Team page reads all profiles with matching `teamId`. Check-in feed and yesterday grid read profiles to display names alongside statuses.

**Indexes needed:** `teamId` (for team member queries)

---

### `teams`

One document per team. Document ID = auto-generated (Firestore ID or custom).

```js
{
  name: string,
  joinCode: string,        // 6-digit code for joining
  webhookUrl: string,      // Google Chat incoming webhook URL
  createdBy: string,       // UID of creator (Manager)
  count: number,           // Number of members
  createdAt: timestamp
}
```

**Used by:** Team creation (writes), join flow (reads by joinCode), notify/update endpoints (reads webhookUrl), team page (reads all members + team info).

**Indexes needed:** `joinCode` (for join lookup)

---

### `status`

One document per user per day. Document ID = `{uid}_{YYYY-MM-DD}` (date in `en-CA` locale, e.g. `2026-09-07`).

```js
{
  uid: string,
  name: string,            // Denormalized from profile
  email: string,           // Denormalized from profile
  status: "wfo" | "wfh" | "leave",
  teamId: string,
  timestamp: number,       // Unix ms — the posting time (user-selectable)
  notifiedStatus: string | null,  // The status value that was actually notified ("In Office" / "Work From Home" / "On Leave")
  lastNotifiedAt: number | null   // Unix ms — when the last webhook was sent
}
```

**Used by:** Check-in feed (today's docs), yesterday grid, reports (date range queries), cooldown/dedup logic in notify endpoint.

**Key design decisions:**
- `{uid}_{dateKey}` ID enforces one status per user per day at the document level.
- `notifiedStatus` and `lastNotifiedAt` are written by the **server** (notify endpoint), not the client. This is how cooldown and dedup work.
- `status` and `notifiedStatus` can differ: `status` is the client-side value, `notifiedStatus` tracks what was actually sent to Google Chat.

**Indexes needed:** `teamId` + `timestamp` (for team feed queries), `uid` + `timestamp` (for personal reports)

---

## Entity-Relationship

```
profiles { uid, name, email, role, teamId, teamName }
    │
    │ 1:N (teamId)
    ▼
teams { teamId, name, joinCode, webhookUrl, createdBy, count }
    │
    │ 1:N (teamId)
    ▼
status { uid_dateKey, uid, name, email, status, teamId, timestamp,
         notifiedStatus, lastNotifiedAt }
```

- A **team** has many **profiles** (members).
- A **profile** has one **status** per day.
- `profiles.teamId` → `teams.teamId` (foreign key, no enforcement).
- `status.teamId` → `teams.teamId` (denormalized, for querying team feeds).

---

## Data Flow: Check-in

```
Client (status.vue)
  │
  ├─ POST /api/notify ──────────────────► Server (notify.post.js)
  │   { name, status, time, teamId,       │
  │     uid, dateKey }                    ├─ Read teams/{teamId}.webhookUrl
  │                                       ├─ Read status/{uid}_{dateKey}
  │                                       ├─ Check duplicate (notifiedStatus === status)
  │                                       ├─ Check cooldown (Date.now() - lastNotifiedAt < 60s)
  │                                       ├─ POST webhookUrl ─► Google Chat
  │                                       └─ Write notifiedStatus + lastNotifiedAt
  │
  └─ setDoc status/{uid}_{dateKey}       (only if /api/notify succeeded)
      { uid, name, email, status,
        teamId, timestamp }
```

---

## Data Flow: Manager Status Change

```
Client (team.vue)
  │
  ├─ POST /api/update ──────────────────► Server (update.post.js)
  │   { name, status, time, teamId,       │
  │     uid, dateKey }                    ├─ Read teams/{teamId}.webhookUrl
  │                                       ├─ POST webhookUrl ─► Google Chat
  │                                       └─ Write notifiedStatus + lastNotifiedAt
  │
  └─ setDoc status/{uid}_{dateKey}
      { uid, name, email, status,
        teamId, timestamp }
```

---

## Data Flow: Join Team

```
Client (welcome/join.vue)
  │
  ├─ Query teams where joinCode === code
  │
  ├─ Update profiles/{uid}
  │   { role: "Member", teamId, teamName }
  │
  └─ Update teams/{teamId}
      { count: increment(1) }
```

---

## Firestore Indexes (from `firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "status",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "teamId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

This composite index powers the team check-in feed (filter by `teamId`, sort by `timestamp`).

---

## Query Patterns

| Screen | Collection | Query | Real-time? |
|--------|-----------|-------|-----------|
| Check-in feed | `status` | `teamId == X && dateKey == today` | Yes (`onSnapshot`) |
| Yesterday grid | `status` | `teamId == X && dateKey == yesterday` | Yes (`onSnapshot`) |
| Team members | `profiles` | `teamId == X` | No (fetched on mount) |
| Personal reports | `status` | `uid == X && timestamp in range` | No (fetched on filter change) |
| Join team | `teams` | `joinCode == X` | No (one-time lookup) |
