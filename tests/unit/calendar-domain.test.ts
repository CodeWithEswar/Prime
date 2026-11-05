import { describe, it, expect } from "vitest";
import {
  formatDurationCompact,
  formatDurationDetailed,
  getLoadRailMetrics,
  deriveCalendarAttention,
  calculateMonthSummary,
  groupRangeByWeek,
  buildMonthMatrix,
  detectTaskSubject,
} from "@/features/calendar/domain/projection";
import { SUBJECT_CONFIG } from "@/features/calendar/components/subject-badge";
import type { CalendarDayProjection } from "@/features/calendar/types";

describe("Calendar Domain — Projection Intelligence Tests", () => {
  describe("Duration Formatting", () => {
    it("formats durations compactly for month cells", () => {
      expect(formatDurationCompact(0)).toBe("0m");
      expect(formatDurationCompact(45)).toBe("45m");
      expect(formatDurationCompact(60)).toBe("1h");
      expect(formatDurationCompact(120)).toBe("2h");
      expect(formatDurationCompact(150)).toBe("2h30");
      expect(formatDurationCompact(225)).toBe("3h45");
    });

    it("formats durations detailed for Day Lens inspection", () => {
      expect(formatDurationDetailed(0)).toBe("0m");
      expect(formatDurationDetailed(60)).toBe("1h");
      expect(formatDurationDetailed(90)).toBe("1h 30m");
      expect(formatDurationDetailed(220)).toBe("3h 40m");
    });
  });

  describe("Load Rail Metrics", () => {
    it("calculates normal load ratios within capacity", () => {
      const metrics = getLoadRailMetrics(180, 240, 90);
      expect(metrics.fillRatio).toBe(0.75);
      expect(metrics.completedRatio).toBe(0.5);
      expect(metrics.isOverCapacity).toBe(false);
      expect(metrics.overflowMinutes).toBe(0);
    });

    it("identifies over-capacity overflow accurately", () => {
      const metrics = getLoadRailMetrics(275, 240, 0);
      expect(metrics.fillRatio).toBe(1.0);
      expect(metrics.isOverCapacity).toBe(true);
      expect(metrics.overflowMinutes).toBe(35);
    });

    it("handles zero capacity and rest days gracefully", () => {
      const metrics = getLoadRailMetrics(0, 0, 0);
      expect(metrics.fillRatio).toBe(0);
      expect(metrics.isOverCapacity).toBe(false);
      expect(metrics.overflowMinutes).toBe(0);
    });
  });

  describe("Temporal Attention Precedence", () => {
    it("prioritizes over-capacity over all other signals", () => {
      const attention = deriveCalendarAttention({
        plannedMinutes: 260,
        availableMinutes: 240,
        overdueRevisionCount: 2,
        isRestDay: false,
        trajectory: "on_track",
      });
      expect(attention).toBe("over-capacity");
    });

    it("flags overdue revisions when not over capacity", () => {
      const attention = deriveCalendarAttention({
        plannedMinutes: 180,
        availableMinutes: 240,
        overdueRevisionCount: 1,
        isRestDay: false,
        trajectory: "on_track",
      });
      expect(attention).toBe("overdue");
    });

    it("flags at-risk plan trajectory when attention is otherwise clean", () => {
      const attention = deriveCalendarAttention({
        plannedMinutes: 180,
        availableMinutes: 240,
        overdueRevisionCount: 0,
        isRestDay: false,
        trajectory: "at_risk",
      });
      expect(attention).toBe("at-risk");
    });

    it("returns none for healthy balanced preparation days", () => {
      const attention = deriveCalendarAttention({
        plannedMinutes: 180,
        availableMinutes: 240,
        overdueRevisionCount: 0,
        isRestDay: false,
        trajectory: "on_track",
      });
      expect(attention).toBe("none");
    });
  });

  describe("Month Summary & Week Grouping", () => {
    const mockDays: CalendarDayProjection[] = [
      {
        date: "2026-11-02", // Monday
        dayOfWeek: 1,
        dayNumber: 2,
        isToday: false,
        isSelected: false,
        isCurrentMonth: true,
        isPlanStart: false,
        isTargetDate: false,
        isRestDay: false,
        availableMinutes: 240,
        plannedMinutes: 180,
        completedMinutes: 180,
        taskCount: 4,
        completedTaskCount: 4,
        revisionCount: 1,
        overdueRevisionCount: 0,
        carriedTaskCount: 0,
        attention: "none",
      },
      {
        date: "2026-11-03", // Tuesday
        dayOfWeek: 2,
        dayNumber: 3,
        isToday: true,
        isSelected: true,
        isCurrentMonth: true,
        isPlanStart: false,
        isTargetDate: false,
        isRestDay: false,
        availableMinutes: 240,
        plannedMinutes: 220,
        completedMinutes: 0,
        taskCount: 5,
        completedTaskCount: 0,
        revisionCount: 2,
        overdueRevisionCount: 0,
        carriedTaskCount: 0,
        attention: "none",
      },
      {
        date: "2026-11-08", // Sunday (Rest)
        dayOfWeek: 0,
        dayNumber: 8,
        isToday: false,
        isSelected: false,
        isCurrentMonth: true,
        isPlanStart: false,
        isTargetDate: false,
        isRestDay: true,
        availableMinutes: 0,
        plannedMinutes: 0,
        completedMinutes: 0,
        taskCount: 0,
        completedTaskCount: 0,
        revisionCount: 0,
        overdueRevisionCount: 0,
        carriedTaskCount: 0,
        attention: "none",
      },
    ];

    it("calculates month summary metrics accurately", () => {
      const summary = calculateMonthSummary("2026-11", mockDays, "on_track");
      expect(summary.monthKey).toBe("2026-11");
      expect(summary.totalPlannedMinutes).toBe(400);
      expect(summary.totalCapacityMinutes).toBe(480);
      expect(summary.totalTasks).toBe(9);
      expect(summary.totalRevisions).toBe(3);
      expect(summary.restDaysCount).toBe(1);
    });

    it("groups day projections into weeks ending on Sunday", () => {
      const weeks = groupRangeByWeek(mockDays, "on_track");
      expect(weeks.length).toBe(1);
      expect(weeks[0].weekNumber).toBe(1);
      expect(weeks[0].totalPlannedMinutes).toBe(400);
      expect(weeks[0].totalTasks).toBe(9);
      expect(weeks[0].restDaysCount).toBe(1);
    });
  });

  describe("Month Matrix Grid Builder", () => {
    it("pads month grid so Monday is the first day of every week", () => {
      const daysMap = new Map<string, CalendarDayProjection>();
      const matrix = buildMonthMatrix(2026, 11, daysMap, "2026-11-05", "2026-11-03");

      // November 1, 2026 was a Sunday.
      // So Monday-Saturday of the previous week (Oct 26 - Oct 31) are padded at the beginning.
      expect(matrix[0].dayOfWeek).toBe(1); // First cell is Monday
      expect(matrix[0].date).toBe("2026-10-26");
      expect(matrix[0].isCurrentMonth).toBe(false);

      // The last day of the matrix must be a Sunday
      expect(matrix[matrix.length - 1].dayOfWeek).toBe(0); // Sunday

      // Grid size must be an exact multiple of 7
      expect(matrix.length % 7).toBe(0);

      // Verify Today flag
      const todayCell = matrix.find((d) => d.date === "2026-11-03");
      expect(todayCell).toBeDefined();
      expect(todayCell?.isToday).toBe(true);

      // Verify Selected flag
      const selectedCell = matrix.find((d) => d.date === "2026-11-05");
      expect(selectedCell).toBeDefined();
      expect(selectedCell?.isSelected).toBe(true);
    });

    it("handles leap year February accurately", () => {
      const daysMap = new Map<string, CalendarDayProjection>();
      const matrix2028 = buildMonthMatrix(2028, 2, daysMap, "2028-02-15", "2028-02-01");
      const feb29 = matrix2028.find((d) => d.date === "2028-02-29");
      expect(feb29).toBeDefined();
      expect(feb29?.isCurrentMonth).toBe(true);
    });
  });

  describe("Calendar Subject Detection & Icons", () => {
    it("detects DBMS, OS, CN, OOP, Aptitude, and DSA correctly", () => {
      expect(detectTaskSubject({ task_type: "dsa_problem", title: "Two Sum" })).toBe("dsa");
      expect(detectTaskSubject({ task_type: "custom", problem_id: "prob-1" })).toBe("dsa");
      expect(detectTaskSubject({ task_type: "custom", title: "DBMS Day 1 · Architecture" })).toBe("dbms");
      expect(detectTaskSubject({ task_type: "custom", title: "OS Day 2 · CPU Scheduling" })).toBe("os");
      expect(detectTaskSubject({ task_type: "custom", title: "CN Day 3 · OSI Model" })).toBe("cn");
      expect(detectTaskSubject({ task_type: "custom", title: "OOP Day 4 · Polymorphism" })).toBe("oop");
      expect(detectTaskSubject({ task_type: "custom", title: "OOPS Concept and Class Hierarchy" })).toBe("oop");
      expect(detectTaskSubject({ task_type: "custom", title: "Aptitude Day 1 · Quantitative Aptitude" })).toBe("aptitude");
      expect(detectTaskSubject({ task_type: "revision", title: "Revision Session" })).toBe("dsa");

      // Verify all 6 subject configs exist with icon, colors, and description
      const subjects = ["dsa", "dbms", "os", "cn", "oop", "aptitude"] as const;
      for (const subj of subjects) {
        expect(SUBJECT_CONFIG[subj]).toBeDefined();
        expect(SUBJECT_CONFIG[subj].label).toBeDefined();
        expect(SUBJECT_CONFIG[subj].icon).toBeDefined();
        expect(SUBJECT_CONFIG[subj].color).toBeDefined();
        expect(SUBJECT_CONFIG[subj].description).toBeDefined();
      }
    });
  });
});

