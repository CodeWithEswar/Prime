# PRIME — Database Architecture & Data Modeling

This document defines the database philosophy, future entities, performance guidelines, and Row Level Security (RLS) standards for **PRIME**.

---

## 1. Authoritative Storage Model

All persistent relational state is owned by **Supabase PostgreSQL**. Cloudflare Workers and Next.js connect directly to PostgreSQL.

### A. Separation of Concerns

```text
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│       GLOBAL CATALOG DATA       │      │        USER-OWNED DATA          │
│   (Shared, Curated, Read-Only)  │      │     (Private, Protected RLS)    │
├─────────────────────────────────┤      ├─────────────────────────────────┤
│ • roadmap_topics                │      │ • profiles                      │
│ • roadmap_items                 │      │ • user_settings                 │
│ • problems                      │      │ • daily_plans                   │
│                                 │      │ • daily_tasks                   │
│                                 │      │ • problem_attempts              │
│                                 │      │ • revision_items                │
│                                 │      │ • revision_attempts             │
│                                 │      │ • study_sessions                │
│                                 │      │ • progress_snapshots            │
│                                 │      │ • email_preferences             │
└─────────────────────────────────┘      └─────────────────────────────────┘
```

---

## 2. Row Level Security (RLS) Standard

Every user-owned table MUST enable RLS before deployment.

### Standard RLS Policy Template

```sql
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only select their own daily tasks"
  ON public.daily_tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own daily tasks"
  ON public.daily_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own daily tasks"
  ON public.daily_tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own daily tasks"
  ON public.daily_tasks
  FOR DELETE
  USING (auth.uid() = user_id);
```

Global catalog tables allow read access to authenticated or public users, while write access is restricted to administrative roles:

```sql
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read-only access for problems catalog"
  ON public.problems
  FOR SELECT
  USING (true);
```

---

## 3. Query Performance & Conventions

1. **Explicit Column Selection**:
   - Avoid `SELECT *` in production queries.
   - Select only the specific fields needed by the feature view model.
2. **Pagination Strategy**:
   - Use keyset / cursor pagination (`WHERE created_at < $cursor ORDER BY created_at DESC LIMIT 20`) for potentially unbounded activity feeds and attempt logs.
   - Offset pagination is permissible only for bounded sheets with UI page navigation.
3. **Database Constraints over App Assumptions**:
   - Enforce uniqueness, foreign keys, and check constraints at the database level.
4. **Indexes Based on Query Patterns**:
   - Composite indexes on `(user_id, plan_date)` for fast daily plan lookup.
   - Composite index on `(user_id, next_due_date)` for revision queue queries.
