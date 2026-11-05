// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  practiceAnalytics,
  practiceProvider,
  companyRows,
} from "@/features/problems/selectors/intelligence";
import {
  safeCatalogReturn,
  problemHref,
  parseCatalogPosition,
} from "@/features/problems/navigation";
import { getProblemDetail } from "@/features/problems/queries/get-problem-detail";
import type {
  ProblemAttemptRecord,
  ProblemReviewRecord,
} from "@/features/problems/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
const attempt = (
  id: string,
  outcome: ProblemAttemptRecord["outcome"],
  seconds: number,
  confidence: number
): ProblemAttemptRecord => ({
  id,
  outcome,
  timeTakenSeconds: seconds,
  confidence,
  notes: null,
  attemptedAt: `2026-10-${id.padStart(2, "0")}T10:00:00Z`,
});
describe("problem intelligence adapters", () => {
  it("reveals charts only after usable observations exist", () => {
    expect(practiceAnalytics([])).toMatchObject({
      showTime: false,
      showConfidence: false,
      showRetention: false,
    });
    expect(practiceAnalytics([attempt("1", "independent", 1800, 4)])).toMatchObject({
      showTime: false,
      showConfidence: false,
    });
    expect(
      practiceAnalytics([
        attempt("1", "hint", 0, 3),
        attempt("2", "independent", 1800, 4),
      ])
    ).toMatchObject({ showTime: false, showConfidence: true });
  });
  it("sorts history and keeps best independent separate from assisted attempts", () => {
    const data = practiceAnalytics(
      [
        attempt("3", "independent", 1500, 4),
        attempt("1", "hint", 300, 2),
        attempt("2", "independent", 1800, 3),
      ],
      70
    );
    expect(data.time.map((p) => p.number)).toEqual([68, 69, 70]);
    expect(data.best).toBe(25);
    expect(data.latest?.id).toBe("3");
  });
  it("uses actual review ratings and requires three reviews for retention charts", () => {
    const reviews: ProblemReviewRecord[] = ["forgot", "hard", "easy"].map(
      (rating, i) => ({
        id: String(i),
        rating: rating as ProblemReviewRecord["rating"],
        reviewedAt: `2026-10-0${i + 1}T10:00:00Z`,
        previousIntervalDays: 1,
        nextIntervalDays: 3,
      })
    );
    expect(practiceAnalytics([], 0, reviews.slice(0, 2)).showRetention).toBe(false);
    expect(practiceAnalytics([], 0, reviews).retention.map((p) => p.value)).toEqual([
      1, 2, 4,
    ]);
  });
  it("does not invent external destinations or accept unsafe links", () => {
    expect(practiceProvider(null)).toBeNull();
    expect(practiceProvider("javascript:alert(1)")).toBeNull();
    expect(practiceProvider("https://user:pass@leetcode.com/problems/test")).toBeNull();
    expect(
      practiceProvider("https://geeksforgeeks.org/problems/k-largest-elements4206/1")
        ?.name
    ).toBe("GeeksforGeeks");
  });
  it("preserves zero source frequency and does not combine overlapping windows", () => {
    const rows = companyRows(
      [
        {
          slug: "zero",
          name: "Zero",
          windows: [
            { window: "all_time", frequency: 0, sourceName: null },
            { window: "three_months", frequency: 8, sourceName: null },
          ],
        },
        {
          slug: "unknown",
          name: "Unknown",
          windows: [{ window: "all_time", frequency: null, sourceName: null }],
        },
      ],
      "all_time"
    );
    expect(rows[0].records[0].frequency).toBe(0);
    expect(rows[1].records[0].frequency).toBeNull();
    expect(rows[0].records).toHaveLength(1);
  });
  it("preserves only safe catalog context without allowing open redirects", () => {
    const filters = new URLSearchParams(
      "q=knapsack&topic=dp&company=amazon&collection=core&status=solved&sort=title_asc&page=3&window=three_months"
    );
    const href = problemHref("01-knapsack-problem", filters);
    const from = new URL(href, "https://prime.invalid").searchParams.get("from");
    expect(safeCatalogReturn(from)).toContain("page=3");
    expect(safeCatalogReturn(from)).toContain("company=amazon");
    for (const bad of [
      "https://evil.test",
      "//evil.test",
      "/settings",
      "/practice/dsa/other",
      "/practice/dsa\\@evil.test",
    ])
      expect(safeCatalogReturn(bad)).toBe("/practice/dsa");
    expect(safeCatalogReturn("/practice/dsa?user_id=another&q=hello")).toBe(
      "/practice/dsa?q=hello"
    );
  });
  it("rejects stale or malformed scroll restoration data", () => {
    expect(parseCatalogPosition("{bad")).toBeNull();
    expect(
      parseCatalogPosition(JSON.stringify({ at: 0, y: 20, slug: "test", items: [] }))
    ).toBeNull();
    expect(
      parseCatalogPosition(
        JSON.stringify({
          at: Date.now(),
          y: 240,
          slug: "test",
          items: [
            { slug: "test", title: "Test" },
            { slug: "../settings", title: "Unsafe" },
          ],
        })
      )?.items
    ).toEqual([{ slug: "test", title: "Test" }]);
  });
});

type Reply = { data: unknown; error: unknown; count?: number };
function clientFixture(overrides: Record<string, Reply> = {}) {
  const calls: { table: string; steps: { method: string; args: unknown[] }[] }[] = [];
  const defaults: Record<string, Reply> = {
    problems: {
      data: {
        id: "p1",
        slug: "01-knapsack-problem",
        title: "0/1 Knapsack Problem",
        difficulty: "medium",
        external_url: null,
        acceptance_rate: null,
        prime_priority: "standard",
        leetcode_slug: null,
        estimated_minutes: null,
        primary_topic: { id: "dp", slug: "dp", name: "Dynamic Programming" },
      },
      error: null,
    },
    problem_topics: { data: [], error: null },
    problem_collection_items: {
      data: [
        {
          position: null,
          section: null,
          collection: { id: "c1", slug: "one", name: "One" },
        },
      ],
      error: null,
    },
    company_problem_stats: {
      data: [
        {
          time_window: "all_time",
          frequency: null,
          company: { slug: "amazon", name: "Amazon" },
          source: { name: "Source" },
        },
      ],
      error: null,
    },
    user_problem_progress: {
      data: {
        status: "needs_revision",
        mastery_score: 0.25,
        last_attempt_at: null,
        next_revision_at: null,
      },
      error: null,
    },
    problem_attempts: { data: [], error: null, count: 48 },
    revision_items: {
      data: {
        id: "r1",
        interval_days: 7,
        next_review_at: "2000-01-01T00:00:00Z",
        last_reviewed_at: null,
        status: "active",
        reviews: [],
      },
      error: null,
    },
  };
  const client = {
    from: (table: string) => {
      const call = { table, steps: [] as { method: string; args: unknown[] }[] };
      calls.push(call);
      const reply = overrides[table] ?? defaults[table];
      const proxy: object = new Proxy(
        {},
        {
          get: (_target, key) =>
            key === "then"
              ? (
                  resolve: (value: Reply) => unknown,
                  reject: (error: unknown) => unknown
                ) => Promise.resolve(reply).then(resolve, reject)
              : (...args: unknown[]) => {
                  call.steps.push({ method: String(key), args });
                  return proxy;
                },
        }
      );
      return proxy;
    },
  } as unknown as SupabaseClient<Database>;
  return { client, calls };
}
describe("bounded problem detail reads", () => {
  it("loads one canonical problem, retains missing values, and scopes every personal read", async () => {
    const { client, calls } = clientFixture();
    const result = await getProblemDetail(client, "01-knapsack-problem", "owner");
    expect(result).toMatchObject({
      attemptCount: 48,
      estimatedMinutes: null,
      acceptanceRate: null,
      isRevisionDue: true,
      companies: [{ slug: "amazon", windows: [{ frequency: null }] }],
    });
    expect(calls).toHaveLength(7);
    for (const table of ["problem_attempts", "revision_items", "user_problem_progress"])
      expect(calls.find((c) => c.table === table)?.steps).toContainEqual({
        method: "eq",
        args: ["user_id", "owner"],
      });
    expect(calls.find((c) => c.table === "problem_attempts")?.steps).toContainEqual({
      method: "range",
      args: [0, 39],
    });
    expect(calls.find((c) => c.table === "company_problem_stats")?.steps).toContainEqual({
      method: "eq",
      args: ["problem_id", "p1"],
    });
  });
  it("keeps a company failure from replacing the personal page with a not-found state", async () => {
    const { client } = clientFixture({
      company_problem_stats: { data: null, error: { message: "unavailable" } },
    });
    const result = await getProblemDetail(client, "01-knapsack-problem", "owner");
    expect(result?.unavailable).toContain("companies");
    expect(result?.revision?.intervalDays).toBe(7);
  });
  it("distinguishes a missing problem from a backend failure", async () => {
    expect(
      await getProblemDetail(
        clientFixture({ problems: { data: null, error: null } }).client,
        "missing",
        "owner"
      )
    ).toBeNull();
    await expect(
      getProblemDetail(
        clientFixture({ problems: { data: null, error: { message: "unavailable" } } })
          .client,
        "missing",
        "owner"
      )
    ).rejects.toThrow("could not be loaded");
  });
  it("does not issue personal-table reads without a verified user context", async () => {
    const { client, calls } = clientFixture();
    await getProblemDetail(client, "01-knapsack-problem");
    expect(calls.map((c) => c.table)).not.toContain("problem_attempts");
    expect(calls.map((c) => c.table)).not.toContain("revision_items");
  });
});
