import { describe, it, expect } from "vitest";
import { notificationPreferencesSchema } from "@/domain/notifications/schemas";
import {
  profileUpdateSchema,
  careerTargetsUpdateSchema,
  studyCommitmentUpdateSchema,
  learningPreferencesUpdateSchema,
  appearancePreferencesUpdateSchema,
  accountDeletionSchema,
  emailChangeSchema,
} from "@/features/settings/schema";

describe("PRIME Settings & Preferences Schemas", () => {
  it("accepts numeric reminder lead times sent by the settings form", () => {
    expect(
      notificationPreferencesSchema.parse({ sessionLeadTimeMinutes: 30 })
        .sessionLeadTimeMinutes
    ).toBe(30);
    expect(
      notificationPreferencesSchema.parse({ sessionLeadTimeMinutes: "15" })
        .sessionLeadTimeMinutes
    ).toBe(15);
    expect(
      notificationPreferencesSchema.safeParse({ sessionLeadTimeMinutes: 20 }).success
    ).toBe(false);
  });

  it("rejects duplicate weekdays and reversed availability windows", () => {
    const rules = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      availableMinutes: 60,
      isRestDay: false,
      preferredStartTime: "18:00",
      preferredEndTime: "19:00",
    }));
    expect(
      studyCommitmentUpdateSchema.safeParse({
        dailyStudyMinutes: 60,
        availabilityRules: rules.map((rule) => ({ ...rule, dayOfWeek: 1 })),
      }).success
    ).toBe(false);
    expect(
      studyCommitmentUpdateSchema.safeParse({
        dailyStudyMinutes: 60,
        availabilityRules: rules.map((rule) => ({ ...rule, preferredEndTime: "17:00" })),
      }).success
    ).toBe(false);
  });
  describe("Profile Update Schema", () => {
    it("accepts valid profile inputs", () => {
      const parsed = profileUpdateSchema.parse({
        displayName: "Alex Johnson",
        fullName: "Alexander David Johnson",
        institution: "IIT Bombay",
        degree: "B.Tech",
        specialization: "CSE",
        graduationYear: 2026,
      });

      expect(parsed.displayName).toBe("Alex Johnson");
      expect(parsed.graduationYear).toBe(2026);
    });

    it("rejects empty display name", () => {
      expect(() =>
        profileUpdateSchema.parse({
          displayName: "   ",
        })
      ).toThrow();
    });

    it("rejects graduation year outside bounds", () => {
      expect(() =>
        profileUpdateSchema.parse({
          displayName: "Alex",
          graduationYear: 1950,
        })
      ).toThrow();
    });
  });

  describe("Career Targets Update Schema", () => {
    it("accepts valid career targets with company chips and LPA package", () => {
      const parsed = careerTargetsUpdateSchema.parse({
        targetRole: "Software Development Engineer (SDE)",
        targetCompanies: ["Google", "Microsoft", "Amazon"],
        primaryTargetCompany: "Google",
        targetPackage: "24 LPA",
        targetCompensationAmount: 24,
        targetCompensationCurrency: "INR",
        targetCompensationPeriod: "annual",
        targetDate: "2026-12-15",
        experienceLevel: "intermediate",
        difficultyPreference: "balanced",
      });

      expect(parsed.targetRole).toBe("Software Development Engineer (SDE)");
      expect(parsed.targetCompanies).toHaveLength(3);
      expect(parsed.targetCompensationAmount).toBe(24);
    });

    it("rejects invalid target date format", () => {
      expect(() =>
        careerTargetsUpdateSchema.parse({
          targetRole: "Backend Engineer",
          targetDate: "15/12/2026", // Not YYYY-MM-DD
        })
      ).toThrow();
    });
  });

  describe("Study Commitment Update Schema", () => {
    it("accepts valid 7-day schedule with rest days", () => {
      const validRules = Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        availableMinutes: i === 0 ? 0 : 180,
        isRestDay: i === 0,
        preferredStartTime: "18:00:00",
        preferredEndTime: "21:00:00",
      }));

      const parsed = studyCommitmentUpdateSchema.parse({
        dailyStudyMinutes: 120,
        restDays: [0],
        availabilityRules: validRules,
      });

      expect(parsed.dailyStudyMinutes).toBe(120);
      expect(parsed.availabilityRules).toHaveLength(7);
      expect(parsed.restDays).toEqual([0]);
    });

    it("rejects incomplete rules array", () => {
      expect(() =>
        studyCommitmentUpdateSchema.parse({
          dailyStudyMinutes: 120,
          restDays: [],
          availabilityRules: [{ dayOfWeek: 1, availableMinutes: 120, isRestDay: false }], // not 7
        })
      ).toThrow();
    });

    it("rejects daily minutes below 15", () => {
      const validRules = Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        availableMinutes: 120,
        isRestDay: false,
      }));

      expect(() =>
        studyCommitmentUpdateSchema.parse({
          dailyStudyMinutes: 5,
          availabilityRules: validRules,
        })
      ).toThrow();
    });
  });

  describe("Learning Preferences Schema", () => {
    it("accepts valid language, difficulty, and revision preferences", () => {
      const parsed = learningPreferencesUpdateSchema.parse({
        preferredLanguage: "python",
        difficultyLevel: "advanced",
        learningPace: "accelerated",
        defaultSessionMinutes: 90,
        revisionMode: "adaptive",
        instructionalLanguage: "english",
        videoPlayerMode: "embedded",
        showSupplementaryLessons: true,
      });

      expect(parsed.preferredLanguage).toBe("python");
      expect(parsed.revisionMode).toBe("adaptive");
      expect(parsed.defaultSessionMinutes).toBe(90);
    });
  });

  describe("Appearance Preferences Schema", () => {
    it("accepts pure black dark theme and reduced motion settings", () => {
      const parsed = appearancePreferencesUpdateSchema.parse({
        theme: "dark",
        motionPreference: "reduced",
        uiDensity: "compact",
        fontScaling: "normal",
      });

      expect(parsed.theme).toBe("dark");
      expect(parsed.motionPreference).toBe("reduced");
      expect(parsed.uiDensity).toBe("compact");
    });
  });

  describe("Account Deletion Safeguard Schema", () => {
    it("requires exact literal confirmation string", () => {
      const valid = accountDeletionSchema.parse({
        confirmationText: "DELETE MY ACCOUNT",
        reason: "Transitioning to new role",
      });
      expect(valid.confirmationText).toBe("DELETE MY ACCOUNT");

      expect(() =>
        accountDeletionSchema.parse({
          confirmationText: "delete my account", // Lowercase must fail
        })
      ).toThrow();

      expect(() =>
        accountDeletionSchema.parse({
          confirmationText: "DELETE",
        })
      ).toThrow();
    });
  });

  describe("Email Change Schema", () => {
    it("validates proper email format", () => {
      const parsed = emailChangeSchema.parse({
        newEmail: "developer@primeprep.app",
      });
      expect(parsed.newEmail).toBe("developer@primeprep.app");

      expect(() =>
        emailChangeSchema.parse({
          newEmail: "not-an-email",
        })
      ).toThrow();
    });
  });
});
