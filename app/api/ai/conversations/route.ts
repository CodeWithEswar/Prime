import { z } from "zod";
import type { AIClient } from "@/lib/ai/database";
import {
  aiSession,
  aiErrorResponse,
  readAIInput,
  privateJSON,
} from "@/features/ai/server/http";
import { conversationPatchSchema } from "@/features/ai/schema";
import { aiAdmin, databaseError } from "@/features/ai/server/repository";
export async function GET(request: Request) {
  try {
    const s = await aiSession(request);
    const q = new URL(request.url).searchParams;
    const before = q.get("before");
    const cursor = before
      ? z.tuple([z.iso.datetime({ offset: true }), z.uuid()]).parse(before.split("|"))
      : null;
    let query = (s.client as unknown as AIClient)
      .from("ai_conversations")
      .select("id,title,context,hint_depth,mode,updated_at,archived")
      .eq("user_id", s.userId)
      .eq("archived", false)
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(21);
    if (cursor)
      query = query.or(
        `updated_at.lt.${cursor[0]},and(updated_at.eq.${cursor[0]},id.lt.${cursor[1]})`
      );
    const { data, error } = await query;
    if (error) databaseError(error);
    return privateJSON({
      conversations: data.slice(0, 20),
      nextCursor: data.length > 20 ? `${data[19].updated_at}|${data[19].id}` : null,
    });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
export async function PATCH(request: Request) {
  try {
    const s = await aiSession(request);
    const input = await readAIInput(request, conversationPatchSchema);
    const { error } = await aiAdmin()
      .from("ai_conversations")
      .update({
        ...(input.title ? { title: input.title } : {}),
        ...(input.archived !== undefined ? { archived: input.archived } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .eq("user_id", s.userId);
    if (error) databaseError(error);
    return privateJSON({ ok: true });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
