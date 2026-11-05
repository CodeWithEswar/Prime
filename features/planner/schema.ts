import { z } from "zod";
import {
  fundamentalsCourses,
  type FundamentalsCourse,
} from "@/domain/fundamentals/courses";

export const sources = [
  "custom",
  "core",
  "topic",
  "problem",
  "company",
  "revision",
  "lab",
] as const;
export const domains = [
  "DSA",
  "Fundamentals",
  "SQL",
  "Aptitude",
  "System design",
  "Other",
] as const;
const minutes = z.number().int().min(5).max(480);
export const workRequest = z
  .object({
    source: z.enum(sources),
    domain: z.enum(domains),
    title: z.string().trim().max(160),
    selection: z
      .string()
      .trim()
      .max(160)
      .regex(/^[\w,-]*$/),
    count: z.number().int().min(1).max(12),
    minutes: minutes.optional(),
    priority: z.enum(["P1", "P2", "OPTIONAL"]),
    when: z.enum(["auto", "week", "date"]),
    date: z.iso.date().optional(),
    locked: z.boolean(),
    allowOverload: z.boolean(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.source === "custom" && !value.title)
      ctx.addIssue({ code: "custom", message: "Enter a task title." });
    if (!["custom", "core"].includes(value.source) && !value.selection)
      ctx.addIssue({ code: "custom", message: "Choose work to plan." });
    if (value.when === "date" && !value.date)
      ctx.addIssue({ code: "custom", message: "Choose a date." });
    if (value.locked && value.when !== "date")
      ctx.addIssue({ code: "custom", message: "Choose a fixed date before locking it." });
  });
export type WorkRequest = z.infer<typeof workRequest>;
export const plannerCommand = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("course"),
    course: z.enum(Object.keys(fundamentalsCourses) as FundamentalsCourse[]),
    start: z.iso.date().optional(),
    minutes: minutes.default(45),
  }),
  z.object({
    kind: z.literal("work"),
    request: workRequest,
    backlogId: z.uuid().optional(),
  }),
  z.object({
    kind: z.literal("automatic"),
    target: z.iso.date().optional(),
    horizon: z.enum(["week", "target"]).default("week"),
    optional: z.boolean().default(false),
  }),
  z.object({ kind: z.literal("rebalance") }),
  z.object({ kind: z.literal("buffer"), percent: z.number().int().min(5).max(40) }),
  z.object({
    kind: z.literal("rule"),
    weekday: z.number().int().min(0).max(6),
    minutes: z.number().int().min(0).max(720),
    rest: z.boolean(),
  }),
  z.object({
    kind: z.literal("exception"),
    date: z.iso.date(),
    minutes: z.number().int().min(0).max(720),
    label: z.string().trim().max(100),
    remove: z.boolean(),
  }),
  z.object({
    kind: z.literal("move"),
    id: z.uuid(),
    date: z.iso.date(),
    allowOverload: z.boolean(),
  }),
]);
export type PlannerCommand = z.infer<typeof plannerCommand>;
