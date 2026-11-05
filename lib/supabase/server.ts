import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { io } from "next/cache";
import { serverEnv } from "@/lib/validation/env.server";
import type { Database } from "./database.types";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Automatically synchronizes auth session tokens with Next.js request cookies.
 */
export async function createClient() {
  // Supabase initializes time-sensitive session state before reading the cookie adapter.
  await io();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if middleware is refreshing user sessions.
          }
        },
      },
    }
  );
}
