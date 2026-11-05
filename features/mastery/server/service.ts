import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  calculateProblemMastery,
  calculateTopicMastery,
  calculateStageMastery,
  calculateOverallMastery,
  MASTERY_POLICY_V1,
  masteryDifficulty,
  type ProblemMasteryResult,
  type AttemptRecord,
  type RevisionRecord,
} from "@/domain/mastery";
import type { CurriculumItem, CurriculumStage } from "@/domain/curriculum/types";
import type { CoreProblemMetadata, MasteryOverviewData } from "../types";

type Client = SupabaseClient<Database>;
export const EVIDENCE_LIMIT = 40;
const batchSize = 50;

export async function getProblemMasteries(
  client: Client,
  userId: string,
  ids: string[],
  now = new Date()
) {
  const results = new Map<string, ProblemMasteryResult>();
  const unique = [...new Set(ids)];
  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize);
    const [problems, revisions] = await Promise.all([
      client
        .from("problems")
        .select(
          "id,difficulty,estimated_minutes,attempts:problem_attempts(id,outcome,time_taken_seconds,confidence,attempted_at)"
        )
        .eq("is_active", true)
        .in("id", batch)
        .eq("attempts.user_id", userId)
        .lte("attempts.attempted_at", now.toISOString())
        .order("attempted_at", { referencedTable: "attempts", ascending: false })
        .order("id", { referencedTable: "attempts", ascending: false })
        .limit(EVIDENCE_LIMIT, { referencedTable: "attempts" }),
      client
        .from("revision_items")
        .select(
          "entity_id,reviews:revision_attempts(id,rating,previous_interval_days,next_interval_days,reviewed_at)"
        )
        .eq("user_id", userId)
        .eq("entity_type", "problem")
        .in("entity_id", batch)
        .eq("reviews.user_id", userId)
        .lte("reviews.reviewed_at", now.toISOString())
        .order("reviewed_at", { referencedTable: "reviews", ascending: false })
        .order("id", { referencedTable: "reviews", ascending: false })
        .limit(EVIDENCE_LIMIT, { referencedTable: "reviews" }),
    ]);
    if (problems.error || revisions.error)
      throw new Error("Mastery evidence could not be loaded.");
    const reviews = new Map(
      (revisions.data ?? []).map((row) => [row.entity_id, row.reviews ?? []])
    );
    for (const problem of problems.data ?? []) {
      results.set(
        problem.id,
        calculateProblemMastery(
          {
            problemId: problem.id,
            difficulty: masteryDifficulty(problem.difficulty),
            targetTimeMinutes: problem.estimated_minutes,
            attempts: (problem.attempts ?? []).map((a): AttemptRecord => ({
              id: a.id,
              outcome: a.outcome as AttemptRecord["outcome"],
              timeTakenSeconds: a.time_taken_seconds,
              confidence: a.confidence,
              attemptedAt: a.attempted_at,
            })),
            revisions: (reviews.get(problem.id) ?? []).map((r): RevisionRecord => ({
              id: r.id,
              rating: r.rating as RevisionRecord["rating"],
              previousIntervalDays: r.previous_interval_days,
              nextIntervalDays: r.next_interval_days,
              reviewedAt: r.reviewed_at,
            })),
          },
          MASTERY_POLICY_V1,
          now
        )
      );
    }
  }
  return results;
}

export async function getMasteredProblemIds(
  client: Client,
  userId: string,
  now = new Date()
) {
  const candidates: string[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from("revision_items")
      .select("entity_id,reviews:revision_attempts!inner(id)")
      .eq("user_id", userId)
      .eq("entity_type", "problem")
      .eq("reviews.user_id", userId)
      .in("reviews.rating", ["okay", "easy"])
      .lte("reviews.reviewed_at", now.toISOString())
      .limit(1, { referencedTable: "reviews" })
      .order("entity_id")
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error("Mastery candidates could not be loaded.");
    candidates.push(...(data ?? []).map((row) => row.entity_id));
    if ((data?.length ?? 0) < pageSize) break;
  }
  const mastery = await getProblemMasteries(client, userId, candidates, now);
  return [...mastery.values()]
    .filter((result) => result.level === "mastered")
    .map((result) => result.problemId);
}

export async function getMasteryOverviewData(
  client: Client,
  userId: string,
  now = new Date()
): Promise<MasteryOverviewData> {
  const curriculum = await client
    .from("curricula")
    .select("id")
    .eq("slug", "prime-core-dsa")
    .single();
  if (curriculum.error || !curriculum.data)
    throw new Error("Prime Core curriculum is unavailable.");
  const [stages, entries] = await Promise.all([
    client
      .from("curriculum_stages")
      .select("*")
      .eq("curriculum_id", curriculum.data.id)
      .order("sequence"),
    client
      .from("curriculum_items")
      .select(
        "*,problem:problems!inner(id,title,slug,difficulty,is_active,topic:roadmap_topics!primary_topic_id(id,name,slug))"
      )
      .eq("curriculum_id", curriculum.data.id)
      .eq("problem.is_active", true)
      .order("sequence"),
  ]);
  if (stages.error || entries.error)
    throw new Error("Prime Core curriculum could not be loaded.");
  const rows = entries.data ?? [];
  const results = await getProblemMasteries(
    client,
    userId,
    rows.map((row) => row.problem_id),
    now
  );
  const coreProblemMetadata: Record<string, CoreProblemMetadata> = {};
  const stageResults = (stages.data ?? []).map((stage) => {
    const groups = new Map<
      string,
      { name: string; slug: string; items: CurriculumItem[] }
    >();
    for (const row of rows) {
      if (row.stage_id !== stage.id || !row.problem || !results.has(row.problem_id))
        continue;
      const topic = row.problem.topic;
      const key = stage.id + ":" + (topic?.id ?? "general");
      const group = groups.get(key) ?? {
        name: topic?.name ?? stage.name,
        slug: topic?.slug ?? stage.slug,
        items: [],
      };
      const difficulty = masteryDifficulty(row.problem.difficulty);
      const priority =
        row.priority === "P0" || row.priority === "P1" ? row.priority : "P2";
      group.items.push({
        id: row.id,
        curriculumId: row.curriculum_id,
        stageId: stage.id,
        problemId: row.problem_id,
        sequence: row.sequence,
        priority,
        recommendedMinutes: row.recommended_minutes,
        isRequired: row.is_required,
        isCheckpoint: row.is_checkpoint,
        selectionReason: row.selection_reason,
        difficulty,
      });
      groups.set(key, group);
      coreProblemMetadata[row.problem_id] = {
        id: row.problem_id,
        slug: row.problem.slug,
        title: row.problem.title,
        difficulty,
        priority,
        recommendedMinutes: row.recommended_minutes,
        isRequired: row.is_required,
        isCheckpoint: row.is_checkpoint,
        topicId: key,
        topicName: group.name,
        stageId: stage.id,
        stageName: stage.name,
        stageSequence: stage.sequence,
      };
    }
    const stageInfo: CurriculumStage = {
      id: stage.id,
      curriculumId: stage.curriculum_id,
      slug: stage.slug,
      name: stage.name,
      sequence: stage.sequence,
      description: stage.description,
      estimatedProblemCount: stage.estimated_problem_count,
      estimatedMinutes: stage.estimated_minutes,
    };
    return calculateStageMastery({
      stage: stageInfo,
      topicResults: [...groups].flatMap(([key, group]) => {
        const required = group.items.filter((item) => item.isRequired);
        return required.length
          ? [
              calculateTopicMastery({
                topicId: key,
                topicSlug: group.slug,
                topicName: group.name,
                coreItems: required,
                problemMasteryMap: results,
                optionalProblemMasteries: group.items.flatMap((item) =>
                  !item.isRequired && results.has(item.problemId)
                    ? [results.get(item.problemId)!]
                    : []
                ),
              }),
            ]
          : [];
      }),
    });
  });
  const problemMasteries = [...results.values()].filter(
    (result) => coreProblemMetadata[result.problemId]?.isRequired
  );
  const overall = calculateOverallMastery(stageResults, problemMasteries, now);
  return {
    overall,
    stages: stageResults,
    topics: stageResults.flatMap((stage) => stage.topics),
    problemMasteries,
    coreProblemMetadata,
    totalCoreProblems: overall.totalCoreProblems,
    lastCalculatedAt: now.toISOString(),
    policyVersion: overall.policyVersion,
    counts: {
      mastered: overall.masteredCount,
      proficient: overall.proficientCount,
      practiced: overall.practicedCount,
      learning: overall.learningCount,
      exposed: overall.exposedCount,
      unseen: overall.unseenCount,
    },
  };
}

export async function recalculateProblemMastery({
  supabase,
  userId,
  problemId,
  now = new Date(),
}: {
  supabase: Client;
  userId: string;
  problemId: string;
  now?: Date;
}): Promise<ProblemMasteryResult> {
  const masteries = await getProblemMasteries(supabase, userId, [problemId], now);
  const result = masteries.get(problemId);
  if (!result) throw new Error("Could not compute mastery for problem: " + problemId);

  return result;
}
