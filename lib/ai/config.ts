import "server-only";
import { serverEnv } from "@/lib/validation/env.server";
import { AIError } from "./errors";
export const aiEnabled = () => serverEnv.PRIME_AI_ENABLED === "true";
export function aiConfig() {
  if (!aiEnabled()) throw new AIError("DISABLED", "PRIME AI is currently disabled.", 503);
  if (
    !serverEnv.GROQ_API_KEY ||
    !serverEnv.GROQ_MODEL ||
    !/^[a-zA-Z0-9_./-]+$/.test(serverEnv.GROQ_MODEL)
  )
    throw new AIError("NOT_CONFIGURED", "PRIME AI needs server configuration.");
  if (
    !serverEnv.SUPABASE_SERVICE_ROLE_KEY ||
    serverEnv.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder")
  )
    throw new AIError("NOT_CONFIGURED", "PRIME AI needs its server storage credential.");
  return { key: serverEnv.GROQ_API_KEY, model: serverEnv.GROQ_MODEL };
}
