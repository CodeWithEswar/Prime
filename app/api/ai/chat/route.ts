import { aiSession, aiErrorResponse, readAIInput } from "@/features/ai/server/http";
import { chatInputSchema } from "@/features/ai/schema";
import { startChat } from "@/features/ai/server/chat";
export const maxDuration = 90;
export async function POST(request: Request) {
  try {
    const session = await aiSession(request);
    const input = await readAIInput(request, chatInputSchema);
    return await startChat(session.client, session.userId, input, request.signal);
  } catch (e) {
    return aiErrorResponse(e);
  }
}
