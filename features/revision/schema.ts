import { z } from "zod";

export const revisionEntityTypeEnum = z.enum(["problem", "topic"]);
export type RevisionEntityType = z.infer<typeof revisionEntityTypeEnum>;

export const revisionStatusEnum = z.enum(["active", "paused", "mastered"]);
export type RevisionStatus = z.infer<typeof revisionStatusEnum>;

export const revisionRatingEnum = z.enum(["forgot", "hard", "okay", "easy"]);
export type RevisionRating = z.infer<typeof revisionRatingEnum>;

export const revisionItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  entity_type: revisionEntityTypeEnum,
  entity_id: z.string().uuid(),
  interval_days: z.number().int().nonnegative().default(1),
  next_review_at: z.string(),
  last_reviewed_at: z.string().nullable().optional(),
  bookmarked: z.boolean().default(false),
  snooze_count: z.number().int().nonnegative().default(0),
  snoozed_until: z.string().nullable().optional(),
  status: revisionStatusEnum.default("active"),
  created_at: z.string(),
  updated_at: z.string(),
});
export type RevisionItem = z.infer<typeof revisionItemSchema>;

export const revisionAttemptSchema = z.object({
  id: z.string().uuid(),
  revision_item_id: z.string().uuid(),
  user_id: z.string().uuid(),
  rating: revisionRatingEnum,
  previous_interval_days: z.number().int().nonnegative().default(0),
  next_interval_days: z.number().int().nonnegative().default(1),
  time_spent_minutes: z.number().int().nonnegative().default(0),
  confidence: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().nullable().optional(),
  reviewed_at: z.string(),
  created_at: z.string(),
});
export type RevisionAttempt = z.infer<typeof revisionAttemptSchema>;

export const recordRevisionFormSchema = z.object({
  problemId: z.string().uuid("Invalid problem ID"),
  rating: revisionRatingEnum,
  timeSpentMinutes: z.number().int().min(0).max(300).default(5),
  confidence: z.number().int().min(1).max(5).default(3),
  notes: z.string().max(2000).optional().nullable(),
});
export type RecordRevisionFormData = z.infer<typeof recordRevisionFormSchema>;

export const snoozeRevisionFormSchema = z.object({
  problemId: z.string().uuid("Invalid problem ID"),
  snoozeUntil: z.string(),
});
export type SnoozeRevisionFormData = z.infer<typeof snoozeRevisionFormSchema>;
