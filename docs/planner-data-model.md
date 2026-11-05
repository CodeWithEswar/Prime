# PRIME — Planner V2 Data Model & Schema Reference

## Overview

The Planner V2 data layer is architected for strict data integrity, optimistic concurrency control, and deterministic multi-tier planning. Storage cleanly decouples **planning intents** (what the user wants to do) from **committed daily tasks** (what is scheduled for execution) and **proposals** (ephemeral preview state).

---

## 1. Relational Entity Schema

### 1.1 `preparation_plans`
Stores the active high-level preparation plan for a user, bounding their 90-day trajectory.
```sql
CREATE TABLE public.preparation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Interview Preparation Plan',
    target_role TEXT NOT NULL DEFAULT 'Software Engineer',
    target_company TEXT,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    daily_capacity_minutes INTEGER NOT NULL DEFAULT 90 CHECK (daily_capacity_minutes > 0),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1.2 `availability_rules`
Defines recurring weekly availability patterns by day of the week.
```sql
CREATE TABLE public.availability_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    available_minutes INTEGER NOT NULL DEFAULT 90 CHECK (available_minutes >= 0),
    is_rest_day BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, day_of_week)
);
```

### 1.3 `availability_exceptions`
Overrides recurring rules for specific calendar dates (vacations, exams, emergency breaks).
```sql
CREATE TABLE public.availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    available_minutes INTEGER NOT NULL DEFAULT 0 CHECK (available_minutes >= 0),
    is_unavailable BOOLEAN NOT NULL DEFAULT false,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, exception_date)
);
```

### 1.4 `daily_plans`
Represents the container for a single preparation day. Today and Calendar query this table.
```sql
CREATE TABLE public.daily_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    target_minutes INTEGER NOT NULL DEFAULT 90,
    allocated_minutes INTEGER NOT NULL DEFAULT 0,
    actual_minutes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'missed', 'rest')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, plan_date)
);
```

### 1.5 `daily_tasks`
The atomic unit of scheduled preparation execution.
```sql
CREATE TABLE public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_plan_id UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (task_type IN ('dsa_problem', 'system_design', 'cs_fundamentals', 'revision', 'mock_interview', 'custom')),
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    problem_id UUID REFERENCES public.dsa_problems(id) ON DELETE SET NULL,
    revision_item_id UUID REFERENCES public.revision_items(id) ON DELETE SET NULL,
    curriculum_topic_id TEXT,
    planning_intent_id UUID REFERENCES public.planning_intents(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'OPTIONAL')),
    is_locked BOOLEAN NOT NULL DEFAULT false,
    scheduled_reason TEXT DEFAULT 'AVAILABLE_CAPACITY',
    carried_from_task_id UUID REFERENCES public.daily_tasks(id) ON DELETE SET NULL,
    carry_count INTEGER NOT NULL DEFAULT 0,
    original_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'carried_forward', 'rescheduled')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1.6 `planning_intents`
Represents the preparation **Backlog** and unscheduled user requests.
```sql
CREATE TABLE public.planning_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('user_created', 'roadmap', 'revision', 'lab', 'recommendation')),
    task_type TEXT NOT NULL DEFAULT 'custom',
    priority TEXT NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2', 'OPTIONAL')),
    estimated_minutes INTEGER NOT NULL DEFAULT 30 CHECK (estimated_minutes > 0),
    preferred_date DATE,
    status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'scheduled', 'dismissed', 'completed')),
    request_payload JSONB DEFAULT '{}'::jsonb,
    problem_id UUID REFERENCES public.dsa_problems(id) ON DELETE SET NULL,
    curriculum_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1.7 `planner_proposals`
Stores short-lived preview proposals awaiting user confirmation.
```sql
CREATE TABLE public.planner_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    local_day DATE NOT NULL,
    snapshot_version TEXT NOT NULL,
    changes JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 2. Stored Procedures & Procedural Logic

### 2.1 `public.lock_planner_owner(p_user uuid)`
Acquires a PostgreSQL advisory transaction lock keyed on a 32-bit integer derived from the user's UUID.
- Coordinates concurrent server actions and background workers modifying the same user's schedule.
- The lock automatically releases at the end of the enclosing database transaction.

### 2.2 `public.planner_snapshot(p_user uuid, p_day text)`
Gathers the complete planning state for the user within their 90-day horizon:
- Aggregates user settings, active plan, weekday rules, exceptions, daily plans, scheduled daily tasks, backlog intents, and due revisions.
- Computes an MD5/SHA-256 snapshot hash across the combined state to detect if any inputs have shifted between preview and confirmation.

### 2.3 `public.commit_planner_proposal(p_user uuid, p_proposal_id uuid)`
Executes the atomic two-phase commit:
1. Locks the user row via `lock_planner_owner`.
2. Verifies proposal ownership, non-expiration (`now() < expires_at`), and unconfirmed state (`confirmed_at IS NULL`).
3. Computes a fresh `planner_snapshot` and asserts that the current snapshot hash matches the proposal's `snapshot_version`. Raises `PLANNER_STALE` if the state shifted.
4. Inserts new `daily_plans` for any newly referenced dates.
5. Inserts new `daily_tasks`, creates linkages to `planning_intents`, and updates intent status to `scheduled`.
6. Executes task moves by updating `daily_plan_id`, `scheduled_reason`, and carry provenance.
7. Recalculates total `allocated_minutes` on all affected `daily_plans`.
8. Marks the proposal as confirmed (`confirmed_at = now()`).

### 2.4 Lock Protection Trigger: `trg_protect_locked_daily_tasks`
Enforces the immutability of locked commitments:
- If a daily task has `is_locked = true` and `OLD.is_locked = true`, any attempt to alter `daily_plan_id` (rescheduling to another date) or `duration_minutes` raises an exception unless explicitly unlocked first.

---

## 3. Security & Row-Level Security (RLS)

All tables enforce strict PostgreSQL Row-Level Security:
```sql
ALTER TABLE public.preparation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_proposals ENABLE ROW LEVEL SECURITY;

-- Standard tenant isolation pattern across all user tables
CREATE POLICY "Users can only access their own preparation plans"
    ON public.preparation_plans
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```
- Server-side background jobs and atomic RPCs use the Supabase admin client (`service_role`), which safely bypasses RLS within audited server boundaries while enforcing user UUID assertions in the stored procedures.
