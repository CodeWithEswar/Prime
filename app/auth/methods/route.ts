import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/validation/env.server";
import { authConfigured } from "@/features/auth/server/http";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  if (!authConfigured())
    return NextResponse.json({ google: false, email: false }, { headers });
  try {
    const response = await fetch(
      new URL("/auth/v1/settings", serverEnv.NEXT_PUBLIC_SUPABASE_URL),
      {
        headers: { apikey: serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("unavailable");
    const settings = await response.json();
    return NextResponse.json(
      {
        google: settings.external?.google === true,
        email: settings.external?.email === true,
      },
      { headers }
    );
  } catch {
    return NextResponse.json({ google: false, email: false }, { headers });
  }
}
