import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/validation/env.client";

/**
 * Creates a Supabase client for use in Browser / Client Components.
 * Uses public anon key and connects to user session stored in cookies.
 */
export function createClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
