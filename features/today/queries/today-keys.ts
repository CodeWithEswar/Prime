/**
 * TanStack Query Key Factory for Today's Execution Command Center
 */

export const todayKeys = {
  all: ["today"] as const,
  snapshot: (date?: string) => ["today", "snapshot", date ?? "current"] as const,
  tasks: (date?: string) => ["today", "tasks", date ?? "current"] as const,
  nextAction: (date?: string) => ["today", "next-action", date ?? "current"] as const,
  activeSession: () => ["today", "active-session"] as const,
};

