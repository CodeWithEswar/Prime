// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { loadLabAIContext } from "@/features/algorithm-lab/ai/context";
import { contextRefSchema } from "@/features/ai/schema";
import { binarySearch } from "@/features/algorithm-lab/algorithms/arrays";
import { pageContext } from "@/features/ai/page-context";
describe("Lab AI context boundary", () => {
  it("regenerates canonical state rather than accepting client state or explanations", async () => {
    const input = { kind: "search", values: [1, 3, 5, 7], target: 5 },
      reference = contextRefSchema.parse({
        type: "lab",
        ref: "binary-search",
        lab: { input: JSON.stringify(input), step: 2, mode: "practice" },
      });
    const context = await loadLabAIContext(reference),
      step = binarySearch.generateTrace(input).steps[2];
    expect(context.facts.state).toEqual(step.scene);
    expect(context.facts.variables).toEqual(step.variables);
    expect(context.facts.operation).toBe(step.operation);
    expect(context.subtitle).toContain("step 3");
    expect(JSON.stringify(context.facts)).not.toContain('"correct":');
    expect(
      contextRefSchema.safeParse({
        ...reference,
        lab: { ...reference.lab, state: { result: "mastered" } },
      }).success
    ).toBe(false);
    expect(contextRefSchema.safeParse({ ...reference, type: "problem" }).success).toBe(
      false
    );
    expect(
      contextRefSchema.safeParse({ ...reference, lab: { ...reference.lab, step: 2000 } })
        .success
    ).toBe(false);
  });
  it("rejects invalid algorithms, JSON, oversized input and nonexistent steps", async () => {
    await expect(
      loadLabAIContext({ type: "lab", ref: "not-a-real-module" })
    ).rejects.toMatchObject({ status: 404 });
    for (const lab of [
      { input: "process.exit()", step: 0, mode: "step" as const },
      {
        input: JSON.stringify({ kind: "search", values: Array(33).fill(0), target: 0 }),
        step: 0,
        mode: "step" as const,
      },
      {
        input: JSON.stringify(binarySearch.defaultInput),
        step: 999,
        mode: "step" as const,
      },
    ])
      await expect(
        loadLabAIContext({ type: "lab", ref: "binary-search", lab })
      ).rejects.toMatchObject({ status: 400 });
  });
  it("supports catalog/default context without requiring persisted execution", async () => {
    expect((await loadLabAIContext({ type: "lab" })).label).toBe("Algorithm Lab");
    expect(
      (await loadLabAIContext({ type: "lab", ref: "binary-search" })).facts.currentStep
    ).toBe(1);
    expect(pageContext("/lab/bfs")).toEqual({ type: "lab", ref: "bfs" });
  });
});
