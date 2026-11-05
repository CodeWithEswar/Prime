import { addDays } from "@/domain/planning/capacity";
import { countsTowardsPlan, weekStart } from "@/domain/planning/control";

export const analyticsViews = {
  overview: "Overview",
  dsa: "DSA",
  time: "Time & execution",
  consistency: "Consistency",
  skills: "Skills & retention",
  insights: "Insights",
} as const;

export type AnalyticsView = keyof typeof analyticsViews;
export const difficulties = ["EASY", "MEDIUM", "HARD"] as const;
export type AnalyticsFilters = ReturnType<typeof readAnalyticsFilters>;

export function readAnalyticsFilters(
  query: Record<string, string | string[] | undefined>
) {
  return {
    view: (Object.keys(analyticsViews).find((view) => view === query.view) ??
      "overview") as AnalyticsView,
    days: query.days === "7" ? 7 : query.days === "90" ? 90 : 30,
    compare: query.compare === "previous",
    topic:
      typeof query.topic === "string" && /^[a-z0-9_-]{1,100}$/i.test(query.topic)
        ? query.topic
        : "",
    difficulty: difficulties.find((value) => value === query.difficulty) ?? "",
    group: query.group === "week" ? ("week" as const) : ("day" as const),
  };
}

export function dayFormatter(timezone: string) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" } as const;
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-CA", { ...options, timeZone: timezone });
  } catch {
    formatter = new Intl.DateTimeFormat("en-CA", { ...options, timeZone: "UTC" });
  }
  return (date: Date) => {
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  };
}

export function analyticsPeriods(today: string, days: number, includeToday = false) {
  const window = (offset: number) =>
    Array.from({ length: days }, (_, i) =>
      addDays(today, offset - days + i + Number(includeToday))
    );
  return { current: window(0), previous: window(-days) };
}

export type Attempt = {
  problemId: string;
  title: string;
  slug: string;
  topic: string;
  coreTopic?: string;
  difficulty: string;
  outcome: string;
  seconds: number;
  at: string;
};
export type Session = {
  at: string;
  endedAt: string | null;
  seconds: number;
  work: string;
};
export type PlanDay = { date: string; available: number; rest: boolean };
export type Commitment = {
  date: string;
  createdAt: string;
  status: string;
  minutes: number;
  carried: boolean;
};
export type Review = { at: string; rating: string };
export type AnalyticsSources = {
  attempts: Attempt[] | null;
  sessions: Session[] | null;
  plans: PlanDay[] | null;
  commitments: Commitment[] | null;
  completions: string[] | null;
  reviews: Review[] | null;
};

export function percent(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((100 * numerator) / denominator) : null;
}

export function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return (
    (sorted[Math.floor((sorted.length - 1) / 2)] +
      sorted[Math.floor(sorted.length / 2)]) /
    2
  );
}

const recognized = new Set(["independent", "hint", "unsolved", "solution_viewed"]);
const successful = (outcome: string) => outcome === "independent" || outcome === "hint";

export function attemptMetrics(rows: Attempt[]) {
  const eligible = rows.filter(({ outcome }) => recognized.has(outcome));
  const solved = eligible.filter(({ outcome }) => successful(outcome));
  const independent = solved.filter(({ outcome }) => outcome === "independent");
  const timed = solved.filter(({ seconds }) => Number.isFinite(seconds) && seconds > 0);
  return {
    attempts: rows.length,
    eligible: eligible.length,
    solves: solved.length,
    distinctSolved: new Set(solved.map(({ problemId }) => problemId)).size,
    distinctAttempted: new Set(rows.map(({ problemId }) => problemId)).size,
    independent: independent.length,
    distinctIndependent: new Set(independent.map(({ problemId }) => problemId)).size,
    assisted: solved.length - independent.length,
    failed: eligible.filter(({ outcome }) => outcome === "unsolved").length,
    viewed: eligible.filter(({ outcome }) => outcome === "solution_viewed").length,
    rate: percent(independent.length, eligible.length),
    hints: percent(solved.length - independent.length, eligible.length),
    medianSeconds: median(timed.map(({ seconds }) => seconds)),
    timed: timed.length,
  };
}

export function improvedReattempts(rows: Attempt[]) {
  const earlier = new Map<string, Attempt>();
  const improved = new Map<
    string,
    { slug: string; title: string; before: string; after: string; outcome: string }
  >();
  const ordered = rows
    .filter(({ outcome }) => recognized.has(outcome))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  for (const row of ordered) {
    if (row.outcome !== "independent") {
      earlier.set(row.problemId, row);
      continue;
    }
    const prior = earlier.get(row.problemId);
    if (
      prior &&
      Date.parse(prior.at) < Date.parse(row.at) &&
      !improved.has(row.problemId)
    ) {
      improved.set(row.problemId, {
        slug: row.slug,
        title: row.title,
        before: prior.at,
        after: row.at,
        outcome: prior.outcome,
      });
    }
  }
  return [...improved.values()];
}

function groupBy<T>(rows: T[], key: (row: T) => string) {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const id = key(row);
    const group = groups.get(id);
    if (group) group.push(row);
    else groups.set(id, [row]);
  }
  return groups;
}

export function projectPeriod(
  dates: string[],
  sources: AnalyticsSources,
  localDay: (date: Date) => string,
  filters: Pick<AnalyticsFilters, "topic" | "difficulty">
) {
  const window = new Set(dates);
  const day = (at: string) => localDay(new Date(at));
  const inWindow = (at: string) => window.has(day(at));
  const allAttempts = sources.attempts?.filter((row) => inWindow(row.at));
  const attempts = allAttempts?.filter(
    (row) =>
      (!filters.topic || row.topic === filters.topic) &&
      (!filters.difficulty || row.difficulty === filters.difficulty)
  );
  const sessions = sources.sessions?.filter(
    (row) =>
      row.endedAt &&
      Date.parse(row.endedAt) > Date.parse(row.at) &&
      Number.isFinite(row.seconds) &&
      row.seconds > 0 &&
      inWindow(row.at)
  );
  const plans = new Map(sources.plans?.map((row) => [row.date, row]));
  const tasks = sources.commitments?.filter(
    (row) =>
      window.has(row.date) &&
      day(row.createdAt) <= row.date &&
      countsTowardsPlan(row.status)
  );
  const completions = groupBy(sources.completions ?? [], day);
  const reviews = sources.reviews?.filter((row) => inWindow(row.at));
  const byDate = groupBy(attempts ?? [], (row) => day(row.at));
  const activityAttempts = groupBy(allAttempts ?? [], (row) => day(row.at));
  const sessionDays = groupBy(sessions ?? [], (row) => day(row.at));
  const taskDays = groupBy(tasks ?? [], (row) => row.date);
  const reviewDays = groupBy(reviews ?? [], (row) => day(row.at));
  const sumSeconds = (rows: Session[]) => rows.reduce((sum, row) => sum + row.seconds, 0);
  const completeActivity = Boolean(
    allAttempts && sessions && sources.completions && reviews
  );
  const daily = dates.map((date) => {
    const evidence = byDate.get(date) ?? [];
    const measured = sessionDays.get(date) ?? [];
    const assigned = taskDays.get(date) ?? [];
    const actual = completions.get(date)?.length ?? 0;
    const reviewCount = reviewDays.get(date)?.length ?? 0;
    const active = Boolean(
      activityAttempts.get(date)?.length || measured.length || actual || reviewCount
    );
    const metrics = attemptMetrics(evidence);
    return {
      date,
      attempts: attempts ? metrics.attempts : null,
      solves: attempts ? metrics.solves : null,
      independent: attempts ? metrics.independent : null,
      assisted: metrics.assisted,
      eligible: metrics.eligible,
      rate: metrics.rate,
      hints: metrics.hints,
      recorded: sessions ? sumSeconds(measured) / 60 : null,
      planned: tasks ? assigned.reduce((sum, row) => sum + row.minutes, 0) : null,
      committed: tasks ? assigned.length : null,
      fulfilled: tasks
        ? assigned.filter((row) => row.status === "completed").length
        : null,
      carried: tasks ? assigned.filter((row) => row.carried).length : null,
      available: plans.get(date)?.available ?? null,
      rest: plans.get(date)?.rest ?? false,
      completed: sources.completions ? actual : null,
      reviews: reviews ? reviewCount : null,
      activityEvents:
        (activityAttempts.get(date)?.length ?? 0) +
        measured.length +
        actual +
        reviewCount,
      active: active ? true : completeActivity ? false : null,
    };
  });
  return {
    daily,
    attempt: attempts ? attemptMetrics(attempts) : null,
    activeDays: completeActivity ? daily.filter(({ active }) => active).length : null,
    studySeconds: sessions?.length ? sumSeconds(sessions) : null,
    sessionCount: sessions?.length ?? 0,
    medianSession: median((sessions ?? []).map(({ seconds }) => seconds)),
    domains: [...groupBy(sessions ?? [], (row) => row.work)]
      .map(([name, rows]) => ({ name, seconds: sumSeconds(rows), count: rows.length }))
      .sort((a, b) => b.seconds - a.seconds),
    reviews: reviews
      ? Object.fromEntries(
          [...groupBy(reviews, (row) => row.rating)].map(([rating, rows]) => [
            rating,
            rows.length,
          ])
        )
      : null,
    reviewCount: reviews?.length ?? null,
    topics: [...groupBy(attempts ?? [], (row) => row.coreTopic ?? row.topic)].map(
      ([id, rows]) => ({ id, slug: rows[0].topic, ...attemptMetrics(rows) })
    ),
    difficulties: difficulties.map((level) => ({
      level,
      metrics: attempts
        ? attemptMetrics(attempts.filter((row) => row.difficulty === level))
        : null,
    })),
    reattempts: improvedReattempts(attempts ?? []),
  };
}

export type PeriodProjection = ReturnType<typeof projectPeriod>;
export type AnalyticsDay = PeriodProjection["daily"][number];

export function calendarWeeks(days: AnalyticsDay[]) {
  return [...groupBy(days, (row) => weekStart(row.date)).entries()].map(
    ([start, rows]) => {
      const total = (key: "completed" | "committed" | "carried") =>
        rows.every((row) => row[key] !== null)
          ? rows.reduce((sum, row) => sum + (row[key] ?? 0), 0)
          : null;
      return {
        start,
        rows,
        committed: total("committed"),
        completed: total("completed"),
        carried: total("carried"),
        active: rows.every((row) => row.active !== null)
          ? rows.filter((row) => row.active).length
          : null,
      };
    }
  );
}

export function independentChange(
  current: PeriodProjection["attempt"],
  previous: PeriodProjection["attempt"]
) {
  if (
    !current ||
    !previous ||
    current.eligible < 10 ||
    previous.eligible < 10 ||
    current.rate === null ||
    previous.rate === null
  )
    return null;
  return current.rate - previous.rate;
}
