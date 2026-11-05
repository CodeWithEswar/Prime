-- ==============================================================================
-- PRIME Settings & User Preferences Migration
-- Authoritative schema extensions for career targets, learning configuration,
-- appearance preferences, security audit events, data export, and deletion.
-- ==============================================================================

-- 1. Extend Profiles with Academic / Personal Details
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS institution TEXT,
  ADD COLUMN IF NOT EXISTS degree TEXT,
  ADD COLUMN IF NOT EXISTS specialization TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- 2. Extend User Settings with Placement Targets & Compensation Details
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS target_companies TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS primary_target_company TEXT,
  ADD COLUMN IF NOT EXISTS target_compensation_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS target_compensation_currency TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS target_compensation_period TEXT NOT NULL DEFAULT 'annual',
  ADD COLUMN IF NOT EXISTS min_acceptable_compensation NUMERIC;

-- 3. Extend Availability Rules with Preferred Time Windows
ALTER TABLE public.availability_rules
  ADD COLUMN IF NOT EXISTS preferred_start_time TIME DEFAULT '18:00:00',
  ADD COLUMN IF NOT EXISTS preferred_end_time TIME DEFAULT '21:00:00';

-- 4. User Learning Preferences
CREATE TABLE IF NOT EXISTS public.user_learning_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_language TEXT NOT NULL DEFAULT 'java',
  difficulty_level TEXT NOT NULL DEFAULT 'intermediate'
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'adaptive')),
  learning_pace TEXT NOT NULL DEFAULT 'standard'
    CHECK (learning_pace IN ('relaxed', 'standard', 'accelerated', 'intensive')),
  default_session_minutes INTEGER NOT NULL DEFAULT 60
    CHECK (default_session_minutes IN (30, 45, 60, 90, 120)),
  revision_mode TEXT NOT NULL DEFAULT 'adaptive'
    CHECK (revision_mode IN ('adaptive', 'spaced_standard', 'manual')),
  instructional_language TEXT NOT NULL DEFAULT 'english',
  video_player_mode TEXT NOT NULL DEFAULT 'embedded'
    CHECK (video_player_mode IN ('embedded', 'youtube')),
  show_supplementary_lessons BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. User Appearance & Accessibility Preferences
CREATE TABLE IF NOT EXISTS public.user_appearance_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'system')),
  motion_preference TEXT NOT NULL DEFAULT 'system' CHECK (motion_preference IN ('system', 'reduced', 'standard')),
  ui_density TEXT NOT NULL DEFAULT 'comfortable' CHECK (ui_density IN ('comfortable', 'compact')),
  font_scaling TEXT NOT NULL DEFAULT 'normal' CHECK (font_scaling IN ('normal', 'large')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. User Data Export Jobs
CREATE TABLE IF NOT EXISTS public.user_data_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'COMPLETED'
    CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED')),
  export_data JSONB,
  download_token UUID DEFAULT gen_random_uuid() UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 HOURS'),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_export_user
  ON public.user_data_export_jobs(user_id, created_at DESC);

-- 7. Account Security Events (Audit Log)
CREATE TABLE IF NOT EXISTS public.account_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user
  ON public.account_security_events(user_id, created_at DESC);

-- 8. User Deletion Requests
CREATE TABLE IF NOT EXISTS public.user_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'COMPLETED'
    CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'FAILED')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

ALTER TABLE public.user_learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_appearance_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Learning Preferences
CREATE POLICY "Users can manage their own learning preferences"
  ON public.user_learning_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Appearance Preferences
CREATE POLICY "Users can manage their own appearance preferences"
  ON public.user_appearance_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Data Export Jobs
CREATE POLICY "Users can view and initiate their own export jobs"
  ON public.user_data_export_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Security Events
CREATE POLICY "Users can view their own security audit events"
  ON public.account_security_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert security audit events"
  ON public.account_security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Deletion Requests
CREATE POLICY "Users can create their own deletion requests"
  ON public.user_deletion_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service Role Bypass Policies
CREATE POLICY "Service role full access on learning_preferences"
  ON public.user_learning_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on appearance_preferences"
  ON public.user_appearance_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on export_jobs"
  ON public.user_data_export_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on security_events"
  ON public.account_security_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on deletion_requests"
  ON public.user_deletion_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

