import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  RoadmapDashboardData,
  RoadmapStageData,
  RoadmapProblemItem,
} from "../types";
import {
  getCurriculumProgress,
  getStageProgress,
  getNextCurriculumItem,
} from "@/domain/curriculum/curriculum-selectors";
import type {
  Curriculum,
  CurriculumStage,
  CurriculumItem,
  CurriculumDependency,
  UserProblemState,
} from "@/domain/curriculum/types";

export async function getRoadmapDashboardData(
  supabase: SupabaseClient<Database>,
  userId?: string | null,
  curriculumSlug = "prime-core-dsa",
  strictPersonalData = false
): Promise<RoadmapDashboardData> {
  const now = new Date();

  // 1. Fetch Curriculum definition
  const { data: currData, error: currErr } = await supabase
    .from("curricula")
    .select("*")
    .eq("slug", curriculumSlug)
    .single();

  if (currErr || !currData) {
    throw new Error(
      `Curriculum "${curriculumSlug}" not found or failed to load: ${currErr?.message || "unknown"}`
    );
  }

  const curriculum: Curriculum = {
    id: currData.id,
    slug: currData.slug,
    name: currData.name,
    description: currData.description,
    version: currData.version,
    status: currData.status as any,
    estimatedProblemCount: currData.estimated_problem_count,
    createdAt: currData.created_at,
    updatedAt: currData.updated_at,
  };

  // 2. Fetch Stages
  const { data: stagesData, error: stagesErr } = await supabase
    .from("curriculum_stages")
    .select("*")
    .eq("curriculum_id", curriculum.id)
    .order("sequence", { ascending: true });

  if (stagesErr) {
    throw stagesErr;
  }

  const stages: CurriculumStage[] = (stagesData ?? []).map((s) => ({
    id: s.id,
    curriculumId: s.curriculum_id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    sequence: s.sequence,
    estimatedProblemCount: s.estimated_problem_count,
    estimatedMinutes: s.estimated_minutes,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }));

  // 3. Fetch Curriculum Items with joined problem metadata
  const { data: itemsData, error: itemsErr } = await supabase
    .from("curriculum_items")
    .select(`
      id,
      curriculum_id,
      stage_id,
      problem_id,
      sequence,
      priority,
      recommended_minutes,
      is_required,
      is_checkpoint,
      selection_reason,
      created_at,
      updated_at,
      problems:problem_id (
        id,
        slug,
        title,
        difficulty,
        source,
        external_url
      )
    `)
    .eq("curriculum_id", curriculum.id)
    .order("sequence", { ascending: true });

  if (itemsErr) {
    throw itemsErr;
  }

  const rawItems = itemsData ?? [];
  const items: CurriculumItem[] = rawItems.map((raw: any) => {
    const prob = Array.isArray(raw.problems) ? raw.problems[0] : raw.problems;
    return {
      id: raw.id,
      curriculumId: raw.curriculum_id,
      stageId: raw.stage_id,
      problemId: raw.problem_id,
      sequence: raw.sequence,
      priority: raw.priority as any,
      recommendedMinutes: raw.recommended_minutes,
      isRequired: raw.is_required,
      isCheckpoint: raw.is_checkpoint,
      selectionReason: raw.selection_reason,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      problemSlug: prob?.slug,
      title: prob?.title,
      difficulty: (prob?.difficulty?.toUpperCase() || "MEDIUM") as any,
      source: prob?.source,
      externalUrl: prob?.external_url,
    };
  });

  // 4. Fetch Dependencies
  const { data: depsData, error: depsErr } = await supabase
    .from("curriculum_dependencies")
    .select("*")
    .eq("curriculum_id", curriculum.id);

  if (depsErr) {
    throw depsErr;
  }

  const dependencies: CurriculumDependency[] = (depsData ?? []).map((d) => ({
    id: d.id,
    curriculumId: d.curriculum_id,
    prerequisiteItemId: d.prerequisite_item_id,
    dependentItemId: d.dependent_item_id,
    dependencyType: d.dependency_type as any,
  }));

  // Map for fast prerequisite resolution by item ID
  const itemMap = new Map<string, CurriculumItem>();
  for (const item of items) {
    itemMap.set(item.id, item);
  }

  const itemPrereqDeps = new Map<string, CurriculumDependency[]>();
  for (const dep of dependencies) {
    const list = itemPrereqDeps.get(dep.dependentItemId) ?? [];
    list.push(dep);
    itemPrereqDeps.set(dep.dependentItemId, list);
  }

  // 5. User Progress & Revision State (if authenticated)
  const userProgressMap = new Map<string, UserProblemState>();

  if (userId) {
    const problemIds = items.map((i) => i.problemId);

    // Fetch user progress for these problems
    const { data: progressRows, error: progressError } = await supabase
      .from("user_problem_progress")
      .select("problem_id, status, last_attempt_at, next_revision_at")
      .eq("user_id", userId)
      .in("problem_id", problemIds);
    if (strictPersonalData && progressError) throw new Error("Personal roadmap progress is unavailable.");

    for (const p of progressRows ?? []) {
      userProgressMap.set(p.problem_id, {
        status: p.status as any,
        lastAttemptAt: p.last_attempt_at,
        nextRevisionAt: p.next_revision_at,
        isRevisionDue: false,
      });
    }

    // Fetch user revision items for these problems
    const { data: revRows, error: revisionError } = await supabase
      .from("revision_items")
      .select("entity_id, next_review_at, snoozed_until, status")
      .eq("user_id", userId)
      .eq("entity_type", "problem")
      .in("entity_id", problemIds);
    if (strictPersonalData && revisionError) throw new Error("Personal roadmap revision state is unavailable.");

    for (const r of revRows ?? []) {
      if (r.status === "active") {
        const reviewDate = r.snoozed_until ? new Date(r.snoozed_until) : new Date(r.next_review_at);
        const isDue = reviewDate <= now;

        const existing = userProgressMap.get(r.entity_id) ?? {
          status: "not_started",
          isRevisionDue: false,
        };
        existing.isRevisionDue = isDue;
        userProgressMap.set(r.entity_id, existing);
      }
    }
  }

  // 6. Compute Global & Stage Progress
  const progress = getCurriculumProgress(items, userProgressMap);
  const nextRecommendation = getNextCurriculumItem(
    items,
    stages,
    dependencies,
    userProgressMap
  );

  // Identify current active stage (first incomplete stage or stage of next problem)
  let currentStageId = nextRecommendation ? nextRecommendation.stage.id : stages[0]?.id || null;

  // Build complete Stage structures with items and prerequisites
  const stagesOutput: RoadmapStageData[] = stages.map((stage) => {
    const stageItems = items.filter((i) => i.stageId === stage.id);
    const stageProgress = getStageProgress(
      stage,
      stageItems,
      userProgressMap,
      currentStageId
    );

    const enrichedItems: RoadmapProblemItem[] = stageItems.map((item) => {
      const uState = userProgressMap.get(item.problemId);
      const userStatus = uState?.status || "not_started";
      const isRevisionDue = Boolean(uState?.isRevisionDue);

      // Resolve prerequisite display info
      const prereqDeps = itemPrereqDeps.get(item.id) ?? [];
      const prerequisites = prereqDeps.map((d) => {
        const prereqItem = itemMap.get(d.prerequisiteItemId);
        const prereqState = prereqItem
          ? userProgressMap.get(prereqItem.problemId)
          : null;
        const isSatisfied =
          prereqState?.status === "solved" || prereqState?.status === "mastered";

        return {
          problemTitle: prereqItem?.title || "Prerequisite Problem",
          problemSlug: prereqItem?.problemSlug || "",
          isSatisfied,
        };
      });

      return {
        ...item,
        userStatus,
        isRevisionDue,
        prerequisites,
      };
    });

    return {
      ...stageProgress,
      description: stage.description,
      items: enrichedItems,
    };
  });

  return {
    curriculum,
    stages: stagesOutput,
    progress,
    nextRecommendation,
    currentStageId,
  };
}

