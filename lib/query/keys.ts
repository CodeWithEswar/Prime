import { normalizeCoordinate } from "@/lib/weather/coordinates";
/**
 * Centralized Query Key Factory
 * Produces predictable, serializable, hierarchical query keys for TanStack Query.
 */
export const queryKeys = {
  ai: {
    all: ["ai"] as const,
    conversations: (userId: string) => ["ai", userId, "conversations"] as const,
    messages: (userId: string, id: string) => ["ai", userId, "messages", id] as const,
    context: (userId: string, context: unknown) =>
      ["ai", userId, "context", context] as const,
  },
  weather: {
    all: ["weather"] as const,
    forecast: (lat: number | null, lon: number | null) =>
      [
        "weather",
        "forecast",
        lat === null ? null : normalizeCoordinate(lat),
        lon === null ? null : normalizeCoordinate(lon),
        "auto",
        "si-v1",
      ] as const,
    locations: (query: string) =>
      ["weather", "locations", query.trim().toLocaleLowerCase("en")] as const,
  },
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
  // Canonical Curricula & PRIME Core
  curriculum: {
    all: ["curriculum"] as const,
    detail: (slug: string) => ["curriculum", "detail", slug] as const,
    stages: (slug: string) => ["curriculum", "stages", slug] as const,
    items: (slug: string) => ["curriculum", "items", slug] as const,
    progress: (slug: string, userId?: string) =>
      userId
        ? (["curriculum", "progress", slug, userId] as const)
        : (["curriculum", "progress", slug] as const),
  },
  // DSA practice & problems catalog
  problems: {
    all: ["problems"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["problems", "list", filters ?? {}] as const,
    detail: (problemId: string, userId?: string) =>
      userId
        ? (["problems", "detail", problemId, userId] as const)
        : (["problems", "detail", problemId] as const),
    attempts: (problemId: string) => ["problems", "attempts", problemId] as const,
    summary: () => ["problems", "summary"] as const,
  },
  // Spaced repetition & revision queue
  revision: {
    all: ["revision"] as const,
    dashboard: () => ["revision", "dashboard"] as const,
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
  // Evidence-based Mastery Intelligence Engine
  mastery: {
    all: ["mastery"] as const,
    overview: (userId?: string) =>
      userId ? (["mastery", "overview", userId] as const) : (["mastery", "overview"] as const),
    problem: (problemId: string, userId?: string) =>
      userId ? (["mastery", "problem", problemId, userId] as const) : (["mastery", "problem", problemId] as const),
    topic: (topicId: string, userId?: string) =>
      userId ? (["mastery", "topic", topicId, userId] as const) : (["mastery", "topic", topicId] as const),
    stage: (stageId: string, userId?: string) =>
      userId ? (["mastery", "stage", stageId, userId] as const) : (["mastery", "stage", stageId] as const),
  },
  // Interview Readiness Engine
  readiness: {
    all: ["readiness"] as const,
    overview: (profileId: string, userId?: string) =>
      userId
        ? (["readiness", "overview", profileId, userId] as const)
        : (["readiness", "overview", profileId] as const),
    competency: (profileId: string, competencyId: string, userId?: string) =>
      userId
        ? (["readiness", "competency", profileId, competencyId, userId] as const)
        : (["readiness", "competency", profileId, competencyId] as const),
    gaps: (profileId: string, userId?: string) =>
      userId
        ? (["readiness", "gaps", profileId, userId] as const)
        : (["readiness", "gaps", profileId] as const),
  },
  // Active study / practice session
  session: {
    all: ["session"] as const,
    active: () => ["session", "active"] as const,
  },
  // Notifications & Reminders Engine
  notifications: {
    all: ["notifications"] as const,
    list: (filters?: { category?: string; unreadOnly?: boolean }) =>
      ["notifications", "list", filters ?? {}] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
    preferences: () => ["notifications", "preferences"] as const,
  },
  // User settings & target cadence
  settings: {
    all: ["settings"] as const,
    overview: () => ["settings", "overview"] as const,
    profile: () => ["settings", "profile"] as const,
    targets: () => ["settings", "targets"] as const,
    study: () => ["settings", "study"] as const,
    learning: () => ["settings", "learning"] as const,
    appearance: () => ["settings", "appearance"] as const,
    security: () => ["settings", "security"] as const,
    user: (userId?: string) => ["settings", userId ?? "me"] as const,
  },
  // User profile identity
  profile: {
    all: ["profile"] as const,
    user: (userId?: string) => ["profile", userId ?? "me"] as const,
  },
} as const;
