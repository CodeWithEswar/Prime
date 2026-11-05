/** Defense in depth for accidentally pasted credentials. Never log the original input. */
export function redactSecrets(text: string) {
  return text
    .replace(/\bpostgres(?:ql)?:\/\/[^\s"'<>]+/gi, "[database credential removed]")
    .replace(
      /\b(?:gsk_|sk_(?:live|test)_|sk-)[A-Za-z0-9_-]{16,}\b/g,
      "[credential removed]"
    )
    .replace(/\bBearer\s+[A-Za-z0-9._~-]{16,}/gi, "Bearer [credential removed]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[token removed]");
}
