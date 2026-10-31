import { z } from "zod";

/**
 * Common Zod Schemas across PRIME application boundaries.
 */

export const uuidSchema = z.string().uuid("Invalid UUID identifier");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must follow YYYY-MM-DD format");

export const paginationParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const searchFilterSchema = z.object({
  query: z.string().trim().max(100).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  topic: z.string().trim().optional(),
});
