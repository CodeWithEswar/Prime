import {
  aiSession,
  aiErrorResponse,
  readAIInput,
  privateJSON,
} from "@/features/ai/server/http";
import { feedbackSchema } from "@/features/ai/schema";
import { aiAdmin, databaseError } from "@/features/ai/server/repository";
import { AIError } from "@/lib/ai/errors";
export async function POST(request: Request) {
  try {
    const s = await aiSession(request);
    const input = await readAIInput(request, feedbackSchema);
    const db = aiAdmin();
    const message = await db
      .from("ai_messages")
      .select("id")
      .eq("id", input.messageId)
      .eq("user_id", s.userId)
      .eq("role", "assistant")
      .maybeSingle();
    if (!message.data)
      throw new AIError("NOT_FOUND", "This response is unavailable.", 404);
    const { error } = await db
      .from("ai_feedback")
      .upsert({ user_id: s.userId, message_id: input.messageId, rating: input.rating });
    if (error) databaseError(error);
    return privateJSON({ ok: true });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
