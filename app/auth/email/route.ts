import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emailSignInSchema } from "@/features/auth/schema";
import {
  authConfigured,
  authOrigin,
  authResponse,
  readAuthInput,
} from "@/features/auth/server/http";

export async function POST(request: NextRequest) {
  const input = await readAuthInput(request);
  if (!input) return authResponse(request, false, 400);
  const parsed = emailSignInSchema.safeParse(input);
  if (!parsed.success) return authResponse(request, false, 400);
  if (!authConfigured()) return authResponse(request, false, 503);
  try {
    const client = await createClient();
    const callback = new URL("/auth/callback", authOrigin(request));
    callback.searchParams.set("next", input.next);
    const { error } = await client.auth.signInWithOtp({
      email: parsed.data.email,
      options: { shouldCreateUser: false, emailRedirectTo: callback.toString() },
    });
    // Do not disclose whether this address has an account.
    if (error && !["user_not_found", "signup_disabled"].includes(error.code || ""))
      return authResponse(request, false, error.status === 429 ? 429 : 503);
    return authResponse(request, true);
  } catch {
    return authResponse(request, false, 503);
  }
}
