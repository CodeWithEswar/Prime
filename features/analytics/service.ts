import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays } from "@/domain/planning/capacity";
import { getMasteryOverviewData } from "@/features/mastery/server/service";
import type { Database } from "@/lib/supabase/database.types";
import { cleanProblemTitle } from "@/lib/utils";
import {
  analyticsPeriods,
  dayFormatter,
  projectPeriod,
  type AnalyticsFilters,
} from "./metrics";

const pageSize = 500;
const maxPages = 20;

async function readRows<T>(
  load: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[] | null> {
  const rows: T[] = [];
  for (let page = 0; page < maxPages; page++) {
    const from = page * pageSize;
    const result = await load(from, from + pageSize - 1);
    if (result.error || !result.data) return null;
    rows.push(...result.data);
    if (result.data.length < pageSize) return rows;
  }
  return null;
}

export async function getAnalytics(
  client: SupabaseClient<Database>,
  userId: string,
  filters: AnalyticsFilters,
  now = new Date()
) {
  const [settings, plan] = await Promise.all([
    client.from("user_settings").select("timezone").eq("user_id", userId).maybeSingle(),
    client
      .from("preparation_plans")
      .select("target_date,target_role,feasibility_status,timezone")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .order("id")
      .limit(1)
      .maybeSingle(),
  ]);
  if (settings.error) throw new Error("Analytics timezone unavailable.");
  const timezone = settings.data?.timezone || plan.data?.timezone || "UTC";
  const localDay = dayFormatter(timezone);
  const today = localDay(now);
  const periods = analyticsPeriods(today, filters.days, !filters.compare);
  const first = (filters.compare ? periods.previous : periods.current)[0];
  const last = periods.current.at(-1)!;
  const lower = `${addDays(first, -1)}T00:00:00.000Z`;
  const upper = now.toISOString();
  const showMastery = ["overview", "dsa", "skills"].includes(filters.view);
  const [
    attempts,
    sessions,
    plans,
    commitments,
    completions,
    reviews,
    mastery,
    topics,
    due,
    overdue,
  ] = await Promise.all([
    readRows((from, to) =>
      client
        .from("problem_attempts")
        .select(
          "id,problem_id,outcome,time_taken_seconds,attempted_at,problem:problems(title,slug,difficulty,topic:roadmap_topics!primary_topic_id(slug))"
        )
        .eq("user_id", userId)
        .gte("attempted_at", lower)
        .lt("attempted_at", upper)
        .order("attempted_at")
        .order("id")
        .range(from, to)
    ),
    readRows((from, to) =>
      client
        .from("study_sessions")
        .select("id,started_at,ended_at,duration_seconds,task:daily_tasks(task_type)")
        .eq("user_id", userId)
        .gte("started_at", lower)
        .lt("started_at", upper)
        .not("ended_at", "is", null)
        .gt("duration_seconds", 0)
        .order("started_at")
        .order("id")
        .range(from, to)
    ),
    client
      .from("daily_plans")
      .select("plan_date,available_minutes,is_rest_day")
      .eq("user_id", userId)
      .gte("plan_date", first)
      .lte("plan_date", last),
    readRows((from, to) =>
      client
        .from("daily_tasks")
        .select(
          "id,status,planned_minutes,created_at,carry_count,carried_from_task_id,plan:daily_plans!inner(plan_date)"
        )
        .eq("user_id", userId)
        .gte("plan.plan_date", first)
        .lte("plan.plan_date", last)
        .order("id")
        .range(from, to)
    ),
    readRows((from, to) =>
      client
        .from("daily_tasks")
        .select("id,completed_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .gte("completed_at", lower)
        .lt("completed_at", upper)
        .order("completed_at")
        .order("id")
        .range(from, to)
    ),
    readRows((from, to) =>
      client
        .from("revision_attempts")
        .select("id,reviewed_at,rating")
        .eq("user_id", userId)
        .gte("reviewed_at", lower)
        .lt("reviewed_at", upper)
        .order("reviewed_at")
        .order("id")
        .range(from, to)
    ),
    showMastery ? getMasteryOverviewData(client, userId, now).catch(() => null) : null,
    filters.view === "dsa"
      ? client.from("roadmap_topics").select("slug,name").order("name")
      : null,
    filters.view === "skills"
      ? client
          .from("revision_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("entity_type", "problem")
          .eq("status", "active")
          .lte("next_review_at", now.toISOString())
          .or(`snoozed_until.is.null,snoozed_until.lte.${now.toISOString()}`)
      : null,
    filters.view === "skills"
      ? client
          .from("revision_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("entity_type", "problem")
          .eq("status", "active")
          .lt("next_review_at", lowerOverdue(today, localDay))
          .or(`snoozed_until.is.null,snoozed_until.lte.${now.toISOString()}`)
      : null,
  ]);
  const workNames: Record<string, string> = {
    dsa_problem: "DSA practice",
    revision: "Revision",
    custom: "Custom work",
  };
  const sources = {
    attempts:
      attempts?.map((row) => ({
        problemId: row.problem_id,
        title: cleanProblemTitle(row.problem?.title ?? "Unavailable problem"),
        slug: row.problem?.slug ?? "",
        topic: row.problem?.topic?.slug ?? "",
        coreTopic: mastery?.coreProblemMetadata[row.problem_id]?.topicId,
        difficulty: row.problem?.difficulty.toUpperCase() ?? "",
        outcome: row.outcome,
        seconds: row.time_taken_seconds,
        at: row.attempted_at,
      })) ?? null,
    sessions:
      sessions?.map((row) => ({
        at: row.started_at,
        endedAt: row.ended_at,
        seconds: row.duration_seconds,
        work: workNames[row.task?.task_type ?? ""] ?? "Unclassified",
      })) ?? null,
    plans:
      plans.data?.map((row) => ({
        date: row.plan_date,
        available: row.available_minutes,
        rest: row.is_rest_day,
      })) ?? null,
    commitments:
      commitments?.flatMap((row) =>
        row.plan
          ? [
              {
                date: row.plan.plan_date,
                status: row.status,
                minutes: row.planned_minutes,
                createdAt: row.created_at,
                carried: row.carry_count > 0 || Boolean(row.carried_from_task_id),
              },
            ]
          : []
      ) ?? null,
    completions:
      completions?.flatMap(({ completed_at }) => (completed_at ? [completed_at] : [])) ??
      null,
    reviews: reviews?.map((row) => ({ at: row.reviewed_at, rating: row.rating })) ?? null,
  };
  const stages =
    mastery?.stages.map((stage) => ({
      id: stage.stageSlug,
      name: stage.stageName,
      level: stage.level,
      total: stage.totalRequired,
      topics: stage.topics.map((topic) => ({
        id: topic.topicId,
        slug: topic.topicSlug,
        name: topic.topicName,
        level: topic.level,
        score: topic.score,
        coverage: topic.evidenceCoverage,
        blockers: topic.blockers,
        withRetentionEvidence: topic.problemMasteries.filter(
          (item) => item.requirements.successfulRevisionCount > 0
        ).length,
      })),
    })) ?? null;
  return {
    timezone,
    today,
    current: projectPeriod(periods.current, sources, localDay, filters),
    previous: filters.compare
      ? projectPeriod(periods.previous, sources, localDay, filters)
      : null,
    target: plan.data,
    stages,
    masteryCounts: mastery?.counts ?? null,
    topics: topics?.data ?? [],
    due: due?.count ?? null,
    overdue: overdue?.count ?? null,
    unavailable: Object.entries(sources).flatMap(([name, rows]) =>
      rows === null ? [name] : []
    ),
  };
}

function lowerOverdue(today: string, day: ReturnType<typeof dayFormatter>) {
  let start = Date.parse(`${addDays(today, -1)}T00:00:00.000Z`);
  let end = Date.parse(`${addDays(today, 1)}T00:00:00.000Z`);
  while (end - start > 1) {
    const middle = Math.floor((start + end) / 2);
    if (day(new Date(middle)) < today) start = middle;
    else end = middle;
  }
  return new Date(end).toISOString();
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;
