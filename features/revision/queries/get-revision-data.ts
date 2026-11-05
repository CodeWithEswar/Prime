import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  RevisionDashboardData,
  RevisionProblemItem,
  WorkloadDay,
  RetentionPoint,
  RevisionTopicTag,
} from "../types";
import {
  categorizeRevisionItem,
  formatDueTiming,
  getStageLabel,
} from "@/domain/revision";
import { addDays, format, isSameDay, startOfDay } from "date-fns";

export async function getRevisionDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<RevisionDashboardData> {
  const now = new Date();
  const today = startOfDay(now);

  // 1. Fetch active revision items for this user
  const { data: revisionRows, error: revisionError } = await supabase
    .from("revision_items")
    .select(`
      id,
      entity_id,
      interval_days,
      next_review_at,
      snoozed_until,
      bookmarked,
      status
    `)
    .eq("user_id", userId)
    .eq("entity_type", "problem")
    .eq("status", "active")
    .order("next_review_at", { ascending: true });

  if (revisionError) {
    console.error("Failed to fetch revision items:", revisionError);
  }

  const items: RevisionProblemItem[] = [];
  const problemIds = (revisionRows ?? []).map((r) => r.entity_id);

  if (problemIds.length > 0) {
    // 2. Fetch problems
    const { data: problemRows } = await supabase
      .from("problems")
      .select("id, title, slug, difficulty, source, external_url")
      .in("id", problemIds);

    const problemMap = new Map((problemRows ?? []).map((p) => [p.id, p]));

    // 3. Fetch problem topics
    const { data: topicRelations } = await supabase
      .from("problem_topics")
      .select(`
        problem_id,
        roadmap_topics (
          id,
          name,
          slug
        )
      `)
      .in("problem_id", problemIds);

    const topicMap = new Map<string, RevisionTopicTag[]>();
    for (const rel of topicRelations ?? []) {
      const topic = rel.roadmap_topics as { id: string; name: string; slug: string } | null;
      if (topic) {
        const list = topicMap.get(rel.problem_id) ?? [];
        list.push({ id: topic.id, name: topic.name, slug: topic.slug });
        topicMap.set(rel.problem_id, list);
      }
    }

    // 4. Fetch latest attempt per problem
    const { data: attempts } = await supabase
      .from("problem_attempts")
      .select("problem_id, outcome, time_taken_seconds, attempted_at")
      .eq("user_id", userId)
      .in("problem_id", problemIds)
      .order("attempted_at", { ascending: false });

    const latestAttemptMap = new Map<
      string,
      {
        outcome: "independent" | "hint" | "solution_viewed" | "unsolved";
        timeTakenMinutes: number;
        attemptedAt: string;
      }
    >();

    for (const att of attempts ?? []) {
      if (!latestAttemptMap.has(att.problem_id)) {
        latestAttemptMap.set(att.problem_id, {
          outcome: att.outcome as any,
          timeTakenMinutes: Math.round(att.time_taken_seconds / 60),
          attemptedAt: att.attempted_at,
        });
      }
    }

    // 5. Fetch latest revision review per item
    const itemIds = (revisionRows ?? []).map((r) => r.id);
    const { data: reviews } = await supabase
      .from("revision_attempts")
      .select("revision_item_id, rating, reviewed_at")
      .eq("user_id", userId)
      .in("revision_item_id", itemIds)
      .order("reviewed_at", { ascending: false });

    const latestReviewMap = new Map<
      string,
      {
        rating: "forgot" | "hard" | "okay" | "easy";
        reviewedAt: string;
      }
    >();

    for (const rev of reviews ?? []) {
      if (!latestReviewMap.has(rev.revision_item_id)) {
        latestReviewMap.set(rev.revision_item_id, {
          rating: rev.rating as any,
          reviewedAt: rev.reviewed_at,
        });
      }
    }

    // 6. Assemble RevisionProblemItems
    for (const row of revisionRows ?? []) {
      const prob = problemMap.get(row.entity_id);
      if (!prob) continue;

      const reviewDate = row.snoozed_until || row.next_review_at;
      const category = categorizeRevisionItem(reviewDate, now);
      const timing = formatDueTiming(reviewDate, now);

      items.push({
        id: row.id,
        problemId: prob.id,
        title: prob.title,
        slug: prob.slug,
        difficulty: (prob.difficulty?.toUpperCase() ?? "MEDIUM") as any,
        platform: prob.source,
        platformUrl: prob.external_url,
        topics: topicMap.get(prob.id) ?? [],
        intervalDays: row.interval_days,
        nextReviewAt: row.next_review_at,
        snoozedUntil: row.snoozed_until,
        bookmarked: row.bookmarked ?? false,
        category,
        timingLabel: timing.label,
        isOverdue: timing.isOverdue,
        stageLabel: getStageLabel(row.interval_days),
        lastAttempt: latestAttemptMap.get(prob.id) ?? null,
        lastReview: latestReviewMap.get(row.id) ?? null,
        status: row.status,
      });
    }
  }

  // 7. Calculate Counts
  let overdue = 0;
  let dueToday = 0;
  let upcoming = 0;
  let thisWeek = 0;

  const weekEnd = addDays(today, 7);

  for (const item of items) {
    if (item.category === "overdue") overdue++;
    else if (item.category === "due_today") dueToday++;
    else if (item.category === "upcoming") upcoming++;

    const itemDate = new Date(item.snoozedUntil || item.nextReviewAt);
    if (itemDate <= weekEnd) {
      thisWeek++;
    }
  }

  // 8. Calculate Next 7 Days Workload
  const workload: WorkloadDay[] = [];
  // Align to 7 days: starting from today
  for (let i = 0; i < 7; i++) {
    const day = addDays(today, i);
    const dateStr = format(day, "yyyy-MM-dd");
    const dayName = format(day, "EEE");
    const shortDate = format(day, "MMM d");
    const isToday = i === 0;

    // Count items due on this day (or if today, include overdue + due today)
    const count = items.filter((item) => {
      const itemDay = startOfDay(new Date(item.snoozedUntil || item.nextReviewAt));
      if (isToday) {
        return item.category === "overdue" || item.category === "due_today" || isSameDay(itemDay, day);
      }
      return isSameDay(itemDay, day);
    }).length;

    workload.push({
      date: dateStr,
      dayName,
      shortDate,
      fullLabel: `${dayName} ${shortDate}`,
      count,
      isToday,
    });
  }

  // 9. Calculate Retention Trend
  // Fetch user's revision attempts across history
  const { data: allReviews } = await supabase
    .from("revision_attempts")
    .select("rating, reviewed_at, previous_interval_days")
    .eq("user_id", userId)
    .order("reviewed_at", { ascending: true });

  const scoreMap = { forgot: 1, hard: 2, okay: 3, easy: 4 };

  const retentionTrend: RetentionPoint[] = [
    { milestone: "R1", rating: "hard", score: 2, label: "Hard" },
    { milestone: "R2", rating: "okay", score: 2.9, label: "Okay" },
    { milestone: "R3", rating: "okay", score: 3.1, label: "Okay" },
    { milestone: "R4", rating: "easy", score: 3.8, label: "Easy" },
  ];

  if (allReviews && allReviews.length >= 4) {
    // Group into 4 chronological quartiles
    const chunkSize = Math.ceil(allReviews.length / 4);
    ["R1", "R2", "R3", "R4"].forEach((m, idx) => {
      const chunk = allReviews.slice(idx * chunkSize, (idx + 1) * chunkSize);
      if (chunk.length > 0) {
        const avgScore =
          chunk.reduce((sum, r) => sum + (scoreMap[r.rating as keyof typeof scoreMap] ?? 2), 0) /
          chunk.length;
        const rounded = Math.round(avgScore * 10) / 10;
        let rating: "forgot" | "hard" | "okay" | "easy" = "okay";
        if (rounded <= 1.5) rating = "forgot";
        else if (rounded <= 2.5) rating = "hard";
        else if (rounded <= 3.5) rating = "okay";
        else rating = "easy";

        retentionTrend[idx] = {
          milestone: m,
          rating,
          score: rounded,
          label: rating.charAt(0).toUpperCase() + rating.slice(1),
        };
      }
    });
  }

  // 10. Extract Unique Topics with problem counts
  const topicCounts = new Map<string, { id: string; name: string; count: number }>();
  for (const item of items) {
    for (const t of item.topics) {
      const existing = topicCounts.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        topicCounts.set(t.id, { id: t.id, name: t.name, count: 1 });
      }
    }
  }

  return {
    items,
    counts: {
      overdue,
      dueToday,
      upcoming,
      thisWeek,
    },
    workload,
    retentionTrend,
    topics: Array.from(topicCounts.values()).sort((a, b) => b.count - a.count),
  };
}
