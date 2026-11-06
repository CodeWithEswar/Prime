-- ============================================================================
-- PRIME — DSA Curated Playlists & Video Learning Engine Schema & RLS
-- Migration: 20261106120000_dsa_playlists_learning_engine.sql
-- ============================================================================

-- 1. Curated DSA Playlists (Striver, Kunal, Aditya Verma, Abdul Bari, etc.)
create table if not exists public.dsa_playlists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 2 and 80),
  youtube_playlist_id text not null unique check (char_length(youtube_playlist_id) between 5 and 64),
  title text not null check (char_length(title) between 2 and 200),
  instructor text not null check (char_length(instructor) between 2 and 100),
  channel_title text not null default '',
  description text,
  difficulty text not null default 'Beginner → Advanced',
  level text not null default 'Beginner',
  focus text not null,
  programming_language text not null default 'Language Agnostic',
  thumbnail_url text,
  video_count integer not null default 0 check (video_count >= 0),
  total_duration_seconds integer not null default 0 check (total_duration_seconds >= 0),
  topic_tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dsa_playlists_slug on public.dsa_playlists(slug);
create index if not exists idx_dsa_playlists_featured on public.dsa_playlists(is_featured, is_default);

-- 2. Canonical Videos (Normalized across multiple playlists)
create table if not exists public.dsa_videos (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text not null unique check (char_length(youtube_video_id) = 11),
  title text not null check (char_length(title) between 2 and 250),
  description text,
  duration_seconds integer not null default 600 check (duration_seconds > 0),
  thumbnail_url text,
  channel_title text not null default '',
  canonical_topic_slug text not null default 'fundamentals',
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  embed_allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dsa_videos_ytid on public.dsa_videos(youtube_video_id);
create index if not exists idx_dsa_videos_topic on public.dsa_videos(canonical_topic_slug);

-- 3. Playlist Items (Specific video order in a curated playlist)
create table if not exists public.dsa_playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.dsa_playlists(id) on delete cascade,
  video_id uuid not null references public.dsa_videos(id) on delete cascade,
  position integer not null check (position > 0),
  title_override text,
  topic_slug text,
  is_essential boolean not null default true,
  created_at timestamptz not null default now(),
  unique (playlist_id, position),
  unique (playlist_id, video_id)
);
create index if not exists idx_dsa_playlist_items_order on public.dsa_playlist_items(playlist_id, position);

-- 4. User Playlist Enrollments
create table if not exists public.dsa_playlist_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  playlist_id uuid not null references public.dsa_playlists(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  last_video_id uuid references public.dsa_videos(id) on delete set null,
  last_activity_at timestamptz not null default now(),
  target_completion_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, playlist_id)
);
create index if not exists idx_dsa_enrollments_user on public.dsa_playlist_enrollments(user_id, status);

-- 5. User Video Progress (Tracked per canonical video across all playlists)
create table if not exists public.dsa_video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.dsa_videos(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed')),
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  watched_seconds integer not null default 0 check (watched_seconds >= 0),
  completed_at timestamptz,
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists idx_dsa_video_progress_user on public.dsa_video_progress(user_id, status);

-- 6. User Video Lesson Notes
create table if not exists public.dsa_video_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.dsa_videos(id) on delete cascade,
  content text not null default '',
  timestamp_seconds integer check (timestamp_seconds is null or timestamp_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists idx_dsa_video_notes_user on public.dsa_video_notes(user_id, video_id);

-- 7. User Video Bookmarks
create table if not exists public.dsa_video_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid references public.dsa_videos(id) on delete cascade,
  playlist_id uuid references public.dsa_playlists(id) on delete cascade,
  timestamp_seconds integer check (timestamp_seconds is null or timestamp_seconds >= 0),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists idx_dsa_video_bookmarks_user on public.dsa_video_bookmarks(user_id);

-- 8. Video to DSA Practice Question Links
create table if not exists public.dsa_video_question_links (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.dsa_videos(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  relationship text not null default 'practice' check (relationship in ('theory', 'practice', 'solution', 'prerequisite')),
  notes text,
  created_at timestamptz not null default now(),
  unique (video_id, problem_id)
);
create index if not exists idx_dsa_video_links_video on public.dsa_video_question_links(video_id);
create index if not exists idx_dsa_video_links_problem on public.dsa_video_question_links(problem_id);

-- 9. Background Playlist Synchronization Runs
create table if not exists public.dsa_playlist_sync_runs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references public.dsa_playlists(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  videos_scanned integer not null default 0,
  videos_added integer not null default 0,
  videos_updated integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================
alter table public.dsa_playlists enable row level security;
alter table public.dsa_videos enable row level security;
alter table public.dsa_playlist_items enable row level security;
alter table public.dsa_playlist_enrollments enable row level security;
alter table public.dsa_video_progress enable row level security;
alter table public.dsa_video_notes enable row level security;
alter table public.dsa_video_bookmarks enable row level security;
alter table public.dsa_video_question_links enable row level security;
alter table public.dsa_playlist_sync_runs enable row level security;

-- Public read for catalog metadata
create policy dsa_playlists_select on public.dsa_playlists for select using (true);
create policy dsa_videos_select on public.dsa_videos for select using (true);
create policy dsa_playlist_items_select on public.dsa_playlist_items for select using (true);
create policy dsa_video_question_links_select on public.dsa_video_question_links for select using (true);
create policy dsa_playlist_sync_runs_select on public.dsa_playlist_sync_runs for select using (true);

-- User scoped RLS for personal enrollments
create policy dsa_enrollments_select on public.dsa_playlist_enrollments for select using ((select auth.uid()) = user_id);
create policy dsa_enrollments_insert on public.dsa_playlist_enrollments for insert with check ((select auth.uid()) = user_id);
create policy dsa_enrollments_update on public.dsa_playlist_enrollments for update using ((select auth.uid()) = user_id);
create policy dsa_enrollments_delete on public.dsa_playlist_enrollments for delete using ((select auth.uid()) = user_id);

-- User scoped RLS for video progress
create policy dsa_video_progress_select on public.dsa_video_progress for select using ((select auth.uid()) = user_id);
create policy dsa_video_progress_insert on public.dsa_video_progress for insert with check ((select auth.uid()) = user_id);
create policy dsa_video_progress_update on public.dsa_video_progress for update using ((select auth.uid()) = user_id);
create policy dsa_video_progress_delete on public.dsa_video_progress for delete using ((select auth.uid()) = user_id);

-- User scoped RLS for lesson notes
create policy dsa_video_notes_select on public.dsa_video_notes for select using ((select auth.uid()) = user_id);
create policy dsa_video_notes_insert on public.dsa_video_notes for insert with check ((select auth.uid()) = user_id);
create policy dsa_video_notes_update on public.dsa_video_notes for update using ((select auth.uid()) = user_id);
create policy dsa_video_notes_delete on public.dsa_video_notes for delete using ((select auth.uid()) = user_id);

-- User scoped RLS for bookmarks
create policy dsa_video_bookmarks_select on public.dsa_video_bookmarks for select using ((select auth.uid()) = user_id);
create policy dsa_video_bookmarks_insert on public.dsa_video_bookmarks for insert with check ((select auth.uid()) = user_id);
create policy dsa_video_bookmarks_update on public.dsa_video_bookmarks for update using ((select auth.uid()) = user_id);
create policy dsa_video_bookmarks_delete on public.dsa_video_bookmarks for delete using ((select auth.uid()) = user_id);

