/**
 * PRIME Query Policies
 * Standardized caching, stale times, and refetch behaviors across query families.
 */
export const QUERY_POLICIES = {
  // Static / global catalog data (e.g. roadmap structures, problem catalog metadata)
  catalog: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    retry: 2,
  },
  // User preparation state (today's tasks, revision queue, problem attempts)
  userState: {
    staleTime: 1000 * 60 * 2, // 2 minutes: allows fast navigation without duplicate network requests
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  },
  // User progress summaries & metrics
  progress: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  },
  // Highly volatile / active session state
  volatile: {
    staleTime: 0, // Always consider stale for live operations
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    retry: 0,
  },
} as const;
