import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ContextRef } from "../schema";
import type { AIContext } from "../types";
import { getProblemDetail } from "@/features/problems/queries/get-problem-detail";
import { getRoadmapDashboardData } from "@/features/roadmap/queries/get-roadmap-data";
import { AIError } from "@/lib/ai/errors";
import { loadLabAIContext } from "@/features/algorithm-lab/ai/context";
import { getPlannerView } from "@/features/planner/server/service";
import { getMasteryOverviewData } from "@/features/mastery/server/service";
import { getAnalytics } from "@/features/analytics/service";
import { readAnalyticsFilters } from "@/features/analytics/metrics";
import { getTargetReadinessData } from "@/features/readiness/server/service";
export async function loadAIContext(
  client: SupabaseClient<Database>,
  userId: string,
  ref: ContextRef
): Promise<AIContext> {
  const result: AIContext = {
    reference: ref,
    label: "Preparation workspace",
    subtitle: "PRIME AI",
    facts: {},
    references: [],
    unavailable: [],
  };
  if (ref.type === "lab") return loadLabAIContext(ref);
  if (ref.type === "problem") {
    if (!ref.ref) throw new AIError("INVALID_REQUEST", "Choose a problem.", 400);
    const p = await getProblemDetail(client, ref.ref, userId);
    if (!p) throw new AIError("NOT_FOUND", "This problem is unavailable.", 404);
    result.label = p.title;
    result.subtitle = [p.primaryTopic?.name, p.difficulty].filter(Boolean).join(" · ");
    result.facts = {
      problem: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        topics: p.allTopics,
        targetMinutes: p.estimatedMinutes,
      },
      status: p.status,
      attemptCount: p.attemptCount,
      attempts: p.attemptHistory.slice(0, 10),
      revision: p.revision,
      mastery: p.mastery && {
        level: p.mastery.level, freshness: p.mastery.freshness, requirements: p.mastery.requirements,
        strengths: p.mastery.strengths, blockers: p.mastery.blockers, nextEvidence: p.mastery.nextEvidence,
        policyVersion: p.mastery.policyVersion,
      },
      unavailable: p.unavailable,
    };
    result.references = [{ title: p.title, href: `/practice/dsa/${p.slug}` }];
    const core = await client
      .from("curriculum_items")
      .select("stage_id,recommended_minutes,selection_reason")
      .eq("problem_id", p.id)
      .limit(1)
      .maybeSingle();
    if (core.data) {
      const stage = await client
        .from("curriculum_stages")
        .select("name,slug")
        .eq("id", core.data.stage_id)
        .maybeSingle();
      result.facts.core = { ...core.data, stage: stage.data };
    }
  } else if (ref.type === "roadmap") {
    const data = await getRoadmapDashboardData(client, userId, "prime-core-dsa", true);
    const stage = data.stages.find((s) => s.stageId === data.currentStageId);
    result.label = stage?.stageName ?? "DSA Roadmap";
    result.subtitle = "PRIME Core · deterministic curriculum";
    result.facts = {
      progress: data.progress,
      currentStage: stage
        ? {
            name: stage.stageName,
            completed: stage.completedProblems,
            total: stage.totalProblems,
            revisionDue: stage.revisionDueCount,
          }
        : null,
      next: data.nextRecommendation,
    };
    result.references = [{ title: "DSA Roadmap", href: "/roadmap/dsa" }];
  } else if (ref.type === "revision") {
    const now = new Date().toISOString();
    const rows = await client
      .from("revision_items")
      .select(
        "id,entity_id,interval_days,next_review_at,snoozed_until,status,last_reviewed_at"
      )
      .eq("user_id", userId)
      .eq("entity_type", "problem")
      .eq("status", "active")
      .lte("next_review_at", now)
      .or(`snoozed_until.is.null,snoozed_until.lte.${now}`)
      .order("next_review_at")
      .limit(20);
    if (rows.error) throw new Error("Revision context unavailable");
    const due = (rows.data ?? []).filter(
      (r) => !r.snoozed_until || r.snoozed_until <= now
    );
    const ids = due.map((r) => r.entity_id);
    const problems = ids.length
      ? await client.from("problems").select("id,slug,title,difficulty").in("id", ids)
      : { data: [] };
    result.label = "Due revisions";
    result.subtitle = "Revision Engine";
    result.facts = {
      items: due.map((r) => ({
        ...r,
        problem: problems.data?.find((p) => p.id === r.entity_id),
      })),
      limit: 20,
    };
    result.references = [{ title: "Revision", href: "/revision" }];
  } else if (ref.type === "today" || ref.type === "planner") {
    const settings = await client
      .from("user_settings")
      .select("timezone")
      .eq("user_id", userId)
      .maybeSingle();
    const date =
      ref.date ??
      new Intl.DateTimeFormat("en-CA", {
        timeZone: settings.data?.timezone || "UTC",
      }).format(new Date());
    const plan = await client
      .from("daily_plans")
      .select("id,plan_date,planned_minutes,completed_minutes,available_minutes,is_rest_day,status")
      .eq("user_id", userId)
      .eq("plan_date", date)
      .maybeSingle();
    if (plan.error) throw new Error("Plan unavailable");
    const tasks = plan.data
      ? await client
          .from("daily_tasks")
          .select("id,title,task_type,planned_minutes,status,source,sort_order,is_locked,scheduled_reason,original_date,carry_count")
          .eq("user_id", userId)
          .eq("daily_plan_id", plan.data.id)
          .order("sort_order")
          .limit(30)
      : { data: [], error: null };
    if (tasks.error) throw new Error("Tasks unavailable");
    result.label = ref.type === "today" ? "Today" : "Preparation plan";
    result.subtitle = date;
    result.facts = {
      date,
      plan: plan.data,
      tasks: tasks.data,
      plannerMutationsAvailable: false,
    };
    result.references = [
      { title: result.label, href: ref.type === "today" ? "/today" : "/plan" },
    ];
    if (ref.type === "planner") {
      const workspace = await getPlannerView(userId).catch(() => null);
      if (workspace) {
        result.facts = { ...result.facts, targetDate: workspace.target, feasibility: workspace.feasibility,
          nextWeek: workspace.days.filter(d => d.date >= date).slice(0, 7),
          missedCommitments: workspace.tasks.filter(t => t.date < workspace.today && t.status === "pending").length,
          backlogCount: workspace.backlog.length };
      } else {
        result.unavailable.push("Planner target and capacity forecast");
      }
    }
  } else if (ref.type === "mastery") {
    const view = await getMasteryOverviewData(client, userId);
    const topics = ref.ref ? view.topics.filter(topic => topic.topicSlug === ref.ref) : view.topics;
    if (ref.ref && !topics.length) throw new AIError("NOT_FOUND", "This skill is unavailable.", 404);
    result.label = ref.ref ? topics[0].topicName : "Prime Core mastery";
    result.subtitle = "Independent practice and spaced recall";
    result.facts = {
      scope: "Required Prime Core problems",
      policyVersion: view.policyVersion, level: view.overall.level, counts: view.counts,
      topics: topics.slice(0, 18).map(topic => ({
        skill: topic.topicName, level: topic.level, coverage: topic.evidenceCoverage,
        strengths: topic.strengths, blockers: topic.blockers,
      })),
      instruction: "Explain the supplied evidence and gaps. An AI quiz is practice and does not change mastery.",
    };
    result.references = [{ title: "Mastery", href: "/mastery" }];
  } else if (ref.type === "notes") {
    result.label = "Engineering notes";
    result.subtitle = "Only requested notes are shared";
    if (ref.ref) {
      const note = await client
        .from("notes")
        .select("id,body,entity_type,entity_id")
        .eq("user_id", userId)
        .eq("id", ref.ref)
        .maybeSingle();
      if (note.error || !note.data)
        throw new AIError("NOT_FOUND", "This note is unavailable.", 404);
      result.facts = { note: note.data };
    }
    result.references = [{ title: "Notes", href: "/notes" }];
  } else if (ref.type === "practice") {
    result.label = "DSA Practice";
    result.subtitle = "Canonical problem catalog";
    result.facts = { instruction: "Use search_dsa_catalog for bounded catalog queries." };
    result.references = [{ title: "Practice", href: "/practice/dsa" }];
  } else if (ref.type === "progress") {
    const [days, compare] = ref.ref?.split("-") ?? [];
    const data = await getAnalytics(client, userId, readAnalyticsFilters({ days, compare, view: "insights" }));
    result.label = "Preparation analytics";
    result.subtitle = data.previous ? "Recorded evidence · Complete local days" : "Recorded evidence · Includes today";
    const summary = (period: typeof data.current) => ({
      firstDay: period.daily[0].date,
      lastDay: period.daily.at(-1)?.date,
      attempts: period.attempt,
      activeDays: period.activeDays,
      recordedStudySeconds: period.studySeconds,
      measuredSessions: period.sessionCount,
      revisionRatings: period.reviews,
    });
    result.facts = {
      timezone: data.timezone,
      current: summary(data.current),
      previous: data.previous ? summary(data.previous) : null,
      instruction: "Explain the supplied metrics and sample sizes. Null is unavailable. Distinguish timed sessions from estimates and avoid inferring mastery, historical adherence or scheduling changes.",
    };
    result.unavailable = data.unavailable;
    result.references = [{ title: "Analytics", href: `/analytics?days=${data.current.daily.length}${data.previous ? "&compare=previous" : ""}` }];
  } else if (ref.type === "readiness") {
    const profileId = ref.ref || "general-sde";
    const data = await getTargetReadinessData(client, userId, profileId);
    result.label = "Interview Readiness";
    result.subtitle = `${data.profile.name} · ${data.overallAlignment.replace("_", " ").toUpperCase()}`;
    result.facts = {
      profile: { id: data.profile.id, name: data.profile.name, description: data.profile.description },
      overallAlignment: data.overallAlignment,
      coreCoveragePercentage: data.coreCoveragePercentage,
      assessedCount: data.assessedCount,
      totalCompetencies: data.totalCompetencies,
      alignedCount: data.alignedCount,
      developingCount: data.developingCount,
      needsAttentionCount: data.needsAttentionCount,
      domainSummaries: data.domainSummaries,
      priorityGaps: data.gaps.slice(0, 5).map((g) => ({
        competency: g.competencyName,
        domain: g.domain,
        type: g.gapType,
        action: g.recommendedAction,
      })),
      instruction: "Readiness is evidence-based and separates coverage from performance and confidence. Never fabricate hiring odds or treat missing evidence as failure.",
    };
    result.references = [{ title: "Interview Readiness", href: `/readiness?profile=${profileId}` }];
  }
  return result;
}
