import type {
  ProblemAttemptRecord,
  ProblemReviewRecord,
  ProblemCompanyContext,
} from "../types";
export const outcomeNames = {
  independent: "Solved independently",
  hint: "Solved with hint",
  solution_viewed: "Viewed solution",
  unsolved: "Could not solve",
} as const;
export const reviewNames = {
  forgot: "Forgot",
  hard: "Hard",
  okay: "Okay",
  easy: "Easy",
} as const;
export const windowNames = {
  thirty_days: "30D",
  three_months: "3M",
  six_months: "6M",
  more_than_six_months: "6M+",
  all_time: "All time",
} as const;
export function formatMinutes(seconds: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
    seconds / 60
  );
}
export function formatPracticeDate(iso: string, includeTime = false) {
  if (!Number.isFinite(Date.parse(iso))) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime
      ? { hour: "numeric", minute: "2-digit", timeZoneName: "short" as const }
      : {}),
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}
export function practiceAnalytics(
  attempts: ProblemAttemptRecord[],
  total = attempts.length,
  reviews: ProblemReviewRecord[] = []
) {
  const ordered = [...attempts]
    .filter((a) => Number.isFinite(Date.parse(a.attemptedAt)))
    .sort(
      (a, b) =>
        Date.parse(a.attemptedAt) - Date.parse(b.attemptedAt) ||
        (a.id ?? "").localeCompare(b.id ?? "")
    );
  const points = ordered.map((a, i) => ({
    ...a,
    number: Math.max(0, total - ordered.length) + i + 1,
    minutes:
      a.timeTakenSeconds > 0 && Number.isFinite(a.timeTakenSeconds)
        ? a.timeTakenSeconds / 60
        : null,
    confidence: a.confidence >= 1 && a.confidence <= 5 ? a.confidence : null,
  }));
  const time = points.filter(
    (p): p is typeof p & { minutes: number } => p.minutes !== null
  );
  const confidence = points.filter(
    (p): p is typeof p & { confidence: number } => p.confidence !== null
  );
  const independent = time.filter((a) => a.outcome === "independent");
  const best = independent.length ? Math.min(...independent.map((a) => a.minutes)) : null;
  const ratings = { forgot: 1, hard: 2, okay: 3, easy: 4 } as const;
  const retention = [...reviews]
    .filter((r) => Number.isFinite(Date.parse(r.reviewedAt)))
    .sort((a, b) => Date.parse(a.reviewedAt) - Date.parse(b.reviewedAt))
    .map((r, i) => ({ ...r, number: i + 1, value: ratings[r.rating] }));
  return {
    time,
    confidence,
    points,
    latest: points.at(-1) ?? null,
    best,
    retention,
    showTime: time.length >= 2,
    showConfidence: confidence.length >= 2,
    showRetention: retention.length >= 3,
  };
}
export function practiceProvider(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    const names: Record<string, string> = {
      "leetcode.com": "LeetCode",
      "geeksforgeeks.org": "GeeksforGeeks",
      "takeuforward.org": "takeUforward",
      "spoj.com": "SPOJ",
      "interviewbit.com": "InterviewBit",
      "codechef.com": "CodeChef",
      "kattis.com": "Kattis",
      "naukri.com": "Coding Ninjas",
      "codingninjas.com": "Coding Ninjas",
    };
    const entry = Object.entries(names).find(
      ([host]) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
    return {
      url: parsed.href,
      name: entry?.[1] ?? parsed.hostname.replace(/^www\./, ""),
    };
  } catch {
    return null;
  }
}
export function companyRows(
  companies: ProblemCompanyContext[],
  window: string,
  preferred?: string | null
) {
  return companies
    .flatMap((company) => {
      const records = company.windows.filter((w) => w.window === window);
      return records.length ? [{ company, records }] : [];
    })
    .sort(
      (a, b) =>
        Number(b.company.slug === preferred) - Number(a.company.slug === preferred) ||
        (b.records.length === 1 ? (b.records[0].frequency ?? -Infinity) : -Infinity) -
          (a.records.length === 1 ? (a.records[0].frequency ?? -Infinity) : -Infinity) ||
        a.company.name.localeCompare(b.company.name)
    );
}
