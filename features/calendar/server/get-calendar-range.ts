/**
 * PRIME Preparation Calendar — Authoritative Server Data Aggregator
 * Single bounded range query aggregating daily plans, tasks, capacity rules,
 * exceptions, and revision signals into the temporal canvas projection.
 * Zero client-authority, zero N+1 queries.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getLocalDateString, formatDayDisplay } from "@/features/today/server/get-today-snapshot";
import { addDays, parseDateParts, getDayOfWeekFromDate, getDailyCapacity } from "@/domain/planning/capacity";
import { countsTowardsPlan } from "@/domain/planning/control";
import { DEFAULT_PLANNER_CONFIG } from "@/domain/planning/types";
import { cleanProblemTitle } from "@/lib/utils";
import { explainTaskReason } from "@/features/today/domain/explanations";
import {
  deriveCalendarAttention,
  buildMonthMatrix,
  groupRangeByWeek,
  calculateMonthSummary,
  detectTaskSubject,
} from "../domain/projection";
import type {
  CalendarRangeSnapshot,
  CalendarDayProjection,
  CalendarDayDetail,
  CalendarTaskItem,
  CalendarViewMode,
  CalendarPlanHeader,
  CalendarSubject,
} from "../types";

export interface GetCalendarRangeOptions {
  month?: string; // YYYY-MM
  date?: string; // YYYY-MM-DD
  view?: CalendarViewMode;
  timezone?: string;
}

export async function getCalendarRange(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: GetCalendarRangeOptions = {}
): Promise<CalendarRangeSnapshot> {
  const now = new Date();

  // 1. Fetch user settings and active plan in parallel
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
    options.timezone ||
    settingsRes.data?.timezone ||
    planRes.data?.timezone ||
    "UTC";

  const todayDate = getLocalDateString(now, timezone);

  // Month Key: options.month or selected date's month or today's month
  const targetDateInput = options.date || todayDate;
  const currentMonthKey =
    options.month || targetDateInput.slice(0, 7) || todayDate.slice(0, 7);

  const selectedDate = options.date || (targetDateInput.startsWith(currentMonthKey) ? targetDateInput : `${currentMonthKey}-01`);

  const { year, month } = parseDateParts(`${currentMonthKey}-01`);
  const actualMonth = month + 1; // 1 - 12

  // Determine query range with 10 days of adjacent padding for smooth month transitions
  const firstDayOfMonth = `${currentMonthKey}-01`;
  const daysInMonth = new Date(Date.UTC(year, actualMonth, 0)).getUTCDate();
  const lastDayOfMonth = `${currentMonthKey}-${String(daysInMonth).padStart(2, "0")}`;

  const rangeStart = addDays(firstDayOfMonth, -10);
  const rangeEnd = addDays(lastDayOfMonth, 10);

  // 2. Fetch daily_plans, rules, exceptions, and revisions in bounded range
  const [dailyPlansRes, rulesRes, exceptionsRes, revisionItemsRes] = await Promise.all([
    supabase
      .from("daily_plans")
      .select("id, plan_date, available_minutes, planned_minutes, completed_minutes, is_rest_day, status")
      .eq("user_id", userId)
      .gte("plan_date", rangeStart)
      .lte("plan_date", rangeEnd),

    supabase
      .from("availability_rules")
      .select("day_of_week, available_minutes, is_rest_day")
      .eq("user_id", userId),

    supabase
      .from("availability_exceptions")
      .select("exception_date, available_minutes, is_unavailable, reason")
      .eq("user_id", userId)
      .gte("exception_date", rangeStart)
      .lte("exception_date", rangeEnd),

    supabase
      .from("revision_items")
      .select("id, entity_id, interval_days, next_review_at, status")
      .eq("user_id", userId),
  ]);

  const dailyPlans = dailyPlansRes.data ?? [];
  const rules = rulesRes.data ?? [];
  const exceptions = exceptionsRes.data ?? [];
  const revisionItems = revisionItemsRes.data ?? [];

  const dailyPlanIds = dailyPlans.map((dp) => dp.id);

  // 3. Fetch daily_tasks for daily plans in range
  let tasks: any[] = [];
  if (dailyPlanIds.length > 0) {
    const tasksRes = await supabase
      .from("daily_tasks")
      .select("id, daily_plan_id, task_type, problem_id, curriculum_item_id, revision_item_id, title, planned_minutes, completed_minutes, status, priority, sort_order, source, scheduled_reason, is_locked, carried_from_task_id, carry_count, original_date")
      .eq("user_id", userId)
      .in("daily_plan_id", dailyPlanIds);

    tasks = (tasksRes.data ?? []).filter(task => countsTowardsPlan(task.status));
  }

  // 4. Fetch problem & stage metadata if tasks exist
  const problemIds = Array.from(new Set(tasks.map((t) => t.problem_id).filter(Boolean)));
  const [problemsRes, topicsRes, stagesRes] = await Promise.all([
    problemIds.length > 0
      ? supabase
          .from("problems")
          .select("id, title, slug, difficulty, primary_topic_id")
          .in("id", problemIds)
      : Promise.resolve({ data: [] }),
    supabase.from("roadmap_topics").select("id, name, slug"),
    supabase.from("curriculum_stages").select("id, name, sequence"),
  ]);

  const problemMap = new Map((problemsRes.data ?? []).map((p) => [p.id, p]));
  const topicMap = new Map((topicsRes.data ?? []).map((t) => [t.id, t]));
  const stageMap = new Map((stagesRes.data ?? []).map((s) => [s.id, s]));

  // Index tasks by daily_plan_id
  const tasksByDailyPlanId = new Map<string, any[]>();
  for (const t of tasks) {
    const list = tasksByDailyPlanId.get(t.daily_plan_id) || [];
    list.push(t);
    tasksByDailyPlanId.set(t.daily_plan_id, list);
  }

  // Index daily plans by plan_date
  const dailyPlansByDate = new Map<string, any>();
  for (const dp of dailyPlans) {
    dailyPlansByDate.set(dp.plan_date, dp);
  }

  const capacityRules = {
    defaultDailyCapacityMinutes: settingsRes.data?.daily_study_minutes ?? planRes.data?.daily_capacity_minutes ?? 90,
    restDays: settingsRes.data?.rest_days ?? [],
    weekdayRules: rules.map(rule => ({ dayOfWeek: rule.day_of_week, availableMinutes: rule.available_minutes, isRestDay: rule.is_rest_day })),
    exceptions: exceptions.map(ex => ({ date: ex.exception_date, availableMinutes: ex.available_minutes, isUnavailable: ex.is_unavailable })),
  };
  // Index revisions due by next_review_at date
  const revisionsByDate = new Map<string, { count: number; overdueCount: number }>();
  for (const rev of revisionItems) {
    if (rev.next_review_at) {
      const revDate = rev.next_review_at.slice(0, 10);
      const current = revisionsByDate.get(revDate) || { count: 0, overdueCount: 0 };
      current.count++;
      if (revDate < todayDate) {
        current.overdueCount++;
      }
      revisionsByDate.set(revDate, current);
    }
  }

  // Plan header metadata
  const planData = planRes.data;
  const startDate = planData?.start_date || settingsRes.data?.start_date || todayDate;
  const targetDate = planData?.target_date || settingsRes.data?.target_date || addDays(todayDate, 90);
  const defaultDailyCapacity = planData?.daily_capacity_minutes || settingsRes.data?.daily_study_minutes || 180;
  const trajectory = planData?.feasibility_status || "on_track";

  const planHeader: CalendarPlanHeader | null = planData
    ? {
        id: planData.id,
        targetRole: planData.target_role,
        startDate: planData.start_date,
        targetDate: planData.target_date,
        timezone: planData.timezone,
        trajectory: planData.feasibility_status,
        feasibilityStatus: planData.feasibility_status,
      }
    : null;

  // 5. Construct day projections map
  const daysMap = new Map<string, CalendarDayProjection>();
  const allDatesInRange: string[] = [];

  let cursor = rangeStart;
  while (cursor <= rangeEnd) {
    allDatesInRange.push(cursor);
    cursor = addDays(cursor, 1);
  }

  for (const dateStr of allDatesInRange) {
    const dayOfWeek = getDayOfWeekFromDate(dateStr);
    const { day: dayNumber } = parseDateParts(dateStr);
    const dp = dailyPlansByDate.get(dateStr);
    const dayTasks = dp ? tasksByDailyPlanId.get(dp.id) || [] : [];

    const capacity = getDailyCapacity(dateStr, capacityRules, DEFAULT_PLANNER_CONFIG);
    const availableMinutes = dateStr < todayDate ? dp?.available_minutes ?? capacity.availableMinutes : capacity.availableMinutes;
    const isRestDay = dateStr < todayDate ? dp?.is_rest_day ?? capacity.isRestDay : capacity.isRestDay;

    const plannedMinutes = dayTasks.reduce((sum, task) => sum + task.planned_minutes, 0);
    const completedMinutes = dp?.completed_minutes ?? 0;
    const taskCount = dayTasks.length;
    let completedTaskCount = 0;
    let carriedTaskCount = 0;
    let revisionCount = 0;
    const subjectsSet = new Set<CalendarSubject>();

    for (const t of dayTasks) {
      if (t.status === "completed") {
        completedTaskCount++;
      }
      if (t.carry_count > 0 || t.carried_from_task_id) {
        carriedTaskCount++;
      }
      if (t.task_type === "revision") {
        revisionCount++;
      }
      const subj = detectTaskSubject(t);
      if (subj) subjectsSet.add(subj);
    }

    const subjects = Array.from(subjectsSet);

    // If day has no daily_plan records yet, fall back to revision obligations
    const revSummary = revisionsByDate.get(dateStr);
    if (!dp && revSummary) {
      revisionCount = revSummary.count;


    }

    const overdueRevisionCount = revSummary ? revSummary.overdueCount : 0;

    const isToday = dateStr === todayDate;
    const isPlanStart = dateStr === startDate;
    const isTargetDate = dateStr === targetDate;

    const attention = deriveCalendarAttention({
      plannedMinutes,
      availableMinutes,
      overdueRevisionCount,
      isRestDay,
      trajectory,
    });

    daysMap.set(dateStr, {
      date: dateStr,
      dayOfWeek,
      dayNumber,
      isToday,
      isSelected: dateStr === selectedDate,
      isCurrentMonth: dateStr.startsWith(currentMonthKey),
      isPlanStart,
      isTargetDate,
      isRestDay,
      availableMinutes,
      plannedMinutes,
      completedMinutes,
      taskCount,
      completedTaskCount,
      revisionCount,
      overdueRevisionCount,
      carriedTaskCount,
      subjects,
      attention,
    });
  }

  // 6. Build the full month matrix for calendar grid
  const monthMatrix = buildMonthMatrix(
    year,
    actualMonth,
    daysMap,
    selectedDate,
    todayDate
  );

  // 7. Compute Month Summary
  const monthSummary = calculateMonthSummary(currentMonthKey, monthMatrix, trajectory);

  // 8. Compute Structured 7-day Weeks
  const weeks = groupRangeByWeek(monthMatrix, trajectory);

  // 9. Assemble Selected Day Detail (for Day Lens)
  const selectedProjection = daysMap.get(selectedDate) || monthMatrix.find((d) => d.date === selectedDate);
  const selectedDp = dailyPlansByDate.get(selectedDate);
  const rawSelectedTasks = selectedDp ? tasksByDailyPlanId.get(selectedDp.id) || [] : [];

  const calendarTasks: CalendarTaskItem[] = rawSelectedTasks.map((t, idx) => {
    const prob = t.problem_id ? problemMap.get(t.problem_id) : undefined;
    const topic = prob?.primary_topic_id ? topicMap.get(prob.primary_topic_id) : undefined;

    return {
      id: t.id,
      title: prob?.title ? cleanProblemTitle(prob.title) : cleanProblemTitle(t.title),
      taskType: t.task_type === "revision" ? "revision" : t.task_type === "custom" ? "custom" : "dsa_problem",
      status: t.status,
      plannedMinutes: t.planned_minutes,
      completedMinutes: t.completed_minutes,
      priority: t.priority,
      sortOrder: t.sort_order ?? idx + 1,
      subject: detectTaskSubject(t),
      problemSlug: prob?.slug ?? undefined,
      difficulty: (prob?.difficulty as "EASY" | "MEDIUM" | "HARD") ?? undefined,
      topicName: topic?.name ?? undefined,
      revisionIntervalDays: t.revision_item_id ? 7 : undefined,
      isOverdue: t.task_type === "revision" && selectedDate < todayDate,
      isCarried: Boolean(t.carry_count > 0 || t.carried_from_task_id),
      carryCount: t.carry_count,
      originalDate: t.original_date,
      scheduledReason: t.scheduled_reason,
      reasonExplanation: explainTaskReason(t.scheduled_reason, t.task_type),
    };
  });

  // Calculate task category breakdowns
  let revCount = 0;
  let revMinutes = 0;
  let coreCount = 0;
  let coreMinutes = 0;
  let customCount = 0;
  let customMinutes = 0;

  for (const t of calendarTasks) {
    if (t.taskType === "revision") {
      revCount++;
      revMinutes += t.plannedMinutes;
    } else if (t.taskType === "dsa_problem") {
      coreCount++;
      coreMinutes += t.plannedMinutes;
    } else {
      customCount++;
      customMinutes += t.plannedMinutes;
    }
  }

  const { displayDate, dayOfWeek: dayOfWeekName } = formatDayDisplay(selectedDate, timezone);

  const selectedDayDetail: CalendarDayDetail = {
    date: selectedDate,
    displayDate,
    dayOfWeek: dayOfWeekName,
    availableMinutes: selectedProjection?.availableMinutes ?? defaultDailyCapacity,
    plannedMinutes: selectedProjection?.plannedMinutes ?? 0,
    completedMinutes: selectedProjection?.completedMinutes ?? 0,
    isRestDay: selectedProjection?.isRestDay ?? false,
    isToday: selectedDate === todayDate,
    isTargetDate: selectedDate === targetDate,
    isPlanStart: selectedDate === startDate,
    trajectory,
    attention: selectedProjection?.attention ?? "none",
    subjects: selectedProjection?.subjects ?? (selectedProjection?.plannedMinutes ? ["dsa"] : []),
    tasks: calendarTasks,
    revisionsSummary: { count: revCount, minutes: revMinutes },
    coreSummary: { count: coreCount, minutes: coreMinutes },
    customSummary: { count: customCount, minutes: customMinutes },
  };

  return {
    plan: planHeader,
    selectedDate,
    todayDate,
    currentMonthKey,
    monthLabel: monthSummary.monthLabel,
    view: options.view || "month",
    days: monthMatrix,
    weeks,
    monthSummary,
    selectedDay: selectedDayDetail,
  };
}


