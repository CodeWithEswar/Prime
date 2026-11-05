# PRIME — Computer Networks Architecture & Integration

## 1. Domain Boundaries

The Computer Networks module adheres to PRIME's established modular architecture:

- `domain/cn/`: Pure business logic, types, calculators, curriculum definitions, and deterministic simulation algorithms. Zero dependencies on React or Next.js.
- `content/cn/`: Static versioned JSON manifests for public curriculum content.
- `features/cn/server/`: Server-only actions and data access layer interfacing with Supabase via Row Level Security (RLS).
- `features/cn/hooks/`: Client TanStack Query hooks managing local optimistic updates, rollback, and cache invalidation.
- `features/cn/components/`: Presentational and container React components strictly utilizing PRIME UI primitives.
- `features/cn/components/simulators/`: Interactive network laboratories with three-zone composition (Configuration / Simulation Canvas / Trace Inspector).

---

## 2. Shared Learning Database Integration

Reuses the unified CS Fundamentals schema (`learning_courses`, `learning_course_days`, `learning_videos`, `learning_enrollments`, `learning_video_progress`, `learning_exercise_attempts`, `learning_day_progress`):

- Course ID: `cn-12-day`
- Course Slug: `cn-12-day`
- Subject: `CN`
- Video progress and laboratory attempts are strictly scoped to authenticated `auth.uid() = user_id`.
- Offline/unauthenticated fallback maintains state in memory/localStorage without throwing runtime exceptions.

---

## 3. Cross-Domain Integrations

1. **Planner V2:**
   - "Plan Course" intent creates a preview mapping 12 days to available calendar slots.
   - Idempotently commits tasks to `planner_tasks` under category `'fundamentals'`.
2. **Revision Engine (FSRS):**
   - Automatically derives revision items from incorrect subnetting attempts, routing errors, and videos flagged `revisionDue`.
   - Spaced-repetition intervals: 1, 3, 7, 14, 30 days.
3. **Interview Readiness Engine (`/readiness`):**
   - Evaluates `fund-cn` ("Computer Networks & Distributed Systems") competency.
   - Feeds authentic evidence from completed days, watched videos, and verified lab submissions.

