import { z } from "zod";
const value = z.number().int().min(-999).max(999);
const values = z
  .array(value)
  .min(1, "Enter at least one value.")
  .max(32, "Use at most 32 values.");
export const searchInput = z
  .object({ kind: z.literal("search"), values, target: value })
  .strict();
export const sortInput = z.object({ kind: z.literal("sort"), values }).strict();
export const windowInput = z
  .object({ kind: z.literal("window"), values, size: z.number().int().min(1).max(32) })
  .strict()
  .refine(
    (x) => x.size <= x.values.length,
    "Window size must not exceed the array length."
  );
export const operationInput = z
  .object({
    kind: z.literal("operations"),
    operations: z
      .array(
        z
          .object({
            type: z.enum([
              "push",
              "pop",
              "peek",
              "enqueue",
              "dequeue",
              "front",
              "insert",
              "delete",
              "search",
              "traverse",
            ]),
            value: value.optional(),
            index: z.number().int().min(0).max(31).optional(),
          })
          .strict()
      )
      .min(1)
      .max(32, "Use at most 32 operations."),
  })
  .strict();
export const treeInput = z
  .object({
    kind: z.literal("tree"),
    values: z.array(value.nullable()).min(1).max(31, "Use at most 31 level-order slots."),
    order: z.enum(["preorder", "inorder", "postorder"]).default("preorder"),
  })
  .strict()
  .superRefine((x, ctx) => {
    if (x.values[0] === null)
      ctx.addIssue({ code: "custom", message: "The root must contain a value." });
    if (x.values.filter((v) => v !== null).length > 15)
      ctx.addIssue({ code: "custom", message: "Use at most 15 tree nodes." });
    x.values.forEach((v, i) => {
      if (v !== null && i > 0 && x.values[Math.floor((i - 1) / 2)] == null)
        ctx.addIssue({
          code: "custom",
          message: `Slot ${i} has no parent. Use null only for absent subtrees.`,
        });
    });
  });
export const graphInput = z
  .object({
    kind: z.literal("graph"),
    nodeCount: z.number().int().min(1).max(12),
    edges: z
      .array(z.tuple([z.number().int().min(0).max(11), z.number().int().min(0).max(11)]))
      .max(28),
    directed: z.boolean(),
    source: z.number().int().min(0).max(11),
    weights: z.array(value).max(28).optional(),
  })
  .strict()
  .superRefine((x, ctx) => {
    if (x.weights && x.weights.length !== x.edges.length)
      ctx.addIssue({
        code: "custom",
        message: "Provide exactly one weight per edge, or omit weights.",
      });
    if (x.source >= x.nodeCount || x.edges.some((e) => e.some((v) => v >= x.nodeCount)))
      ctx.addIssue({
        code: "custom",
        message: "Every edge endpoint and source must be an existing node.",
      });
    const keys = x.edges.map(([a, b]) =>
      x.directed ? `${a}:${b}` : [a, b].sort((a, b) => a - b).join(":")
    );
    if (new Set(keys).size !== keys.length)
      ctx.addIssue({ code: "custom", message: "Remove duplicate edges." });
  });
export const labInputSchema = z.union([
  searchInput,
  sortInput,
  windowInput,
  operationInput,
  treeInput,
  graphInput,
]);
export type LabInput = z.infer<typeof labInputSchema>;
export function sorted(input: z.infer<typeof searchInput>) {
  if (input.values.some((v, i) => i > 0 && v < input.values[i - 1]))
    throw new Error(
      "This algorithm needs values in nondecreasing order. Use Sort values explicitly or edit the input."
    );
  return input;
}
export function parseInputJSON(text: string): unknown {
  if (text.length > 12000) throw new Error("Input is too large. Use a smaller example.");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Enter valid JSON. Use the example as a starting point.");
  }
}
export function inputError(error: unknown): string {
  if (error instanceof z.ZodError)
    return error.issues
      .slice(0, 3)
      .map((x) => `${x.path.join(".") || "Input"}: ${x.message}`)
      .join(" ");
  return error instanceof Error ? error.message : "This input could not be visualized.";
}
/** Reproducible numerical presets. Never used by execution playback. */
export function seededValues(seed: number, count = 9): number[] {
  let state = seed >>> 0;
  return Array.from({ length: count }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state % 41) - 10;
  });
}
