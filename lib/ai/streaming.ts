import type { AIEvent } from "@/features/ai/types";
export function encodeAIEvent(event: AIEvent) {
  return new TextEncoder().encode(JSON.stringify(event) + "\n");
}
/** Incremental NDJSON decoder; incomplete UTF-8 and network chunks are retained. */
export async function consumeAIStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: AIEvent) => void
) {
  const reader = body.getReader(),
    decoder = new TextDecoder();
  let buffer = "",
    doneEvent = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 100000) throw new Error("Response exceeded the stream limit.");
      let end: number;
      while ((end = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 1);
        if (line.trim()) {
          const event = JSON.parse(line) as AIEvent;
          if (event.type === "done") doneEvent = true;
          onEvent(event);
        }
      }
      if (done) break;
    }
    if (buffer.trim() || !doneEvent)
      throw new Error("The response was interrupted. You can retry.");
  } finally {
    reader.releaseLock();
  }
}
