import type {
  CurriculumItem,
  CurriculumStage,
  CurriculumDependency,
  UserProblemState,
  CurriculumProgressSummary,
  StageProgressSummary,
  CurriculumNextRecommendation,
} from "./types";

/**
 * Computes overall progress across the curriculum.
 * Completed requires either 'solved' or 'mastered' status.
 * Revision due does not erase completion status, but is tracked distinctly for retention focus.
 */
export function getCurriculumProgress(
  items: CurriculumItem[],
  userProgressMap: Map<string, UserProblemState>
): CurriculumProgressSummary {
  let totalRequired = 0;
  let completedRequired = 0;
  let totalOptional = 0;
  let completedOptional = 0;
  let totalAttempted = 0;
  let revisionDueCount = 0;

  for (const item of items) {
    const userState = userProgressMap.get(item.problemId);
    const isSolved = userState?.status === "solved" || userState?.status === "mastered";
    const isAttempted = userState?.status === "attempted";
    const isRevisionDue = Boolean(userState?.isRevisionDue);

    if (item.isRequired) {
      totalRequired++;
      if (isSolved) completedRequired++;
    } else {
      totalOptional++;
      if (isSolved) completedOptional++;
    }

    if (isAttempted) {
      totalAttempted++;
    }

    if (isRevisionDue) {
      revisionDueCount++;
    }
  }

  const remainingRequiredCount = Math.max(0, totalRequired - completedRequired);
  const completionPercentage =
    totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;

  return {
    totalRequired,
    completedRequired,
    totalOptional,
    completedOptional,
    totalAttempted,
    revisionDueCount,
    remainingRequiredCount,
    completionPercentage,
  };
}

/**
 * Computes per-stage progress metrics.
 */
export function getStageProgress(
  stage: CurriculumStage,
  stageItems: CurriculumItem[],
  userProgressMap: Map<string, UserProblemState>,
  currentStageId?: string | null
): StageProgressSummary {
  let totalRequired = 0;
  let completedRequired = 0;
  let totalProblems = stageItems.length;
  let completedProblems = 0;
  let revisionDueCount = 0;

  for (const item of stageItems) {
    const userState = userProgressMap.get(item.problemId);
    const isSolved = userState?.status === "solved" || userState?.status === "mastered";
    const isRevisionDue = Boolean(userState?.isRevisionDue);

    if (item.isRequired) {
      totalRequired++;
      if (isSolved) completedRequired++;
    }

    if (isSolved) {
      completedProblems++;
    }

    if (isRevisionDue) {
      revisionDueCount++;
    }
  }

  const isCompleted = totalRequired > 0 && completedRequired === totalRequired;
  const isCurrent = currentStageId ? stage.id === currentStageId : false;
  const completionPercentage =
    totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;

  return {
    stageId: stage.id,
    stageSlug: stage.slug,
    stageName: stage.name,
    sequence: stage.sequence,
    totalRequired,
    completedRequired,
    totalProblems,
    completedProblems,
    revisionDueCount,
    completionPercentage,
    isCompleted,
    isCurrent,
  };
}

/**
 * Pure, deterministic algorithm to determine the Next Recommended Curriculum Problem ("Continue").
 *
 * Rules:
 * 1. Find all required curriculum items that are NOT solved/mastered.
 * 2. Filter to items whose required prerequisites are satisfied (prerequisites are solved or mastered).
 * 3. Choose the candidate with the lowest global sequence (earliest in the curriculum learning order).
 * 4. If all required items are completed, return null.
 */
export function getNextCurriculumItem(
  items: CurriculumItem[],
  stages: CurriculumStage[],
  dependencies: CurriculumDependency[],
  userProgressMap: Map<string, UserProblemState>
): CurriculumNextRecommendation | null {
  const stageMap = new Map<string, CurriculumStage>();
  for (const s of stages) {
    stageMap.set(s.id, s);
  }

  const itemMap = new Map<string, CurriculumItem>();
  for (const item of items) {
    itemMap.set(item.id, item);
  }

  // Pre-index required prerequisites by dependent item id
  const requiredPrereqMap = new Map<string, string[]>();
  for (const dep of dependencies) {
    if (dep.dependencyType === "required") {
      const list = requiredPrereqMap.get(dep.dependentItemId) ?? [];
      list.push(dep.prerequisiteItemId);
      requiredPrereqMap.set(dep.dependentItemId, list);
    }
  }

  // Helper to check if a problem is solved/mastered
  const isProblemCompleted = (problemId: string): boolean => {
    const state = userProgressMap.get(problemId);
    return state?.status === "solved" || state?.status === "mastered";
  };

  // Sort items by sequence ascending
  const sortedItems = [...items].sort((a, b) => a.sequence - b.sequence);

  for (const item of sortedItems) {
    if (!item.isRequired) continue;
    if (isProblemCompleted(item.problemId)) continue;

    // Check if all required prerequisites are satisfied
    const prereqIds = requiredPrereqMap.get(item.id) ?? [];
    const allPrereqsMet = prereqIds.every((prereqItemId) => {
      const prereqItem = itemMap.get(prereqItemId);
      if (!prereqItem) return false;
      return isProblemCompleted(prereqItem.problemId);
    });

    if (allPrereqsMet) {
      const stage = stageMap.get(item.stageId);
      if (!stage) continue;

      return {
        item,
        stage,
        reason: prereqIds.length > 0 ? "prerequisites_satisfied" : "next_in_sequence",
      };
    }
  }

  return null;
}

