import { aiSession, aiErrorResponse, privateJSON } from "@/features/ai/server/http";
import { contextRefSchema } from "@/features/ai/schema";
import { loadAIContext } from "@/features/ai/server/context";
export async function GET(request: Request) {
  try {
    const s = await aiSession(request);
    const q = new URL(request.url).searchParams;
    const ref = contextRefSchema.parse({
      type: q.get("type") ?? "general",
      ref: q.get("ref") ?? undefined,
      date: q.get("date") ?? undefined,
      lab: q.has("lab")
        ? (() => {
            try {
              return JSON.parse(q.get("lab")!);
            } catch {
              return null;
            }
          })()
        : undefined,
    });
    return privateJSON(await loadAIContext(s.client, s.userId, ref));
  } catch (e) {
    return aiErrorResponse(e);
  }
}
