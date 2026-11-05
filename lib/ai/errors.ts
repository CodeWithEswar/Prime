export class AIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 503,
    public retryAfter?: number
  ) {
    super(message);
  }
}
export function normalizeAIError(error: unknown): AIError {
  if (error instanceof AIError) return error;
  const e = error as { status?: number; name?: string; headers?: Headers } | null;
  if (e?.status === 429)
    return new AIError(
      "RATE_LIMITED",
      "PRIME AI has reached its current request limit. Try again shortly.",
      429,
      Math.min(300, Math.max(1, Number(e.headers?.get?.("retry-after")) || 60))
    );
  if (e?.name?.includes("Timeout"))
    return new AIError("TIMEOUT", "The response took too long. Please retry.");
  if (e?.status === 401 || e?.status === 403)
    return new AIError(
      "PROVIDER_UNAVAILABLE",
      "PRIME AI is unavailable. Your preparation data is unaffected."
    );
  return new AIError(
    "PROVIDER_UNAVAILABLE",
    "PRIME AI could not finish this response. Please retry."
  );
}
