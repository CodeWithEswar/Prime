// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getTargetReadinessData } from "@/features/readiness/server/service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

describe("Interview Readiness Service Integration Tests", () => {
  const fixedNow = new Date("2026-11-04T12:00:00Z");
  const testUserId = "user-readiness-123";

  it("aggregates raw database rows into verified competency readiness result", async () => {
    // Mock Supabase client returning representative database records
    const mockClient = {
      from: (table: string) => {
        if (table === "user_settings") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { target_role: "Backend Engineer" }, error: null }),
              }),
            }),
          };
        }
        if (table === "preparation_plans") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    limit: () => ({
                      maybeSingle: async () => ({
                        data: { target_role: "Backend Engineer" },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        if (table === "problems") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  {
                    id: "p-two-sum",
                    slug: "two-sum",
                    title: "Two Sum",
                    difficulty: "EASY",
                    topic: { id: "t-arrays", name: "Arrays & Hashing", slug: "arrays-hashing" },
                  },
                  {
                    id: "p-binary-search",
                    slug: "binary-search",
                    title: "Binary Search",
                    difficulty: "EASY",
                    topic: { id: "t-bs", name: "Binary Search", slug: "binary-search" },
                  },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === "problem_attempts") {
          return {
            select: () => ({
              eq: () => ({
                lte: async () => ({
                  data: [
                    {
                      id: "att-1",
                      problem_id: "p-two-sum",
                      outcome: "solved",
                      time_taken_seconds: 600,
                      confidence: 4,
                      attempted_at: "2026-11-03T10:00:00Z",
                    },
                    {
                      id: "att-2",
                      problem_id: "p-two-sum",
                      outcome: "solved",
                      time_taken_seconds: 500,
                      confidence: 5,
                      attempted_at: "2026-11-04T10:00:00Z",
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "revision_items") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === "learning_video_progress") {
          return {
            select: () => ({
              eq: () => ({
                in: async () => ({
                  data: [
                    { video_id: "OMwgGL3lHlI", status: "watched", watched_at: "2026-11-04T09:00:00Z" },
                    { video_id: "eGlyfNRdjz4", status: "watched", watched_at: "2026-11-04T09:30:00Z" },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "learning_exercise_attempts") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  { exercise_id: "sqlbolt-ddl-create", outcome: "solved_independent", attempted_at: "2026-11-04T10:00:00Z" },
                ],
                error: null,
              }),
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        };
      },
    } as unknown as SupabaseClient<Database>;

    const result = await getTargetReadinessData(mockClient, testUserId, undefined, undefined, fixedNow);

    // Profile auto-detection matched "Backend Engineer" -> "backend-dev"
    expect(result.profile.id).toBe("backend-dev");
    expect(result.totalCompetencies).toBeGreaterThan(0);
    expect(result.competencies.length).toBe(result.totalCompetencies);
    expect(result.domainSummaries.fundamentals).toBeDefined();

    // Verify arrays competency received evidence from two-sum
    const arraysComp = result.competencies.find((c) => c.competencyId === "dsa-arrays");
    expect(arraysComp).toBeDefined();

    // Verify DBMS and SQL competencies received evidence from learning tables
    const dbmsComp = result.competencies.find((c) => c.competencyId === "fund-dbms");
    expect(dbmsComp).toBeDefined();
    expect(dbmsComp?.status).not.toBe("not_assessed");

    const sqlComp = result.competencies.find((c) => c.competencyId === "fund-sql");
    expect(sqlComp).toBeDefined();
    expect(sqlComp?.status).not.toBe("not_assessed");

    const networksComp = result.competencies.find((c) => c.competencyId === "fund-networks");
    expect(networksComp).toBeDefined();
    expect(networksComp?.status).not.toBe("not_assessed");
  });
});
