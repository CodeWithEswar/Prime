import { z } from "zod";
import type { AIClient } from "@/lib/ai/database";
import { aiSession, aiErrorResponse, privateJSON } from "@/features/ai/server/http";
import { databaseError } from "@/features/ai/server/repository";
export async function GET(request: Request) {
  try {
    const s = await aiSession(request);
    const q = new URL(request.url).searchParams;
    const id = z.uuid().parse(q.get("conversationId"));
    const before = q.get("before");
    const db = s.client as unknown as AIClient;
    let query = db
      .from("ai_messages")
      .select("id,role,content,status,intent,ordinal,created_at,parts")
      .eq("user_id", s.userId)
      .eq("conversation_id", id)
      .order("ordinal", { ascending: false })
      .limit(41);
    if (before)
      query = query.lt("ordinal", z.coerce.number().int().positive().parse(before));
    const [messages, actions] = await Promise.all([
      query,
      db
        .from("ai_tool_calls")
        .select("id,tool_name,status,input,expires_at,result")
        .eq("user_id", s.userId)
        .eq("conversation_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    if (messages.error) databaseError(messages.error);
    if (actions.error) databaseError(actions.error);
    return privateJSON({
      messages: messages.data.slice(0, 40).reverse(),
      actions: actions.data,
      nextCursor: messages.data.length > 40 ? messages.data[39].ordinal : null,
    });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
