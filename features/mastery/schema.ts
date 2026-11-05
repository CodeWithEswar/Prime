import { z } from "zod";

export const masteryLevelEnum = z.enum([
  "unseen",
  "exposed",
  "learning",
  "practiced",
  "proficient",
  "mastered",
]);

export const masteryFreshnessEnum = z.enum(["fresh", "aging", "stale"]);

export const masteryFilterEnum = z.enum([
  "all",
  "learning",
  "practiced",
  "proficient",
  "mastered",
  "needs_evidence",
]);

export const masterySortEnum = z.enum([
  "curriculum",
  "lowest_evidence",
  "highest_evidence",
  "recent",
]);

export const masteryViewQuerySchema = z.object({
  filter: masteryFilterEnum.default("all"),
  sort: masterySortEnum.default("curriculum"),
  topic: z.string().optional(),
});

export const recalculateMasteryInputSchema = z.object({
  problemId: z.string().uuid("Invalid problem ID"),
});

export type MasteryViewQueryParams = z.infer<typeof masteryViewQuerySchema>;
export type RecalculateMasteryInput = z.infer<typeof recalculateMasteryInputSchema>;

