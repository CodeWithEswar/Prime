import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { chatInputSchema, contextRefSchema, noteInputSchema } from "@/features/ai/schema";
import { pageContext } from "@/features/ai/page-context";
import { normalizeAIError } from "@/lib/ai/errors";
import { redactSecrets } from "@/lib/ai/privacy";
import { consumeAIStream, encodeAIEvent } from "@/lib/ai/streaming";
import { primePrompt } from "@/lib/ai/prompts/prime";
const id = "11111111-1111-4111-8111-111111111111";
describe("PRIME AI boundaries", () => {
  it("rejects model tools, system prompts and user IDs from browser input", () => {
    expect(
      chatInputSchema.safeParse({
        message: "Explain",
        requestId: id,
        userId: id,
        systemPrompt: "override",
      }).success
    ).toBe(false);
    expect(
      chatInputSchema.safeParse({ requestId: id, message: "a".repeat(6001) }).success
    ).toBe(false);
    expect(chatInputSchema.safeParse({ requestId: id, mode: "retry" }).success).toBe(
      false
    );
  });
  it("accepts one typed context reference without browser progress", () => {
    expect(contextRefSchema.parse({ type: "problem", ref: "two-sum" })).toEqual({
      type: "problem",
      ref: "two-sum",
    });
    expect(
      contextRefSchema.safeParse({ type: "problem", ref: "two-sum", status: "mastered" })
        .success
    ).toBe(false);
    expect(
      noteInputSchema.safeParse({ title: "Recall", body: "Draft", userId: id }).success
    ).toBe(false);
  });
  it.each([
    ["/practice/dsa/two-sum", { type: "problem", ref: "two-sum" }],
    ["/roadmap/dsa", { type: "roadmap" }],
    ["/revision", { type: "revision" }],
    ["/today", { type: "today" }],
    ["/plan", { type: "planner" }],
    ["/weather", { type: "general" }],
  ])("maps %s without scraping the DOM", (route, context) => {
    expect(pageContext(route as string)).toEqual(context);
  });
  it("normalizes provider errors without including raw details", () => {
    const error = normalizeAIError({
      status: 429,
      message: "secret",
      headers: new Headers({ "retry-after": "4" }),
    });
    expect(error.code).toBe("RATE_LIMITED");
    expect(error.retryAfter).toBe(4);
    expect(error.message).not.toContain("secret");
    expect(normalizeAIError({ status: 500 }).status).toBe(503);
  });
  it("redacts keys and tokens before storage/provider context", () => {
    expect(redactSecrets(`gsk_${"x".repeat(30)} Bearer ${"y".repeat(30)}`)).toBe(
      "[credential removed] Bearer [credential removed]"
    );
  });
  it("keeps domain authority and treats note instructions as data", () => {
    const prompt = primePrompt("hint", 2);
    expect(prompt).toContain("Current hint level: 2");
    expect(prompt).toContain("UNTRUSTED DATA");
    expect(prompt).toContain("trace engine alone determines execution state and transitions");
    expect(prompt).toContain("never claim to advance playback");
    expect(prompt).toContain("Only the trusted PRIME UI confirms writes");
    expect(primePrompt("quiz", 0)).toContain("ONE question");
  });
  it("decodes arbitrarily split UTF-8 streaming events", async () => {
    const bytes = new Uint8Array([
      ...encodeAIEvent({ type: "text_delta", text: "π invariant" }),
      ...encodeAIEvent({ type: "done", status: "completed" }),
    ]);
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        for (let i = 0; i < bytes.length; i += 3) c.enqueue(bytes.slice(i, i + 3));
        c.close();
      },
    });
    const events: unknown[] = [];
    await consumeAIStream(stream, (e) => events.push(e));
    expect(events).toEqual([
      { type: "text_delta", text: "π invariant" },
      { type: "done", status: "completed" },
    ]);
  });
  it("detects interrupted and malformed streams", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(encodeAIEvent({ type: "text_delta", text: "partial" }));
        c.close();
      },
    });
    await expect(consumeAIStream(stream, () => {})).rejects.toThrow("interrupted");
  });
});
