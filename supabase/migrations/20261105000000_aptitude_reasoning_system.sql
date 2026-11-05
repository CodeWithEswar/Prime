-- ============================================================================
-- PRIME — Complete Aptitude, Reasoning, Verbal & DI (40-Day System)
-- Migration: 20261105000000_aptitude_reasoning_system.sql
-- ============================================================================

-- 1. Aptitude Tracks (Quantitative, Logical, Verbal, DI)
create table if not exists public.aptitude_tracks (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  order_index integer not null unique,
  color text not null default '#FF4D4D',
  created_at timestamptz not null default now()
);

-- 2. Aptitude Days (40 Days across the 4 Tracks)
create table if not exists public.aptitude_days (
  id text primary key,
  day_number integer not null unique check (day_number between 1 and 40),
  track_id text not null references public.aptitude_tracks(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 160),
  subtitle text not null default '',
  description text not null default '',
  is_assessment_day boolean not null default false,
  estimated_minutes integer not null default 90 check (estimated_minutes > 0),
  sort_order integer not null unique check (sort_order between 1 and 40),
  created_at timestamptz not null default now()
);
create index if not exists idx_aptitude_days_track on public.aptitude_days(track_id, sort_order);

-- 3. Aptitude Topics (132 Topics with stable Dxx_Tyy IDs)
create table if not exists public.aptitude_topics (
  id text primary key check (char_length(id) between 5 and 15),
  day_id text not null references public.aptitude_days(id) on delete cascade,
  day_number integer not null check (day_number between 1 and 40),
  track_slug text not null,
  title text not null check (char_length(title) between 2 and 200),
  order_index integer not null check (order_index > 0),
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  priority text not null default 'High' check (priority in ('Essential', 'High', 'Medium', 'Low')),
  estimated_minutes integer not null default 30 check (estimated_minutes > 0),
  objectives text[] not null default '{}',
  prerequisites text[] not null default '{}',
  concept_checklist text[] not null default '{}',
  formula_notes text default '',
  created_at timestamptz not null default now(),
  unique (day_id, order_index)
);
create index if not exists idx_aptitude_topics_day on public.aptitude_topics(day_number, order_index);
create index if not exists idx_aptitude_topics_track on public.aptitude_topics(track_slug);

-- 4. Aptitude Video Catalog (YouTube Metadata with review & language flags)
create table if not exists public.aptitude_videos (
  video_id text primary key check (char_length(video_id) between 5 and 30),
  canonical_url text not null,
  title text not null,
  channel_title text not null default 'Unknown',
  duration_seconds integer not null default 0,
  duration_formatted text not null default '00:00',
  default_audio_language text default 'unknown',
  default_language text default 'unknown',
  embeddable boolean not null default true,
  availability text not null default 'available' check (availability in ('available', 'unavailable', 'restricted')),
  review_status text not null default 'candidate_review_required' check (review_status in ('candidate_review_required', 'verified', 'rejected', 'unavailable', 'missing_video')),
  spoken_english_verified boolean not null default false,
  topic_coverage_verified boolean not null default false,
  review_notes text default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_aptitude_videos_review on public.aptitude_videos(review_status);

-- 5. Topic-Video Association (Primary & Backup with topic-specific review)
create table if not exists public.aptitude_topic_videos (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null references public.aptitude_topics(id) on delete cascade,
  video_id text not null references public.aptitude_videos(video_id) on delete cascade,
  role text not null default 'primary' check (role in ('primary', 'backup', 'supplementary')),
  rank integer not null default 1,
  coverage_notes text default '',
  created_at timestamptz not null default now(),
  unique (topic_id, video_id)
);
create index if not exists idx_aptitude_topic_videos_topic on public.aptitude_topic_videos(topic_id, role, rank);

-- 6. User Enrollments (40-day Aptitude Roadmap)
create table if not exists public.aptitude_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_version text not null default '1.0.0',
  current_day integer not null default 1 check (current_day between 1 and 40),
  start_date date not null default current_date,
  target_completion_date date,
  timezone text not null default 'UTC',
  pacing text not null default 'standard' check (pacing in ('accelerated', 'standard', 'relaxed')),
  is_paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
create index if not exists idx_aptitude_enrollments_user on public.aptitude_enrollments(user_id);

-- 7. User Topic Progress & Notes
create table if not exists public.aptitude_topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null references public.aptitude_topics(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'practiced', 'completed')),
  user_notes text,
  is_bookmarked boolean not null default false,
  needs_revision boolean not null default false,
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);
create index if not exists idx_aptitude_topic_progress_user on public.aptitude_topic_progress(user_id, status);

-- 8. User Video Watching Progress
create table if not exists public.aptitude_video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null references public.aptitude_topics(id) on delete cascade,
  video_id text not null references public.aptitude_videos(video_id) on delete cascade,
  watched boolean not null default false,
  user_confirmed boolean not null default false,
  watched_seconds integer not null default 0,
  watched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id, video_id)
);
create index if not exists idx_aptitude_video_progress_user on public.aptitude_video_progress(user_id, topic_id);

-- 9. Aptitude Practice Questions (Authentic Placement & Original Content)
create table if not exists public.aptitude_questions (
  id text primary key,
  topic_id text not null references public.aptitude_topics(id) on delete cascade,
  track_slug text not null,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_option_index integer not null check (correct_option_index between 0 and 5),
  solution_explanation text not null default '',
  distractor_rationales jsonb not null default '{}'::jsonb,
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  question_type text not null default 'single_choice' check (question_type in ('single_choice', 'multi_choice', 'numeric')),
  formula_used text default '',
  provenance text not null default 'original' check (provenance in ('original', 'tcs_nqt', 'placement_pyq', 'curated')),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_aptitude_questions_topic on public.aptitude_questions(topic_id, difficulty);
create index if not exists idx_aptitude_questions_track on public.aptitude_questions(track_slug);

-- 10. User Question Practice Attempts
create table if not exists public.aptitude_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.aptitude_questions(id) on delete cascade,
  topic_id text not null references public.aptitude_topics(id) on delete cascade,
  session_id text not null,
  selected_option_index integer,
  is_correct boolean not null,
  time_taken_ms integer not null default 0,
  hints_used integer not null default 0,
  confidence integer check (confidence between 1 and 5),
  created_at timestamptz not null default now()
);
create index if not exists idx_aptitude_attempts_user on public.aptitude_attempts(user_id, topic_id, is_correct);
create index if not exists idx_aptitude_attempts_session on public.aptitude_attempts(session_id);

-- 11. Assessments & Mock Tests (Day 16, 26, 33, 39, 40)
create table if not exists public.aptitude_assessments (
  id text primary key,
  day_number integer not null check (day_number between 1 and 40),
  title text not null,
  track_slug text not null,
  assessment_type text not null check (assessment_type in ('sectional', 'full_mock', 'diagnostic')),
  time_limit_minutes integer not null default 30 check (time_limit_minutes > 0),
  total_marks integer not null default 30,
  passing_percentage integer not null default 60,
  question_ids text[] not null default '{}',
  blueprint jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 12. Assessment Attempts
create table if not exists public.aptitude_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null references public.aptitude_assessments(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  auto_submitted boolean not null default false,
  score_achieved numeric(5, 2) not null default 0,
  total_possible numeric(5, 2) not null default 0,
  time_spent_seconds integer not null default 0,
  sectional_breakdown jsonb not null default '{}'::jsonb,
  answers_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_aptitude_assessment_attempts_user on public.aptitude_assessment_attempts(user_id, assessment_id);

-- 13. Resource Reports (User feedback on broken or wrong audio language)
create table if not exists public.aptitude_resource_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null,
  topic_id text not null references public.aptitude_topics(id) on delete cascade,
  issue_type text not null check (issue_type in ('broken_link', 'non_english_audio', 'poor_quality', 'wrong_topic', 'other')),
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_aptitude_resource_reports_status on public.aptitude_resource_reports(status);

-- 14. Content Audit Trail (Editor actions)
create table if not exists public.aptitude_content_audit (
  id uuid primary key default gen_random_uuid(),
  editor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
alter table public.aptitude_tracks enable row level security;
alter table public.aptitude_days enable row level security;
alter table public.aptitude_topics enable row level security;
alter table public.aptitude_videos enable row level security;
alter table public.aptitude_topic_videos enable row level security;
alter table public.aptitude_questions enable row level security;
alter table public.aptitude_assessments enable row level security;

alter table public.aptitude_enrollments enable row level security;
alter table public.aptitude_topic_progress enable row level security;
alter table public.aptitude_video_progress enable row level security;
alter table public.aptitude_attempts enable row level security;
alter table public.aptitude_assessment_attempts enable row level security;
alter table public.aptitude_resource_reports enable row level security;
alter table public.aptitude_content_audit enable row level security;

-- Read Catalog Policies (Public and Authenticated)
create policy aptitude_tracks_read on public.aptitude_tracks for select using (true);
create policy aptitude_days_read on public.aptitude_days for select using (true);
create policy aptitude_topics_read on public.aptitude_topics for select using (true);
create policy aptitude_videos_read on public.aptitude_videos for select using (true);
create policy aptitude_topic_videos_read on public.aptitude_topic_videos for select using (true);
create policy aptitude_questions_read on public.aptitude_questions for select using (is_published = true);
create policy aptitude_assessments_read on public.aptitude_assessments for select using (true);

-- User Progress Policies (Scoped to Authenticated User)
create policy aptitude_enrollments_select on public.aptitude_enrollments for select using ((select auth.uid()) = user_id);
create policy aptitude_enrollments_insert on public.aptitude_enrollments for insert with check ((select auth.uid()) = user_id);
create policy aptitude_enrollments_update on public.aptitude_enrollments for update using ((select auth.uid()) = user_id);
create policy aptitude_enrollments_delete on public.aptitude_enrollments for delete using ((select auth.uid()) = user_id);

create policy aptitude_topic_progress_select on public.aptitude_topic_progress for select using ((select auth.uid()) = user_id);
create policy aptitude_topic_progress_insert on public.aptitude_topic_progress for insert with check ((select auth.uid()) = user_id);
create policy aptitude_topic_progress_update on public.aptitude_topic_progress for update using ((select auth.uid()) = user_id);
create policy aptitude_topic_progress_delete on public.aptitude_topic_progress for delete using ((select auth.uid()) = user_id);

create policy aptitude_video_progress_select on public.aptitude_video_progress for select using ((select auth.uid()) = user_id);
create policy aptitude_video_progress_insert on public.aptitude_video_progress for insert with check ((select auth.uid()) = user_id);
create policy aptitude_video_progress_update on public.aptitude_video_progress for update using ((select auth.uid()) = user_id);
create policy aptitude_video_progress_delete on public.aptitude_video_progress for delete using ((select auth.uid()) = user_id);

create policy aptitude_attempts_select on public.aptitude_attempts for select using ((select auth.uid()) = user_id);
create policy aptitude_attempts_insert on public.aptitude_attempts for insert with check ((select auth.uid()) = user_id);

create policy aptitude_assessment_attempts_select on public.aptitude_assessment_attempts for select using ((select auth.uid()) = user_id);
create policy aptitude_assessment_attempts_insert on public.aptitude_assessment_attempts for insert with check ((select auth.uid()) = user_id);
create policy aptitude_assessment_attempts_update on public.aptitude_assessment_attempts for update using ((select auth.uid()) = user_id);

create policy aptitude_resource_reports_select on public.aptitude_resource_reports for select using ((select auth.uid()) = user_id);
create policy aptitude_resource_reports_insert on public.aptitude_resource_reports for insert with check ((select auth.uid()) = user_id);

-- Permissions
grant select on public.aptitude_tracks to anon, authenticated;
grant select on public.aptitude_days to anon, authenticated;
grant select on public.aptitude_topics to anon, authenticated;
grant select on public.aptitude_videos to anon, authenticated;
grant select on public.aptitude_topic_videos to anon, authenticated;
grant select on public.aptitude_questions to anon, authenticated;
grant select on public.aptitude_assessments to anon, authenticated;

grant select, insert, update, delete on public.aptitude_enrollments to authenticated;
grant select, insert, update, delete on public.aptitude_topic_progress to authenticated;
grant select, insert, update, delete on public.aptitude_video_progress to authenticated;
grant select, insert on public.aptitude_attempts to authenticated;
grant select, insert, update on public.aptitude_assessment_attempts to authenticated;
grant select, insert on public.aptitude_resource_reports to authenticated;

