import { describe, it, expect } from "vitest";
import {
  calculateNextRevisionInterval,
  getStageLabel,
  evaluateRevisionAttempt,
  categorizeRevisionItem,
  formatDueTiming,
} from "@/domain/revision";

describe("domain/revision - Spaced Repetition Engine", () => {
  describe("calculateNextRevisionInterval", () => {
    it("resets to 1 day on 'forgot' regardless of previous interval", () => {
      expect(calculateNextRevisionInterval(1, "forgot")).toBe(1);
      expect(calculateNextRevisionInterval(7, "forgot")).toBe(1);
      expect(calculateNextRevisionInterval(30, "forgot")).toBe(1);
    });

    it("repeats current interval on 'hard' (minimum 1)", () => {
      expect(calculateNextRevisionInterval(0, "hard")).toBe(1);
      expect(calculateNextRevisionInterval(1, "hard")).toBe(1);
      expect(calculateNextRevisionInterval(3, "hard")).toBe(3);
      expect(calculateNextRevisionInterval(7, "hard")).toBe(7);
      expect(calculateNextRevisionInterval(14, "hard")).toBe(14);
      expect(calculateNextRevisionInterval(30, "hard")).toBe(30);
    });

    it("advances by 1 step along the interval ladder on 'okay'", () => {
      expect(calculateNextRevisionInterval(0, "okay")).toBe(1);
      expect(calculateNextRevisionInterval(1, "okay")).toBe(3);
      expect(calculateNextRevisionInterval(3, "okay")).toBe(7);
      expect(calculateNextRevisionInterval(7, "okay")).toBe(14);
      expect(calculateNextRevisionInterval(14, "okay")).toBe(30);
      expect(calculateNextRevisionInterval(30, "okay")).toBe(30);
    });

    it("advances by 2 steps along the interval ladder on 'easy'", () => {
      expect(calculateNextRevisionInterval(0, "easy")).toBe(3);
      expect(calculateNextRevisionInterval(1, "easy")).toBe(7);
      expect(calculateNextRevisionInterval(3, "easy")).toBe(14);
      expect(calculateNextRevisionInterval(7, "easy")).toBe(30);
      expect(calculateNextRevisionInterval(14, "easy")).toBe(30);
      expect(calculateNextRevisionInterval(30, "easy")).toBe(30);
    });
  });

  describe("getStageLabel", () => {
    it("returns correct stage labels", () => {
      expect(getStageLabel(1)).toBe("Stage 1-day");
      expect(getStageLabel(3)).toBe("Stage 3-day");
      expect(getStageLabel(7)).toBe("Stage 7-day");
      expect(getStageLabel(14)).toBe("Stage 14-day");
      expect(getStageLabel(30)).toBe("Stage 30-day");
    });
  });

  describe("evaluateRevisionAttempt", () => {
    it("evaluates a successful review accurately", () => {
      const fixedNow = new Date("2026-11-02T12:00:00Z");
      const result = evaluateRevisionAttempt({
        currentIntervalDays: 3,
        rating: "okay",
        currentDate: fixedNow,
      });

      expect(result.previousIntervalDays).toBe(3);
      expect(result.nextIntervalDays).toBe(7);
      expect(result.stageLabel).toBe("Stage 7-day");
      expect(result.nextReviewDate.toISOString().slice(0, 10)).toBe("2026-11-09");
    });
  });

  describe("categorizeRevisionItem and formatDueTiming", () => {
    const today = new Date("2026-11-02T10:00:00Z");

    it("detects overdue items", () => {
      const yesterday = new Date("2026-11-01T10:00:00Z");
      expect(categorizeRevisionItem(yesterday, today)).toBe("overdue");
      const timing = formatDueTiming(yesterday, today);
      expect(timing.label).toBe("Due Yesterday");
      expect(timing.isOverdue).toBe(true);

      const twoDaysAgo = new Date("2026-10-31T10:00:00Z");
      expect(categorizeRevisionItem(twoDaysAgo, today)).toBe("overdue");
      expect(formatDueTiming(twoDaysAgo, today).label).toBe("2 days ago");
    });

    it("detects due today items", () => {
      const dueToday = new Date("2026-11-02T15:00:00Z");
      expect(categorizeRevisionItem(dueToday, today)).toBe("due_today");
      const timing = formatDueTiming(dueToday, today);
      expect(timing.label).toBe("Due Today");
      expect(timing.isOverdue).toBe(false);
    });

    it("detects upcoming items", () => {
      const tomorrow = new Date("2026-11-03T10:00:00Z");
      expect(categorizeRevisionItem(tomorrow, today)).toBe("upcoming");
      expect(formatDueTiming(tomorrow, today).label).toBe("Tomorrow");

      const inThreeDays = new Date("2026-11-05T10:00:00Z");
      expect(categorizeRevisionItem(inThreeDays, today)).toBe("upcoming");
      expect(formatDueTiming(inThreeDays, today).label).toBe("Nov 05");
    });
  });
});

