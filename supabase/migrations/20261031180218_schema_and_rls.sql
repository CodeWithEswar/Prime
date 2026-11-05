-- PRIME Database Schema, Constraints, Indexes & Row Level Security
-- Establishes the authoritative backend schema for Preparation, Roadmap, Practice, Revision, and Readiness.

-- ============================================================================
-- 1. GLOBAL CATALOG TABLES
-- ============================================================================

-- 1.1 Roadmap Topics
CREATE TABLE IF NOT EXISTS public.roadmap_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER NOT NULL DEFAULT 60 CHECK (estimated_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 Roadmap Dependencies (Topic Prerequisites - DAG)
CREATE TABLE IF NOT EXISTS public.roadmap_dependencies (
  topic_id UUID NOT NULL REFERENCES public.roadmap_topics(id) ON DELETE CASCADE,
  prerequisite_topic_id UUID NOT NULL REFERENCES public.roadmap_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (topic_id, prerequisite_topic_id),
  CONSTRAINT check_no_self_dependency CHECK (topic_id <> prerequisite_topic_id)
);

-- 1.3 Canonical Problem Catalog
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  source TEXT NOT NULL DEFAULT 'leetcode',
  external_url TEXT,
  acceptance_rate NUMERIC(5, 2) CHECK (acceptance_rate >= 0.0 AND acceptance_rate <= 100.0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.4 Problem Topics (Many-to-Many join)
CREATE TABLE IF NOT EXISTS public.problem_topics (
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.roadmap_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (problem_id, topic_id)
);

-- 1.5 Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.6 Company Problem Stats (Interview Frequency & Windowing)
CREATE TABLE IF NOT EXISTS public.company_problem_stats (
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  time_window TEXT NOT NULL CHECK (time_window IN ('thirty_days', 'three_months', 'six_months', 'more_than_six_months', 'all_time')),
  frequency INTEGER NOT NULL DEFAULT 1 CHECK (frequency >= 0),
  acceptance_rate NUMERIC(5, 2) CHECK (acceptance_rate >= 0.0 AND acceptance_rate <= 100.0),
  source_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (company_id, problem_id, time_window)
);

-- ============================================================================
-- 2. USER-OWNED TABLES
-- ============================================================================

-- 2.1 Profiles (Canonical User Identity)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 User Settings (Preparation Targets & Cadence)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL DEFAULT 'Software Engineer',
  target_package TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  daily_study_minutes INTEGER NOT NULL DEFAULT 120 CHECK (daily_study_minutes > 0),
  experience_level TEXT NOT NULL DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  rest_days INTEGER[] NOT NULL DEFAULT '{}',
  difficulty_preference TEXT NOT NULL DEFAULT 'balanced' CHECK (difficulty_preference IN ('foundational', 'balanced', 'aggressive')),
  morning_email_enabled BOOLEAN NOT NULL DEFAULT true,
  morning_email_time TIME NOT NULL DEFAULT '07:00:00',
  evening_email_enabled BOOLEAN NOT NULL DEFAULT true,
  weekly_report_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Daily Plans
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number > 0),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
  planned_minutes INTEGER NOT NULL DEFAULT 0 CHECK (planned_minutes >= 0),
  completed_minutes INTEGER NOT NULL DEFAULT 0 CHECK (completed_minutes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_plan_date UNIQUE (user_id, plan_date)
);

-- 2.4 Daily Tasks
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('learn', 'practice', 'revise', 'mock')),
  topic_id UUID REFERENCES public.roadmap_topics(id) ON DELETE SET NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  planned_minutes INTEGER NOT NULL DEFAULT 30 CHECK (planned_minutes >= 0),
  completed_minutes INTEGER NOT NULL DEFAULT 0 CHECK (completed_minutes >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'rescheduled')),
  source TEXT NOT NULL DEFAULT 'planner' CHECK (source IN ('planner', 'user', 'revision_queue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 2.5 Problem Attempts (Append-Only Log of Attempts)
CREATE TABLE IF NOT EXISTS public.problem_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE RESTRICT,
  outcome TEXT NOT NULL CHECK (outcome IN ('independent', 'hint', 'solution_viewed', 'unsolved')),
  time_taken_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_taken_seconds >= 0),
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 5),
  notes TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 User Problem Progress (Current Rollup / State)
CREATE TABLE IF NOT EXISTS public.user_problem_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'attempted', 'solved', 'needs_revision', 'mastered')),
  mastery_score NUMERIC(4, 3) NOT NULL DEFAULT 0.0 CHECK (mastery_score >= 0.0 AND mastery_score <= 1.0),
  last_attempt_at TIMESTAMPTZ,
  next_revision_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, problem_id)
);

-- 2.7 Revision Items (Spaced Repetition Queue)
CREATE TABLE IF NOT EXISTS public.revision_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('problem', 'topic')),
  entity_id UUID NOT NULL,
  interval_days INTEGER NOT NULL DEFAULT 1 CHECK (interval_days >= 0),
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'mastered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_revision_entity UNIQUE (user_id, entity_type, entity_id)
);

-- 2.8 Revision Attempts (Feedback on Reviews)
CREATE TABLE IF NOT EXISTS public.revision_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_item_id UUID NOT NULL REFERENCES public.revision_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('forgot', 'hard', 'okay', 'easy')),
  previous_interval_days INTEGER NOT NULL DEFAULT 0 CHECK (previous_interval_days >= 0),
  next_interval_days INTEGER NOT NULL DEFAULT 1 CHECK (next_interval_days >= 0),
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.9 Study Sessions (Focused Practice Timers)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.daily_tasks(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'focus' CHECK (session_type IN ('focus', 'review', 'assessment')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 Progress Snapshots (Historical Dimension Scores)
CREATE TABLE IF NOT EXISTS public.progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  dsa_score NUMERIC(4, 1) DEFAULT 0.0 CHECK (dsa_score >= 0.0 AND dsa_score <= 100.0),
  fundamentals_score NUMERIC(4, 1) DEFAULT 0.0 CHECK (fundamentals_score >= 0.0 AND fundamentals_score <= 100.0),
  sql_score NUMERIC(4, 1) DEFAULT 0.0 CHECK (sql_score >= 0.0 AND sql_score <= 100.0),
  aptitude_score NUMERIC(4, 1) DEFAULT 0.0 CHECK (aptitude_score >= 0.0 AND aptitude_score <= 100.0),
  retention_score NUMERIC(4, 1) DEFAULT 0.0 CHECK (retention_score >= 0.0 AND retention_score <= 100.0),
  consistency_score NUMERIC(4, 1) DEFAULT 0.0 CHECK (consistency_score >= 0.0 AND consistency_score <= 100.0),
  readiness_score NUMERIC(4, 1) DEFAULT 0.0 CHECK (readiness_score >= 0.0 AND readiness_score <= 100.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_snapshot_date UNIQUE (user_id, snapshot_date)
);

-- 2.11 Notes
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('problem', 'topic', 'general')),
  entity_id UUID,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. AUTOMATED UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_roadmap_topics_updated_at BEFORE UPDATE ON public.roadmap_topics FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_problems_updated_at BEFORE UPDATE ON public.problems FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_company_problem_stats_updated_at BEFORE UPDATE ON public.company_problem_stats FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_daily_plans_updated_at BEFORE UPDATE ON public.daily_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_daily_tasks_updated_at BEFORE UPDATE ON public.daily_tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_user_problem_progress_updated_at BEFORE UPDATE ON public.user_problem_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_revision_items_updated_at BEFORE UPDATE ON public.revision_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. IDEMPOTENT USER BOOTSTRAP (AUTH.USERS TRIGGER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_roadmap_topics_domain_sort ON public.roadmap_topics(domain, sort_order);
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_slug ON public.roadmap_topics(slug);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_company_problem_stats_company_window ON public.company_problem_stats(company_id, time_window, frequency DESC);

CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON public.daily_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_status ON public.daily_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_plan_sort ON public.daily_tasks(daily_plan_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_problem_attempts_user_problem ON public.problem_attempts(user_id, problem_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_problem_progress_user_status ON public.user_problem_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_revision_items_user_due ON public.revision_items(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_started ON public.study_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_user_date ON public.progress_snapshots(user_id, snapshot_date);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 6.1 Enable RLS on all tables
ALTER TABLE public.roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_problem_stats ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problem_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 6.2 Global Catalog Policies (Public / Authenticated Read-Only)
CREATE POLICY "roadmap_topics_select" ON public.roadmap_topics
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "roadmap_dependencies_select" ON public.roadmap_dependencies
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "problems_select" ON public.problems
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "problem_topics_select" ON public.problem_topics
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "companies_select" ON public.companies
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "company_problem_stats_select" ON public.company_problem_stats
  FOR SELECT TO authenticated, anon USING (true);

-- 6.3 User Profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- 6.4 User Settings
CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 6.5 Daily Plans
CREATE POLICY "daily_plans_select_own" ON public.daily_plans
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "daily_plans_insert_own" ON public.daily_plans
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "daily_plans_update_own" ON public.daily_plans
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "daily_plans_delete_own" ON public.daily_plans
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- 6.6 Daily Tasks
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

-- 6.7 Problem Attempts
CREATE POLICY "problem_attempts_select_own" ON public.problem_attempts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "problem_attempts_insert_own" ON public.problem_attempts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- 6.8 User Problem Progress
CREATE POLICY "user_problem_progress_select_own" ON public.user_problem_progress
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_problem_progress_insert_own" ON public.user_problem_progress
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_problem_progress_update_own" ON public.user_problem_progress
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 6.9 Revision Items
CREATE POLICY "revision_items_select_own" ON public.revision_items
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "revision_items_insert_own" ON public.revision_items
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "revision_items_update_own" ON public.revision_items
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "revision_items_delete_own" ON public.revision_items
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- 6.10 Revision Attempts
CREATE POLICY "revision_attempts_select_own" ON public.revision_attempts
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "revision_attempts_insert_own" ON public.revision_attempts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- 6.11 Study Sessions
CREATE POLICY "study_sessions_select_own" ON public.study_sessions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "study_sessions_insert_own" ON public.study_sessions
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "study_sessions_update_own" ON public.study_sessions
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 6.12 Progress Snapshots
CREATE POLICY "progress_snapshots_select_own" ON public.progress_snapshots
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "progress_snapshots_insert_own" ON public.progress_snapshots
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- 6.13 Notes
CREATE POLICY "notes_select_own" ON public.notes
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "notes_insert_own" ON public.notes
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "notes_update_own" ON public.notes
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "notes_delete_own" ON public.notes
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 7. DETERMINISTIC FOUNDATION SEED DATA (GLOBAL CATALOG ONLY)
-- ============================================================================

-- 7.1 Seed Core Roadmap Topics
INSERT INTO public.roadmap_topics (slug, name, domain, sort_order, estimated_minutes) VALUES
  ('arrays', 'Arrays', 'dsa', 1, 90),
  ('strings', 'Strings', 'dsa', 2, 90),
  ('hashing', 'Hashing', 'dsa', 3, 75),
  ('two-pointers', 'Two Pointers', 'dsa', 4, 75),
  ('sliding-window', 'Sliding Window', 'dsa', 5, 90),
  ('prefix-sum', 'Prefix Sum', 'dsa', 6, 60),
  ('binary-search', 'Binary Search', 'dsa', 7, 90),
  ('linked-lists', 'Linked Lists', 'dsa', 8, 90),
  ('stacks', 'Stacks', 'dsa', 9, 75),
  ('queues', 'Queues', 'dsa', 10, 60),
  ('recursion', 'Recursion', 'dsa', 11, 90),
  ('backtracking', 'Backtracking', 'dsa', 12, 105),
  ('trees', 'Trees', 'dsa', 13, 120),
  ('bst', 'Binary Search Trees', 'dsa', 14, 90),
  ('heap', 'Heap / Priority Queue', 'dsa', 15, 90),
  ('graphs', 'Graphs', 'dsa', 16, 120),
  ('greedy', 'Greedy Algorithms', 'dsa', 17, 90),
  ('dynamic-programming', 'Dynamic Programming', 'dsa', 18, 150),
  ('java-fundamentals', 'Java Fundamentals', 'programming_java', 19, 90),
  ('oop-principles', 'OOP Principles', 'oop', 20, 90),
  ('sql-basics', 'SQL Queries & Joins', 'sql', 21, 90),
  ('dbms-transactions', 'ACID & Indexing', 'dbms', 22, 90),
  ('os-concurrency', 'Processes & Threads', 'os', 23, 90),
  ('networks-protocols', 'TCP/IP & HTTP', 'networks', 24, 90),
  ('system-design-basics', 'Scalability & Caching', 'system_design', 25, 120),
  ('aptitude-quantitative', 'Quantitative Aptitude', 'aptitude', 26, 60)
ON CONFLICT (slug) DO NOTHING;

-- 7.2 High-Confidence Topic Dependencies
INSERT INTO public.roadmap_dependencies (topic_id, prerequisite_topic_id)
SELECT t.id, p.id
FROM public.roadmap_topics t, public.roadmap_topics p
WHERE (t.slug = 'two-pointers' AND p.slug = 'arrays')
   OR (t.slug = 'sliding-window' AND p.slug = 'arrays')
   OR (t.slug = 'prefix-sum' AND p.slug = 'arrays')
   OR (t.slug = 'bst' AND p.slug = 'trees')
   OR (t.slug = 'backtracking' AND p.slug = 'recursion')
ON CONFLICT (topic_id, prerequisite_topic_id) DO NOTHING;

-- 7.3 Canonical Starter Problems
INSERT INTO public.problems (slug, title, difficulty, source, external_url, acceptance_rate) VALUES
  ('two-sum', 'Two Sum', 'easy', 'leetcode', 'https://leetcode.com/problems/two-sum/', 52.4),
  ('valid-anagram', 'Valid Anagram', 'easy', 'leetcode', 'https://leetcode.com/problems/valid-anagram/', 64.2),
  ('binary-search', 'Binary Search', 'easy', 'leetcode', 'https://leetcode.com/problems/binary-search/', 57.8),
  ('lru-cache', 'LRU Cache', 'medium', 'leetcode', 'https://leetcode.com/problems/lru-cache/', 42.1),
  ('merge-k-sorted-lists', 'Merge k Sorted Lists', 'hard', 'leetcode', 'https://leetcode.com/problems/merge-k-sorted-lists/', 51.9),
  ('trapping-rain-water', 'Trapping Rain Water', 'hard', 'leetcode', 'https://leetcode.com/problems/trapping-rain-water/', 61.2)
ON CONFLICT (slug) DO NOTHING;

-- 7.4 Problem Topics Linkage
INSERT INTO public.problem_topics (problem_id, topic_id)
SELECT pr.id, top.id
FROM public.problems pr, public.roadmap_topics top
WHERE (pr.slug = 'two-sum' AND top.slug = 'arrays')
   OR (pr.slug = 'valid-anagram' AND top.slug = 'hashing')
   OR (pr.slug = 'binary-search' AND top.slug = 'binary-search')
   OR (pr.slug = 'lru-cache' AND top.slug = 'linked-lists')
   OR (pr.slug = 'merge-k-sorted-lists' AND top.slug = 'heap')
   OR (pr.slug = 'trapping-rain-water' AND top.slug = 'two-pointers')
ON CONFLICT (problem_id, topic_id) DO NOTHING;
