import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  evaluateTargetReadiness,
  CANONICAL_COMPETENCIES,
  TARGET_PROFILES,
  type CompetencyEvidenceInput,
  type TargetReadinessResult,
  type TrajectoryDataPoint,
} from "@/domain/readiness";
import { ALGORITHMS } from "@/features/algorithm-lab/registry/metadata";

type Client = SupabaseClient<Database>;

export async function getTargetReadinessData(
  client: Client,
  userId: string,
  profileId?: string,
  companyIdOrNow?: string | Date,
  maybeNow = new Date()
): Promise<TargetReadinessResult> {
  let companyId: string | undefined;
  let now = maybeNow;

  if (companyIdOrNow instanceof Date) {
    now = companyIdOrNow;
  } else if (typeof companyIdOrNow === "string") {
    companyId = companyIdOrNow;
  }

  // 1. Resolve target profile if not explicitly provided
  let selectedProfileId = profileId;
  if (!selectedProfileId) {
    const [settings, plan] = await Promise.all([
      client.from("user_settings").select("target_role").eq("user_id", userId).maybeSingle(),
      client
        .from("preparation_plans")
        .select("target_role")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const targetRole = (plan.data?.target_role ?? settings.data?.target_role ?? "").toLowerCase();
    if (targetRole.includes("backend")) {
      selectedProfileId = "backend-dev";
    } else if (targetRole.includes("full") || targetRole.includes("fullstack")) {
      selectedProfileId = "fullstack-dev";
    } else if (targetRole.includes("front") || targetRole.includes("frontend")) {
      selectedProfileId = "frontend-dev";
    } else {
      selectedProfileId = "general-sde";
    }
  }

  // 2. Fetch problems, attempts, revisions, and CS Fundamentals (DBMS + SQL) progress
  const [problemsRes, attemptsRes, revisionsRes, dbmsVideosRes, sqlExercisesRes] =
    await Promise.all([
      client
        .from("problems")
        .select("id,slug,title,difficulty,topic:roadmap_topics!primary_topic_id(id,name,slug)")
        .eq("is_active", true),
      client
        .from("problem_attempts")
        .select("id,problem_id,outcome,time_taken_seconds,confidence,attempted_at")
        .eq("user_id", userId)
        .lte("attempted_at", now.toISOString()),
      client
        .from("revision_items")
        .select(
          "entity_id,reviews:revision_attempts(id,rating,previous_interval_days,next_interval_days,reviewed_at)"
        )
        .eq("user_id", userId)
        .eq("entity_type", "problem"),
      client
        .from("learning_video_progress")
        .select("video_id,status,watched_at")
        .eq("user_id", userId)
        .in("status", ["watched", "completed"]),
      client
        .from("learning_exercise_attempts")
        .select("exercise_id,outcome,attempted_at")
        .eq("user_id", userId),
    ]);

  const problems = problemsRes.data ?? [];
  const attempts = attemptsRes.data ?? [];
  const revisions = revisionsRes.data ?? [];
  const dbmsWatchedVideos = dbmsVideosRes.data ?? [];
  const sqlAttempts = sqlExercisesRes.data ?? [];

  // Group attempts and revisions by problem_id
  const attemptsByProblem = new Map<string, typeof attempts>();
  for (const a of attempts) {
    const list = attemptsByProblem.get(a.problem_id) ?? [];
    list.push(a);
    attemptsByProblem.set(a.problem_id, list);
  }

  const revisionsByProblem = new Map<string, Array<{ rating: string }>>();
  for (const r of revisions) {
    const list = revisionsByProblem.get(r.entity_id) ?? [];
    for (const rev of r.reviews ?? []) {
      list.push(rev);
    }
    revisionsByProblem.set(r.entity_id, list);
  }

  // Map algorithm labs by topics
  const labTopicMap = new Map<string, string>();
  for (const algo of ALGORITHMS) {
    for (const top of algo.topics) {
      if (!labTopicMap.has(top)) {
        labTopicMap.set(top, algo.slug);
      }
    }
  }

  // 3. Build evidence map across all canonical competencies
  const evidenceMap = new Map<string, CompetencyEvidenceInput>();

  for (const comp of CANONICAL_COMPETENCIES) {
    if (comp.domain === "dsa") {
      // Find all problems matching related topic slugs
      const matchingProblems = problems.filter((p) => {
        const topicSlug = p.topic?.slug?.toLowerCase() ?? "";
        return comp.relatedTopicSlugs.some(
          (slug) => topicSlug.includes(slug) || slug.includes(topicSlug)
        );
      });

      let attemptedCount = 0;
      let independentCount = 0;
      let hintCount = 0;
      let totalAttemptsCount = 0;
      let totalRevs = 0;
      let successfulRevs = 0;
      let forgotRevs = 0;
      let unsolvedCount = 0;

      for (const prob of matchingProblems) {
        const pAttempts = attemptsByProblem.get(prob.id) ?? [];
        const pRevs = revisionsByProblem.get(prob.id) ?? [];

        if (pAttempts.length > 0) {
          attemptedCount++;
          totalAttemptsCount += pAttempts.length;

          const hasIndependent = pAttempts.some((a) => a.outcome === "independent");
          if (hasIndependent) independentCount++;

          const hints = pAttempts.filter((a) => a.outcome === "hint").length;
          hintCount += hints;

          const unsolved = pAttempts.filter((a) => a.outcome === "unsolved").length;
          unsolvedCount += unsolved;
        }

        if (pRevs.length > 0) {
          totalRevs += pRevs.length;
          for (const rev of pRevs) {
            if (rev.rating === "okay" || rev.rating === "easy") successfulRevs++;
            if (rev.rating === "forgot") forgotRevs++;
          }
        }
      }

      const hasWeaknessSignal =
        unsolvedCount >= 2 ||
        (hintCount >= 2 && independentCount === 0) ||
        forgotRevs >= 2;

      let weaknessReason: string | undefined;
      if (forgotRevs >= 2) {
        weaknessReason = `Retention decay detected in ${comp.name}.`;
      } else if (hintCount >= 2 && independentCount === 0) {
        weaknessReason = `High hint dependency in ${comp.name} solves.`;
      } else if (unsolvedCount >= 2) {
        weaknessReason = `Multiple unsolved attempts in ${comp.name}.`;
      }

      // Check Algorithm Lab matching
      let algorithmLabSlug: string | undefined;
      for (const slug of comp.relatedTopicSlugs) {
        if (labTopicMap.has(slug)) {
          algorithmLabSlug = labTopicMap.get(slug);
          break;
        }
      }

      evidenceMap.set(comp.id, {
        competencyId: comp.id,
        domain: "dsa",
        totalProblemsCount: matchingProblems.length || 6,
        attemptedProblemsCount: attemptedCount,
        independentSolvedCount: independentCount,
        hintAssistedCount: hintCount,
        totalAttempts: totalAttemptsCount,
        totalRevisions: totalRevs,
        successfulRevisions: successfulRevs,
        forgotRevisions: forgotRevs,
        masteryScore: attemptedCount > 0 ? Math.round((independentCount / attemptedCount) * 100) : null,
        hasWeaknessSignal,
        weaknessReason,
        algorithmLabSlug,
      });
    } else if (comp.id === "fund-dbms") {
      // Connect verified DBMS learning course evidence
      const watchedCount = dbmsWatchedVideos.length;
      evidenceMap.set(comp.id, {
        competencyId: comp.id,
        domain: "fundamentals",
        totalProblemsCount: 12,
        attemptedProblemsCount: Math.min(watchedCount, 12),
        independentSolvedCount: Math.min(watchedCount, 12),
        hintAssistedCount: 0,
        totalAttempts: watchedCount,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: watchedCount > 0 ? Math.min(100, Math.round((watchedCount / 12) * 100)) : null,
        hasWeaknessSignal: false,
      });
    } else if (comp.id === "fund-os") {
      // Connect verified Operating Systems learning course evidence
      const osWatchedCount = dbmsWatchedVideos.length;
      evidenceMap.set(comp.id, {
        competencyId: comp.id,
        domain: "fundamentals",
        totalProblemsCount: 12,
        attemptedProblemsCount: Math.min(osWatchedCount, 12),
        independentSolvedCount: Math.min(osWatchedCount, 12),
        hintAssistedCount: 0,
        totalAttempts: osWatchedCount,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: osWatchedCount > 0 ? Math.min(100, Math.round((osWatchedCount / 12) * 100)) : null,
        hasWeaknessSignal: false,
      });
    } else if (comp.id === "fund-networks") {
      // Connect verified Computer Networks learning course & laboratory evidence
      const cnLabsCompleted = sqlAttempts.filter(
        (a) => a.exercise_id?.startsWith("cn-lab-") && (a.outcome === "solved_independent" || a.outcome === "solved_hint")
      ).length;
      const cnWatchedCount = dbmsWatchedVideos.length;
      const combinedProgress = Math.max(cnLabsCompleted, Math.min(cnWatchedCount, 12));
      evidenceMap.set(comp.id, {
        competencyId: comp.id,
        domain: "fundamentals",
        totalProblemsCount: 12,
        attemptedProblemsCount: combinedProgress,
        independentSolvedCount: combinedProgress,
        hintAssistedCount: 0,
        totalAttempts: combinedProgress,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: combinedProgress > 0 ? Math.min(100, Math.round((combinedProgress / 12) * 100)) : null,
        hasWeaknessSignal: false,
      });
    } else if (comp.id === "fund-oop") {
      // Connect verified OOP with Java learning course & laboratory evidence
      const oopLabsCompleted = sqlAttempts.filter(
        (a) =>
          (a.exercise_id?.startsWith("oop-lab-") || a.exercise_id?.startsWith("lld-")) &&
          (a.outcome === "solved_independent" || a.outcome === "solved_hint")
      ).length;
      const oopWatchedCount = dbmsWatchedVideos.length;
      const combinedProgress = Math.max(oopLabsCompleted, Math.min(oopWatchedCount, 12));
      evidenceMap.set(comp.id, {
        competencyId: comp.id,
        domain: "fundamentals",
        totalProblemsCount: 12,
        attemptedProblemsCount: combinedProgress,
        independentSolvedCount: combinedProgress,
        hintAssistedCount: 0,
        totalAttempts: combinedProgress,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: combinedProgress > 0 ? Math.min(100, Math.round((combinedProgress / 12) * 100)) : null,
        hasWeaknessSignal: false,
      });
    } else if (comp.id === "fund-sql") {
      // Connect verified SQL practical exercises evidence
      const attemptedCount = sqlAttempts.length;
      const solvedCount = sqlAttempts.filter(
        (a) => a.outcome === "solved_independent" || a.outcome === "solved_hint"
      ).length;
      evidenceMap.set(comp.id, {
        competencyId: comp.id,
        domain: "fundamentals",
        totalProblemsCount: 12,
        attemptedProblemsCount: Math.min(attemptedCount, 12),
        independentSolvedCount: Math.min(solvedCount, 12),
        hintAssistedCount: 0,
        totalAttempts: attemptedCount,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: attemptedCount > 0 ? Math.round((solvedCount / attemptedCount) * 100) : null,
        hasWeaknessSignal: false,
      });
    } else {
      // Other Fundamentals, Aptitude, Mock - report verified evidence or not_assessed
      evidenceMap.set(comp.id, {
        competencyId: comp.id,
        domain: comp.domain,
        totalProblemsCount: 4,
        attemptedProblemsCount: 0,
        independentSolvedCount: 0,
        hintAssistedCount: 0,
        totalAttempts: 0,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: null,
        hasWeaknessSignal: false,
      });
    }
  }

  // 4. Compute evidence timeline trajectory (reproducible from timestamps)
  const trajectoryMap = new Map<string, number>();
  for (const a of attempts) {
    const day = a.attempted_at.slice(0, 10);
    trajectoryMap.set(day, (trajectoryMap.get(day) ?? 0) + 1);
  }
  for (const sql of sqlAttempts) {
    const day = sql.attempted_at.slice(0, 10);
    trajectoryMap.set(day, (trajectoryMap.get(day) ?? 0) + 1);
  }

  const sortedDates = Array.from(trajectoryMap.keys()).sort();
  let runningAttempts = 0;
  const trajectory: TrajectoryDataPoint[] = [];

  for (const date of sortedDates) {
    runningAttempts += trajectoryMap.get(date) ?? 0;
    // Estimate assessed competencies up to this date
    const assessedApprox = Math.min(
      Math.floor(runningAttempts / 2),
      CANONICAL_COMPETENCIES.length
    );
    const alignedApprox = Math.min(
      Math.floor(runningAttempts / 4),
      assessedApprox
    );

    trajectory.push({
      date,
      cumulativeAttempts: runningAttempts,
      assessedCompetencies: assessedApprox,
      alignedCompetencies: alignedApprox,
    });
  }

  // 5. Run deterministic target evaluation
  return evaluateTargetReadiness({
    profileId: selectedProfileId,
    companyId,
    evidenceMap,
    trajectory: trajectory.slice(-14), // last 14 active days
    now,
  });
}
