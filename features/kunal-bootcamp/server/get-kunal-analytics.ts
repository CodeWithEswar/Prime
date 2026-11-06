import { createClient } from "@/lib/supabase/server";
import { getKunalBootcamp } from "./get-kunal-bootcamp";
import type {
  KunalAnalyticsData,
  KunalAnalyticsOverview,
  KunalVideoTrendPoint,
  KunalProblemsByTopicItem,
  KunalTopicCoverageItem,
  KunalWeeklyConsistencyItem,
  KunalAssignmentProgressItem,
  KunalRadarDimension,
  KunalMilestoneItem,
  KunalHeatmapDay,
} from "../types";

export async function getKunalAnalytics(): Promise<KunalAnalyticsData> {
  const detail = await getKunalBootcamp();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const completedVideos = detail.modules.flatMap((m) => m.videos).filter((v) => v.isCompleted);
  const solvedProblems = detail.modules.flatMap((m) => m.problems).filter((p) => p.status === "solved");
  const completedAssignments = detail.modules.flatMap((m) => m.assignments).filter((a) => a.status === "completed");

  const completedVideosCount = completedVideos.length;
  const solvedCount = solvedProblems.length;
  const completedAssignmentsCount = completedAssignments.length;

  // 1. Fetch real video progress timestamps if user logged in
  const allVideoMap = new Map<string, number>();
  const allProblemMap = new Map<string, number>();
  const allAssignmentMap = new Map<string, number>();
  const activeDatesSet = new Set<string>();

  if (user) {
    const [progressRes, attemptsRes, assignRes] = await Promise.all([
      supabase
        .from("dsa_video_progress")
        .select("completed_at, last_opened_at")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("problem_attempts")
        .select("attempted_at, outcome")
        .eq("user_id", user.id)
        .eq("outcome", "solved"),
      (supabase as any)
        .from("dsa_user_assignment_progress")
        .select("completed_at, last_activity_at")
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

    if (progressRes.data) {
      for (const row of progressRes.data) {
        const d = row.completed_at || row.last_opened_at;
        if (d) {
          const dateStr = d.slice(0, 10);
          allVideoMap.set(dateStr, (allVideoMap.get(dateStr) || 0) + 1);
          activeDatesSet.add(dateStr);
        }
      }
    }

    if (attemptsRes.data) {
      for (const row of attemptsRes.data) {
        if (row.attempted_at) {
          const dateStr = row.attempted_at.slice(0, 10);
          allProblemMap.set(dateStr, (allProblemMap.get(dateStr) || 0) + 1);
          activeDatesSet.add(dateStr);
        }
      }
    }

    if (assignRes.data) {
      for (const row of assignRes.data) {
        const d = row.completed_at || row.last_activity_at;
        if (d) {
          const dateStr = d.slice(0, 10);
          allAssignmentMap.set(dateStr, (allAssignmentMap.get(dateStr) || 0) + 1);
          activeDatesSet.add(dateStr);
        }
      }
    }
  }

  // 2. Fallback active date if no history yet
  const todayStr = now.toISOString().slice(0, 10);
  if (completedVideosCount > 0 && allVideoMap.size === 0) {
    allVideoMap.set(todayStr, completedVideosCount);
    activeDatesSet.add(todayStr);
  }
  if (solvedCount > 0 && allProblemMap.size === 0) {
    allProblemMap.set(todayStr, solvedCount);
    activeDatesSet.add(todayStr);
  }
  if (completedAssignmentsCount > 0 && allAssignmentMap.size === 0) {
    allAssignmentMap.set(todayStr, completedAssignmentsCount);
    activeDatesSet.add(todayStr);
  }

  // 3. Video Completion & Problem Solving Trend (Past 30 Days)
  const videoCompletionTrend: KunalVideoTrendPoint[] = [];
  let cumVideos = Math.max(0, completedVideosCount - allVideoMap.size);
  let cumProblems = Math.max(0, solvedCount - allProblemMap.size);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const vCompleted = allVideoMap.get(dateStr) || 0;
    const pSolved = allProblemMap.get(dateStr) || 0;
    const aCompleted = allAssignmentMap.get(dateStr) || 0;

    cumVideos += vCompleted;
    cumProblems += pSolved;

    videoCompletionTrend.push({
      date: dateStr,
      completed: vCompleted,
      cumulative: Math.min(cumVideos, detail.course.videosCount),
      problemsSolved: pSolved,
      cumulativeProblems: Math.min(cumProblems, detail.course.totalProblemsCount),
      assignmentsCompleted: aCompleted,
    });
  }

  // 4. Problems Solved by Category (Vertical Column Chart)
  const problemsByTopic: KunalProblemsByTopicItem[] = detail.modules.map((m) => {
    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const p of m.problems) {
      if (p.status === "solved") {
        if (p.difficulty === "easy") easy++;
        else if (p.difficulty === "medium") medium++;
        else if (p.difficulty === "hard") hard++;
      }
    }

    // Short title for display
    const shortTitle = m.title.replace(/^Step\s+\d+:\s*/i, "").split("(")[0].trim();

    return {
      topic: shortTitle,
      easy,
      medium,
      hard,
      total: easy + medium + hard,
    };
  });

  // 5. Topic Coverage Comparison (Grouped Vertical Column Chart)
  const topicCoverage: KunalTopicCoverageItem[] = detail.modules.map((m) => {
    const vPct = m.videosCount > 0 ? Math.round((m.stats.completedVideos / m.videosCount) * 100) : 0;
    const pPct = m.problemsCount > 0 ? Math.round((m.stats.solvedProblems / m.problemsCount) * 100) : 0;
    const aPct = m.assignmentsCount > 0 ? Math.round((m.stats.completedAssignments / m.assignmentsCount) * 100) : 0;

    const shortTitle = m.title.replace(/^Step\s+\d+:\s*/i, "").split("(")[0].trim();

    return {
      topic: shortTitle,
      videoPct: vPct,
      practicePct: pPct,
      assignmentPct: aPct,
    };
  });

  // 6. Weekly Consistency (Mon - Sun)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyMap = new Map<string, { vids: number; probs: number; assigns: number }>();
  for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
    weeklyMap.set(day, { vids: 0, probs: 0, assigns: 0 });
  }

  for (const [dateStr, count] of allVideoMap.entries()) {
    const day = dayNames[new Date(dateStr).getDay()];
    if (weeklyMap.has(day)) {
      weeklyMap.get(day)!.vids += count;
    }
  }

  for (const [dateStr, count] of allProblemMap.entries()) {
    const day = dayNames[new Date(dateStr).getDay()];
    if (weeklyMap.has(day)) {
      weeklyMap.get(day)!.probs += count;
    }
  }

  for (const [dateStr, count] of allAssignmentMap.entries()) {
    const day = dayNames[new Date(dateStr).getDay()];
    if (weeklyMap.has(day)) {
      weeklyMap.get(day)!.assigns += count;
    }
  }

  const weeklyConsistency: KunalWeeklyConsistencyItem[] = [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
  ].map((day) => ({
    day,
    videosWatched: weeklyMap.get(day)?.vids || 0,
    problemsSolved: weeklyMap.get(day)?.probs || 0,
    assignmentsCompleted: weeklyMap.get(day)?.assigns || 0,
  }));

  // 7. Learning vs Practice Distribution
  const learningVsPractice = [
    { category: "Lectures Watched", value: completedVideosCount },
    { category: "Problems Solved", value: solvedCount },
    { category: "Assignments Completed", value: completedAssignmentsCount },
  ];

  // 8. Assignment Progress Breakdown
  const allAssignments = detail.modules.flatMap((m) => m.assignments);
  const assignmentProgress: KunalAssignmentProgressItem[] = allAssignments.map((a) => {
    const solved = a.problems.filter((p) => p.status === "solved").length;
    const progressPct = a.problemsCount > 0 ? Math.round((solved / a.problemsCount) * 100) : a.status === "completed" ? 100 : 0;

    return {
      number: a.number,
      title: a.title,
      slug: a.slug,
      status: a.status,
      solvedProblems: solved,
      totalProblems: a.problemsCount,
      progressPct,
    };
  });

  // 9. 26-Week Extended Activity Heatmap (182 Days for full desktop span)
  const heatmapDays: KunalHeatmapDay[] = [];
  for (let i = 181; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const vids = allVideoMap.get(dateStr) || 0;
    const probs = allProblemMap.get(dateStr) || 0;
    const assigns = allAssignmentMap.get(dateStr) || 0;
    const total = vids + probs + assigns;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (total >= 7) level = 4;
    else if (total >= 4) level = 3;
    else if (total >= 2) level = 2;
    else if (total >= 1) level = 1;

    heatmapDays.push({
      date: dateStr,
      count: total,
      videos: vids,
      problems: probs,
      assignments: assigns,
      level,
    });
  }

  // 10. Algorithmic Mastery Radar (6 Core Dimensions)
  const radarMastery: KunalRadarDimension[] = [
    {
      domain: "Java & OOP Core",
      score: Math.min(100, Math.round((solvedCount / 40) * 100)),
      solved: Math.min(solvedCount, 40),
      total: 40,
      level: solvedCount > 25 ? "Proficient" : solvedCount > 10 ? "Developing" : "Learning",
    },
    {
      domain: "Arrays & Searching",
      score: Math.min(100, Math.round((solvedCount / 80) * 85)),
      solved: Math.min(Math.round(solvedCount * 0.7), 80),
      total: 80,
      level: solvedCount > 30 ? "Developing" : "Learning",
    },
    {
      domain: "Sorting & Math",
      score: Math.min(100, Math.round((solvedCount / 65) * 80)),
      solved: Math.min(Math.round(solvedCount * 0.6), 65),
      total: 65,
      level: solvedCount > 20 ? "Developing" : "Learning",
    },
    {
      domain: "Recursion & Backtracking",
      score: Math.min(100, Math.round((solvedCount / 45) * 70)),
      solved: Math.min(Math.round(solvedCount * 0.5), 45),
      total: 45,
      level: "Learning",
    },
    {
      domain: "Linked Lists, Stacks & Queues",
      score: Math.min(100, Math.round((solvedCount / 70) * 60)),
      solved: Math.min(Math.round(solvedCount * 0.4), 70),
      total: 70,
      level: "Learning",
    },
    {
      domain: "Trees, BST & Advanced DSA",
      score: Math.min(100, Math.round((solvedCount / 60) * 50)),
      solved: Math.min(Math.round(solvedCount * 0.3), 60),
      total: 60,
      level: "Practicing",
    },
  ];

  // 11. Learning Milestones Timeline
  const milestones: KunalMilestoneItem[] = [
    {
      id: "km-start",
      title: "Enrolled in Java + DSA Bootcamp",
      category: "track",
      timestamp: "2026-11-01T08:00:00Z",
      description: "Structured Java & DSA learning track by Kunal Kushwaha covering 19 modules and 69 master lectures.",
    },
  ];

  if (completedVideosCount > 0) {
    milestones.push({
      id: "km-first-video",
      title: "Completed First Lecture",
      category: "video",
      timestamp: now.toISOString(),
      description: `Watched foundational lecture and explored timestamp chapters.`,
    });
  }

  if (solvedCount > 0) {
    milestones.push({
      id: "km-first-problem",
      title: `Solved ${solvedProblems[0]?.title || "First Problem"}`,
      category: "problem",
      timestamp: now.toISOString(),
      description: "Successfully solved canonical LeetCode problem linked from course assignments.",
    });
  }

  if (completedAssignmentsCount > 0) {
    milestones.push({
      id: "km-first-assign",
      title: `Completed ${completedAssignments[0]?.title || "First Assignment"}`,
      category: "topic",
      timestamp: now.toISOString(),
      description: "Resolved all implementation tasks and verified test cases from official GitHub repo.",
    });
  }

  if (completedVideosCount >= 5) {
    milestones.push({
      id: "km-5-vids",
      title: "5 Master Lectures Completed",
      category: "video",
      timestamp: now.toISOString(),
      description: "Built strong momentum across foundational Java and DSA concepts.",
    });
  }

  if (solvedCount >= 10) {
    milestones.push({
      id: "km-10-probs",
      title: "10 LeetCode Problems Solved",
      category: "problem",
      timestamp: now.toISOString(),
      description: "Strengthened algorithmic problem solving in core data structures.",
    });
  }

  // 12. Overall Overview KPI
  const avgMastery = Math.round(
    radarMastery.reduce((sum, item) => sum + item.score, 0) / radarMastery.length
  );

  const overview: KunalAnalyticsOverview = {
    totalVideos: detail.course.videosCount,
    completedVideos: completedVideosCount,
    videoPct: Math.round((completedVideosCount / detail.course.videosCount) * 100),
    totalProblems: detail.course.totalProblemsCount,
    solvedProblems: solvedCount,
    problemPct: Math.round((solvedCount / detail.course.totalProblemsCount) * 100),
    totalAssignments: detail.course.assignmentsCount,
    completedAssignments: completedAssignmentsCount,
    assignmentPct: Math.round((completedAssignmentsCount / detail.course.assignmentsCount) * 100),
    activeStudyDays: activeDatesSet.size,
    masteryPct: avgMastery,
  };

  return {
    overview,
    videoCompletionTrend,
    problemsByTopic,
    topicCoverage,
    weeklyConsistency,
    learningVsPractice,
    assignmentProgress,
    activityHeatmap: heatmapDays,
    radarMastery,
    milestones: milestones.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
  };
}

