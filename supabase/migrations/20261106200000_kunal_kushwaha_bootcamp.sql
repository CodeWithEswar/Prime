-- ============================================================================
-- PRIME — Kunal Kushwaha Java + DSA Bootcamp Curriculum & Progress Schema
-- Migration: 20261106200000_kunal_kushwaha_bootcamp.sql
-- ============================================================================

-- 1. Bootcamp Syllabus Topics (Modules in Kunal's Bootcamp)
create table if not exists public.dsa_bootcamp_topics (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.dsa_playlists(id) on delete cascade,
  step_number integer not null check (step_number > 0),
  title text not null check (char_length(title) between 2 and 200),
  slug text not null check (char_length(slug) between 2 and 80),
  description text,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  unique (playlist_id, slug),
  unique (playlist_id, step_number)
);
create index if not exists idx_dsa_bootcamp_topics_order on public.dsa_bootcamp_topics(playlist_id, position);

-- 2. Timestamp-level Video Chapters (Child segments within parent YouTube videos)
create table if not exists public.dsa_video_chapters (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.dsa_videos(id) on delete cascade,
  topic_id uuid references public.dsa_bootcamp_topics(id) on delete set null,
  title text not null check (char_length(title) between 2 and 250),
  start_seconds integer not null default 0 check (start_seconds >= 0),
  end_seconds integer check (end_seconds is null or end_seconds >= start_seconds),
  source_url text,
  verification_status text not null default 'verified' check (verification_status in ('verified', 'needs_review')),
  position integer not null default 1 check (position > 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_dsa_video_chapters_video on public.dsa_video_chapters(video_id, position);
create index if not exists idx_dsa_video_chapters_topic on public.dsa_video_chapters(topic_id);

-- 3. User Chapter Progress (Independent chapter completion tracking)
create table if not exists public.dsa_chapter_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.dsa_video_chapters(id) on delete cascade,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);
create index if not exists idx_dsa_chapter_progress_user on public.dsa_chapter_progress(user_id);

-- 4. Course Assignments (Official GitHub assignments from the course)
create table if not exists public.dsa_assignments (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.dsa_playlists(id) on delete cascade,
  topic_id uuid references public.dsa_bootcamp_topics(id) on delete set null,
  assignment_number integer not null check (assignment_number > 0),
  slug text not null check (char_length(slug) between 2 and 80),
  title text not null check (char_length(title) between 2 and 200),
  github_path text not null,
  github_url text not null,
  description text,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  unique (playlist_id, slug)
);
create index if not exists idx_dsa_assignments_order on public.dsa_assignments(playlist_id, position);
create index if not exists idx_dsa_assignments_topic on public.dsa_assignments(topic_id);

-- 5. Assignment Problems (Practice & LeetCode problems linked to assignments)
create table if not exists public.dsa_assignment_problems (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.dsa_assignments(id) on delete cascade,
  problem_id uuid references public.problems(id) on delete set null,
  title text not null check (char_length(title) between 2 and 250),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  leetcode_url text,
  position integer not null check (position > 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_dsa_assignment_problems_order on public.dsa_assignment_problems(assignment_id, position);
create index if not exists idx_dsa_assignment_problems_problem on public.dsa_assignment_problems(problem_id);

-- 6. User Assignment Progress (Individual assignment progress tracking)
create table if not exists public.dsa_user_assignment_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references public.dsa_assignments(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'revisit')),
  notes text,
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, assignment_id)
);
create index if not exists idx_dsa_user_assignment_prog_user on public.dsa_user_assignment_progress(user_id, status);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================

alter table public.dsa_bootcamp_topics enable row level security;
alter table public.dsa_video_chapters enable row level security;
alter table public.dsa_chapter_progress enable row level security;
alter table public.dsa_assignments enable row level security;
alter table public.dsa_assignment_problems enable row level security;
alter table public.dsa_user_assignment_progress enable row level security;

-- Public read policies for course catalog & content
create policy "Allow public read for dsa_bootcamp_topics"
  on public.dsa_bootcamp_topics for select using (true);

create policy "Allow public read for dsa_video_chapters"
  on public.dsa_video_chapters for select using (true);

create policy "Allow public read for dsa_assignments"
  on public.dsa_assignments for select using (true);

create policy "Allow public read for dsa_assignment_problems"
  on public.dsa_assignment_problems for select using (true);

-- User-scoped policies for chapter progress
create policy "Users can view own chapter progress"
  on public.dsa_chapter_progress for select using ((select auth.uid()) = user_id);

create policy "Users can insert own chapter progress"
  on public.dsa_chapter_progress for insert with check ((select auth.uid()) = user_id);

create policy "Users can update own chapter progress"
  on public.dsa_chapter_progress for update using ((select auth.uid()) = user_id);

create policy "Users can delete own chapter progress"
  on public.dsa_chapter_progress for delete using ((select auth.uid()) = user_id);

-- User-scoped policies for assignment progress
create policy "Users can view own assignment progress"
  on public.dsa_user_assignment_progress for select using ((select auth.uid()) = user_id);

create policy "Users can insert own assignment progress"
  on public.dsa_user_assignment_progress for insert with check ((select auth.uid()) = user_id);

create policy "Users can update own assignment progress"
  on public.dsa_user_assignment_progress for update using ((select auth.uid()) = user_id);

create policy "Users can delete own assignment progress"
  on public.dsa_user_assignment_progress for delete using ((select auth.uid()) = user_id);

