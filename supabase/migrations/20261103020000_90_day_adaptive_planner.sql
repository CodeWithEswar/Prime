-- ============================================================================
-- PRIME — 90-Day Adaptive Preparation Planner Migration
-- Tables: preparation_plans, availability_rules, availability_exceptions
-- Alterations: daily_plans, daily_tasks (curriculum, revision, capacity, state machine)
-- ============================================================================

-- 1. PREPARATION PLANS
CREATE TABLE IF NOT EXISTS public.preparation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  target_role TEXT NOT NULL DEFAULT 'Software Engineer',
  daily_capacity_minutes INTEGER NOT NULL DEFAULT 180 CHECK (daily_capacity_minutes > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  plan_revision INTEGER NOT NULL DEFAULT 1 CHECK (plan_revision >= 1),
  algorithm_version TEXT NOT NULL DEFAULT 'planner-v1',
  feasibility_status TEXT NOT NULL DEFAULT 'on_track' CHECK (feasibility_status IN ('comfortable', 'on_track', 'tight', 'at_risk', 'infeasible')),
  feasibility_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_rebalanced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_plan_dates CHECK (target_date >= start_date)
);

-- 2. WEEKDAY AVAILABILITY RULES (Recurring Weekly Capacity)
CREATE TABLE IF NOT EXISTS public.availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  available_minutes INTEGER NOT NULL DEFAULT 180 CHECK (available_minutes >= 0),
  is_rest_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_weekday UNIQUE (user_id, day_of_week)
);

-- 3. DATE-SPECIFIC AVAILABILITY EXCEPTIONS (Overrides for Specific Dates)
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  available_minutes INTEGER NOT NULL DEFAULT 0 CHECK (available_minutes >= 0),
  is_unavailable BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_exception_date UNIQUE (user_id, exception_date)
);

-- 4. EXTEND DAILY PLANS
ALTER TABLE public.daily_plans 
  ADD COLUMN IF NOT EXISTS preparation_plan_id UUID REFERENCES public.preparation_plans(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS available_minutes INTEGER NOT NULL DEFAULT 180 CHECK (available_minutes >= 0),
  ADD COLUMN IF NOT EXISTS is_rest_day BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS utilization_rate NUMERIC(4, 3) NOT NULL DEFAULT 0.0;

-- Expand status check on daily_plans to include rest_day
ALTER TABLE public.daily_plans DROP CONSTRAINT IF EXISTS daily_plans_status_check;
ALTER TABLE public.daily_plans ADD CONSTRAINT daily_plans_status_check 
  CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped', 'rest_day'));

-- 5. EXTEND DAILY TASKS
ALTER TABLE public.daily_tasks DROP CONSTRAINT IF EXISTS daily_tasks_task_type_check;
ALTER TABLE public.daily_tasks ADD CONSTRAINT daily_tasks_task_type_check 
  CHECK (task_type IN ('learn', 'practice', 'revise', 'mock', 'dsa_problem', 'revision', 'custom'));

ALTER TABLE public.daily_tasks DROP CONSTRAINT IF EXISTS daily_tasks_status_check;
ALTER TABLE public.daily_tasks ADD CONSTRAINT daily_tasks_status_check 
  CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'rescheduled', 'carried_forward', 'cancelled'));

ALTER TABLE public.daily_tasks DROP CONSTRAINT IF EXISTS daily_tasks_source_check;
ALTER TABLE public.daily_tasks ADD CONSTRAINT daily_tasks_source_check 
  CHECK (source IN ('planner', 'user', 'revision_queue', 'planner_generated', 'revision_generated', 'user_created', 'carry_forward', 'rescheduled'));

ALTER TABLE public.daily_tasks
  ADD COLUMN IF NOT EXISTS curriculum_item_id UUID REFERENCES public.curriculum_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revision_item_id UUID REFERENCES public.revision_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'P1',
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scheduled_reason TEXT,
  ADD COLUMN IF NOT EXISTS decision_metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS original_date DATE,
  ADD COLUMN IF NOT EXISTS carried_from_task_id UUID REFERENCES public.daily_tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS carry_count INTEGER NOT NULL DEFAULT 0;

-- 6. TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_preparation_plans_updated_at ON public.preparation_plans;
CREATE TRIGGER set_preparation_plans_updated_at
  BEFORE UPDATE ON public.preparation_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_availability_rules_updated_at ON public.availability_rules;
CREATE TRIGGER set_availability_rules_updated_at
  BEFORE UPDATE ON public.availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_availability_exceptions_updated_at ON public.availability_exceptions;
CREATE TRIGGER set_availability_exceptions_updated_at
  BEFORE UPDATE ON public.availability_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_preparation_plans_user_status ON public.preparation_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_plans_prep_plan_id ON public.daily_plans(preparation_plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_curriculum_item ON public.daily_tasks(user_id, curriculum_item_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_revision_item ON public.daily_tasks(user_id, revision_item_id);
CREATE INDEX IF NOT EXISTS idx_availability_rules_user ON public.availability_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_user_date ON public.availability_exceptions(user_id, exception_date);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.preparation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Policies for preparation_plans
DROP POLICY IF EXISTS "preparation_plans_select_own" ON public.preparation_plans;
CREATE POLICY "preparation_plans_select_own" ON public.preparation_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "preparation_plans_insert_own" ON public.preparation_plans;
CREATE POLICY "preparation_plans_insert_own" ON public.preparation_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "preparation_plans_update_own" ON public.preparation_plans;
CREATE POLICY "preparation_plans_update_own" ON public.preparation_plans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "preparation_plans_delete_own" ON public.preparation_plans;
CREATE POLICY "preparation_plans_delete_own" ON public.preparation_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for availability_rules
DROP POLICY IF EXISTS "availability_rules_select_own" ON public.availability_rules;
CREATE POLICY "availability_rules_select_own" ON public.availability_rules
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "availability_rules_insert_own" ON public.availability_rules;
CREATE POLICY "availability_rules_insert_own" ON public.availability_rules
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "availability_rules_update_own" ON public.availability_rules;
CREATE POLICY "availability_rules_update_own" ON public.availability_rules
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "availability_rules_delete_own" ON public.availability_rules;
CREATE POLICY "availability_rules_delete_own" ON public.availability_rules
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for availability_exceptions
DROP POLICY IF EXISTS "availability_exceptions_select_own" ON public.availability_exceptions;
CREATE POLICY "availability_exceptions_select_own" ON public.availability_exceptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "availability_exceptions_insert_own" ON public.availability_exceptions;
CREATE POLICY "availability_exceptions_insert_own" ON public.availability_exceptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "availability_exceptions_update_own" ON public.availability_exceptions;
CREATE POLICY "availability_exceptions_update_own" ON public.availability_exceptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "availability_exceptions_delete_own" ON public.availability_exceptions;
CREATE POLICY "availability_exceptions_delete_own" ON public.availability_exceptions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

