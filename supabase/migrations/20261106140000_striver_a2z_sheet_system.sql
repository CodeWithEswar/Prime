-- ============================================================================
-- PRIME — Striver A2Z DSA Sheet Complete Learning & Topic Mastery Schema
-- Migration: 20261106140000_striver_a2z_sheet_system.sql
-- ============================================================================

-- 1. Curated DSA Sheets Catalog
create table if not exists public.dsa_sheets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 2 and 80),
  title text not null check (char_length(title) between 2 and 200),
  author text not null default 'Striver (takeUforward)',
  description text,
  official_url text not null,
  version text not null default '2026.1',
  modules_count integer not null default 0 check (modules_count >= 0),
  problems_count integer not null default 0 check (problems_count >= 0),
  videos_count integer not null default 0 check (videos_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dsa_sheets_slug on public.dsa_sheets(slug);

-- 2. Sheet Modules (Steps: e.g. Step 01 Learn the Basics, Step 02 Sorting, etc.)
create table if not exists public.dsa_sheet_modules (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.dsa_sheets(id) on delete cascade,
  step_number integer not null check (step_number > 0),
  title text not null check (char_length(title) between 2 and 200),
  slug text not null,
  description text,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  unique (sheet_id, step_number),
  unique (sheet_id, slug)
);
create index if not exists idx_dsa_sheet_modules_order on public.dsa_sheet_modules(sheet_id, position);

-- 3. Sheet Subtopics (e.g. 1.1 Language Basics, 1.2 Patterns, 3.1 Easy Arrays, etc.)
create table if not exists public.dsa_sheet_topics (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.dsa_sheet_modules(id) on delete cascade,
  substep_number text not null check (char_length(substep_number) between 2 and 20),
  title text not null check (char_length(title) between 2 and 200),
  slug text not null,
  description text,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  unique (module_id, substep_number)
);
create index if not exists idx_dsa_sheet_topics_order on public.dsa_sheet_topics(module_id, position);

-- 4. Sheet Problems (Individual practice problems mapped to canonical PRIME problems)
create table if not exists public.dsa_sheet_problems (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.dsa_sheet_topics(id) on delete cascade,
  problem_id uuid references public.problems(id) on delete set null,
  title text not null check (char_length(title) between 2 and 250),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  leetcode_url text,
  article_url text,
  video_id uuid references public.dsa_videos(id) on delete set null,
  position integer not null check (position > 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (topic_id, position)
);
create index if not exists idx_dsa_sheet_problems_topic on public.dsa_sheet_problems(topic_id, position);
create index if not exists idx_dsa_sheet_problems_problem on public.dsa_sheet_problems(problem_id);
create index if not exists idx_dsa_sheet_problems_video on public.dsa_sheet_problems(video_id);

-- 5. Sheet Topic Video Links (Many-to-many relationship: verified tutorial videos for each topic)
create table if not exists public.dsa_sheet_topic_videos (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.dsa_sheet_topics(id) on delete cascade,
  video_id uuid not null references public.dsa_videos(id) on delete cascade,
  position integer not null default 1 check (position > 0),
  mapping_confidence text not null default 'verified' check (mapping_confidence in ('verified', 'suggested', 'review')),
  relationship text not null default 'lecture' check (relationship in ('lecture', 'problem_solution', 'pattern_deep_dive', 'theory')),
  created_at timestamptz not null default now(),
  unique (topic_id, video_id)
);
create index if not exists idx_dsa_sheet_topic_videos_topic on public.dsa_sheet_topic_videos(topic_id, position);
create index if not exists idx_dsa_sheet_topic_videos_video on public.dsa_sheet_topic_videos(video_id);

-- 6. User Topic Mastery (Independent evidence-based mastery tracking)
create table if not exists public.dsa_topic_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.dsa_sheet_topics(id) on delete cascade,
  mastery_level text not null default 'not_assessed' check (
    mastery_level in ('not_assessed', 'learning', 'practicing', 'developing', 'proficient')
  ),
  solved_count integer not null default 0 check (solved_count >= 0),
  total_problems integer not null default 0 check (total_problems >= 0),
  videos_watched integer not null default 0 check (videos_watched >= 0),
  total_videos integer not null default 0 check (total_videos >= 0),
  revisions_completed integer not null default 0 check (revisions_completed >= 0),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);
create index if not exists idx_dsa_topic_mastery_user on public.dsa_topic_mastery(user_id, mastery_level);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

alter table public.dsa_sheets enable row level security;
alter table public.dsa_sheet_modules enable row level security;
alter table public.dsa_sheet_topics enable row level security;
alter table public.dsa_sheet_problems enable row level security;
alter table public.dsa_sheet_topic_videos enable row level security;
alter table public.dsa_topic_mastery enable row level security;

-- Public read access to sheet curriculum and topic mappings
create policy "Allow public read for dsa_sheets"
  on public.dsa_sheets for select using (true);

create policy "Allow public read for dsa_sheet_modules"
  on public.dsa_sheet_modules for select using (true);

create policy "Allow public read for dsa_sheet_topics"
  on public.dsa_sheet_topics for select using (true);

create policy "Allow public read for dsa_sheet_problems"
  on public.dsa_sheet_problems for select using (true);

create policy "Allow public read for dsa_sheet_topic_videos"
  on public.dsa_sheet_topic_videos for select using (true);

-- User-scoped CRUD for topic mastery
create policy "Users can view own topic mastery"
  on public.dsa_topic_mastery for select using (auth.uid() = user_id);

create policy "Users can insert own topic mastery"
  on public.dsa_topic_mastery for insert with check (auth.uid() = user_id);

create policy "Users can update own topic mastery"
  on public.dsa_topic_mastery for update using (auth.uid() = user_id);

