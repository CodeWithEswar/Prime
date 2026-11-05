import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/validation/env.server";
import { safeAuthReturn } from "../schema";

export function authOrigin(request: NextRequest) {
  return process.env.NODE_ENV === "production"
    ? new URL(serverEnv.NEXT_PUBLIC_APP_URL).origin
    : request.nextUrl.origin;
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
  const origin = request.headers.get("origin");
  if (!origin || origin !== authOrigin(request)) return null;
  if (Number(request.headers.get("content-length") || 0) > 4096) return null;
  try {
    const input = Object.fromEntries(await request.formData());
    const referrer = request.headers.get("referer");
    const fallback =
      referrer && new URL(referrer).origin === authOrigin(request)
        ? new URL(referrer).searchParams.get("next")
        : null;
    return { email: input.email, next: safeAuthReturn(input.next || fallback) };
  } catch {
    return null;
  }
}
