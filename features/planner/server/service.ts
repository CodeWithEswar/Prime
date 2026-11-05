import "server-only";
import { fundamentalsCourses } from "@/domain/fundamentals/courses";
import { DBMS_DAYS_CURRICULUM } from "@/domain/dbms/curriculum";
import { OS_12_DAY_CURRICULUM } from "@/domain/os/curriculum";
import { CN_12_DAY_CURRICULUM } from "@/domain/cn/curriculum";
import { OOP_12_DAY_CURRICULUM } from "@/domain/oop/curriculum";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";
import { addDays, getDayOfWeekFromDate } from "@/domain/planning/capacity";
import {
  capacityDays,
  countsTowardsPlan,
  planControl,
  weekStart,
  type ScheduledWork,
  type Work,
} from "@/domain/planning/control";
import { evaluatePlanFeasibility } from "@/domain/planning/feasibility";
import {
  DEFAULT_PLANNER_CONFIG,
  type PreparationTarget,
  type TaskPriority,
} from "@/domain/planning/types";
import { getRoadmapDashboardData } from "@/features/roadmap/queries/get-roadmap-data";
import {
  ALGORITHMS,
  algorithmMetadata,
} from "@/features/algorithm-lab/registry/metadata";
import { workRequest, type PlannerCommand, type WorkRequest } from "../schema";
import type { PlannerView, ProposalView } from "../types";

type Row<K extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][K]["Row"];
type Snapshot = {
  version: string;
  settings: Row<"user_settings"> | null;
  plan: Row<"preparation_plans"> | null;
  rules: Row<"availability_rules">[];
  exceptions: Row<"availability_exceptions">[];
  days: Row<"daily_plans">[];
  tasks: (Row<"daily_tasks"> & { date: string })[];
  intents: Row<"planning_intents">[];
  revisions: Row<"revision_items">[];
};

const localDay = (instant: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);

function requireData<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function load(owner: string) {
  const db = createAdminClient();
  const [settings, plan] = await Promise.all([
    db.from("user_settings").select("timezone").eq("user_id", owner).maybeSingle(),
    db
      .from("preparation_plans")
      .select("timezone")
      .eq("user_id", owner)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .order("id")
      .limit(1)
      .maybeSingle(),
  ]);
  const today = localDay(
    new Date(),
    requireData(settings)?.timezone ?? requireData(plan)?.timezone ?? "UTC"
  );
  const raw = requireData(
    await db.rpc("planner_snapshot", { p_user: owner, p_day: today })
  ) as unknown as Snapshot;
  const { rules, exceptions } = raw;
  const target: PreparationTarget = {
    userId: owner,
    startDate: raw.plan?.start_date ?? today,
    targetDate: raw.plan?.target_date ?? raw.settings?.target_date ?? addDays(today, 89),
    timezone: raw.settings?.timezone ?? raw.plan?.timezone ?? "UTC",
    targetRole: raw.plan?.target_role ?? raw.settings?.target_role ?? "Software Engineer",
    defaultDailyCapacityMinutes:
      raw.settings?.daily_study_minutes ?? raw.plan?.daily_capacity_minutes ?? 90,
    weekdayRules: rules.map((r) => ({
      dayOfWeek: r.day_of_week,
      availableMinutes: r.available_minutes,
      isRestDay: r.is_rest_day,
    })),
    exceptions: exceptions.map((e) => ({
      date: e.exception_date,
      availableMinutes: e.available_minutes,
      isUnavailable: e.is_unavailable,
      reason: e.reason ?? undefined,
    })),
    restDays: (raw.settings?.rest_days ?? []).filter(
      (day) => !rules.some((r) => r.day_of_week === day)
    ),
  };
  const tasks: ScheduledWork[] = raw.tasks.map((t) => ({
    id: t.id,
    date: t.date,
    title: t.title,
    minutes: t.planned_minutes,
    priority: t.priority as TaskPriority,
    locked: t.is_locked,
    status: t.status === "planned" ? "pending" : t.status,
    source: t.source,
    type: t.task_type,
    problemId: t.problem_id,
    revisionId: t.revision_item_id,
    reason: t.scheduled_reason,
    originalDate: t.original_date,
    carryCount: t.carry_count,
  }));
  const backlog = raw.intents.flatMap((i) => {
    const request = workRequest.safeParse(i.request);
    return request.success ? [{ id: i.id, title: i.title, request: request.data }] : [];
  });
  return {
    db,
    raw,
    today,
    target,
    tasks,
    backlog,
    bufferPercent: raw.settings?.planner_buffer_percent ?? 15,
  };
}

type State = Awaited<ReturnType<typeof load>>;

const courseDays = {
  dbms: DBMS_DAYS_CURRICULUM,
  os: OS_12_DAY_CURRICULUM,
  cn: CN_12_DAY_CURRICULUM,
  oop: OOP_12_DAY_CURRICULUM,
};
const pendingProblemIds = (state: State) =>
  new Set(
    state.tasks
      .filter(
        (t) =>
          t.type !== "revision" && countsTowardsPlan(t.status) && t.status !== "completed"
      )
      .map((t) => t.problemId)
  );
const priorityRank: Record<TaskPriority, number> = { P0: 0, P1: 1, P2: 2, OPTIONAL: 3 };
const roadmap = (s: State) =>
  getRoadmapDashboardData(s.db, s.target.userId, "prime-core-dsa", true);

async function revisions(s: State) {
  const scheduled = new Set(
    s.tasks
      .filter((t) => countsTowardsPlan(t.status) && t.status !== "completed")
      .map((t) => t.revisionId)
  );
  const rows = s.raw.revisions.filter((r) => !scheduled.has(r.id));
  if (!rows.length) return [];
  const problems =
    requireData(
      await s.db
        .from("problems")
        .select("id,title")
        .in("id", [...new Set(rows.map((r) => r.entity_id))])
    ) ?? [];
  const titles = new Map(problems.map((p) => [p.id, p.title]));
  return rows.flatMap((r): Work[] => {
    const title = titles.get(r.entity_id);
    const due = new Date(
      r.snoozed_until && r.snoozed_until > r.next_review_at
        ? r.snoozed_until
        : r.next_review_at
    );
    return title
      ? [
          {
            title: "Review " + title,
            minutes: 20,
            priority: "P0",
            type: "revision",
            source: "revision_generated",
            revisionId: r.id,
            problemId: r.entity_id,
            due: localDay(due, s.target.timezone),
          },
        ]
      : [];
  });
}

async function coreWork(s: State, stage?: string, optional = false) {
  const catalog = await roadmap(s);
  const scheduled = pendingProblemIds(s);
  return catalog.stages
    .filter((g) => !stage || g.stageSlug === stage)
    .flatMap((g) => g.items)
    .filter(
      (i) =>
        i.title &&
        (optional || i.isRequired) &&
        ["not_started", "attempted"].includes(i.userStatus) &&
        i.prerequisites.every((p) => p.isSatisfied) &&
        !scheduled.has(i.problemId)
    )
    .map((i): Work => ({
      title: i.title!,
      minutes: i.recommendedMinutes,
      type: "dsa_problem",
      priority: i.isRequired ? i.priority : "OPTIONAL",
      source: "planner_generated",
      problemId: i.problemId,
      curriculumId: i.id,
    }))
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
}

export async function getPlannerView(owner: string): Promise<PlannerView> {
  const s = await load(owner);
  const days = capacityDays(s.today, s.target, s.tasks, (100 - s.bufferPercent) / 100);
  const window = days.filter((d) => d.date <= s.target.targetDate);
  const active = window.filter((d) => !d.rest);
  const catalog = await roadmap(s).catch(() => null);
  const stageLoads = catalog?.stages.map((stage) => ({
    stage,
    minutes: stage.items
      .filter((i) => i.isRequired && ["not_started", "attempted"].includes(i.userStatus))
      .reduce((sum, i) => sum + i.recommendedMinutes, 0),
  }));
  const remainingCoreMinutes = stageLoads?.reduce((sum, item) => sum + item.minutes, 0);
  const scheduledReviewIds = new Set(
    s.tasks
      .filter(
        (task) =>
          task.date >= s.today &&
          task.date <= s.target.targetDate &&
          countsTowardsPlan(task.status) &&
          task.status !== "completed"
      )
      .map((task) => task.revisionId)
  );
  const expectedRevisionReserveMinutes =
    s.raw.revisions.filter(
      (r) =>
        !scheduledReviewIds.has(r.id) &&
        localDay(
          new Date(
            r.snoozed_until && r.snoozed_until > r.next_review_at
              ? r.snoozed_until
              : r.next_review_at
          ),
          s.target.timezone
        ) <= s.target.targetDate
    ).length * 20;
  const committedCoreIds = new Set(
    s.raw.tasks
      .filter((row) => row.curriculum_item_id && row.status !== "completed")
      .map((row) => row.id)
  );
  const nonCore = capacityDays(
    s.today,
    s.target,
    s.tasks.filter((task) => !committedCoreIds.has(task.id)),
    (100 - s.bufferPercent) / 100
  );
  const totalBudget = window.reduce((sum, day) => sum + day.budget, 0);
  const revisionShare =
    totalBudget > 0 ? Math.min(1, expectedRevisionReserveMinutes / totalBudget) : 0;
  let accrued = 0;
  const forecast = nonCore
    .filter((day) => day.date <= s.target.targetDate)
    .map((day) => ({
      date: day.date,
      cumulative: (accrued += Math.max(
        0,
        day.budget * (1 - revisionShare) - day.planned
      )),
    }));
  let required = 0;
  const milestones = (stageLoads ?? []).map(({ stage, minutes }) => {
    required += minutes;
    return {
      slug: stage.stageSlug,
      name: stage.stageName,
      completed: stage.completedRequired,
      total: stage.totalRequired,
      estimate:
        minutes > 0
          ? (forecast.find((day) => day.cumulative >= required)?.date ?? null)
          : null,
    };
  });
  return {
    today: s.today,
    target: s.target.targetDate,
    start: s.target.startDate,
    role: s.target.targetRole,
    timezone: s.target.timezone,
    hasPlan: Boolean(s.raw.plan),
    days,
    tasks: s.tasks,
    backlog: s.backlog,
    bufferPercent: s.bufferPercent,
    milestones,
    rules: Array.from({ length: 7 }, (_, weekday) => {
      const rule = s.target.weekdayRules.find((r) => r.dayOfWeek === weekday);
      return {
        weekday,
        minutes: rule?.availableMinutes ?? s.target.defaultDailyCapacityMinutes,
        rest: rule?.isRestDay ?? s.target.restDays.includes(weekday),
      };
    }),
    exceptions: s.target.exceptions.map((e) => ({
      date: e.date,
      minutes: e.availableMinutes,
      label: e.reason ?? "",
    })),
    feasibility:
      remainingCoreMinutes === undefined
        ? null
        : evaluatePlanFeasibility({
            remainingCoreMinutes,
            expectedRevisionReserveMinutes,
            config: DEFAULT_PLANNER_CONFIG,
            totalEffectiveCapacityMinutes: nonCore
              .filter((day) => day.date <= s.target.targetDate)
              .reduce((sum, day) => sum + Math.max(0, day.budget - day.planned), 0),
            totalCalendarDays: window.length,
            activeStudyDays: active.length,
            restDaysCount: window.length - active.length,
          }),
  };
}

async function resolveWork(
  s: State,
  request: WorkRequest,
  queue?: Work[]
): Promise<Work[]> {
  const { source, selection, title, domain, minutes, priority, count } = request;
  const custom = (name: string, fallback: number): Work[] => [
    {
      title: name,
      minutes: minutes ?? fallback,
      priority,
      type: "custom",
      source: "user_created",
    },
  ];
  if (source === "custom")
    return custom(domain === "Other" ? title : domain + " · " + title, 30);
  if (source === "lab") {
    const algorithm = algorithmMetadata(selection);
    return algorithm ? custom("Lab · " + algorithm.name, 20) : [];
  }
  if (source === "core")
    return (await coreWork(s, selection, priority === "OPTIONAL"))
      .filter((w) => priority !== "OPTIONAL" || w.priority === "OPTIONAL")
      .slice(0, count)
      .map((w) => ({ ...w, priority, minutes: minutes ?? w.minutes }));
  if (source === "revision")
    return (queue ?? (await revisions(s)))
      .filter((w) =>
        selection === "due" ? (w.due ?? "") <= s.today : w.revisionId === selection
      )
      .slice(0, count)
      .map((w) => ({ ...w, minutes: minutes ?? w.minutes }));
  const db = s.db;
  const problems = db
    .from("problems")
    .select("id,slug,title,estimated_minutes")
    .eq("is_active", true);
  let records: Awaited<typeof problems>["data"];
  if (source === "topic") {
    const topic = requireData(
      await db.from("roadmap_topics").select("id").eq("slug", selection).maybeSingle()
    );
    records = topic
      ? requireData(
          await problems.eq("primary_topic_id", topic.id).order("slug").limit(150)
        )
      : [];
  } else if (source === "company") {
    const company = requireData(
      await db
        .from("companies")
        .select("id")
        .eq("slug", selection)
        .eq("is_active", true)
        .maybeSingle()
    );
    if (!company) return [];
    const stats =
      requireData(
        await db
          .from("company_problem_stats")
          .select("problem_id")
          .eq("company_id", company.id)
          .eq("is_active", true)
          .order("frequency", { ascending: false, nullsFirst: false })
          .order("problem_id")
          .limit(200)
      ) ?? [];
    const ids = [...new Set(stats.map((r) => r.problem_id))];
    if (!ids.length) return [];
    const found = requireData(await problems.in("id", ids)) ?? [];
    records = ids.flatMap((id) => found.filter((p) => p.id === id));
  } else {
    const slugs = [...new Set(selection.split(","))];
    records = requireData(await problems.in("slug", slugs));
    records = slugs.flatMap((slug) => records?.filter((p) => p.slug === slug) ?? []);
  }
  const scheduled = pendingProblemIds(s);
  return (records ?? [])
    .filter((p) => !scheduled.has(p.id))
    .slice(0, count)
    .map((p) => ({
      title: p.title,
      minutes: minutes ?? p.estimated_minutes ?? 35,
      priority,
      type: "dsa_problem",
      source: "user_created",
      problemId: p.id,
      problemSlug: p.slug,
    }));
}

export async function plannerChoices(
  owner: string,
  source: WorkRequest["source"],
  search: string
) {
  const db = createAdminClient();
  const query = "%" + search.replace(/[^\p{L}\p{N} -]/gu, "") + "%";
  switch (source) {
    case "lab":
      return ALGORITHMS.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 12)
        .map((a) => ({ id: a.slug, label: a.name }));
    case "core":
      return (await roadmap(await load(owner))).stages.map((g) => ({
        id: g.stageSlug,
        label: g.stageName,
      }));
    case "topic":
      return (
        requireData(
          await db
            .from("roadmap_topics")
            .select("slug,name")
            .ilike("name", query)
            .order("name")
            .limit(12)
        ) ?? []
      ).map((p) => ({ id: p.slug, label: p.name }));
    case "company":
      return (
        requireData(
          await db
            .from("companies")
            .select("slug,name")
            .eq("is_active", true)
            .ilike("name", query)
            .order("name")
            .limit(12)
        ) ?? []
      ).map((p) => ({ id: p.slug, label: p.name }));
    case "problem":
      return (
        requireData(
          await db
            .from("problems")
            .select("slug,title")
            .eq("is_active", true)
            .ilike("title", query)
            .order("title")
            .limit(12)
        ) ?? []
      ).map((p) => ({ id: p.slug, label: p.title }));
    case "revision":
      return [
        { id: "due", label: "Due reviews" },
        ...(await revisions(await load(owner)))
          .filter((w) => w.title.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 11)
          .map((w) => ({ id: w.revisionId!, label: w.title })),
      ];
    default:
      return [];
  }
}

async function store(s: State, changes: Record<string, unknown>) {
  const owner = s.target.userId;
  const cleanup = await s.db
    .from("planner_proposals")
    .delete()
    .eq("user_id", owner)
    .is("applied_at", null)
    .lt("expires_at", new Date().toISOString());
  if (cleanup.error) throw new Error(cleanup.error.message);
  return requireData(
    await s.db
      .from("planner_proposals")
      .insert({
        user_id: owner,
        local_day: s.today,
        snapshot_version: s.raw.version,
        changes: JSON.parse(JSON.stringify(changes)) as Json,
      })
      .select("id,expires_at")
      .single()
  )!;
}

export async function confirmProposal(owner: string, id: string) {
  requireData(
    await createAdminClient().rpc("commit_planner_proposal", { p_user: owner, p_id: id })
  );
}

export async function changePlanner(owner: string, changes: Record<string, unknown>) {
  const s = await load(owner);
  const proposal = await store(s, changes);
  await confirmProposal(owner, proposal.id);
}

export async function buildProposal(
  owner: string,
  command: PlannerCommand
): Promise<ProposalView> {
  const s = await load(owner);
  const { today, target, tasks } = s;
  const last = addDays(today, 89);
  let end = last;
  let start = today;
  let fixedDate: string | undefined;
  let locked = false;
  let bufferPercent = s.bufferPercent;
  let allowOverload = false;
  let move: ScheduledWork | undefined;
  let work: Work[] = [];
  let rebalance = command.kind === "rebalance";
  let rebalanceScope: ((date: string) => boolean) | undefined;
  let title = "Rebalance schedule";
  const changes: Record<string, unknown> = {};
  const queue = await revisions(s);

  if (command.kind === "course") {
    const course = fundamentalsCourses[command.course];
    title = "Schedule " + course.title;
    start = command.start ?? today;
    const requiredHorizon = addDays(start, Math.max(30, courseDays[command.course].length * 2));
    if (target.targetDate < requiredHorizon) {
      target.targetDate = requiredHorizon < last ? requiredHorizon : last;
      changes.target = {
        date: target.targetDate,
        minutes: target.defaultDailyCapacityMinutes,
        role: target.targetRole,
      };
    }
    if (start < today || start > last || start > target.targetDate)
      throw new Error("PLANNER_DATE");

    const existing = new Map(
      tasks
        .filter((task) => task.type === "custom" && countsTowardsPlan(task.status))
        .map((task) => [task.title, task.date])
    );
    work = courseDays[command.course].flatMap((day): Work[] => {
      const name = `${course.label} Day ${day.dayNumber} · ${day.title}`;
      const date = existing.get(name);
      if (date) {
        if (date >= start) start = addDays(date, 1);
        return [];
      }
      return [
        {
          title: name,
          minutes: command.minutes,
          priority: "P2",
          type: "custom",
          source: "user_created",
        },
      ];
    });
  } else if (command.kind === "work") {
    title = "Schedule work";
    const item = command.backlogId
      ? s.backlog.find((i) => i.id === command.backlogId)
      : undefined;
    if (command.backlogId && !item) throw new Error("PLANNER_STALE");
    const request = item
      ? {
          ...item.request,
          when: command.request.when,
          date: command.request.date,
          locked: command.request.locked,
          allowOverload: command.request.allowOverload,
        }
      : command.request;
    work = await resolveWork(s, request, queue);
    fixedDate = request.when === "date" ? request.date : undefined;
    if (request.when === "week") {
      start = request.date ? weekStart(request.date) : today;
      end = addDays(weekStart(request.date ?? today), 6);
    }
    locked = request.locked;
    allowOverload = Boolean(fixedDate && request.allowOverload);
    if (item) work = work.map((w) => ({ ...w, intentId: item.id }));
    else {
      work = work.map((w) => ({ ...w, requestIntent: true }));
      changes.intent = {
        title: (request.title || work[0]?.title || "Planned work").slice(0, 160),
        request,
        status: "scheduled",
      };
    }
  } else if (command.kind === "automatic") {
    title = "Automatic plan";
    if (command.target && (command.target !== target.targetDate || !s.raw.plan)) {
      if (command.target < today || command.target > last)
        throw new Error("PLANNER_DATE");
      target.targetDate = command.target;
      changes.target = {
        date: target.targetDate,
        minutes: target.defaultDailyCapacityMinutes,
        role: target.targetRole,
      };
      rebalance = true;
    }
    end = command.horizon === "week" ? addDays(today, 6) : last;
    const backlog = await Promise.all(
      s.backlog
        .filter(
          (i) =>
            i.request.when === "auto" &&
            (command.optional || i.request.priority !== "OPTIONAL")
        )
        .slice(0, 12)
        .map(async (i) =>
          (await resolveWork(s, i.request, queue)).map((w) => ({ ...w, intentId: i.id }))
        )
    );
    const seen = new Set<string>();
    work = [
      ...backlog.flat(),
      ...queue.filter((w) => (w.due ?? today) <= end),
      ...(await coreWork(s, undefined, command.optional)),
    ]
      .sort(
        (a, b) =>
          (a.type === "revision" ? -1 : priorityRank[a.priority]) -
          (b.type === "revision" ? -1 : priorityRank[b.priority])
      )
      .filter((w) => {
        const key = w.revisionId ?? w.problemId;
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  } else if (command.kind === "rule") {
    title = "Update weekly availability";
    changes.rule = command;
    rebalance = true;
    rebalanceScope = (date) =>
      date >= today && getDayOfWeekFromDate(date) === command.weekday;
    target.weekdayRules = [
      ...target.weekdayRules.filter((r) => r.dayOfWeek !== command.weekday),
      {
        dayOfWeek: command.weekday,
        availableMinutes: command.minutes,
        isRestDay: command.rest,
      },
    ];
    target.restDays = target.restDays.filter((day) => day !== command.weekday);
  } else if (command.kind === "exception") {
    title = "Update date exception";
    if (command.date < today || command.date > last) throw new Error("PLANNER_DATE");
    changes.exception = command;
    rebalance = true;
    rebalanceScope = (date) => date === command.date;
    target.exceptions = target.exceptions.filter((e) => e.date !== command.date);
    if (!command.remove)
      target.exceptions.push({
        date: command.date,
        availableMinutes: command.minutes,
        isUnavailable: command.minutes === 0,
        reason: command.label,
      });
  } else if (command.kind === "buffer") {
    title = "Update planning buffer";
    bufferPercent = command.percent;
    changes.buffer = bufferPercent;
    rebalance = true;
    rebalanceScope = (date) => date >= today;
  } else if (command.kind === "move") {
    title = "Move commitment";
    move = tasks.find((t) => t.id === command.id);
    if (!move) throw new Error("PLANNER_STALE");
    fixedDate = command.date;
    allowOverload = command.allowOverload;
  }

  const selectedRevisions = new Set(work.map((w) => w.revisionId));
  const reserves = queue.filter((w) => !selectedRevisions.has(w.revisionId));
  const result = planControl({
    today,
    target,
    tasks,
    work,
    start,
    end,
    fixedDate,
    sequential: command.kind === "course",
    locked,
    allowOverload,
    rebalance,
    rebalanceScope,
    move,
    reserves,
    utilizationTarget: (100 - bufferPercent) / 100,
  });
  if (command.kind === "course" && !work.length)
    result.warnings.unshift("All sessions for this roadmap are already in your Planner.");
  if (command.kind === "work" && !work.length)
    result.warnings.unshift(
      "No eligible work matched your selection. Check the source or existing schedule."
    );
  if (!result.placements.length) delete changes.intent;
  const settingsOnly =
    changes.rule || changes.exception || changes.target || changes.buffer;
  if (!result.placements.length && !settingsOnly) return { ...result, id: null, title };
  if (!s.raw.plan && (result.placements.length || changes.target)) {
    changes.target = {
      date: target.targetDate,
      minutes: target.defaultDailyCapacityMinutes,
      role: target.targetRole,
    };
  }
  const existing = new Set(s.raw.days.map((d) => d.plan_date));
  const movedTo = new Set(result.placements.map((p) => p.date));
  changes.days = result.days.filter(
    (d) =>
      movedTo.has(d.date) ||
      Boolean((changes.rule || changes.exception) && s.raw.plan && existing.has(d.date))
  );
  changes.placements = result.placements;
  const fulfilled = new Map<string, { count: number; slugs: Set<string> }>();
  for (const placement of result.placements)
    if ("intentId" in placement && placement.intentId) {
      const group = fulfilled.get(placement.intentId) ?? {
        count: 0,
        slugs: new Set<string>(),
      };
      group.count++;
      if (placement.problemSlug) group.slugs.add(placement.problemSlug);
      fulfilled.set(placement.intentId, group);
    }
  changes.fulfilled = s.backlog.flatMap((item) => {
    const group = fulfilled.get(item.id);
    if (!group) return [];
    const selection =
      item.request.source === "problem"
        ? item.request.selection
            .split(",")
            .filter((slug) => !group.slugs.has(slug))
            .join(",")
        : undefined;
    return [
      {
        id: item.id,
        remaining: Math.max(0, item.request.count - group.count),
        selection,
      },
    ];
  });
  if (rebalance) changes.rebalance = true;
  const proposal = await store(s, changes);
  return {
    ...result,
    id: proposal.id,
    expiresAt: proposal.expires_at,
    title,
    target: changes.target ? target.targetDate : undefined,
    bufferPercent: changes.buffer ? bufferPercent : undefined,
  };
}
