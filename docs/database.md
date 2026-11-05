# PRIME — Database Architecture & Data Modeling

This document defines the production database architecture, schema migrations, Row Level Security (RLS) standards, and CLI workflows for **PRIME** (Preparation Roadmap for Interviews, Mastery & Excellence).

---

## 1. Authoritative Storage Model

All persistent relational state is owned by **Supabase PostgreSQL** (`eu-west-1`, project ref `irioygnezxaptppbfpqz`).
Cloudflare Workers and Next.js connect directly to PostgreSQL. Cloudflare is strictly stateless compute; no secondary database (e.g., D1, KV) stores duplicate database state.

### Separation of Concerns

```text
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│       GLOBAL CATALOG DATA       │      │        USER-OWNED DATA          │
│   (Shared, Curated, Read-Only)  │      │     (Private, Protected RLS)    │
├─────────────────────────────────┤      ├─────────────────────────────────┤
│ • roadmap_topics                │      │ • profiles                      │
│ • roadmap_dependencies          │      │ • user_settings                 │
│ • problems                      │      │ • daily_plans                   │
│ • problem_topics                │      │ • daily_tasks                   │
│ • companies                     │      │ • problem_attempts              │
│ • company_problem_stats         │      │ • user_problem_progress         │
│ • content_sources               │      │ • revision_items                │
│ • dsa_problem_identities        │      │ • revision_attempts             │
│ • dsa_problem_sources           │      │ • study_sessions                │
│ • dsa_problem_aliases           │      │ • progress_snapshots            │
│ • problem_collections           │      │ • notes                         │
│ • problem_collection_items      │      │                                 │
│ • dsa_import_runs               │      │                                 │
└─────────────────────────────────┘      └─────────────────────────────────┘
```

---

## 2. Version-Controlled Migrations

All schema changes are tracked in version-controlled migrations under `supabase/migrations/`:

1. `20261031000000_foundation_setup.sql`:
   - Extensions: `uuid-ossp`, `pgcrypto`.
   - Timezone UTC enforcement.
   - `public.handle_updated_at()` trigger function.

2. `20261031180218_schema_and_rls.sql`:
   - Core 16 tables: Roadmap catalog, canonical problems, company statistics, user profiles, user preparation settings, daily plans & tasks, problem attempts, user progress rollups, spaced repetition revision queue, study sessions, and progress snapshots.
   - Idempotent `public.handle_new_user()` trigger on `auth.users` to bootstrap profile and default settings.
   - Composite and foreign-key performance indexes.
   - Complete Row Level Security policies with `(select auth.uid())` query optimization.
   - Seed catalog of 26 core roadmap topics, DAG dependency edges, and canonical starter problems.

3. `20261031180951_dsa_content_catalog_v1.sql`:
   - Content catalog tables: `content_sources`, `dsa_problem_identities`, `dsa_problem_sources`, `dsa_problem_aliases`, `problem_collections`, `problem_collection_items`, `dsa_import_runs`.
   - Provenance tracking, licensing metadata, and LeetCode slug uniqueness constraints.
   - Extended roadmap taxonomy topics (fundamentals, sorting, bit-manipulation, tries, intervals, math, matrix).

---

## 3. Row Level Security (RLS) Standard

Every table without exception has Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

### User-Owned Data Isolation

User tables strictly verify row ownership via `(select auth.uid())`:

```sql
CREATE POLICY "daily_tasks_select_own" ON public.daily_tasks
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "daily_tasks_insert_own" ON public.daily_tasks
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "daily_tasks_update_own" ON public.daily_tasks
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "daily_tasks_delete_own" ON public.daily_tasks
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);
```

### Global Catalog Read-Only Protection

Catalog tables allow read access to authenticated and anonymous users, but strictly revoke mutations from client roles:

```sql
CREATE POLICY "problems_select" ON public.problems
  FOR SELECT TO authenticated, anon
  USING (true);

-- Client roles cannot mutate the problem catalog
REVOKE INSERT, UPDATE, DELETE ON public.problems FROM anon, authenticated;
GRANT ALL ON public.problems TO service_role;
```

---

## 4. Query Performance & Conventions

1. **Planner Optimization for RLS**:
   `auth.uid()` calls in RLS policies are wrapped in subqueries `(select auth.uid())` so Postgres executes the function once per query rather than once per candidate row.

2. **Foreign Key Integrity**:
   - `auth.users(id) ON DELETE CASCADE` ensures GDPR compliance and clean user deletion.
   - `problems(id) ON DELETE RESTRICT` protects problem attempts from orphaned references.

3. **Explicit Keyset Pagination**:
   Activity feeds, logs, and attempts use keyset pagination (`WHERE attempted_at < $cursor ORDER BY attempted_at DESC LIMIT 20`) to eliminate offset scan penalties.

---

## 5. CLI Workflows

```bash
# Push pending migrations to remote Supabase project
npm run db:push

# Regenerate TypeScript types from remote schema
npm run db:types
```
