import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/validation/env.server";
import { safeAuthReturn } from "../schema";

export function authOrigin(request: NextRequest): string {
  // 1. Prefer incoming request origin (dynamic, supports Vercel preview/production, custom domains, and localhost)
  if (request.nextUrl?.origin && request.nextUrl.origin !== "null") {
    return request.nextUrl.origin;
  }

  // 2. Fallback to reverse-proxy forwarded headers
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  if (host) {
    return `${proto}://${host}`;
  }

  // 3. Fallback to configured server environment URL
  if (serverEnv.NEXT_PUBLIC_APP_URL) {
    try {
      return new URL(serverEnv.NEXT_PUBLIC_APP_URL).origin;
    } catch {
      // ignore
    }
  }

  // 4. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function isAllowedOrigin(origin: string | null, request: NextRequest): boolean {
  if (!origin) return false;

  const currentOrigin = authOrigin(request);
  if (origin === currentOrigin) return true;

  if (request.nextUrl?.origin && origin === request.nextUrl.origin) return true;

  if (serverEnv.NEXT_PUBLIC_APP_URL) {
    try {
      if (origin === new URL(serverEnv.NEXT_PUBLIC_APP_URL).origin) return true;
    } catch {}
  }

  if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const currentUrl = new URL(currentOrigin);
    if (originUrl.hostname === currentUrl.hostname && originUrl.protocol === currentUrl.protocol) {
      return true;
    }
    // Allow vercel preview / deployment subdomains matching this deployment
    if (
      originUrl.hostname.endsWith(".vercel.app") &&
      (request.nextUrl?.hostname?.endsWith(".vercel.app") ||
        request.headers.get("host")?.endsWith(".vercel.app"))
    ) {
      return true;
    }
  } catch {}

  return false;
}

export function authConfigured() {
  return (
    !!serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !/placeholder/i.test(serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function authResponse(request: NextRequest, ok: boolean, status = 200) {
  const headers = { "Cache-Control": "private, no-store" };
  if (request.headers.get("accept")?.includes("application/json"))
    return NextResponse.json({ ok }, { status, headers });
  return NextResponse.redirect(
    new URL(ok ? "/auth/check-email" : "/auth/problem", authOrigin(request)),
    { status: 303, headers }
  );
}

export async function readAuthInput(request: NextRequest) {
  const origin =
    request.headers.get("origin") ||
    (request.headers.get("referer")
      ? new URL(request.headers.get("referer")!).origin
      : null);

  if (!isAllowedOrigin(origin, request)) return null;
  if (Number(request.headers.get("content-length") || 0) > 4096) return null;

  try {
    let input: Record<string, unknown> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      input = (await request.json()) as Record<string, unknown>;
    } else {
      input = Object.fromEntries(await request.formData());
    }

    const referrer = request.headers.get("referer");
    const fallback =
      referrer && isAllowedOrigin(new URL(referrer).origin, request)
        ? new URL(referrer).searchParams.get("next")
        : null;

    const email = typeof input.email === "string" ? input.email : undefined;
    const nextVal = typeof input.next === "string" ? input.next : fallback;

    return { email, next: safeAuthReturn(nextVal) };
  } catch {
    return null;
  }
}
