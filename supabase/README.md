# Supabase Local Development & Architecture

This directory manages the local Supabase environment, database migrations, seed data, and Row Level Security (RLS) tests for **PRIME**.

## Authoritative Database Model

PRIME uses Supabase PostgreSQL as its single source of truth:

- **Global Catalog Data** (e.g. `roadmap_topics`, `roadmap_items`, `problems`): World-readable by authenticated users, modifiable only via admin/migrations.
- **User-Owned Data** (e.g. `daily_plans`, `daily_tasks`, `problem_attempts`, `revision_items`, `study_sessions`, `progress_snapshots`): Strictly protected via Row Level Security (RLS).

Cloudflare Workers and Next.js connect to this same authoritative PostgreSQL instance. No duplicate relational store (like Cloudflare D1) is used.

## Row Level Security (RLS) Principles

1. **Defense in Depth**: Authorization is enforced at the UI, server action/boundary, and database RLS. RLS is the non-negotiable final perimeter.
2. **Standard User Isolation**:
   ```sql
   CREATE POLICY "Users can only access their own records"
     ON public.daily_tasks
     FOR ALL
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
   ```
3. **No Direct UI SQL Access**: Queries are orchestrated via typed server functions and repositories, with RLS active.

## Migration Rules

1. **Immutable Migrations**: Never modify an existing migration after it has been deployed or committed to the main branch. Create a new timestamped migration.
2. **Timestamps**: File names must follow `YYYYMMDDHHMMSS_<description>.sql`.
3. **Reproducible**: Every migration must be idempotent or run cleanly from `supabase db reset`.

## Local Commands

- Start local Supabase containers: `pnpm supabase:start`
- Stop local Supabase containers: `pnpm supabase:stop`
- Reset local database and run all migrations: `pnpm supabase:reset`
- Create a new migration: `pnpm dlx supabase migration new <name>`
