-- ============================================================================
-- PRIME — Fundamentals Course Video & Exercise Progress String IDs
-- Migration: 20261104210000_fundamentals_progress_text_ids.sql
-- ============================================================================

-- 1. Modify learning_video_progress to use text video_id
-- Drop foreign key constraint referencing public.learning_videos(id)
alter table if exists public.learning_video_progress
  drop constraint if exists learning_video_progress_video_id_fkey;

-- Drop existing unique constraint if named
alter table if exists public.learning_video_progress
  drop constraint if exists learning_video_progress_user_id_video_id_key;

-- Change video_id to text so it accepts YouTube video IDs and slug identifiers
alter table if exists public.learning_video_progress
  alter column video_id type text using video_id::text;

-- Add difficulty_rating column if not present
alter table if exists public.learning_video_progress
  add column if not exists difficulty_rating text;

-- Re-apply unique constraint for (user_id, video_id)
alter table if exists public.learning_video_progress
  add constraint learning_video_progress_user_id_video_id_key unique (user_id, video_id);

-- Re-create index
drop index if exists public.idx_learning_video_progress_user;
create index if not exists idx_learning_video_progress_user
  on public.learning_video_progress(user_id, video_id);


-- 2. Modify learning_exercise_attempts to use text exercise_id
-- Drop foreign key constraint referencing public.learning_sql_exercises(id)
alter table if exists public.learning_exercise_attempts
  drop constraint if exists learning_exercise_attempts_exercise_id_fkey;

-- Drop existing unique constraint if named
alter table if exists public.learning_exercise_attempts
  drop constraint if exists learning_exercise_attempts_user_id_exercise_id_key;

-- Change exercise_id to text so it accepts exercise slugs (e.g. 'sql-ex-1', 'cn-lab-1')
alter table if exists public.learning_exercise_attempts
  alter column exercise_id type text using exercise_id::text;

-- Re-apply unique constraint for (user_id, exercise_id)
alter table if exists public.learning_exercise_attempts
  add constraint learning_exercise_attempts_user_id_exercise_id_key unique (user_id, exercise_id);

-- Re-create index
drop index if exists public.idx_learning_exercise_attempts_user;
create index if not exists idx_learning_exercise_attempts_user
  on public.learning_exercise_attempts(user_id, exercise_id);


-- 3. Modify learning_day_progress to ensure day tracking can be linked flexibly
alter table if exists public.learning_day_progress
  drop constraint if exists learning_day_progress_course_day_id_fkey;

alter table if exists public.learning_day_progress
  alter column course_day_id drop not null;

alter table if exists public.learning_day_progress
  add column if not exists course_slug text default 'dbms-12-day',
  add column if not exists day_number integer check (day_number between 1 and 30);

create unique index if not exists idx_learning_day_progress_user_course_day
  on public.learning_day_progress(user_id, course_slug, day_number)
  where day_number is not null;

