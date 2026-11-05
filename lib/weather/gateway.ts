import "server-only";
import { createClient } from "@/lib/supabase/server";
// Best-effort, bounded per-instance protection in addition to authenticated access and shared provider caches.
const calls = new Map<string, { at: number; count: number }>();
export async function weatherAccess(kind: "forecast" | "search") {
  const result = await (async () => {
    try {
      return await (await createClient()).auth.getUser();
    } catch {
      return null;
    }
  })();
  if (!result || result.error)
    return Response.json(
      { error: "Weather sign-in verification is temporarily unavailable." },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store", "Retry-After": "60" },
      }
    );
  const user = result.data.user;
  if (!user)
    return Response.json(
      { error: "Sign in to use weather." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } }
    );
  const key = `${user.id}:${kind}`,
    now = Date.now(),
    old = calls.get(key),
    limit = kind === "search" ? 40 : 20;
  if (old && now - old.at < 60000 && old.count >= limit)
    return Response.json(
      { error: "Please wait a moment before trying again." },
      {
        status: 429,
        headers: { "Retry-After": "60", "Cache-Control": "private, no-store" },
      }
    );
  if (calls.size > 2000)
    for (const [id, value] of calls) if (now - value.at >= 60000) calls.delete(id);
  if (calls.size > 3000) calls.delete(calls.keys().next().value!);
  calls.set(
    key,
    old && now - old.at < 60000 ? { ...old, count: old.count + 1 } : { at: now, count: 1 }
  );
  return null;
}
