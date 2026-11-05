import { describe, it, expect } from "vitest";
import {
  practiceFilterSchema,
  recordAttemptFormSchema,
} from "@/features/problems/schema";
import { deriveAttemptEffects } from "@/domain/attempts";

describe("DSA Practice — Schemas & Validation", () => {
  describe("practiceFilterSchema", () => {
    it("applies sensible defaults when input is empty", () => {
      const parsed = practiceFilterSchema.parse({});
      expect(parsed.q).toBe("");
      expect(parsed.topic).toBe("");
      expect(parsed.difficulty).toBe("");
      expect(parsed.status).toBe("");
      expect(parsed.sort).toBe("recommended");
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(25);
    });

    it("parses valid filter query values", () => {
      const parsed = practiceFilterSchema.parse({
        q: "binary search",
        topic: "arrays",
        difficulty: "medium",
        status: "needs_revision",
        sort: "difficulty_desc",
        page: "3",
        pageSize: "50",
      });

      expect(parsed.q).toBe("binary search");
      expect(parsed.topic).toBe("arrays");
      expect(parsed.difficulty).toBe("medium");
      expect(parsed.status).toBe("needs_revision");
      expect(parsed.sort).toBe("difficulty_desc");
      expect(parsed.page).toBe(3);
      expect(parsed.pageSize).toBe(50);
    });
  });

  describe("recordAttemptFormSchema", () => {
    it("accepts valid attempt data", () => {
      const valid = {
        problemId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
        outcome: "independent",
        durationMinutes: 25,
        confidence: 4,
        notes: "Used two pointer approach",
      };

      const result = recordAttemptFormSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.problemId).toBe(valid.problemId);
        expect(result.data.durationMinutes).toBe(25);
        expect(result.data.confidence).toBe(4);
        expect(result.data.notes).toBe("Used two pointer approach");
      }
    });

    it("rejects invalid UUID problem IDs", () => {
      const invalid = {
        problemId: "not-a-uuid",
        outcome: "independent",
        durationMinutes: 30,
        confidence: 3,
      };

      const result = recordAttemptFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects confidence scores outside 1-5", () => {
      const invalid = {
        problemId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
        outcome: "hint",
        durationMinutes: 20,
        confidence: 6,
      };

      const result = recordAttemptFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("transforms whitespace notes to null", () => {
      const input = {
        problemId: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
        outcome: "independent",
        durationMinutes: 15,
        confidence: 5,
        notes: "   ",
      };

      const result = recordAttemptFormSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBeNull();
      }
    });
  });

  describe("Spaced Retention Integration", () => {
    it("progresses independent attempt interval along [1, 3, 7, 14, 30] sequence", () => {
      const fixedNow = new Date("2026-11-01T00:00:00.000Z");

      // 1. Initial attempt
      const step1 = deriveAttemptEffects(
        {
          outcome: "independent",
          confidence: 4,
          timeTakenMinutes: 20,
          currentStatus: "not_started",
          currentIntervalDays: 0,
        },
        fixedNow
      );
      expect(step1.nextStatus).toBe("solved");
      expect(step1.nextIntervalDays).toBe(3);

      // 2. Second attempt (confidence 4)
      const step2 = deriveAttemptEffects(
        {
          outcome: "independent",
          confidence: 4,
          timeTakenMinutes: 15,
          currentStatus: "solved",
          currentIntervalDays: 3,
        },
        fixedNow
      );
      expect(step2.nextIntervalDays).toBe(7);

      // 3. Third attempt
      const step3 = deriveAttemptEffects(
        {
          outcome: "independent",
          confidence: 4,
          timeTakenMinutes: 15,
          currentStatus: "solved",
          currentIntervalDays: 7,
        },
        fixedNow
      );
      expect(step3.nextIntervalDays).toBe(14);
    });

    it("resets interval to 1 on solution_viewed or unsolved", () => {
      const step = deriveAttemptEffects({
        outcome: "solution_viewed",
        confidence: 2,
        timeTakenMinutes: 45,
        currentStatus: "solved",
        currentIntervalDays: 14,
      });

      expect(step.nextStatus).toBe("needs_revision");
      expect(step.nextIntervalDays).toBe(1);
    });
  });
});
