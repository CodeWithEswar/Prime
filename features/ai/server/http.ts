import "server-only";
import { createClient } from "@/lib/supabase/server";
import { aiEnabled } from "@/lib/ai/config";
import { AIError, normalizeAIError } from "@/lib/ai/errors";
import type { ZodType } from "zod";
import { ZodError } from "zod";
export async function aiSession(request: Request) {
  if (!aiEnabled()) throw new AIError("DISABLED", "PRIME AI is currently disabled.", 503);
  if (request.method !== "GET") {
    const expected =
      process.env.NODE_ENV === "production"
        ? new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin
        : new URL(request.url).origin;
    if (
      request.headers.get("origin") !== expected ||
      request.headers.get("sec-fetch-site") === "cross-site"
    )
      throw new AIError("FORBIDDEN", "This request is not allowed.", 403);
  }
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user)
    throw new AIError("UNAUTHENTICATED", "Sign in to use PRIME AI.", 401);
  return { client, userId: user.id };
}
export async function readAIInput<T>(request: Request, schema: ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new AIError("INVALID_REQUEST", "Use a JSON request.", 400);
  const reader = request.body?.getReader();
  if (!reader) throw new AIError("INVALID_REQUEST", "Enter a request.", 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 32768) {
      await reader.cancel();
      throw new AIError("INVALID_REQUEST", "This request is too large.", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return schema.parse(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    throw new AIError("INVALID_REQUEST", "Check the request and try again.", 400);
  }
}
export function aiErrorResponse(error: unknown) {
  const e =
    error instanceof ZodError
      ? new AIError("INVALID_REQUEST", "Check the request and try again.", 400)
      : normalizeAIError(error);
  return Response.json(
    { error: e.message, code: e.code },
    {
      status: e.status,
      headers: {
        "Cache-Control": "private, no-store",
        ...(e.retryAfter ? { "Retry-After": String(e.retryAfter) } : {}),
      },
    }
  );
}
export const privateJSON = (data: unknown) =>
  Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
