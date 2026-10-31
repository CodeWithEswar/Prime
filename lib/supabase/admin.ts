import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/validation/env.server";

/**
 * Privileged Admin / Service-Role Supabase Client.
 *
 * CAUTION: Bypasses Row Level Security (RLS).
 * Only to be used in privileged background jobs, administrative maintenance,
 * or trusted server operations. NEVER import into client-facing modules.
 */
export function createAdminClient() {
  return createSupabaseClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
