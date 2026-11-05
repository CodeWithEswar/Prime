# PRIME — OOP with Java: System Architecture & Integration Contracts

## 1. Architectural Principles

The Object-Oriented Programming with Java module is architected as a core CS Fundamentals vertical slice that follows PRIME's unidirectional data flow:

```
[Content Manifests & Exercises]
             │
             ▼
   [Domain Layer: Pure Math & Simulators] (Zero React / Next dependencies)
             │
             ▼
   [Server Service & Actions Layer] (Supabase RLS with Resilient Guest Fallback)
             │
             ▼
   [Feature Hooks: TanStack Query] (Optimistic updates, stable cache keys)
             │
             ▼
   [UI Studios & Workspace] (PRIME Design System, pure black & pure red)
```

---

## 2. Cross-Domain Integrations

1. **Planner V2 (`features/planner/`):**
   - Candidate study items are generated deterministically per study day.
   - Calling `planOOPCourseInPlannerAction` submits planned study sessions with stable resource IDs.
   - Rescheduling in Planner modifies schedule dates without corrupting underlying lesson completion state.
2. **Interview Readiness Engine (`features/readiness/`):**
   - Competency ID: `fund-oop` ("OOP & System Architecture").
   - Aggregates lecture watch completion, 10 concept laboratory attempts, and LLD practice attempts.
   - Respects the invariant that unassessed items remain `not_assessed`, never penalized as failures.
3. **Revision Engine (FSRS / Spaced Repetition):**
   - Flashcards and revision items map to misconception tags from output predictions (e.g. `protected-receiver-rule`, `dynamic-dispatch-vs-static`, `mutable-hashmap-keys`).
4. **App Shell & Breadcrumbs:**
   - Acronym `oop: "OOP"` registered in `components/shell/navigation-config.ts`.
   - Primary route `/roadmap/oop` and alias `/fundamentals/oop`.

---

## 3. Database Schema & RLS

Additive migration `20261104200000_oop_learning_course.sql`:
- Extends `learning_courses`, `learning_course_days`, `learning_videos`, `learning_video_progress`.
- Adds `learning_video_segments` for granular timestamped chapter tracking without inflating video counts.
- Adds `learning_user_segment_progress` for user timestamp completion.
- Adds `learning_lab_attempts` for 10 deterministic OOP simulators.
- All learner progress tables enforce RLS: `(select auth.uid()) = user_id`.

