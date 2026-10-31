# PRIME — System Architecture

**PRIME**: Preparation Roadmap for Interviews, Mastery & Excellence.
A personal interview-preparation operating system engineered for structured roadmaps, spaced repetition, DSA practice tracking, and interview readiness.

---

## 1. High-Level System Architecture

```text
Browser Client
   │
   │  HTTPS / RSC / Server Actions
   ▼
Next.js App Router (Authoritative Application Layer)
   │
   ├── Server Components (initial streaming data render)
   ├── Server Actions & Route Handlers (typed mutations & trust boundaries)
   └── TanStack Query (interactive client cache & optimistic state)
   │
   │  Direct PostgreSQL Connection / Pooler / Auth
   ▼
Supabase (Authoritative Relational Database & Identity)
   ├── PostgreSQL (Source of truth)
   ├── Row Level Security (RLS per user)
   └── Auth / JWT Sessions

Cloudflare Workers (Headless Background Execution)
   │
   ├── Cloudflare Cron Triggers (scheduled planner & reminders)
   ├── Direct Supabase Connection (service-role authenticated)
   └── Resend API (transactional email dispatch)
```

---

## 2. Architectural Pillars

### A. Supabase PostgreSQL is the Authoritative Source of Truth

- All relational state, preparation history, question attempts, revision logs, and user configurations reside exclusively in Supabase PostgreSQL.
- Cloudflare D1, KV, or local databases are deliberately excluded to avoid split-brain consistency bugs, complex synchronization layers, and relational duplication.

### B. Cloudflare Workers as Headless Execution Only

- Cloudflare Workers serve strictly as scheduled cron runners and asynchronous workers.
- The `planner` worker evaluates daily preparation milestones and generates day-wise plans.
- The `reminders` worker schedules and triggers email dispatches.
- Workers do not hold authoritative data; they interact with Supabase via the shared service-role adapter.

### C. Server Components First

- Default to React Server Components (RSC) for initial page renders and streaming with Suspense.
- Client components (`"use client"`) are constrained strictly to interactive controls, forms, Motion transitions, and TanStack Query client boundaries.
- Minimizes client bundle footprint and eliminates client-side hydration cascades.

### D. TanStack Query for Interactive Server State

- TanStack Query coordinates client-side caching, background freshness, and mutation lifecycles.
- Centralized `queryKeys` factory guarantees serializable, hierarchical query identity.
- Mutations invalidate targeted query families rather than triggering global application refetches.

### E. Pure Domain Logic Separation

- Algorithmic evaluation (spaced repetition SM-2 intervals, readiness scoring, mastery classifications, weakness heuristics) is implemented as pure, deterministic TypeScript modules in `/domain`.
- Domain modules have **zero dependencies** on React, Next.js, or Supabase. They are independently unit-testable and reusable between the Next.js server and Cloudflare Workers.

---

## 3. Data Access Flow

```text
User Interaction
   ↓
Client Component (Button / Form)
   ↓
Feature Mutation (TanStack Query / Server Action)
   ↓
Zod Validation Boundary (Input Trust Verification)
   ↓
Application Service / Domain Computation
   ↓
Supabase Data Adapter (with RLS enforcement)
   ↓
Targeted Cache Invalidation (revalidateTag / queryClient.invalidateQueries)
```
