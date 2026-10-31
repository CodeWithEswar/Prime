/**
 * Centralized Query Key Factory
 * Produces predictable, serializable, hierarchical query keys for TanStack Query.
 */
export const queryKeys = {
  // Today preparation plan
  today: {
    all: ["today"] as const,
    byDate: (date: string) => ["today", "date", date] as const,
  },
  // Structured interview roadmaps
  roadmap: {
    all: ["roadmap"] as const,
    list: () => ["roadmap", "list"] as const,
    topic: (topicId: string) => ["roadmap", "topic", topicId] as const,
    item: (itemId: string) => ["roadmap", "item", itemId] as const,
  },
  // DSA practice & problems catalog
  problems: {
    all: ["problems"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["problems", "list", filters ?? {}] as const,
    detail: (problemId: string) => ["problems", "detail", problemId] as const,
    attempts: (problemId: string) => ["problems", "attempts", problemId] as const,
  },
  // Spaced repetition & revision queue
  revision: {
    all: ["revision"] as const,
    due: (date: string) => ["revision", "due", date] as const,
    item: (itemId: string) => ["revision", "item", itemId] as const,
  },
  // Preparation progress & analytics
  progress: {
    all: ["progress"] as const,
    summary: () => ["progress", "summary"] as const,
    range: (startDate: string, endDate: string) =>
      ["progress", "range", { startDate, endDate }] as const,
  },
  // Active study / practice session
  session: {
    all: ["session"] as const,
    active: () => ["session", "active"] as const,
  },
} as const;
