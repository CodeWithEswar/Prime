import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  authConfigured,
  authOrigin,
  authResponse,
  readAuthInput,
} from "@/features/auth/server/http";

export async function POST(request: NextRequest) {
  const input = await readAuthInput(request);
  if (!input) return authResponse(request, false, 400);
  if (!authConfigured()) return authResponse(request, false, 503);
  try {
    const client = await createClient();
    const callback = new URL("/auth/callback", authOrigin(request));
    callback.searchParams.set("next", input.next);
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (error || !data.url) return authResponse(request, false, 503);
    const target = new URL(data.url);
    if (
      target.origin !==
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321").origin
    )
      return authResponse(request, false, 503);
    if (request.headers.get("accept")?.includes("application/json"))
      return NextResponse.json(
        { ok: true, url: target.toString() },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    return NextResponse.redirect(target, {
      status: 303,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return authResponse(request, false, 503);
  }
}
