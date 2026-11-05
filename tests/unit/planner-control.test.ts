import { describe, expect, it } from "vitest";
import {
  capacityDays,
  planControl,
  type ScheduledWork,
  type Work,
} from "@/domain/planning/control";
import type { PreparationTarget } from "@/domain/planning/types";

const today = "2026-11-02";
const end = "2026-11-08";
const target: PreparationTarget = {
  userId: "learner",
  startDate: today,
  targetDate: end,
  timezone: "UTC",
  targetRole: "Engineer",
  defaultDailyCapacityMinutes: 100,
  weekdayRules: [],
  exceptions: [],
  restDays: [0],
};
const work: Work = {
  title: "Practice",
  minutes: 30,
  type: "dsa_problem",
  priority: "P1",
  source: "planner_generated",
};
function task(
  id: string,
  date: string,
  options: Partial<ScheduledWork> = {}
): ScheduledWork {
  return {
    id,
    date,
    title: id,
    minutes: 30,
    priority: "P2",
    locked: false,
    status: "pending",
    source: "user_created",
    type: "custom",
    problemId: null,
    revisionId: null,
    ...options,
  };
}
describe("Planner control", () => {
  it("resolves dated availability and preserves a daily buffer", () => {
    const calendar = capacityDays(
      today,
      {
        ...target,
        weekdayRules: [{ dayOfWeek: 0, isRestDay: false, availableMinutes: 60 }],
        exceptions: [{ date: today, availableMinutes: 45, isUnavailable: false }],
      },
      []
    );
    expect(calendar).toHaveLength(90);
    expect(calendar[0]).toMatchObject({ available: 45, budget: 38, rest: false });
    expect(calendar[6]).toMatchObject({ available: 60, budget: 51, rest: false });
    const capped = planControl({
      today,
      end,
      target,
      work: [{ ...work, minutes: 86 }],
      tasks: [],
      fixedDate: today,
    });
    expect(capped.placements).toHaveLength(0);
    const override = planControl({
      today,
      end,
      target,
      work: [{ ...work, minutes: 86 }],
      tasks: [],
      fixedDate: today,
      allowOverload: true,
    });
    expect(override.placements).toHaveLength(1);
    expect(override.warnings[0]).toContain("buffer");
  });

  it("allocates due reviews first, caps new DSA and produces deterministic results", () => {
    const review: Work = {
      ...work,
      title: "Review",
      minutes: 25,
      type: "revision",
      priority: "P0",
      due: today,
    };
    const input = {
      today,
      end,
      target,
      work: [
        ...Array.from({ length: 4 }, (_, i) => ({
          ...work,
          title: "Problem " + i,
          minutes: 10,
        })),
        review,
      ],
      tasks: [],
    };
    const result = planControl(input);
    expect(result.placements.map((p) => p.date)).toEqual([
      today,
      today,
      today,
      today,
      "2026-11-03",
    ]);
    expect(result.placements[0].title).toBe("Review");
    expect(planControl(input)).toEqual(result);
  });

  it("places roadmap sessions in order on separate available days", () => {
    const sessions: Work[] = [1, 2, 3].map((day) => ({
      ...work,
      title: "Roadmap day " + day,
      type: "custom",
    }));
    const result = planControl({
      today,
      start: "2026-11-06",
      end,
      target,
      tasks: [],
      work: sessions,
      sequential: true,
    });
    expect(result.placements.map(({ date, title }) => [date, title])).toEqual([
      ["2026-11-06", "Roadmap day 1"],
      ["2026-11-07", "Roadmap day 2"],
    ]);
    expect(result.unplaced).toEqual(["Roadmap day 3"]);
  });

  it("places all 12 days of a fundamentals course across sequential days when target horizon is sufficient", () => {
    const sessions: Work[] = Array.from({ length: 12 }, (_, i) => ({
      ...work,
      title: `DBMS Day ${i + 1} · Lesson`,
      type: "custom",
    }));
    const extendedTarget = { ...target, targetDate: "2026-11-20" };
    const result = planControl({
      today,
      start: today,
      end: "2026-11-20",
      target: extendedTarget,
      tasks: [],
      work: sessions,
      sequential: true,
    });
    expect(result.placements).toHaveLength(12);
    expect(result.unplaced).toHaveLength(0);
    expect(result.placements[0].title).toBe("DBMS Day 1 · Lesson");
    expect(result.placements[11].title).toBe("DBMS Day 12 · Lesson");
  });

  it("moves missed and optional excess while preserving locks, history and stable dates", () => {
    const tasks = [
      task("missed", "2026-11-01"),
      task("locked", today, { locked: true, minutes: 40 }),
      task("complete", today, { status: "completed", minutes: 30 }),
      task("optional", today, { priority: "OPTIONAL" }),
      task("stable", "2026-11-04"),
    ];
    const result = planControl({ today, end, target, work: [], tasks, rebalance: true });
    expect(result.placements).toEqual([
      expect.objectContaining({
        moveId: "missed",
        date: "2026-11-03",
        reason: "CARRY_FORWARD",
      }),
      expect.objectContaining({
        moveId: "optional",
        date: "2026-11-03",
        reason: "CAPACITY_REBALANCE",
      }),
    ]);
    expect(tasks[0].date).toBe("2026-11-01");
    expect(result.days[0].planned).toBe(70);
  });
});
