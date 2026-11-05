import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateProblemMastery, masteryDifficulty } from "@/domain/mastery";
import type { Database } from "@/lib/supabase/database.types";
import type {
  CompanyWindow,
  ProblemDetail,
  ProblemAttemptRecord,
  ProblemCompanyContext,
  ProblemReviewRecord,
  ProblemDifficulty,
  UserProblemStatus,
} from "../types";
import { attemptOutcomeEnum } from "../schema";
import { revisionRatingEnum } from "@/features/revision/schema";

export const ATTEMPT_PAGE_SIZE = 40;
const attemptColumns = "id,outcome,time_taken_seconds,confidence,notes,attempted_at";
export async function getProblemAttempts(
  client: SupabaseClient<Database>,
  problemId: string,
  userId: string,
  offset = 0
) {
  const result = await client
    .from("problem_attempts")
    .select(attemptColumns, { count: "exact" })
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .order("attempted_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + ATTEMPT_PAGE_SIZE - 1);
  if (result.error) throw new Error("Attempt history is temporarily unavailable.");
  const attempts: ProblemAttemptRecord[] = (result.data ?? []).flatMap((row) => {
    const outcome = attemptOutcomeEnum.safeParse(row.outcome);
    return outcome.success
      ? [
          {
            id: row.id,
            outcome: outcome.data,
            timeTakenSeconds: row.time_taken_seconds,
            confidence: row.confidence,
            notes: row.notes,
            attemptedAt: row.attempted_at,
          },
        ]
      : [];
  });
  return { attempts, total: result.count ?? attempts.length };
}

/** One canonical lookup followed by bounded parallel reads, all personal reads explicitly user-scoped. */
export async function getProblemDetail(
  client: SupabaseClient<Database>,
  slug: string,
  userId?: string
): Promise<ProblemDetail | null> {
  const { data: problem, error } = await client
    .from("problems")
    .select(
      "id,slug,title,difficulty,source,external_url,acceptance_rate,prime_priority,leetcode_slug,estimated_minutes,primary_topic:roadmap_topics!primary_topic_id(id,slug,name)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error("This problem could not be loaded. Please try again.");
  if (!problem) return null;
  const [topics, collections, companies, progress, history, revision] = await Promise.all(
    [
      client
        .from("problem_topics")
        .select("topic:roadmap_topics(id,slug,name)")
        .eq("problem_id", problem.id),
      client
        .from("problem_collection_items")
        .select("position,section,collection:problem_collections(id,slug,name)")
        .eq("problem_id", problem.id),
      client
        .from("company_problem_stats")
        .select(
          "time_window,frequency,company:companies(id,slug,name),source:content_sources(name)"
        )
        .eq("problem_id", problem.id)
        .eq("is_active", true)
        .order("frequency", { ascending: false, nullsFirst: false })
        .limit(1000),
      userId
        ? client
            .from("user_problem_progress")
            .select("status,mastery_score,last_attempt_at,next_revision_at")
            .eq("user_id", userId)
            .eq("problem_id", problem.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      userId
        ? getProblemAttempts(client, problem.id, userId)
            .then((data) => ({ data, error: null }))
            .catch(() => ({ data: null, error: true }))
        : Promise.resolve({ data: null, error: null }),
      userId
        ? client
            .from("revision_items")
            .select(
              "id,interval_days,next_review_at,last_reviewed_at,status,reviews:revision_attempts(id,rating,reviewed_at,previous_interval_days,next_interval_days)"
            )
            .eq("user_id", userId)
            .eq("entity_type", "problem")
            .eq("entity_id", problem.id)
            .eq("reviews.user_id", userId)
            .order("reviewed_at", { referencedTable: "reviews", ascending: false })
            .limit(40, { referencedTable: "reviews" })
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]
  );
  const unavailable = [
    topics.error && "topics",
    collections.error && "collections",
    companies.error && "companies",
    progress.error && "progress",
    history.error && "attempts",
    revision.error && "revision",
  ].filter((x): x is string => typeof x === "string");
  const allTopics = (topics.data ?? []).flatMap((r) => (r.topic ? [r.topic] : []));
  if (problem.primary_topic && !allTopics.some((t) => t.id === problem.primary_topic!.id))
    allTopics.unshift(problem.primary_topic);
  const grouped = new Map<string, ProblemCompanyContext>();
  const windows: CompanyWindow[] = [
    "thirty_days",
    "three_months",
    "six_months",
    "more_than_six_months",
    "all_time",
  ];
  for (const row of companies.data ?? []) {
    if (!row.company || !windows.includes(row.time_window as CompanyWindow)) continue;
    const company = grouped.get(row.company.slug) ?? {
      slug: row.company.slug,
      name: row.company.name,
      windows: [],
    };
    company.windows.push({
      window: row.time_window as CompanyWindow,
      frequency: row.frequency === null ? null : Number(row.frequency),
      sourceName: row.source?.name ?? null,
    });
    grouped.set(company.slug, company);
  }
  const state = revision.data;
  const nextReview = state?.status === "active" ? state.next_review_at : null;
  const now = Date.now(),
    reviewTime = nextReview ? Date.parse(nextReview) : Infinity;
  const reviewHistory: ProblemReviewRecord[] = (state?.reviews ?? []).flatMap((row) => {
    const rating = revisionRatingEnum.safeParse(row.rating);
    return rating.success
      ? [
          {
            id: row.id,
            rating: rating.data,
            reviewedAt: row.reviewed_at,
            previousIntervalDays: row.previous_interval_days,
            nextIntervalDays: row.next_interval_days,
          },
        ]
      : [];
  });
  const statuses: UserProblemStatus[] = [
    "not_started",
    "attempted",
    "solved",
    "needs_revision",
    "mastered",
  ];
  const status = progress.data?.status as UserProblemStatus | undefined;
  const mastery = userId && !history.error && !revision.error ? calculateProblemMastery({
    problemId: problem.id,
    difficulty: masteryDifficulty(problem.difficulty),
    targetTimeMinutes: problem.estimated_minutes,
    attempts: history.data?.attempts ?? [],
    revisions: reviewHistory,
  }) : undefined;
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty as ProblemDifficulty,
    externalUrl: problem.external_url,
    acceptanceRate:
      problem.acceptance_rate === null ? null : Number(problem.acceptance_rate),
    primePriority: problem.prime_priority,
    leetcodeSlug: problem.leetcode_slug,
    estimatedMinutes: problem.estimated_minutes,
    primaryTopic: problem.primary_topic,
    allTopics,
    collections: (collections.data ?? []).flatMap((r) =>
      r.collection ? [{ ...r.collection, position: r.position, section: r.section }] : []
    ),
    collectionCount: collections.data?.length ?? 0,
    companies: [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name)),
    companyRelevance: null,
    status: status === "mastered" ? "solved" : status && statuses.includes(status) ? status : "not_started",
    masteryScore: (mastery?.score ?? 0) / 100,
    masteryLevel: mastery?.level,
    mastery,
    lastAttemptAt: progress.data?.last_attempt_at ?? null,
    nextRevisionAt: nextReview,
    isRevisionDue: reviewTime <= now,
    isRevisionOverdue: now - reviewTime > 86400000,
    attemptHistory: history.data?.attempts ?? [],
    attemptCount: history.data?.total ?? 0,
    revision: state
      ? {
          id: state.id,
          intervalDays: state.interval_days,
          nextReviewAt: state.next_review_at,
          lastReviewedAt: state.last_reviewed_at,
          status: state.status,
        }
      : null,
    reviewHistory,
    unavailable,
  };
}
