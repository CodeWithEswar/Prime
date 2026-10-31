/**
 * PRIME Next.js Server & Data Cache Policies
 * Intentional cache boundaries distinguishing static catalogs from volatile user state.
 */
export const CACHE_POLICY = {
  /**
   * Static & Global Content
   * Roadmaps, problem definitions, topic metadata.
   * Tolerates long revalidation lifetimes (e.g. 24 hours).
   */
  staticCatalog: {
    revalidate: 86400, // 24 hours in seconds
    tags: ["catalog"],
  },

  /**
   * Topic and Roadmap Structures
   * Revalidated on roadmap schema updates.
   */
  roadmap: {
    revalidate: 43200, // 12 hours in seconds
    tags: ["roadmap"],
  },

  /**
   * User Daily Preparation State
   * Short-lived and driven primarily by targeted invalidation.
   */
  userDailyPlan: {
    revalidate: 300, // 5 minutes in seconds
    tags: ["user-daily-plan"],
  },

  /**
   * User Revision Queue
   * Spaced repetition queue state.
   */
  userRevision: {
    revalidate: 600, // 10 minutes in seconds
    tags: ["user-revision"],
  },

  /**
   * Progress & Readiness Analytics
   * Periodic summary recalculation.
   */
  userProgress: {
    revalidate: 900, // 15 minutes in seconds
    tags: ["user-progress"],
  },

  /**
   * Highly Volatile State
   * Active timer, live problem solving session.
   * Persistent caching is disabled.
   */
  volatileSession: {
    revalidate: 0, // No cache
    tags: ["user-session"],
  },
} as const;
