import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_AUTH_REDIRECT,
  safeAuthReturn,
  isWorkspacePath,
} from "@/features/auth/schema";

/**
 * Refreshes Supabase auth tokens across requests to prevent session expiration.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "anon-key-placeholder";

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Avoid executing user profile queries here; only refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let path = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  try {
    path = decodeURIComponent(path);
  } catch {
    /* Invalid URL encodings do not match protected auth pages. */
  }
  const nextParam = request.nextUrl.searchParams.get("next");
  const destination =
    isWorkspacePath(path) && !user
      ? `/login?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`
      : path === "/login" && user
        ? nextParam
          ? safeAuthReturn(nextParam)
          : DEFAULT_AUTH_REDIRECT
        : path === "/auth/complete" && !user
          ? "/auth/problem"
          : null;
  if (destination) {
    const response = NextResponse.redirect(new URL(destination, request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  if (path === "/login" || path.startsWith("/auth/") || isWorkspacePath(path)) {
    supabaseResponse.headers.set("Cache-Control", "private, no-store");
  }

  return supabaseResponse;
}
