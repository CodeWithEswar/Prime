import { describe, expect, it } from "vitest";
import {
  analyticsPeriods,
  attemptMetrics,
  dayFormatter,
  improvedReattempts,
  projectPeriod,
  readAnalyticsFilters,
  type AnalyticsSources,
  type Attempt,
} from "@/features/analytics/metrics";

const day = "2026-11-01";
const at = `${day}T16:00:00Z`;
const attempt = (overrides: Partial<Attempt> = {}): Attempt => ({
  at,
  outcome: "independent",
  seconds: 60,
  problemId: "canonical",
  title: "Example",
  slug: "example",
  topic: "arrays",
  difficulty: "EASY",
  ...overrides,
});
const empty: AnalyticsSources = {
  attempts: [],
  sessions: [],
  plans: [],
  commitments: [],
  completions: [],
  reviews: [],
};

describe("preparation analytics", () => {
  it("normalizes invalid query input and compares full, equal, non-overlapping local windows", () => {
    const filters = readAnalyticsFilters({
      view: "arbitrary",
      days: "-1",
      topic: ["arrays"],
      compare: "previous",
    });
    expect(filters).toMatchObject({
      view: "overview",
      days: 30,
      topic: "",
      compare: true,
    });
    const { current, previous } = analyticsPeriods("2026-11-04", 7);
    expect([current[0], current.at(-1), previous[0], previous.at(-1)]).toEqual([
      "2026-10-28",
      "2026-11-03",
      "2026-10-21",
      "2026-10-27",
    ]);
  });

  it("attributes records by their local day across midnight and a DST transition", () => {
    const local = dayFormatter("America/New_York");
    expect(local(new Date("2026-11-01T03:59:59Z"))).toBe("2026-10-31");
    expect(local(new Date("2026-11-01T04:00:00Z"))).toBe("2026-11-01");
    expect(local(new Date("2026-11-02T04:59:59Z"))).toBe("2026-11-01");
    expect(local(new Date("2026-11-02T05:00:00Z"))).toBe("2026-11-02");
  });

  it("classifies outcomes, deduplicates solved problems and excludes invalid timings", () => {
    const metrics = attemptMetrics([
      attempt(),
      attempt({ seconds: 180 }),
      attempt({ seconds: 0, outcome: "hint" }),
      attempt({ outcome: "solution_viewed" }),
      attempt({ outcome: "unsolved" }),
      attempt({ outcome: "legacy_unknown" }),
    ]);
    expect(metrics).toMatchObject({
      attempts: 6,
      eligible: 5,
      distinctSolved: 1,
      solves: 3,
      independent: 2,
      assisted: 1,
      viewed: 1,
      failed: 1,
      rate: 40,
      hints: 20,
      medianSeconds: 120,
      timed: 2,
    });
    expect(attemptMetrics([]).rate).toBeNull();
  });

  it("requires a strictly earlier outcome before claiming reattempt improvement", () => {
    const earlier = attempt({ at: `${day}T15:00:00Z`, outcome: "hint" });
    expect(
      improvedReattempts([attempt(), earlier, attempt({ problemId: "different" })])
    ).toHaveLength(1);
    expect(
      improvedReattempts([attempt({ outcome: "unsolved" }), attempt()])
    ).toHaveLength(0);
  });

  it("separates measured time, assigned work, and actual completion", () => {
    const data = projectPeriod(
      [day],
      {
        ...empty,
        sessions: [
          { at, endedAt: `${day}T16:15:00Z`, seconds: 900, work: "Revision" },
          { at, endedAt: null, seconds: 300, work: "Revision" },
          { at, endedAt: at, seconds: 100, work: "Revision" },
        ],
        plans: [{ date: day, rest: true, available: 0 }],
        commitments: [
          { date: day, createdAt: at, status: "completed", minutes: 35, carried: true },
          {
            date: day,
            createdAt: at,
            status: "carried_forward",
            minutes: 35,
            carried: true,
          },
          {
            date: day,
            createdAt: "2026-11-02T10:00:00Z",
            status: "completed",
            minutes: 50,
            carried: false,
          },
        ],
        completions: [at, at],
        reviews: [
          { at, rating: "forgot" },
          { at, rating: "okay" },
        ],
      },
      dayFormatter("UTC"),
      { topic: "", difficulty: "" }
    );
    expect(data.studySeconds).toBe(900);
    expect(data.daily[0]).toMatchObject({
      planned: 35,
      recorded: 15,
      available: 0,
      rest: true,
      committed: 1,
      fulfilled: 1,
      carried: 1,
      completed: 2,
      active: true,
    });
    expect(data.reviews).toEqual({ forgot: 1, okay: 1 });
  });

  it("preserves source outages and keeps unfiltered activity separate from DSA filters", () => {
    const unavailable = projectPeriod(
      [day],
      { ...empty, attempts: null, reviews: null },
      dayFormatter("UTC"),
      { topic: "", difficulty: "" }
    );
    expect(unavailable).toMatchObject({ attempt: null, activeDays: null, reviews: null });
    expect(unavailable.daily[0]).toMatchObject({ available: null, active: null });
    const scoped = projectPeriod(
      [day],
      { ...empty, attempts: [attempt()] },
      dayFormatter("UTC"),
      { topic: "trees", difficulty: "" }
    );
    expect(scoped.attempt?.attempts).toBe(0);
    expect(scoped.activeDays).toBe(1);
  });
});
