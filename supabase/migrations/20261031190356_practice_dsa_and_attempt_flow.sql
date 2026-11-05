-- Migration: practice_dsa_and_attempt_flow
-- 1. Grant public/anon read access to catalog collections and sources
-- 2. Establish transaction-safe record_problem_attempt() RPC function
-- 3. Additional query performance indexes for practice search & filters

BEGIN;

-- 1. Catalog Read Permissions for Anonymous / Public Visitors
DO $$
DECLARE
  name text;
BEGIN
  FOREACH name IN ARRAY ARRAY[
    'problem_collections',
    'problem_collection_items',
    'dsa_problem_sources',
    'dsa_problem_aliases',
    'content_sources',
    'dsa_problem_identities'
  ] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', name);
    EXECUTE format('DROP POLICY IF EXISTS anon_catalog_read ON public.%I', name);
    EXECUTE format('CREATE POLICY anon_catalog_read ON public.%I FOR SELECT TO anon USING (true)', name);
  END LOOP;
END $$;

-- 2. Transaction-Safe Record Attempt Function
CREATE OR REPLACE FUNCTION public.record_problem_attempt(
  p_problem_id UUID,
  p_outcome TEXT,
  p_time_taken_seconds INTEGER DEFAULT 0,
  p_confidence INTEGER DEFAULT 3,
  p_notes TEXT DEFAULT NULL,
  p_next_status TEXT DEFAULT NULL,
  p_interval_days INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_attempt_id UUID;
  v_status TEXT;
  v_next_interval INTEGER;
  v_next_review_at TIMESTAMPTZ;
  v_mastery_score NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to record attempt';
  END IF;

  -- Validate problem exists
  IF NOT EXISTS (SELECT 1 FROM public.problems WHERE id = p_problem_id) THEN
    RAISE EXCEPTION 'Problem not found: %', p_problem_id;
  END IF;

  -- Validate outcome
  IF p_outcome NOT IN ('independent', 'hint', 'solution_viewed', 'unsolved') THEN
    RAISE EXCEPTION 'Invalid outcome: %', p_outcome;
  END IF;

  -- Validate confidence (1 to 5)
  IF p_confidence < 1 OR p_confidence > 5 THEN
    RAISE EXCEPTION 'Confidence must be between 1 and 5';
  END IF;

  -- Determine status from outcome if not explicitly provided
  IF p_next_status IS NOT NULL AND p_next_status IN ('attempted', 'solved', 'needs_revision', 'mastered') THEN
    v_status := p_next_status;
  ELSE
    v_status := CASE
      WHEN p_outcome = 'unsolved' THEN 'attempted'
      WHEN p_outcome = 'solution_viewed' THEN 'needs_revision'
      WHEN p_outcome IN ('hint', 'independent') THEN 'solved'
      ELSE 'attempted'
    END;
  END IF;

  -- Determine interval days from outcome if not provided
  v_next_interval := COALESCE(p_interval_days, CASE
    WHEN p_outcome IN ('unsolved', 'solution_viewed') THEN 1
    WHEN p_outcome = 'hint' THEN 3
    WHEN p_outcome = 'independent' THEN 7
    ELSE 1
  END);

  v_next_review_at := NOW() + (v_next_interval || ' days')::INTERVAL;

  -- Mastery score estimation
  v_mastery_score := CASE
    WHEN p_outcome = 'independent' AND p_confidence >= 4 THEN 0.85
    WHEN p_outcome = 'independent' THEN 0.70
    WHEN p_outcome = 'hint' THEN 0.50
    WHEN p_outcome = 'solution_viewed' THEN 0.25
    ELSE 0.10
  END;

  -- 1. Insert attempt
  INSERT INTO public.problem_attempts (
    user_id,
    problem_id,
    outcome,
    time_taken_seconds,
    confidence,
    notes,
    attempted_at
  )
  VALUES (
    v_user_id,
    p_problem_id,
    p_outcome,
    GREATEST(0, COALESCE(p_time_taken_seconds, 0)),
    p_confidence,
    p_notes,
    NOW()
  )
  RETURNING id INTO v_attempt_id;

  -- 2. Upsert user_problem_progress
  INSERT INTO public.user_problem_progress (
    user_id,
    problem_id,
    status,
    mastery_score,
    last_attempt_at,
    next_revision_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_problem_id,
    v_status,
    v_mastery_score,
    NOW(),
    v_next_review_at,
    NOW()
  )
  ON CONFLICT (user_id, problem_id) DO UPDATE SET
    status = CASE
      WHEN public.user_problem_progress.status = 'mastered' AND v_status = 'solved' THEN 'mastered'
      ELSE EXCLUDED.status
    END,
    mastery_score = EXCLUDED.mastery_score,
    last_attempt_at = EXCLUDED.last_attempt_at,
    next_revision_at = EXCLUDED.next_revision_at,
    updated_at = NOW();

  -- 3. Upsert revision_items
  INSERT INTO public.revision_items (
    user_id,
    entity_type,
    entity_id,
    interval_days,
    next_review_at,
    last_reviewed_at,
    status,
    updated_at
  )
  VALUES (
    v_user_id,
    'problem',
    p_problem_id,
    v_next_interval,
    v_next_review_at,
    NOW(),
    'active',
    NOW()
  )
  ON CONFLICT (user_id, entity_type, entity_id) DO UPDATE SET
    interval_days = EXCLUDED.interval_days,
    next_review_at = EXCLUDED.next_review_at,
    last_reviewed_at = EXCLUDED.last_reviewed_at,
    status = 'active',
    updated_at = NOW();

  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'status', v_status,
    'interval_days', v_next_interval,
    'next_revision_at', v_next_review_at,
    'mastery_score', v_mastery_score
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_problem_attempt(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_problem_attempt(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT, INTEGER) TO authenticated;

COMMIT;

