-- ============================================================================
-- PRIME — CS Fundamentals / DBMS Learning Roadmap Schema & RLS
-- Migration: 20261104140000_dbms_learning_course.sql
-- ============================================================================

-- 1. Courses Table (DBMS, OS, OOP, CN, etc.)
create table if not exists public.learning_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 2 and 60),
  title text not null check (char_length(title) between 2 and 120),
  description text not null,
  subject text not null default 'Fundamentals',
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  estimated_days integer not null default 12 check (estimated_days > 0),
  estimated_minutes integer not null default 1071 check (estimated_minutes > 0),
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  version text not null default '1.0.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Course Days (12 Days for DBMS)
create table if not exists public.learning_course_days (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.learning_courses(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 30),
  title text not null check (char_length(title) between 2 and 120),
  description text not null,
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  importance text not null default 'High' check (importance in ('Critical', 'High', 'Medium', 'Low')),
  learning_outcomes text[] not null default '{}',
  interview_questions text[] not null default '{}',
  practical_assignment jsonb not null default '{}',
  estimated_minutes integer not null default 90 check (estimated_minutes > 0),
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (course_id, day_number)
);
create index if not exists idx_learning_course_days_course on public.learning_course_days(course_id, sort_order);

-- 3. Course Videos (91 verified Neso Academy videos + verified supplementary)
create table if not exists public.learning_videos (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.learning_courses(id) on delete cascade,
  youtube_video_id text not null check (char_length(youtube_video_id) = 11),
  playlist_position integer not null check (playlist_position > 0),
  title text not null check (char_length(title) between 2 and 200),
  channel_title text not null default 'Neso Academy',
  duration_seconds integer not null default 720 check (duration_seconds > 0),
  source_url text not null,
  topic_slug text not null,
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium', 'Hard')),
  importance text not null default 'High' check (importance in ('Critical', 'High', 'Medium', 'Low')),
  is_supplementary boolean not null default false,
  verification_status text not null default 'verified' check (verification_status in ('verified', 'unverified', 'unavailable')),
  created_at timestamptz not null default now(),
  unique (course_id, youtube_video_id)
);
create index if not exists idx_learning_videos_course_pos on public.learning_videos(course_id, playlist_position);

-- 4. Day-Video Mappings
create table if not exists public.learning_day_videos (
  id uuid primary key default gen_random_uuid(),
  course_day_id uuid not null references public.learning_course_days(id) on delete cascade,
  video_id uuid not null references public.learning_videos(id) on delete cascade,
  sort_order integer not null,
  is_required boolean not null default true,
  unique (course_day_id, video_id)
);
create index if not exists idx_learning_day_videos_day on public.learning_day_videos(course_day_id, sort_order);

-- 5. SQL Practice Exercises
create table if not exists public.learning_sql_exercises (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.learning_courses(id) on delete cascade,
  course_day_id uuid references public.learning_course_days(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text not null,
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium', 'Hard')),
  external_url text not null,
  source_platform text not null,
  topic text not null,
  estimated_minutes integer not null default 15,
  sort_order integer not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_learning_sql_exercises_day on public.learning_sql_exercises(course_day_id, sort_order);

-- 6. User Enrollments (Per User, Per Course)
create table if not exists public.learning_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.learning_courses(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed', 'paused')),
  current_day integer not null default 1 check (current_day between 1 and 30),
  target_completion_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index if not exists idx_learning_enrollments_user on public.learning_enrollments(user_id, course_id);

-- 7. User Video Progress
create table if not exists public.learning_video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.learning_videos(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'watched', 'needs_revision', 'completed')),
  watched_at timestamptz,
  needs_revision boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists idx_learning_video_progress_user on public.learning_video_progress(user_id, video_id);

-- 8. User SQL Exercise Attempts
create table if not exists public.learning_exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.learning_sql_exercises(id) on delete cascade,
  outcome text not null default 'attempted' check (outcome in ('not_attempted', 'attempted', 'solved_independent', 'solved_hint', 'reviewed_solution', 'needs_revision')),
  time_taken_seconds integer,
  confidence integer check (confidence between 1 and 5),
  notes text,
  attempted_at timestamptz not null default now(),
  unique (user_id, exercise_id)
);
create index if not exists idx_learning_exercise_attempts_user on public.learning_exercise_attempts(user_id, exercise_id);

-- 9. User Day Progress (Assignment & Completion)
create table if not exists public.learning_day_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_day_id uuid not null references public.learning_course_days(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed')),
  assignment_completed boolean not null default false,
  assignment_notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_day_id)
);
create index if not exists idx_learning_day_progress_user on public.learning_day_progress(user_id, course_day_id);

-- 10. Enable Row Level Security
alter table public.learning_courses enable row level security;
alter table public.learning_course_days enable row level security;
alter table public.learning_videos enable row level security;
alter table public.learning_day_videos enable row level security;
alter table public.learning_sql_exercises enable row level security;
alter table public.learning_enrollments enable row level security;
alter table public.learning_video_progress enable row level security;
alter table public.learning_exercise_attempts enable row level security;
alter table public.learning_day_progress enable row level security;

-- Course Catalog RLS (Public/Authenticated Read, Service Role Write)
create policy learning_courses_read on public.learning_courses for select using (true);
create policy learning_course_days_read on public.learning_course_days for select using (true);
create policy learning_videos_read on public.learning_videos for select using (true);
create policy learning_day_videos_read on public.learning_day_videos for select using (true);
create policy learning_sql_exercises_read on public.learning_sql_exercises for select using (true);

-- User Progress RLS (Scoped to Authenticated User)
create policy learning_enrollments_select on public.learning_enrollments for select using ((select auth.uid()) = user_id);
create policy learning_enrollments_insert on public.learning_enrollments for insert with check ((select auth.uid()) = user_id);
create policy learning_enrollments_update on public.learning_enrollments for update using ((select auth.uid()) = user_id);
create policy learning_enrollments_delete on public.learning_enrollments for delete using ((select auth.uid()) = user_id);

create policy learning_video_progress_select on public.learning_video_progress for select using ((select auth.uid()) = user_id);
create policy learning_video_progress_insert on public.learning_video_progress for insert with check ((select auth.uid()) = user_id);
create policy learning_video_progress_update on public.learning_video_progress for update using ((select auth.uid()) = user_id);
create policy learning_video_progress_delete on public.learning_video_progress for delete using ((select auth.uid()) = user_id);

create policy learning_exercise_attempts_select on public.learning_exercise_attempts for select using ((select auth.uid()) = user_id);
create policy learning_exercise_attempts_insert on public.learning_exercise_attempts for insert with check ((select auth.uid()) = user_id);
create policy learning_exercise_attempts_update on public.learning_exercise_attempts for update using ((select auth.uid()) = user_id);
create policy learning_exercise_attempts_delete on public.learning_exercise_attempts for delete using ((select auth.uid()) = user_id);

create policy learning_day_progress_select on public.learning_day_progress for select using ((select auth.uid()) = user_id);
create policy learning_day_progress_insert on public.learning_day_progress for insert with check ((select auth.uid()) = user_id);
create policy learning_day_progress_update on public.learning_day_progress for update using ((select auth.uid()) = user_id);
create policy learning_day_progress_delete on public.learning_day_progress for delete using ((select auth.uid()) = user_id);

-- Grant appropriate permissions
grant select on public.learning_courses to anon, authenticated;
grant select on public.learning_course_days to anon, authenticated;
grant select on public.learning_videos to anon, authenticated;
grant select on public.learning_day_videos to anon, authenticated;
grant select on public.learning_sql_exercises to anon, authenticated;

grant select, insert, update, delete on public.learning_enrollments to authenticated;
grant select, insert, update, delete on public.learning_video_progress to authenticated;
grant select, insert, update, delete on public.learning_exercise_attempts to authenticated;
grant select, insert, update, delete on public.learning_day_progress to authenticated;

