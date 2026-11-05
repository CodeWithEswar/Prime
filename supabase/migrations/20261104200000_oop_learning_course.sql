-- ============================================================================
-- PRIME — CS Fundamentals / OOP with Java Schema Extension & RLS
-- Migration: 20261104200000_oop_learning_course.sql
-- ============================================================================

-- 1. Video Segments Table (Granular timestamped chapters referencing parent videos)
create table if not exists public.learning_video_segments (
  id uuid primary key default gen_random_uuid(),
  segment_id text not null unique check (char_length(segment_id) between 2 and 80),
  parent_youtube_id text not null check (char_length(parent_youtube_id) = 11),
  concept_title text not null check (char_length(concept_title) between 2 and 200),
  assigned_day integer not null check (assigned_day between 1 and 30),
  start_seconds integer not null check (start_seconds >= 0),
  end_seconds integer check (end_seconds is null or end_seconds > start_seconds),
  direct_url text not null,
  topic_slug text not null,
  importance text not null default 'Critical' check (importance in ('Critical', 'High', 'Medium', 'Low')),
  created_at timestamptz not null default now()
);
create index if not exists idx_learning_video_segments_day on public.learning_video_segments(assigned_day);
create index if not exists idx_learning_video_segments_parent on public.learning_video_segments(parent_youtube_id);

-- 2. User Video Segment Progress (Separate from whole video completion)
create table if not exists public.learning_user_segment_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  segment_id text not null references public.learning_video_segments(segment_id) on delete cascade,
  status text not null default 'completed' check (status in ('not_started', 'in_progress', 'completed', 'needs_revision')),
  notes text,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, segment_id)
);
create index if not exists idx_learning_user_segment_progress_user on public.learning_user_segment_progress(user_id, segment_id);

-- 3. Dedicated Lab Attempts Table for Interactive Simulators
create table if not exists public.learning_lab_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null default 'oop-12-day',
  lab_id text not null check (char_length(lab_id) between 2 and 80),
  scenario_id text not null default 'default',
  input_state jsonb not null default '{}',
  result_state jsonb not null default '{}',
  outcome text not null default 'completed' check (outcome in ('attempted', 'completed', 'failed')),
  time_taken_seconds integer,
  notes text,
  attempted_at timestamptz not null default now(),
  unique (user_id, course_slug, lab_id, scenario_id)
);
create index if not exists idx_learning_lab_attempts_user on public.learning_lab_attempts(user_id, lab_id);

-- 4. Dedicated Design & LLD Attempts Table
create table if not exists public.learning_design_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text not null check (char_length(case_id) between 2 and 80),
  notes text,
  self_assessment text check (self_assessment in ('proficient', 'adequate', 'needs_review')),
  rubric_scores jsonb not null default '{}',
  completed_at timestamptz not null default now(),
  unique (user_id, case_id)
);
create index if not exists idx_learning_design_attempts_user on public.learning_design_attempts(user_id, case_id);

-- 5. Enable Row Level Security
alter table public.learning_video_segments enable row level security;
alter table public.learning_user_segment_progress enable row level security;
alter table public.learning_lab_attempts enable row level security;
alter table public.learning_design_attempts enable row level security;

-- Public content reads
create policy learning_video_segments_read on public.learning_video_segments for select using (true);

-- User scoped policies
create policy learning_user_segment_progress_select on public.learning_user_segment_progress for select using ((select auth.uid()) = user_id);
create policy learning_user_segment_progress_insert on public.learning_user_segment_progress for insert with check ((select auth.uid()) = user_id);
create policy learning_user_segment_progress_update on public.learning_user_segment_progress for update using ((select auth.uid()) = user_id);
create policy learning_user_segment_progress_delete on public.learning_user_segment_progress for delete using ((select auth.uid()) = user_id);

create policy learning_lab_attempts_select on public.learning_lab_attempts for select using ((select auth.uid()) = user_id);
create policy learning_lab_attempts_insert on public.learning_lab_attempts for insert with check ((select auth.uid()) = user_id);
create policy learning_lab_attempts_update on public.learning_lab_attempts for update using ((select auth.uid()) = user_id);
create policy learning_lab_attempts_delete on public.learning_lab_attempts for delete using ((select auth.uid()) = user_id);

create policy learning_design_attempts_select on public.learning_design_attempts for select using ((select auth.uid()) = user_id);
create policy learning_design_attempts_insert on public.learning_design_attempts for insert with check ((select auth.uid()) = user_id);
create policy learning_design_attempts_update on public.learning_design_attempts for update using ((select auth.uid()) = user_id);
create policy learning_design_attempts_delete on public.learning_design_attempts for delete using ((select auth.uid()) = user_id);

-- Grant privileges
grant select on public.learning_video_segments to anon, authenticated;
grant select, insert, update, delete on public.learning_user_segment_progress to authenticated;
grant select, insert, update, delete on public.learning_lab_attempts to authenticated;
grant select, insert, update, delete on public.learning_design_attempts to authenticated;

