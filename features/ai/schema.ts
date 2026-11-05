import { z } from "zod";
export const intentSchema = z.enum([
  "ask",
  "explain",
  "hint",
  "summarize",
  "correct",
  "improve",
  "quiz",
  "interview",
  "revision_notes",
]);
export type AIIntent = z.infer<typeof intentSchema>;
export const contextRefSchema = z
  .object({
    type: z.enum([
      "general",
      "problem",
      "practice",
      "roadmap",
      "revision",
      "today",
      "planner",
      "mastery",
      "notes",
      "progress",
      "lab",
      "readiness",
    ]),
    ref: z
      .string()
      .regex(/^[a-zA-Z0-9_-]{1,160}$/)
      .optional(),
    date: z.iso.date().optional(),
    lab: z
      .object({
        input: z.string().max(12000),
        step: z.number().int().min(0).max(1999),
        mode: z.enum(["watch", "step", "practice"]),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine(
    (value) => !value.lab || (value.type === "lab" && !!value.ref),
    "Attach a Lab snapshot to an algorithm reference."
  );
export type ContextRef = z.infer<typeof contextRefSchema>;
export const chatInputSchema = z
  .object({
    conversationId: z.uuid().optional(),
    requestId: z.uuid(),
    message: z.string().trim().max(6000).default(""),
    intent: intentSchema.default("ask"),
    context: contextRefSchema.default({ type: "general" }),
    mode: z.enum(["send", "retry", "edit"]).default("send"),
  })
  .strict()
  .refine((x) => x.mode === "retry" || x.message.length > 0, "Enter a message.")
  .refine((x) => x.mode === "send" || !!x.conversationId, "Choose a conversation.");
export type ChatInput = z.infer<typeof chatInputSchema>;
export const noteInputSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    body: z.string().trim().min(1).max(12000),
    problemSlug: z
      .string()
      .regex(/^[a-zA-Z0-9_-]{1,160}$/)
      .optional(),
  })
  .strict();
export const actionSchema = z
  .object({ id: z.uuid(), decision: z.enum(["confirm", "cancel"]) })
  .strict();
export const saveNoteSchema = z.object({ messageId: z.uuid() }).strict();
export const conversationPatchSchema = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(1).max(100).optional(),
    archived: z.boolean().optional(),
  })
  .strict();
export const feedbackSchema = z
  .object({ messageId: z.uuid(), rating: z.enum(["helpful", "not_helpful"]) })
  .strict();
