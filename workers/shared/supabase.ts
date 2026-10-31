import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { WorkerEnv } from "./types";

/**
 * Creates an authoritative Supabase client within Cloudflare Worker runtime.
 */
export function createWorkerSupabaseClient(env: WorkerEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
