-- PRIME Database Foundation Migration
-- Establishes extensions, helper triggers, and base architectural conventions.
-- Note: Feature schemas (Today, Roadmap, Practice, Revision, Progress) are deferred to Phase 1+.

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Timezone enforcement
SET timezone TO 'UTC';

-- Automated updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments establishing RLS expectations for future migrations
COMMENT ON FUNCTION public.handle_updated_at IS 'PRIME trigger: automatically keeps updated_at synchronized to UTC timestamp';

