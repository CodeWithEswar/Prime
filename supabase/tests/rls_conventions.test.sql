-- PRIME Database RLS Conventions Test Specification
-- In Phase 1+, pgTAP tests run against local Supabase to verify RLS enforcement.
-- Standard contract:
-- 1. Unauthenticated users cannot read user-owned tables
-- 2. Authenticated users can only read/write their own records: auth.uid() = user_id
-- 3. Global catalog tables (roadmaps, problem catalog) are world-readable, admin-writeable

