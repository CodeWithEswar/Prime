import { describe, it, expect } from "vitest";
import { plannerCommand } from "@/features/planner/schema";
import { DBMS_DAYS_CURRICULUM } from "@/domain/dbms/curriculum";
import { OS_12_DAY_CURRICULUM } from "@/domain/os/curriculum";
import { CN_12_DAY_CURRICULUM } from "@/domain/cn/curriculum";
import { OOP_12_DAY_CURRICULUM } from "@/domain/oop/curriculum";

describe("Planner Course Scheduling Duration Resolution", () => {
  it("does not force a hardcoded 45m default in the course planner schema", () => {
    const parsed = plannerCommand.parse({
      kind: "course",
      course: "dbms",
    });
    // Schema should NOT default to 45, it should be optional
    expect(parsed.kind).toBe("course");
    if (parsed.kind === "course") {
      expect(parsed.minutes).toBeUndefined();
    }
  });

  it("verifies all DBMS curriculum days have realistic estimated minutes (>45m)", () => {
    expect(DBMS_DAYS_CURRICULUM.length).toBe(12);
    for (const day of DBMS_DAYS_CURRICULUM) {
      expect(day.estimatedMinutes).toBeGreaterThanOrEqual(60);
      expect(typeof day.estimatedMinutes).toBe("number");
    }
    // Verify specific key days
    expect(DBMS_DAYS_CURRICULUM[0].estimatedMinutes).toBe(120);
    expect(DBMS_DAYS_CURRICULUM[1].estimatedMinutes).toBe(145);
    expect(DBMS_DAYS_CURRICULUM[5].estimatedMinutes).toBe(110);
  });

  it("verifies OS curriculum days have realistic estimated minutes", () => {
    expect(OS_12_DAY_CURRICULUM.length).toBe(12);
    for (const day of OS_12_DAY_CURRICULUM) {
      expect(day.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("verifies CN curriculum days have realistic estimated minutes", () => {
    expect(CN_12_DAY_CURRICULUM.length).toBe(12);
    for (const day of CN_12_DAY_CURRICULUM) {
      expect(day.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("verifies OOP curriculum days have realistic estimated minutes", () => {
    expect(OOP_12_DAY_CURRICULUM.length).toBe(12);
    for (const day of OOP_12_DAY_CURRICULUM) {
      expect(day.estimatedMinutes).toBeGreaterThan(0);
    }
  });
});
