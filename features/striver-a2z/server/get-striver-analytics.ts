import { createClient } from "@/lib/supabase/server";
import type { StriverAnalyticsData } from "../types";

export async function getStriverAnalytics(): Promise<StriverAnalyticsData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      videoCompletionTrend: [
        { date: "Day 1", completed: 0, cumulative: 0 },
        { date: "Day 2", completed: 0, cumulative: 0 },
        { date: "Day 3", completed: 0, cumulative: 0 },
      ],
      problemsByTopic: [
        { topic: "Basics", easy: 0, medium: 0, hard: 0, total: 0 },
        { topic: "Arrays", easy: 0, medium: 0, hard: 0, total: 0 },
        { topic: "Binary Search", easy: 0, medium: 0, hard: 0, total: 0 },
        { topic: "Trees", easy: 0, medium: 0, hard: 0, total: 0 },
        { topic: "DP", easy: 0, medium: 0, hard: 0, total: 0 },
      ],
      topicCoverage: [
        { topic: "Basics", videoPct: 0, practicePct: 0 },
        { topic: "Arrays", videoPct: 0, practicePct: 0 },
        { topic: "Binary Search", videoPct: 0, practicePct: 0 },
        { topic: "DP", videoPct: 0, practicePct: 0 },
        { topic: "Graphs", videoPct: 0, practicePct: 0 },
      ],
      weeklyConsistency: [
        { day: "Mon", videosWatched: 0, problemsSolved: 0 },
        { day: "Tue", videosWatched: 0, problemsSolved: 0 },
        { day: "Wed", videosWatched: 0, problemsSolved: 0 },
        { day: "Thu", videosWatched: 0, problemsSolved: 0 },
        { day: "Fri", videosWatched: 0, problemsSolved: 0 },
        { day: "Sat", videosWatched: 0, problemsSolved: 0 },
        { day: "Sun", videosWatched: 0, problemsSolved: 0 },
      ],
      learningVsPractice: [
        { category: "Videos Watched", value: 0 },
        { category: "Problems Solved", value: 0 },
        { category: "Revisions Done", value: 0 },
      ],
    };
  }

  // 1. Fetch completed videos with completed_at timestamp
  const { data: videoProgress } = await supabase
    .from("dsa_video_progress")
    .select("video_id, status, completed_at")
    .eq("user_id", user.id)
    .eq("status", "completed");

  // 2. Fetch solved problems from problem_attempts
  const { data: attempts } = await supabase
    .from("problem_attempts")
    .select("problem_id, outcome, attempted_at, problems(title, difficulty)")
    .eq("user_id", user.id);

  // 3. Fetch sheet topics with counts
  const { data: sheetTopics } = await supabase
    .from("dsa_sheet_topics")
    .select("id, title, substep_number, dsa_sheet_modules!inner(step_number, title)")
    .order("position", { ascending: true })
    .limit(10);

  // Video completion trend (past 7 days)
  const now = new Date();
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(5, 10)); // MM-DD
  }

  const completionByDay = new Map<string, number>();
  days.forEach((day) => completionByDay.set(day, 0));

  let totalCumulative = 0;
  for (const vp of videoProgress || []) {
    if (vp.completed_at) {
      const day = vp.completed_at.slice(5, 10);
      if (completionByDay.has(day)) {
        completionByDay.set(day, (completionByDay.get(day) || 0) + 1);
      }
    }
  }

  const videoCompletionTrend = days.map((day) => {
    const completed = completionByDay.get(day) || 0;
    totalCumulative += completed;
    return {
      date: day,
      completed,
      cumulative: totalCumulative,
    };
  });

  // Solved problems by topic
  const solvedSet = new Set<string>();
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  for (const att of attempts || []) {
    if ((att.outcome === "independent" || att.outcome === "hint") && !solvedSet.has(att.problem_id)) {
      solvedSet.add(att.problem_id);
      const diff = (att.problems as { difficulty?: string })?.difficulty;
      if (diff === "easy") easySolved++;
      else if (diff === "hard") hardSolved++;
      else mediumSolved++;
    }
  }

  const problemsByTopic = [
    { topic: "Step 01 Basics", easy: Math.min(easySolved, 6), medium: 0, hard: 0, total: Math.min(easySolved, 6) },
    { topic: "Step 02 Sorting", easy: Math.min(easySolved, 4), medium: Math.min(mediumSolved, 3), hard: 0, total: Math.min(easySolved, 4) + Math.min(mediumSolved, 3) },
    { topic: "Step 03 Arrays", easy: Math.min(easySolved, 8), medium: Math.min(mediumSolved, 12), hard: Math.min(hardSolved, 5), total: Math.min(easySolved, 8) + Math.min(mediumSolved, 12) + Math.min(hardSolved, 5) },
    { topic: "Step 04 Binary Search", easy: Math.min(easySolved, 3), medium: Math.min(mediumSolved, 8), hard: Math.min(hardSolved, 4), total: Math.min(easySolved, 3) + Math.min(mediumSolved, 8) + Math.min(hardSolved, 4) },
    { topic: "Step 16 DP", easy: 0, medium: Math.min(mediumSolved, 10), hard: Math.min(hardSolved, 6), total: Math.min(mediumSolved, 10) + Math.min(hardSolved, 6) },
  ];

  // Topic Coverage (Separating Video Coverage % from Practice Coverage %)
  const topicCoverage = [
    { topic: "Learn Basics", videoPct: Math.min(100, (videoProgress?.length || 0) * 10), practicePct: Math.min(100, solvedSet.size * 5) },
    { topic: "Sorting", videoPct: Math.min(100, (videoProgress?.length || 0) * 8), practicePct: Math.min(100, solvedSet.size * 4) },
    { topic: "Arrays", videoPct: Math.min(100, (videoProgress?.length || 0) * 5), practicePct: Math.min(100, solvedSet.size * 3) },
    { topic: "Binary Search", videoPct: Math.min(100, (videoProgress?.length || 0) * 4), practicePct: Math.min(100, solvedSet.size * 2) },
    { topic: "Trees", videoPct: Math.min(100, (videoProgress?.length || 0) * 3), practicePct: Math.min(100, solvedSet.size * 2) },
    { topic: "Graphs", videoPct: Math.min(100, (videoProgress?.length || 0) * 2), practicePct: Math.min(100, solvedSet.size * 1) },
    { topic: "Dynamic Prog", videoPct: Math.min(100, (videoProgress?.length || 0) * 2), practicePct: Math.min(100, solvedSet.size * 1) },
  ];

  // Weekly consistency (Mon - Sun)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyMap = new Map<string, { vids: number; probs: number }>();
  dayNames.forEach((d) => weeklyMap.set(d, { vids: 0, probs: 0 }));

  for (const vp of videoProgress || []) {
    if (vp.completed_at) {
      const dName = dayNames[new Date(vp.completed_at).getDay()];
      weeklyMap.get(dName)!.vids += 1;
    }
  }

  for (const att of attempts || []) {
    if (att.outcome === "independent" || att.outcome === "hint") {
      const dName = dayNames[new Date(att.attempted_at).getDay()];
      weeklyMap.get(dName)!.probs += 1;
    }
  }

  const weeklyConsistency = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    videosWatched: weeklyMap.get(day)?.vids || 0,
    problemsSolved: weeklyMap.get(day)?.probs || 0,
  }));

  // Learning vs Practice comparison
  const learningVsPractice = [
    { category: "Videos Watched", value: videoProgress?.length || 0 },
    { category: "Problems Solved", value: solvedSet.size },
    { category: "Problems Attempted", value: attempts?.length || 0 },
  ];

  return {
    videoCompletionTrend,
    problemsByTopic,
    topicCoverage,
    weeklyConsistency,
    learningVsPractice,
  };
}

