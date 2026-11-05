import {
  aiSession,
  aiErrorResponse,
  privateJSON,
  readAIInput,
} from "@/features/ai/server/http";
import { actionSchema, saveNoteSchema, contextRefSchema } from "@/features/ai/schema";
import { aiAdmin, databaseError } from "@/features/ai/server/repository";
import { proposeNote } from "@/lib/ai/tools/registry";
import { AIError } from "@/lib/ai/errors";
export async function POST(request: Request) {
  try {
    const s = await aiSession(request);
    const { messageId } = await readAIInput(request, saveNoteSchema);
    const db = aiAdmin();
    const message = await db
      .from("ai_messages")
      .select("id,content,conversation_id,status")
      .eq("id", messageId)
      .eq("user_id", s.userId)
      .eq("role", "assistant")
      .single();
    if (message.error || !message.data?.content || message.data.status !== "completed")
      throw new AIError("NOT_FOUND", "Choose a completed response.", 404);
    const pending = await db
      .from("ai_tool_calls")
      .select("id,tool_name,status,input,expires_at,result")
      .eq("user_id", s.userId)
      .eq("message_id", messageId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    if (pending.data) return privateJSON({ action: pending.data });
    const title =
      message.data.content
        .split("\n")
        .find((x) => x.trim())
        ?.replace(/^#+\s*/, "")
        .slice(0, 100) || "PRIME recall notes";
    const conversation = await db
      .from("ai_conversations")
      .select("context")
      .eq("id", message.data.conversation_id)
      .eq("user_id", s.userId)
      .single();
    const context = contextRefSchema.safeParse(conversation.data?.context);
    const problemSlug =
      context.success && context.data.type === "problem" ? context.data.ref : undefined;
    return privateJSON({
      action: await proposeNote(
        { title, body: message.data.content.slice(0, 12000), problemSlug },
        {
          client: s.client,
          userId: s.userId,
          conversationId: message.data.conversation_id,
          messageId,
        }
      ),
    });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
export async function PATCH(request: Request) {
  try {
    const s = await aiSession(request);
    const input = await readAIInput(request, actionSchema);
    const { data, error } = await aiAdmin().rpc("decide_ai_note", {
      p_user_id: s.userId,
      p_action_id: input.id,
      p_confirm: input.decision === "confirm",
    });
    if (error) databaseError(error);
    return privateJSON(data);
  } catch (e) {
    return aiErrorResponse(e);
  }
}
