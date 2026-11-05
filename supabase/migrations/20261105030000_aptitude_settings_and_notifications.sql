-- ============================================================================
-- PRIME — Aptitude Integration: Settings & Notification Preferences
-- Migration: 20261105030000_aptitude_settings_and_notifications.sql
-- ============================================================================

-- 1. Extend user learning preferences with Aptitude tracking
ALTER TABLE public.user_learning_preferences
  ADD COLUMN IF NOT EXISTS enable_aptitude_module BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS aptitude_track_focus TEXT NOT NULL DEFAULT 'comprehensive'
    CHECK (aptitude_track_focus IN ('comprehensive', 'campus_nqt', 'quant_only', 'logical_verbal')),
  ADD COLUMN IF NOT EXISTS aptitude_daily_target_minutes INTEGER NOT NULL DEFAULT 30;

-- 2. Extend notification preferences with Aptitude reminders
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS aptitude_reminder_enabled BOOLEAN NOT NULL DEFAULT true;

