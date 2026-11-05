import { z } from "zod";
import type {
  ProblemDifficulty,
  AttemptOutcome,
  UserProblemStatus,
  CompanyWindow,
  PracticeSort,
} from "./types";

export const problemDifficultyEnum = z.enum(["easy", "medium", "hard"]);

export const attemptOutcomeEnum = z.enum([
  "independent",
  "hint",
  "solution_viewed",
  "unsolved",
]);

export const userProblemStatusEnum = z.enum([
  "not_started",
  "attempted",
  "solved",
  "needs_revision",
  "mastered",
]);

export const companyWindowEnum = z.enum([
  "thirty_days",
  "three_months",
  "six_months",
  "more_than_six_months",
  "all_time",
]);

export const practiceSortEnum = z.enum([
  "recommended",
  "difficulty_asc",
  "difficulty_desc",
  "title_asc",
  "frequency_desc",
]);

/**
 * Validates recording an attempt from the user interface
 */
export const recordAttemptFormSchema = z.object({
  problemId: z.string().uuid("Invalid problem ID"),
  outcome: attemptOutcomeEnum,
  durationMinutes: z
    .coerce
    .number()
    .int("Minutes must be a whole number")
    .min(1, "Enter at least 1 minute")
    .max(600, "Maximum duration is 600 minutes")
    .default(30),
  confidence: z
    .coerce
    .number()
    .int("Confidence must be a whole number")
    .min(1, "Minimum confidence is 1")
    .max(5, "Maximum confidence is 5")
    .default(3),
  notes: z
    .string()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : null)),
});
export type RecordAttemptFormInput = z.input<typeof recordAttemptFormSchema>;
export type RecordAttemptFormData = z.infer<typeof recordAttemptFormSchema>;

/**
 * Safe parser for URL filter state with defaults
 */
export const practiceFilterSchema = z.object({
  q: z.string().default(""),
  topic: z.string().default(""),
  difficulty: z.enum(["", "easy", "medium", "hard"]).default(""),
  status: z
    .enum(["", "not_started", "attempted", "solved", "needs_revision", "mastered"])
    .default(""),
  collection: z.string().default(""),
  company: z.string().default(""),
  window: z
    .enum(["", "thirty_days", "three_months", "six_months", "more_than_six_months", "all_time"])
    .default(""),
  revision: z.enum(["", "due", "overdue"]).default(""),
  sort: practiceSortEnum.default("recommended"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(25),
});
export type PracticeFilterState = z.infer<typeof practiceFilterSchema>;

export const problemSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  difficulty: problemDifficultyEnum,
  source: z.string().default("leetcode"),
  external_url: z.string().url().nullable().optional(),
  acceptance_rate: z.number().min(0).max(100).nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Problem = z.infer<typeof problemSchema>;

export const problemAttemptSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  problem_id: z.string().uuid(),
  outcome: attemptOutcomeEnum,
  time_taken_seconds: z.number().int().nonnegative().default(0),
  confidence: z.number().int().min(1).max(5),
  notes: z.string().nullable().optional(),
  attempted_at: z.string(),
  created_at: z.string(),
});
export type ProblemAttempt = z.infer<typeof problemAttemptSchema>;

export const userProblemProgressSchema = z.object({
  user_id: z.string().uuid(),
  problem_id: z.string().uuid(),
  status: userProblemStatusEnum,
  mastery_score: z.number().min(0).max(1),
  last_attempt_at: z.string().nullable().optional(),
  next_revision_at: z.string().nullable().optional(),
  updated_at: z.string(),
});
export type UserProblemProgress = z.infer<typeof userProblemProgressSchema>;
