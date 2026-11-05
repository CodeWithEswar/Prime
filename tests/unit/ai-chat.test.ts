// @vitest-environment node
import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  begin: vi.fn(),
  finish: vi.fn(),
  context: vi.fn(),
  execute: vi.fn(),
}));
vi.mock("@/features/ai/server/repository", () => ({
  beginTurn: mocks.begin,
  finishTurn: mocks.finish,
  databaseError: () => {
    throw new Error("Storage error");
  },
}));
vi.mock("@/features/ai/server/context", () => ({ loadAIContext: mocks.context }));
vi.mock("@/lib/ai/config", () => ({
  aiConfig: () => ({ key: "test", model: "configured-test-model" }),
}));
vi.mock("@/lib/ai/groq", () => ({ groqProvider: {} }));
vi.mock("@/lib/ai/tools/registry", () => ({
  toolDefinitions: () => [],
  executeTool: mocks.execute,
}));
import { startChat } from "@/features/ai/server/chat";
import { consumeAIStream } from "@/lib/ai/streaming";
import type { AIProvider } from "@/lib/ai/provider";
import type { AIEvent } from "@/features/ai/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
const conversationId = "11111111-1111-4111-8111-111111111111",
  messageId = "22222222-2222-4222-8222-222222222222";
function client() {
  const query = {
    select: () => query,
    eq: () => query,
    neq: () => query,
    order: () => query,
    limit: async () => ({
      data: [{ role: "user", content: "Explain", status: "completed", ordinal: 1 }],
      error: null,
    }),
  };
  return { from: () => query } as unknown as SupabaseClient<Database>;
}
const input = {
  requestId: "33333333-3333-4333-8333-333333333333",
  message: "Explain",
  intent: "ask" as const,
  context: { type: "general" as const },
  mode: "send" as const,
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.begin.mockResolvedValue({
    conversationId,
    messageId,
    hintDepth: 0,
    intent: "ask",
    context: { type: "general" },
  });
  mocks.finish.mockResolvedValue(undefined);
  mocks.context.mockResolvedValue({
    reference: { type: "general" },
    label: "Preparation",
    facts: {},
    references: [],
    unavailable: [],
  });
});
async function run(provider: AIProvider, signal = new AbortController().signal) {
  const response = await startChat(client(), "owner", input, signal, provider);
  const events: AIEvent[] = [];
  await consumeAIStream(response.body!, (e) => events.push(e));
  return events;
}
describe("AI streaming orchestration", () => {
  it("streams text and persists final content once", async () => {
    const events = await run({
      async *stream() {
        yield { type: "text", text: "## Invariant\n" };
        yield { type: "text", text: "Keep the window valid." };
        yield { type: "finish", reason: "stop" };
        yield { type: "usage", input: 20, output: 10 };
      },
    });
    expect(events.filter((e) => e.type === "text_delta")).toHaveLength(2);
    expect(events.at(-1)).toMatchObject({ type: "done", status: "completed" });
    expect(mocks.finish).toHaveBeenCalledTimes(1);
    expect(mocks.finish.mock.calls[0][4]).toContain("Keep the window");
  });
  it.each([429, 500])(
    "normalizes provider %s and preserves lifecycle",
    async (status) => {
      const events = await run({
        async *stream() {
          throw { status };
          yield { type: "finish", reason: "stop" };
        },
      });
      expect(events.some((e) => e.type === "error")).toBe(true);
      expect(mocks.finish.mock.calls[0][5]).toBe("failed");
    }
  );
  it("preserves useful partial output when the provider stream breaks", async () => {
    await run({
      async *stream() {
        yield { type: "text", text: "Partial explanation" };
        throw new Error("network");
      },
    });
    expect(mocks.finish.mock.calls[0][4]).toBe("Partial explanation");
    expect(mocks.finish.mock.calls[0][5]).toBe("failed");
  });
  it("marks an aborted response interrupted without executing tools", async () => {
    const controller = new AbortController();
    controller.abort();
    await run(
      {
        async *stream() {
          yield { type: "text", text: "Should not run" };
        },
      },
      controller.signal
    );
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.finish.mock.calls[0][5]).toBe("interrupted");
  });
  it("returns a tool error to the model and continues without inventing data", async () => {
    let rounds = 0;
    mocks.execute.mockRejectedValue(new Error("malformed arguments"));
    const events = await run({
      async *stream() {
        if (rounds++ === 0) {
          yield {
            type: "tool",
            index: 0,
            id: "call1",
            name: "get_notes",
            arguments: "not JSON",
          };
          yield { type: "finish", reason: "tool_calls" };
        } else {
          yield { type: "text", text: "Notes are unavailable." };
          yield { type: "finish", reason: "stop" };
        }
      },
    });
    expect(events).toContainEqual({
      type: "tool_result",
      name: "get_notes",
      ok: false,
      summary: "Could not complete this tool request",
    });
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });
  it("never executes an unbounded number of tool rounds", async () => {
    mocks.execute.mockResolvedValue({ access: "read", result: { items: [] } });
    const events = await run({
      async *stream() {
        yield {
          type: "tool",
          index: 0,
          id: "call",
          name: "get_due_revisions",
          arguments: "{}",
        };
        yield { type: "finish", reason: "tool_calls" };
      },
    });
    expect(mocks.execute).toHaveBeenCalledTimes(2);
    expect(events.some((e) => e.type === "error")).toBe(true);
  });
});
