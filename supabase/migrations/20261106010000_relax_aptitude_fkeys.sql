-- ============================================================================
-- PRIME — Decouple Aptitude Progress from Strict Catalog Foreign Keys
-- Migration: 20261106010000_relax_aptitude_fkeys.sql
-- ============================================================================

-- Decouple user topic and video progress from strict catalog existence,
-- identical to fundamentals progress in 20261104210000_fundamentals_progress_text_ids.sql.
-- This guarantees user progress tracking and server actions never fail with a 23503
-- foreign key violation when topics or videos are updated, migrated, or cached.

alter table if exists public.aptitude_topic_progress
  drop constraint if exists aptitude_topic_progress_topic_id_fkey;

alter table if exists public.aptitude_video_progress
  drop constraint if exists aptitude_video_progress_topic_id_fkey;

alter table if exists public.aptitude_video_progress
  drop constraint if exists aptitude_video_progress_video_id_fkey;

alter table if exists public.aptitude_attempts
  drop constraint if exists aptitude_attempts_topic_id_fkey;

alter table if exists public.aptitude_attempts
  drop constraint if exists aptitude_attempts_question_id_fkey;

alter table if exists public.aptitude_resource_reports
  drop constraint if exists aptitude_resource_reports_topic_id_fkey;

