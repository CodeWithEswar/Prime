-- PRIME Mastery Intelligence Engine — Migration
-- Authoritative attempts and revisions remain the raw evidence;
-- user_problem_mastery stores deterministic, recomputable derived mastery snapshots.

CREATE TABLE IF NOT EXISTS public.user_problem_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  policy_version INTEGER NOT NULL DEFAULT 1,
  level TEXT NOT NULL CHECK (level IN ('unseen', 'exposed', 'learning', 'practiced', 'proficient', 'mastered')),
  score NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (score >= 0.0 AND score <= 100.0),
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  freshness TEXT NOT NULL DEFAULT 'stale' CHECK (freshness IN ('fresh', 'aging', 'stale')),
  blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_evidence TEXT,
  last_evidence_at TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_problem_policy UNIQUE (user_id, problem_id, policy_version)
);

CREATE INDEX IF NOT EXISTS idx_user_problem_mastery_user_problem
  ON public.user_problem_mastery(user_id, problem_id);

CREATE INDEX IF NOT EXISTS idx_user_problem_mastery_user_level
  ON public.user_problem_mastery(user_id, level);

-- Row Level Security
ALTER TABLE public.user_problem_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_problem_mastery_select_own" ON public.user_problem_mastery
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_problem_mastery_insert_own" ON public.user_problem_mastery
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_problem_mastery_update_own" ON public.user_problem_mastery
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_problem_mastery_delete_own" ON public.user_problem_mastery
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_problem_mastery TO authenticated;


