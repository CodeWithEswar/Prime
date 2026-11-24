import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  calculatePythonProgress,
  calculateTopicMastery,
  PYTHON_STAGE_INTERVIEWS,
  type PythonDashboardData,
  type PythonVideoItem,
  type PythonExercise,
  type PythonStageSchedule,
  type PythonCourseState,
  type UserVideoProgress,
  type UserStageProgress,
  type UserExerciseAttempt,
} from "@/domain/python";
import manifestJson from "@/content/python/python-dsa-manifest.json";
import exercisesJson from "@/content/python/python-dsa-exercises.json";

type Client = SupabaseClient<Database>;

const COURSE_SLUG = "python-dsa";

const STAGE_PRACTICAL_ASSIGNMENTS: Record<
  number,
  { title: string; description: string; submissionType: "checkbox" | "query" | "code" }
> = {
  1: {
    title: "Log Streaming Pipeline with Memory Profiling",
    description:
      "Construct a production-grade generator pipeline in Python that streams multi-gigabyte server logs, filters error codes, and verifies memory efficiency using sys.getsizeof.",
    submissionType: "checkbox",
  },
  2: {
    title: "Custom Dynamic Array & Cache Benchmark",
    description:
      "Implement a dynamic array class from scratch with array doubling and benchmark push/pop operations against Python's built-in list and collections.deque.",
    submissionType: "checkbox",
  },
  3: {
    title: "Sliding Window & Binary Search Solution Space Engine",
    description:
      "Implement Minimum Window Substring in O(m+n) time and binary search on solution space for Koko Eating Bananas with strict edge condition handling.",
    submissionType: "checkbox",
  },
  4: {
    title: "LRU Cache Architecture with Sentinel Doubly Linked List",
    description:
      "Build a complete Least Recently Used (LRU) Cache combining a Python dictionary and a doubly linked list with sentinel nodes to achieve verified O(1) operations.",
    submissionType: "checkbox",
  },
  5: {
    title: "Streaming Top-K Elements & Running Median with Balancing Heaps",
    description:
      "Implement continuous median finding using two balancing heaps (heapq) and write unit tests verifying running median queries after streaming 100,000 numbers.",
    submissionType: "checkbox",
  },
  6: {
    title: "Backtracking Sudoku Solver with Bitmask Constraint Optimization",
    description:
      "Author an optimal backtracking solver for 9x9 Sudoku puzzles using bitmask state tracking to achieve under 10ms execution time per puzzle.",
    submissionType: "checkbox",
  },
  7: {
    title: "Network Routing Dijkstra & Disjoint Set Union Engine",
    description:
      "Implement Dijkstra's shortest path algorithm with min-heaps and cycle detection using Union-Find (DSU) with path compression and rank.",
    submissionType: "checkbox",
  },
  8: {
    title: "Space-Optimized Dynamic Programming & Intervals Merger",
    description:
      "Solve the 0/1 Knapsack problem with reverse iteration 1D array space optimization and implement non-overlapping interval scheduling.",
    submissionType: "checkbox",
  },
};

export async function getPythonDashboardData(
  client: Client | null,
  userId: string | null
): Promise<PythonDashboardData> {
  const rawStages = manifestJson.stages;

  const allVideos: PythonVideoItem[] = rawStages.flatMap((st) =>
    st.modules.flatMap((m) =>
      m.videos.map((v) => ({
        position: v.position,
        stageNumber: st.stageNumber,
        moduleId: m.id,
        youtubeVideoId: v.youtubeVideoId,
        title: v.title,
        channel: v.channel,
        canonicalUrl: v.canonicalUrl,
        difficulty: v.difficulty as PythonVideoItem["difficulty"],
        importance: v.importance as PythonVideoItem["importance"],
        topicSlug: v.topicSlug,
        estimatedMinutes: v.estimatedMinutes,
        verificationStatus: "verified" as const,
        keyTakeaways: v.keyTakeaways,
      }))
    )
  );

  const exercises = exercisesJson as unknown as PythonExercise[];

  const stages: PythonStageSchedule[] = rawStages.map((st) => {
    const stageNum = st.stageNumber;
    const stageVideos = allVideos.filter((v) => v.stageNumber === stageNum);
    const videoPositions = stageVideos.map((v) => v.position);

    const practicalAssignment =
      STAGE_PRACTICAL_ASSIGNMENTS[stageNum] ?? {
        title: `Stage ${stageNum} Capstone Implementation`,
        description: `Complete all stage ${stageNum} hands-on labs and algorithm implementations.`,
        submissionType: "checkbox" as const,
      };

    const interviewQuestions = PYTHON_STAGE_INTERVIEWS[stageNum] ?? [];

    const modules = st.modules.map((m) => ({
      id: m.id,
      title: m.title,
      summary: m.summary,
      videos: m.videos.map((v) => ({
        position: v.position,
        stageNumber: stageNum,
        moduleId: m.id,
        youtubeVideoId: v.youtubeVideoId,
        title: v.title,
        channel: v.channel,
        canonicalUrl: v.canonicalUrl,
        difficulty: v.difficulty as PythonVideoItem["difficulty"],
        importance: v.importance as PythonVideoItem["importance"],
        topicSlug: v.topicSlug,
        estimatedMinutes: v.estimatedMinutes,
        verificationStatus: "verified" as const,
        keyTakeaways: v.keyTakeaways,
      })),
    }));

    return {
      stageNumber: stageNum,
      id: st.id,
      title: st.title,
      subtitle: st.subtitle,
      description: st.description,
      level: st.level,
      estimatedMinutes: st.estimatedMinutes,
      learningOutcomes: st.learningOutcomes,
      modules,
      videoPositions,
      practicalAssignment,
      interviewQuestions,
    };
  });

  const userVideoProgress: Record<string, UserVideoProgress> = {};
  const userStageProgress: Record<number, UserStageProgress> = {};
  const userExerciseAttempts: Record<string, UserExerciseAttempt> = {};

  let isEnrolled = false;
  let currentStageNumber = 1;

  if (client && userId) {
    try {
      const [enrollmentRes, videoProgRes, exerciseProgRes] = await Promise.all([
        client
          .from("learning_enrollments")
          .select("current_day, status")
          .eq("user_id", userId)
          .maybeSingle(),
        client
          .from("learning_video_progress")
          .select("video_id, status, notes, watched_at")
          .eq("user_id", userId),
        client
          .from("learning_exercise_attempts")
          .select("exercise_id, outcome")
          .eq("user_id", userId),
      ]);

      if (enrollmentRes?.data) {
        isEnrolled = true;
        currentStageNumber = enrollmentRes.data.current_day || 1;
      }

      if (videoProgRes?.data) {
        for (const vp of videoProgRes.data) {
          userVideoProgress[vp.video_id] = {
            watched: vp.status === "completed",
            notes: vp.notes || undefined,
            watchedAt: vp.watched_at || undefined,
          };
        }
      }

      if (exerciseProgRes?.data) {
        for (const ep of exerciseProgRes.data) {
          userExerciseAttempts[ep.exercise_id] = {
            exerciseId: ep.exercise_id,
            status: ep.outcome === "solved" ? "completed" : "attempted",
          };
        }
      }
    } catch (err) {
      console.warn("Could not query user Python progress:", err);
    }
  }

  const course: PythonCourseState = {
    slug: COURSE_SLUG,
    title: manifestJson.title,
    estimatedStages: stages.length,
    estimatedHours: Math.ceil(manifestJson.totalEstimatedMinutes / 60),
    enrolled: isEnrolled,
    currentStage: currentStageNumber,
    status: isEnrolled ? "in_progress" : "not_started",
  };

  const metrics = calculatePythonProgress(
    stages,
    allVideos,
    userVideoProgress,
    userStageProgress,
    userExerciseAttempts,
    exercises
  );

  const topicMastery = calculateTopicMastery(allVideos, userVideoProgress);

  return {
    course,
    stages,
    videos: allVideos,
    exercises,
    metrics,
    topicMastery,
    userVideoProgress,
    userStageProgress,
    userExerciseAttempts,
    activeStageNumber: currentStageNumber,
  };
}
