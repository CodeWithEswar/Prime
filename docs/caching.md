# PRIME — Caching Conventions & Architecture

Caching in PRIME is intentional and segmented by data volatility. Caching everything by default creates stale data bugs and memory bloat.

---

## 1. Caching Layers Explained

| Layer                         | Responsibility                                                          | Lifetime         | Scope              |
| :---------------------------- | :---------------------------------------------------------------------- | :--------------- | :----------------- |
| **React Request Memoization** | Deduplicates identical reads within a single server request render pass | Single Request   | Server (In-flight) |
| **Next.js Server Data Cache** | Caches server-rendered queries across users or per tag                  | Minutes to Hours | Edge / Server      |
| **TanStack Query Client**     | Interactive client state, background refetch, and mutation sync         | Minutes          | Browser Tab        |
| **Database Indexing & RLS**   | Fast SQL access patterns avoiding sequential table scans                | Persistent       | PostgreSQL Engine  |

---

## 2. Content Volatility Taxonomy

### A. Static / Global Catalog Content

- **Entities**: Roadmap topic trees, DSA problem definitions, external links.
- **Policy**: `CACHE_POLICY.staticCatalog` / `CACHE_POLICY.roadmap`
- **Lifetime**: 12 to 24 hours.
- **Invalidation**: Triggered only upon catalog schema updates or administrative publishing (`invalidateProblemCatalog`, `invalidateRoadmap`).

### B. User Preparation State

- **Entities**: Today's daily plan, task statuses, spaced repetition revision queue.
- **Policy**: `CACHE_POLICY.userDailyPlan` / `CACHE_POLICY.userRevision`
- **Lifetime**: 5 to 10 minutes (short-lived).
- **Invalidation**: Driven explicitly by user mutations (e.g., `invalidateUserToday(userId, date)`, `invalidateUserRevision(userId)`).

### C. Analytical Summaries

- **Entities**: Interview readiness score, mastery distribution, weakness alerts.
- **Policy**: `CACHE_POLICY.userProgress`
- **Lifetime**: 15 minutes.
- **Invalidation**: Recalculated on study session completion.

### D. Volatile / Active State

- **Entities**: Active practice stopwatch/timer, active problem attempt scratchpad.
- **Policy**: `revalidate: 0` / TanStack Query `staleTime: 0`.
- **Rule**: Never stored in persistent server data caches.

---

## 3. Targeted Invalidation Philosophy

Avoid blanket invalidations. When completing a task:

```text
Task Completed
  │
  ├── 1. Optimistic client update in TanStack Query (immediate UI feedback)
  ├── 2. Server Action commits transition in Supabase PostgreSQL
  ├── 3. Invalidate queryKeys.today.byDate(date)
  └── 4. Invalidate queryKeys.progress.summary()
```

The roadmap catalog, question catalog, and static metadata are untouched.
