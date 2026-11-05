-- PRIME Migration: Spaced Repetition Revision Engine
-- Forward-only schema extension and deterministic revision state machine

-- 1. Extend revision_items table
ALTER TABLE public.revision_items
  ADD COLUMN IF NOT EXISTS bookmarked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS snooze_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ;

-- 2. Extend revision_attempts table
ALTER TABLE public.revision_attempts
  ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confidence INTEGER CHECK (confidence IS NULL OR (confidence BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Optimal performance indexes
CREATE INDEX IF NOT EXISTS idx_revision_items_user_due
  ON public.revision_items (user_id, status, next_review_at);

CREATE INDEX IF NOT EXISTS idx_revision_items_user_bookmarked
  ON public.revision_items (user_id, bookmarked)
  WHERE bookmarked = true;

CREATE INDEX IF NOT EXISTS idx_revision_attempts_item_reviewed
  ON public.revision_attempts (revision_item_id, reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_revision_attempts_user_reviewed
  ON public.revision_attempts (user_id, reviewed_at DESC);

-- 4. Complete Problem Revision RPC
CREATE OR REPLACE FUNCTION public.complete_problem_revision(
  p_problem_id UUID,
  p_rating TEXT,
  p_time_spent_minutes INTEGER DEFAULT 0,
  p_confidence INTEGER DEFAULT 3,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_item public.revision_items%ROWTYPE;
  v_prev_interval INTEGER;
  v_next_interval INTEGER;
  v_next_review_at TIMESTAMPTZ;
  v_attempt_id UUID;
  v_rating TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_rating := LOWER(p_rating);
  IF v_rating NOT IN ('forgot', 'hard', 'okay', 'easy') THEN
    RAISE EXCEPTION 'Invalid rating: %', p_rating;
  END IF;

  -- 1. Find or initialize revision item
  SELECT * INTO v_item
  FROM public.revision_items
  WHERE user_id = v_user_id
    AND entity_type = 'problem'
    AND entity_id = p_problem_id
  FOR UPDATE;

  IF NOT FOUND THEN
    v_prev_interval := 1;
    INSERT INTO public.revision_items (
      user_id, entity_type, entity_id, interval_days, next_review_at, status
    ) VALUES (
      v_user_id, 'problem', p_problem_id, 1, NOW(), 'active'
    )
    RETURNING * INTO v_item;
  ELSE
    v_prev_interval := COALESCE(v_item.interval_days, 1);
  END IF;

  -- 2. Deterministic Spaced Repetition Engine (Interval ladder: 1 -> 3 -> 7 -> 14 -> 30)
  -- forgot: reset to 1 day
  -- hard: retain current interval (conservative consolidation)
  -- okay: advance 1 milestone
  -- easy: advance 2 milestones
  IF v_rating = 'forgot' THEN
    v_next_interval := 1;
  ELSIF v_rating = 'hard' THEN
    v_next_interval := GREATEST(1, v_prev_interval);
  ELSIF v_rating = 'okay' THEN
    IF v_prev_interval < 1 THEN
      v_next_interval := 1;
    ELSIF v_prev_interval < 3 THEN
      v_next_interval := 3;
    ELSIF v_prev_interval < 7 THEN
      v_next_interval := 7;
    ELSIF v_prev_interval < 14 THEN
      v_next_interval := 14;
    ELSE
      v_next_interval := 30;
    END IF;
  ELSIF v_rating = 'easy' THEN
    IF v_prev_interval < 1 THEN
      v_next_interval := 3;
    ELSIF v_prev_interval < 3 THEN
      v_next_interval := 7;
    ELSIF v_prev_interval < 7 THEN
      v_next_interval := 14;
    ELSE
      v_next_interval := 30;
    END IF;
  END IF;

  v_next_review_at := NOW() + (v_next_interval || ' days')::INTERVAL;

  -- 3. Update revision item
  UPDATE public.revision_items
  SET
    interval_days = v_next_interval,
    next_review_at = v_next_review_at,
    last_reviewed_at = NOW(),
    snoozed_until = NULL,
    status = 'active',
    updated_at = NOW()
  WHERE id = v_item.id;

  -- 4. Record revision attempt
  INSERT INTO public.revision_attempts (
    revision_item_id,
    user_id,
    rating,
    previous_interval_days,
    next_interval_days,
    time_spent_minutes,
    confidence,
    notes,
    reviewed_at
  ) VALUES (
    v_item.id,
    v_user_id,
    v_rating,
    v_prev_interval,
    v_next_interval,
    COALESCE(p_time_spent_minutes, 0),
    p_confidence,
    p_notes,
    NOW()
  )
  RETURNING id INTO v_attempt_id;

  -- 5. Keep user_problem_progress in sync
  UPDATE public.user_problem_progress
  SET
    next_revision_at = v_next_review_at,
    updated_at = NOW()
  WHERE user_id = v_user_id
    AND problem_id = p_problem_id;

  RETURN jsonb_build_object(
    'revision_item_id', v_item.id,
    'attempt_id', v_attempt_id,
    'problem_id', p_problem_id,
    'rating', v_rating,
    'previous_interval_days', v_prev_interval,
    'next_interval_days', v_next_interval,
    'next_review_at', v_next_review_at
  );
END;
$$;

-- 5. Snooze Problem Revision RPC
CREATE OR REPLACE FUNCTION public.snooze_problem_revision(
  p_problem_id UUID,
  p_snooze_until TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_item_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.revision_items
  SET
    snoozed_until = p_snooze_until,
    next_review_at = p_snooze_until,
    snooze_count = snooze_count + 1,
    updated_at = NOW()
  WHERE user_id = v_user_id
    AND entity_type = 'problem'
    AND entity_id = p_problem_id
  RETURNING id INTO v_item_id;

  IF v_item_id IS NULL THEN
    INSERT INTO public.revision_items (
      user_id, entity_type, entity_id, interval_days, next_review_at, snoozed_until, snooze_count, status
    ) VALUES (
      v_user_id, 'problem', p_problem_id, 1, p_snooze_until, p_snooze_until, 1, 'active'
    )
    RETURNING id INTO v_item_id;
  END IF;

  UPDATE public.user_problem_progress
  SET
    next_revision_at = p_snooze_until,
    updated_at = NOW()
  WHERE user_id = v_user_id
    AND problem_id = p_problem_id;

  RETURN jsonb_build_object(
    'revision_item_id', v_item_id,
    'snoozed_until', p_snooze_until
  );
END;
$$;

-- 6. Toggle Revision Bookmark RPC
CREATE OR REPLACE FUNCTION public.toggle_revision_bookmark(
  p_problem_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_bookmarked BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.revision_items
  SET
    bookmarked = NOT bookmarked,
    updated_at = NOW()
  WHERE user_id = v_user_id
    AND entity_type = 'problem'
    AND entity_id = p_problem_id
  RETURNING bookmarked INTO v_bookmarked;

  IF v_bookmarked IS NULL THEN
    INSERT INTO public.revision_items (
      user_id, entity_type, entity_id, interval_days, next_review_at, bookmarked, status
    ) VALUES (
      v_user_id, 'problem', p_problem_id, 1, NOW() + INTERVAL '1 day', true, 'active'
    )
    RETURNING bookmarked INTO v_bookmarked;
  END IF;

  RETURN v_bookmarked;
END;
$$;

-- 7. Grant execution privileges to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_problem_revision(UUID, TEXT, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.snooze_problem_revision(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_revision_bookmark(UUID) TO authenticated;

