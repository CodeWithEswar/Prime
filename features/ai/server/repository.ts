import "server-only";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AIClient } from "@/lib/ai/database";
import { AIError } from "@/lib/ai/errors";
import type { ChatInput } from "../schema";
import { contextRefSchema, intentSchema } from "../schema";
import { redactSecrets } from "@/lib/ai/privacy";
import type { Json } from "@/lib/supabase/database.types";
import { PROMPT_VERSION } from "@/lib/ai/prompts/prime";
export const aiAdmin = () => createAdminClient() as unknown as AIClient;
export function databaseError(error: { message: string; code?: string } | null): never {
  const message = error?.message ?? "";
  if (message.includes("AI_LIMIT"))
    throw new AIError(
      "RATE_LIMITED",
      "You've reached the current PRIME AI request limit. Try again shortly.",
      429,
      60
    );
  if (message.includes("AI_BUSY") || message.includes("AI_DUPLICATE"))
    throw new AIError(
      "CONFLICT",
      "A response is already running or this request was already received.",
      409
    );
  if (message.includes("AI_NOT_FOUND"))
    throw new AIError("NOT_FOUND", "This conversation or action is unavailable.", 404);
  if (message.includes("AI_ACTION_CLOSED"))
    throw new AIError("ACTION_CLOSED", "This action is no longer available.", 409);
  throw new AIError(
    "STORAGE_UNAVAILABLE",
    "PRIME AI storage is unavailable. Your preparation data is unaffected."
  );
}
const turnSchema = z.object({
  conversationId: z.uuid(),
  messageId: z.uuid(),
  hintDepth: z.number().int(),
  intent: intentSchema,
  context: contextRefSchema,
});
export async function beginTurn(userId: string, input: ChatInput) {
  const { data, error } = await aiAdmin().rpc("begin_ai_turn", {
    p_user_id: userId,
    p_conversation_id: input.conversationId ?? null,
    p_request_id: input.requestId,
    p_message: redactSecrets(input.message),
    p_intent: input.intent,
    p_context: input.context,
    p_mode: input.mode,
  });
  if (error) databaseError(error);
  return turnSchema.parse(data);
}
export async function finishTurn(
  userId: string,
  conversationId: string,
  requestId: string,
  messageId: string,
  content: string,
  status: string,
  parts: Json,
  metrics: { input: number; output: number; latency: number; model: string }
) {
  const db = aiAdmin();
  const result = await db
    .from("ai_messages")
    .update({
      content: content.slice(0, 30000),
      status,
      parts,
      completed_at: new Date().toISOString(),
      model: metrics.model,
      prompt_version: PROMPT_VERSION,
      input_tokens: metrics.input,
      output_tokens: metrics.output,
      latency_ms: metrics.latency,
    })
    .eq("id", messageId)
    .eq("user_id", userId)
    .eq("request_id", requestId);
  if (result.error) databaseError(result.error);
  const lease = await db
    .from("ai_conversations")
    .update({
      active_request: null,
      active_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .eq("user_id", userId)
    .eq("active_request", requestId);
  if (lease.error) databaseError(lease.error);
}
