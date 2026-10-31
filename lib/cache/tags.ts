/**
 * Centralized Server Cache Tag Conventions
 * Maps cleanly to domain entities and users for targeted invalidation.
 */
export const CACHE_TAGS = {
  // Global catalog entities
  catalog: () => "catalog" as const,
  roadmap: () => "roadmap" as const,
  roadmapTopic: (topicId: string) => `roadmap:topic:${topicId}` as const,
  problems: () => "problems" as const,
  problemDetail: (problemId: string) => `problem:${problemId}` as const,

  // User-scoped entities
  userToday: (userId: string, date: string) => `user:${userId}:today:${date}` as const,
  userRevision: (userId: string) => `user:${userId}:revision` as const,
  userProgress: (userId: string) => `user:${userId}:progress` as const,
  userSettings: (userId: string) => `user:${userId}:settings` as const,
} as const;
