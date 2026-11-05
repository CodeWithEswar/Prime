import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeAuthReturn } from "@/features/auth/schema";
import { authConfigured, authOrigin } from "@/features/auth/server/http";

export async function GET(request: NextRequest) {
  const errorDestination = new URL("/auth/problem", authOrigin(request));
  const headers = {
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
  };
  if (!authConfigured())
    return NextResponse.redirect(errorDestination, { status: 303, headers });
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  try {
    const client = await createClient();
    const result =
      code && code.length < 2048
        ? await client.auth.exchangeCodeForSession(code)
        : tokenHash && tokenHash.length < 2048 && type === "email"
          ? await client.auth.verifyOtp({ token_hash: tokenHash, type: "email" })
          : null;
    if (!result || result.error || !result.data.user || !result.data.session)
      return NextResponse.redirect(errorDestination, { status: 303, headers });
    const destination = new URL("/auth/complete", authOrigin(request));
    destination.searchParams.set(
      "next",
      safeAuthReturn(request.nextUrl.searchParams.get("next"))
    );
    return NextResponse.redirect(destination, { status: 303, headers });
  } catch {
    return NextResponse.redirect(errorDestination, { status: 303, headers });
  }
}
