import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  TodaySnapshot,
  TodayTaskItem,
  TodayTaskGroup,
  TodayNextAction,
  ActiveStudySession,
  TomorrowPreview,
  TodayStatus,
  PlanTrajectory,
} from "../types";
import { explainTaskReason } from "../domain/explanations";
import { cleanProblemTitle } from "@/lib/utils";
import { daysBetween, addDays, getDailyCapacity, getDayOfWeekFromDate } from "@/domain/planning/capacity";
import { countsTowardsPlan } from "@/domain/planning/control";
import { DEFAULT_PLANNER_CONFIG } from "@/domain/planning/types";
import { syncUserNotifications } from "@/features/notifications/server/sync-notifications";

/**
 * Derives a calendar day key (YYYY-MM-DD) for a given date and timezone safely.
 */
export function getLocalDateString(date: Date = new Date(), timeZone = "UTC"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Formats a YYYY-MM-DD date string into human-readable components in a given timezone.
 */
export function formatDayDisplay(
  dateStr: string,
  timeZone = "UTC"
): { displayDate: string; dayOfWeek: string } {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0));

    const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "2-digit",
    });
    const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "long",
    });

    const displayDate = monthDayFormatter.format(date).toUpperCase(); // e.g. "NOV 03"
    const dayOfWeek = weekdayFormatter.format(date); // e.g. "Tuesday"

    return { displayDate, dayOfWeek };
  } catch {
    return { displayDate: dateStr, dayOfWeek: "" };
  }
}

/**
 * Authoritative Server Snapshot Aggregator for Today's Command Center
 */
export async function getTodaySnapshot(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: { overrideDate?: string; overrideTimezone?: string } = {}
): Promise<TodaySnapshot> {
  const now = new Date();

  // 1. Resolve User Settings & Timezone
  const [settingsRes, planRes] = await Promise.all([
    supabase
      .from("user_settings")
      .select("timezone, target_role, target_date, start_date, daily_study_minutes, rest_days")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("preparation_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active").order("created_at", { ascending: false }).order("id")
      .limit(1)
      .maybeSingle(),
  ]);

  const timezone =
    options.overrideTimezone ||
    settingsRes.data?.timezone ||
    planRes.data?.timezone ||
    "UTC";

  const todayDate = options.overrideDate || getLocalDateString(now, timezone);
  const { displayDate, dayOfWeek } = formatDayDisplay(todayDate, timezone);

  // Background non-blocking sync of user notifications
  syncUserNotifications(userId).catch((err) => {
    console.warn("[Notifications] Background sync warning on Today page load:", err);
  });

  const activePlan = planRes.data;

  // If no preparation plan exists at all, return empty state
  if (!activePlan) {
    return {
      date: todayDate,
      displayDate,
      dayOfWeek,
      timezone,
      dayNumber: 1,
      totalDays: 90,
      plan: {
        id: null,
        preparationPlanId: null,
        status: "empty",
        trajectory: "on_track",
        isRestDay: false,
      },
      capacity: {
        availableMinutes: 120,
        plannedMinutes: 0,
        completedMinutes: 0,
        remainingMinutes: 0,
        focusedMinutes: 0,
        utilizationRate: 0,
        isExceeded: false,
      },
      progress: {
        completedTaskCount: 0,
        totalTaskCount: 0,
        percentage: 0,
      },
      revision: {
        overdueCount: 0,
        dueTodayCount: 0,
      },
      tasks: [],
      groups: [],
      nextAction: null,
      activeSession: null,
      tomorrowPreview: null,
    };
  }

  const startDate = activePlan.start_date || todayDate;
  const targetDate = activePlan.target_date;
  const totalDays = daysBetween(startDate, targetDate);
  const dayNumber = Math.min(totalDays, Math.max(1, daysBetween(startDate, todayDate)));

  const [{ data: dailyPlan }, { data: rule }, { data: exception }] = await Promise.all([
    supabase.from("daily_plans").select("*").eq("user_id", userId).eq("plan_date", todayDate).maybeSingle(),
    supabase.from("availability_rules").select("*").eq("user_id", userId)
      .eq("day_of_week", getDayOfWeekFromDate(todayDate)).maybeSingle(),
    supabase.from("availability_exceptions").select("*").eq("user_id", userId).eq("exception_date", todayDate).maybeSingle(),
  ]);
  const capacity = getDailyCapacity(todayDate, {
    defaultDailyCapacityMinutes: settingsRes.data?.daily_study_minutes ?? activePlan.daily_capacity_minutes,
    restDays: settingsRes.data?.rest_days ?? [],
    weekdayRules: rule ? [{ dayOfWeek: rule.day_of_week, availableMinutes: rule.available_minutes, isRestDay: rule.is_rest_day }] : [],
    exceptions: exception ? [{ date: exception.exception_date, availableMinutes: exception.available_minutes, isUnavailable: exception.is_unavailable }] : [],
  }, DEFAULT_PLANNER_CONFIG);
  // 3. Query daily tasks for today
  const dailyPlanId = dailyPlan?.id ?? null;
  let taskRows: Database["public"]["Tables"]["daily_tasks"]["Row"][] = [];

  if (dailyPlanId) {
    const { data: tasks } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("daily_plan_id", dailyPlanId)
      .order("sort_order", { ascending: true });

    taskRows = (tasks ?? []).filter(task => countsTowardsPlan(task.status));
  }

  // 4. Query active study session for user
  const { data: activeSessionRow } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sessionRow = activeSessionRow;
  let sessionStatus: "running" | "paused" = "running";

  if (!sessionRow) {
    const inProgressTask = taskRows.find((t) => t.status === "in_progress");
    if (inProgressTask) {
      const { data: pausedSessionRow } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("task_id", inProgressTask.id)
        .order("ended_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pausedSessionRow) {
        sessionRow = pausedSessionRow;
        sessionStatus = "paused";
      }
    }
  }

  // 5. Query active revision counts for context
  const { data: revisionCounts } = await supabase
    .from("revision_items")
    .select("id, next_review_at")
    .eq("user_id", userId)
    .eq("status", "active");

  const overdueCount = (revisionCounts ?? []).filter((r) => r.next_review_at < todayDate).length;
  const dueTodayCount = (revisionCounts ?? []).filter((r) => r.next_review_at.slice(0, 10) === todayDate).length;

  // 6. Gather problem metadata for tasks
  const problemIds = taskRows.map((t) => t.problem_id).filter((id): id is string => Boolean(id));
  const revisionItemIds = taskRows.map((t) => t.revision_item_id).filter((id): id is string => Boolean(id));

  const [problemsRes, revisionItemsRes, attemptsRes, reviewsRes] = await Promise.all([
    problemIds.length > 0
      ? supabase
          .from("problems")
          .select("id, title, slug, difficulty, primary_topic_id")
          .in("id", problemIds)
      : Promise.resolve({ data: [] }),

    revisionItemIds.length > 0
      ? supabase
          .from("revision_items")
          .select("id, interval_days, next_review_at")
          .in("id", revisionItemIds)
      : Promise.resolve({ data: [] }),

    problemIds.length > 0
      ? supabase
          .from("problem_attempts")
          .select("problem_id, outcome, time_taken_seconds, attempted_at")
          .eq("user_id", userId)
          .in("problem_id", problemIds)
          .order("attempted_at", { ascending: false })
      : Promise.resolve({ data: [] }),

    revisionItemIds.length > 0
      ? supabase
          .from("revision_attempts")
          .select("revision_item_id, rating, reviewed_at")
          .in("revision_item_id", revisionItemIds)
          .order("reviewed_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const problemMap = new Map((problemsRes.data ?? []).map((p) => [p.id, p]));
  const revisionMap = new Map((revisionItemsRes.data ?? []).map((r) => [r.id, r]));

  // Index latest attempt per problem
  const latestAttemptMap = new Map<
    string,
    {
      outcome: "hint" | "independent" | "solution_viewed" | "unsolved";
      timeTakenMinutes: number;
      attemptedAt: string;
    }
  >();
  for (const att of attemptsRes.data ?? []) {
    if (!latestAttemptMap.has(att.problem_id)) {
      latestAttemptMap.set(att.problem_id, {
        outcome: att.outcome as "hint" | "independent" | "solution_viewed" | "unsolved",
        timeTakenMinutes: Math.round(att.time_taken_seconds / 60),
        attemptedAt: att.attempted_at,
      });
    }
  }

  // Index latest review per revision item
  const latestReviewMap = new Map<
    string,
    {
      rating: "easy" | "hard" | "forgot" | "okay";
      reviewedAt: string;
    }
  >();
  for (const rev of reviewsRes.data ?? []) {
    if (!latestReviewMap.has(rev.revision_item_id)) {
      latestReviewMap.set(rev.revision_item_id, {
        rating: rev.rating as "easy" | "hard" | "forgot" | "okay",
        reviewedAt: rev.reviewed_at,
      });
    }
  }

  // 7. Map Task Rows into TodayTaskItem
  const activeTaskId = activeSessionRow?.task_id;

  const tasks: TodayTaskItem[] = taskRows.map((row) => {
    const prob = row.problem_id ? problemMap.get(row.problem_id) : null;
    const rev = row.revision_item_id ? revisionMap.get(row.revision_item_id) : null;
    const isOverdue = rev ? rev.next_review_at.slice(0, 10) < todayDate : false;
    const isCurrent = activeTaskId ? row.id === activeTaskId : false;

    const title = cleanProblemTitle(prob?.title || row.title);
    const reasonExplanation = explainTaskReason(
      isOverdue ? "REVISION_OVERDUE" : row.scheduled_reason,
      row.decision_metadata as Record<string, unknown> | null
    );

    return {
      id: row.id,
      dailyPlanId: row.daily_plan_id,
      taskType: (row.task_type as TodayTaskItem["taskType"]) || "custom",
      title,
      status: row.status === "pending" ? "planned" : row.status as TodayTaskItem["status"],
      priority: (row.priority as TodayTaskItem["priority"]) || "p1",
      plannedMinutes: row.planned_minutes || 30,
      completedMinutes: row.completed_minutes || 0,
      actualMinutes: row.completed_minutes || 0,
      sortOrder: row.sort_order || 0,
      isLocked: row.is_locked ?? false,
      scheduledReason: row.scheduled_reason,
      reasonExplanation,
      carriedFromDate: row.original_date,
      carryCount: row.carry_count,
      problemId: row.problem_id,
      problemSlug: prob?.slug ?? null,
      problemDifficulty: (prob?.difficulty as TodayTaskItem["problemDifficulty"]) ?? null,
      revisionItemId: row.revision_item_id,
      revisionIntervalDays: rev?.interval_days ?? null,
      revisionTimingLabel: isOverdue ? "Overdue" : "Due today",
      isOverdue,
      lastAttempt: row.problem_id ? latestAttemptMap.get(row.problem_id) ?? null : null,
      lastReview: row.revision_item_id ? latestReviewMap.get(row.revision_item_id) ?? null : null,
      isCurrent,
    };
  });

  // 8. Determine Next Action
  let nextAction: TodayNextAction | null = null;

  if (activeSessionRow && activeSessionRow.task_id) {
    const runningTask = tasks.find((t) => t.id === activeSessionRow.task_id);
    if (runningTask) {
      runningTask.isCurrent = true;
      nextAction = {
        taskId: runningTask.id,
        taskType: runningTask.taskType,
        title: runningTask.title,
        problemSlug: runningTask.problemSlug,
        difficulty: runningTask.problemDifficulty,
        topicName: runningTask.topicName,
        stageName: runningTask.stageName,
        stageSequence: runningTask.stageSequence,
        targetMinutes: runningTask.plannedMinutes,
        reasonExplanation: runningTask.reasonExplanation,
        actionType: "continue",
        isOverdue: runningTask.isOverdue,
        sessionElapsedSeconds: activeSessionRow.duration_seconds || 0,
      };
    }
  }

  if (!nextAction) {
    // Priority order: Overdue revision -> Due today revision -> Locked -> Carried -> Next Core -> Custom
    const incompleteTasks = tasks.filter((t) => t.status === "planned" || t.status === "in_progress");

    const candidate =
      incompleteTasks.find((t) => t.taskType === "revision" && t.isOverdue) ||
      incompleteTasks.find((t) => t.taskType === "revision") ||
      incompleteTasks.find((t) => t.isLocked) ||
      incompleteTasks.find((t) => (t.carryCount ?? 0) > 0) ||
      incompleteTasks.find((t) => t.taskType === "dsa_problem") ||
      incompleteTasks[0];

    if (candidate) {
      candidate.isCurrent = true;
      nextAction = {
        taskId: candidate.id,
        taskType: candidate.taskType,
        title: candidate.title,
        problemSlug: candidate.problemSlug,
        difficulty: candidate.problemDifficulty,
        topicName: candidate.topicName,
        stageName: candidate.stageName,
        stageSequence: candidate.stageSequence,
        targetMinutes: candidate.plannedMinutes,
        reasonExplanation: candidate.reasonExplanation,
        actionType: candidate.taskType === "revision" ? "review" : "start",
        isOverdue: candidate.isOverdue,
      };
    }
  }

  // 9. Semantic Task Grouping: Revision -> PRIME Core -> Custom
  const groups: TodayTaskGroup[] = [];

  const revisionTasks = tasks.filter((t) => t.taskType === "revision");
  if (revisionTasks.length > 0) {
    const totalMins = revisionTasks.reduce((sum, t) => sum + t.plannedMinutes, 0);
    const completed = revisionTasks.filter((t) => t.status === "completed").length;
    groups.push({
      id: "revision",
      label: "01 / REVISION",
      tasks: revisionTasks,
      totalPlannedMinutes: totalMins,
      completedCount: completed,
      totalCount: revisionTasks.length,
      isUrgent: revisionTasks.some((t) => t.isOverdue),
    });
  }

  const coreTasks = tasks.filter((t) => t.taskType === "dsa_problem");
  if (coreTasks.length > 0) {
    const totalMins = coreTasks.reduce((sum, t) => sum + t.plannedMinutes, 0);
    const completed = coreTasks.filter((t) => t.status === "completed").length;
    const index = groups.length + 1;
    groups.push({
      id: "prime_core",
      label: `0${index} / PRIME CORE`,
      tasks: coreTasks,
      totalPlannedMinutes: totalMins,
      completedCount: completed,
      totalCount: coreTasks.length,
    });
  }

  const customTasks = tasks.filter((t) => t.taskType === "custom");
  if (customTasks.length > 0) {
    const totalMins = customTasks.reduce((sum, t) => sum + t.plannedMinutes, 0);
    const completed = customTasks.filter((t) => t.status === "completed").length;
    const index = groups.length + 1;
    groups.push({
      id: "custom",
      label: `0${index} / CUSTOM`,
      tasks: customTasks,
      totalPlannedMinutes: totalMins,
      completedCount: completed,
      totalCount: customTasks.length,
    });
  }

  // 10. Capacity & Workload Metrics
  const availableMinutes = capacity.availableMinutes;
  const plannedMinutes = tasks.reduce((sum, t) => sum + t.plannedMinutes, 0);
  const completedMinutes = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.plannedMinutes, 0);
  const remainingMinutes = Math.max(0, plannedMinutes - completedMinutes);
  const focusedMinutes = tasks.reduce((sum, t) => sum + t.actualMinutes, 0);
  const utilizationRate = availableMinutes > 0 ? Math.round((plannedMinutes / availableMinutes) * 100) : 0;
  const isExceeded = plannedMinutes > availableMinutes;

  // 11. Progress & Status
  const completedTaskCount = tasks.filter((t) => t.status === "completed").length;
  const totalTaskCount = tasks.length;
  const progressPercentage = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;

  const isRestDay = capacity.isRestDay;
  let status: TodayStatus = "not_started";
  if (isRestDay && !totalTaskCount) {
    status = "rest_day";
  } else if (totalTaskCount > 0 && completedTaskCount === totalTaskCount) {
    status = "complete";
  } else if (completedTaskCount > 0 || sessionRow !== null) {
    status = "in_progress";
  }

  const trajectory = (activePlan.feasibility_status as PlanTrajectory) || "on_track";

  // 12. Active Session Data
  let activeSession: ActiveStudySession | null = null;
  if (sessionRow) {
    const task = tasks.find((t) => t.id === sessionRow.task_id);
    activeSession = {
      id: sessionRow.id,
      taskId: sessionRow.task_id ?? "",
      taskTitle: task?.title || "Focus Session",
      problemSlug: task?.problemSlug,
      startedAt: sessionRow.started_at,
      durationSeconds: sessionRow.duration_seconds || 0,
      status: sessionStatus,
    };
  }

  // 13. Tomorrow Preview
  const tomorrowDate = addDays(todayDate, 1);
  const { displayDate: tomDisplay, dayOfWeek: tomWeekday } = formatDayDisplay(tomorrowDate, timezone);

  const { data: tomPlan } = await supabase
    .from("daily_plans")
    .select("id, planned_minutes")
    .eq("user_id", userId)
    .eq("plan_date", tomorrowDate)
    .maybeSingle();

  let tomorrowPreview: TomorrowPreview | null = null;
  if (tomPlan) {
    const { data: tomTasks } = await supabase
      .from("daily_tasks")
      .select("task_type, planned_minutes")
      .eq("user_id", userId)
      .eq("daily_plan_id", tomPlan.id);

    const tomTaskList = tomTasks ?? [];
    const revCount = tomTaskList.filter((t) => t.task_type === "revision").length;
    const coreCount = tomTaskList.filter((t) => t.task_type === "dsa_problem").length;
    const tomMinutes = tomTaskList.reduce((sum, t) => sum + (t.planned_minutes || 0), 0);

    tomorrowPreview = {
      date: tomorrowDate,
      dayOfWeek: tomWeekday,
      plannedMinutes: tomMinutes || tomPlan.planned_minutes,
      taskCount: tomTaskList.length,
      revisionCount: revCount,
      coreCount,
    };
  }

  return {
    date: todayDate,
    displayDate,
    dayOfWeek,
    timezone,
    dayNumber,
    totalDays,
    plan: {
      id: dailyPlanId,
      preparationPlanId: activePlan.id,
      status,
      trajectory,
      isRestDay,
    },
    capacity: {
      availableMinutes,
      plannedMinutes,
      completedMinutes,
      remainingMinutes,
      focusedMinutes,
      utilizationRate,
      isExceeded,
    },
    progress: {
      completedTaskCount,
      totalTaskCount,
      percentage: progressPercentage,
    },
    revision: {
      overdueCount,
      dueTodayCount,
    },
    tasks,
    groups,
    nextAction,
    activeSession,
    tomorrowPreview,
  };
}

