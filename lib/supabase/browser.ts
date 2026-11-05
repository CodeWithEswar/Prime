import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/validation/env.client";
import type { Database } from "./database.types";

/**
 * Creates a Supabase client for use in Browser / Client Components.
 * Uses public anon key and connects to user session stored in cookies.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
