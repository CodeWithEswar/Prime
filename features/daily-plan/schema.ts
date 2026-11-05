import { z } from "zod";

export const planStatusEnum = z.enum(["planned", "in_progress", "completed", "skipped"]);
export type PlanStatus = z.infer<typeof planStatusEnum>;

export const taskTypeEnum = z.enum(["learn", "practice", "revise", "mock"]);
export type TaskType = z.infer<typeof taskTypeEnum>;

export const taskStatusEnum = z.enum([
  "pending",
  "in_progress",
  "completed",
  "skipped",
  "rescheduled",
]);
export type TaskStatus = z.infer<typeof taskStatusEnum>;

export const taskSourceEnum = z.enum(["planner", "user", "revision_queue"]);
export type TaskSource = z.infer<typeof taskSourceEnum>;

export const dailyPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  plan_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  day_number: z.number().int().positive(),
  status: planStatusEnum.default("in_progress"),
  planned_minutes: z.number().int().nonnegative().default(0),
  completed_minutes: z.number().int().nonnegative().default(0),
  created_at: z.string(),
  updated_at: z.string(),
});
export type DailyPlan = z.infer<typeof dailyPlanSchema>;

export const dailyTaskSchema = z.object({
  id: z.string().uuid(),
  daily_plan_id: z.string().uuid(),
  user_id: z.string().uuid(),
  task_type: taskTypeEnum,
  topic_id: z.string().uuid().nullable().optional(),
  problem_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1),
  planned_minutes: z.number().int().nonnegative().default(30),
  completed_minutes: z.number().int().nonnegative().default(0),
  sort_order: z.number().int().default(0),
  status: taskStatusEnum.default("pending"),
  source: taskSourceEnum.default("planner"),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable().optional(),
});
export type DailyTask = z.infer<typeof dailyTaskSchema>;

