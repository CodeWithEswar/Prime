-- ==============================================================================
-- PRIME Notifications & Reminders Engine Migration
-- Enterprise event-driven notification architecture, durable scheduling,
-- delivery tracking, inbox management, and user preference controls.
-- ==============================================================================

-- 1. Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  revision_email_enabled BOOLEAN NOT NULL DEFAULT true,
  session_email_enabled BOOLEAN NOT NULL DEFAULT true,
  assessment_email_enabled BOOLEAN NOT NULL DEFAULT true,
  missed_task_email_enabled BOOLEAN NOT NULL DEFAULT true,
  daily_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  weekly_report_enabled BOOLEAN NOT NULL DEFAULT true,
  session_lead_time_minutes INTEGER NOT NULL DEFAULT 15 CHECK (session_lead_time_minutes IN (5, 10, 15, 30, 60)),
  daily_digest_local_time TIME NOT NULL DEFAULT '07:00:00',
  weekly_report_day INTEGER NOT NULL DEFAULT 0 CHECK (weekly_report_day BETWEEN 0 AND 6), -- 0 = Sunday
  weekly_report_local_time TIME NOT NULL DEFAULT '19:00:00',
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME NOT NULL DEFAULT '22:00:00',
  quiet_hours_end TIME NOT NULL DEFAULT '07:00:00',
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_notification_preferences_user UNIQUE (user_id)
);

-- 2. Notification Events (Durable Transactional Event Records)
CREATE TABLE IF NOT EXISTS public.notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_version INTEGER NOT NULL DEFAULT 1,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_events_user_occurred
  ON public.notification_events(user_id, occurred_at DESC);

-- 3. Notification Schedules (Due reminder jobs evaluated by Cloudflare / Dispatcher)
CREATE TABLE IF NOT EXISTS public.notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_version INTEGER NOT NULL DEFAULT 1,
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'CLAIMED', 'QUEUED', 'COMPLETED', 'CANCELED', 'SUPPRESSED', 'FAILED')),
  idempotency_key TEXT NOT NULL UNIQUE,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  lease_owner TEXT,
  lease_expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial index for fast due-job claiming
CREATE INDEX IF NOT EXISTS idx_notification_schedules_due
  ON public.notification_schedules(scheduled_for, status)
  WHERE status IN ('PENDING', 'CLAIMED');

CREATE INDEX IF NOT EXISTS idx_notification_schedules_user
  ON public.notification_schedules(user_id, status);

-- 4. In-App Notifications (User Inbox)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.notification_events(id) ON DELETE SET NULL,
  category TEXT NOT NULL
    CHECK (category IN (
      'revision_due',
      'revision_overdue',
      'study_session_upcoming',
      'assessment_upcoming',
      'missed_daily_task',
      'daily_study_digest',
      'weekly_progress_report',
      'weekly_plan_reminder',
      'streak_at_risk',
      'goal_deadline',
      'system_announcement'
    )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast user inbox lookup (excluding deleted)
CREATE INDEX IF NOT EXISTS idx_notifications_user_inbox
  ON public.notifications(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Fast unread count lookup
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id)
  WHERE deleted_at IS NULL AND read_at IS NULL;

-- 5. Notification Deliveries (Channel-Specific Delivery Records)
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL')),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'DEFERRED', 'FAILED', 'BOUNCED', 'SUPPRESSED')),
  idempotency_key TEXT NOT NULL UNIQUE,
  provider TEXT DEFAULT 'nodemailer_smtp',
  provider_message_id TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_pending
  ON public.notification_deliveries(status, next_attempt_at)
  WHERE status IN ('PENDING', 'DEFERRED');

-- 6. Notification Delivery Attempts (Audit & Operational History)
CREATE TABLE IF NOT EXISTS public.notification_delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.notification_deliveries(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'transient_failure', 'permanent_failure')),
  error_category TEXT,
  provider_response_code TEXT,
  provider_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_attempts_delivery
  ON public.notification_delivery_attempts(delivery_id, attempt_number);

-- 7. Notification Outbox (Durable Transactional Outbox for Domain Events)
CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  aggregate_version INTEGER NOT NULL DEFAULT 1,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_unpublished
  ON public.notification_outbox(created_at)
  WHERE published_at IS NULL;

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

-- Preferences: Users can read and update their own preferences
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- In-App Notifications: Users can view their own non-deleted notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Internal pipeline tables: Service role only (No public/authenticated access)
CREATE POLICY "Service role full access to notification_events"
  ON public.notification_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to notification_schedules"
  ON public.notification_schedules FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to notification_deliveries"
  ON public.notification_deliveries FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to notification_delivery_attempts"
  ON public.notification_delivery_attempts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to notification_outbox"
  ON public.notification_outbox FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to notifications"
  ON public.notifications FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to notification_preferences"
  ON public.notification_preferences FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ==============================================================================
-- Stored Procedures & Atomic Claim Functions
-- ==============================================================================

-- Atomically claim due notification schedules using FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION public.claim_due_notification_schedules(
  p_lease_owner TEXT,
  p_batch_size INTEGER DEFAULT 50,
  p_lease_duration_seconds INTEGER DEFAULT 300
)
RETURNS SETOF public.notification_schedules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_lease_expiry TIMESTAMPTZ := v_now + (p_lease_duration_seconds || ' seconds')::INTERVAL;
BEGIN
  RETURN QUERY
  WITH claimable AS (
    SELECT s.id
    FROM public.notification_schedules s
    WHERE (
      (s.status = 'PENDING' AND s.scheduled_for <= v_now)
      OR
      (s.status = 'CLAIMED' AND s.lease_expires_at < v_now)
    )
    ORDER BY s.scheduled_for ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_batch_size
  )
  UPDATE public.notification_schedules tgt
  SET
    status = 'CLAIMED',
    lease_owner = p_lease_owner,
    lease_expires_at = v_lease_expiry,
    attempt_count = tgt.attempt_count + 1,
    updated_at = v_now
  FROM claimable
  WHERE tgt.id = claimable.id
  RETURNING tgt.*;
END;
$$;

-- Mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET read_at = NOW()
  WHERE user_id = p_user_id
    AND read_at IS NULL
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Revoke dangerous direct grants
REVOKE ALL ON FUNCTION public.claim_due_notification_schedules(TEXT, INTEGER, INTEGER) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_notification_schedules(TEXT, INTEGER, INTEGER) TO service_role;

GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read(UUID) TO authenticated, service_role;

