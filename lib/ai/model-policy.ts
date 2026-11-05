import "server-only";
import { aiConfig } from "./config";
export const AI_LIMITS = {
  inputChars: 6000,
  historyChars: 9000,
  contextChars: 9000,
  toolResultChars: 5000,
  outputTokens: 1800,
  maxRounds: 3,
  maxToolCalls: 6,
  timeoutMs: 75000,
} as const;
export function resolveModel() {
  return aiConfig().model;
}
