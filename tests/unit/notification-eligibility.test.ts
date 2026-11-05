import { describe, it, expect } from "vitest";
import {
  parseTimeToMinutes,
  isInQuietHours,
  generateNotificationIdempotencyKey,
  isEligibleForDelivery,
  getNotificationCategoryMeta,
} from "@/domain/notifications/eligibility";
import type { NotificationPreferences } from "@/domain/notifications/types";

describe("Notification Scheduling & Quiet Hours Logic", () => {
  it("parses time strings to minutes accurately", () => {
    expect(parseTimeToMinutes("00:00:00")).toBe(0);
    expect(parseTimeToMinutes("07:30")).toBe(450);
    expect(parseTimeToMinutes("22:00:00")).toBe(1320);
    expect(parseTimeToMinutes("23:59:59")).toBe(1439);
  });

  it("evaluates quiet hours across midnight span (22:00 to 07:00)", () => {
    // 23:30 (1410 min) should be inside quiet hours
    const lateNight = new Date("2026-11-05T18:00:00.000Z"); // 23:30 in Asia/Kolkata (+05:30)
    expect(isInQuietHours(lateNight, "Asia/Kolkata", "22:00:00", "07:00:00")).toBe(true);

    // 03:00 (180 min) should be inside quiet hours
    const earlyMorning = new Date("2026-11-04T21:30:00.000Z"); // 03:00 in Asia/Kolkata
    expect(isInQuietHours(earlyMorning, "Asia/Kolkata", "22:00:00", "07:00:00")).toBe(true);

    // 14:00 (840 min) should be outside quiet hours
    const afternoon = new Date("2026-11-05T08:30:00.000Z"); // 14:00 in Asia/Kolkata
    expect(isInQuietHours(afternoon, "Asia/Kolkata", "22:00:00", "07:00:00")).toBe(false);
  });

  it("evaluates quiet hours within same-day span (01:00 to 06:00)", () => {
    const atTwoAm = new Date("2026-11-04T20:30:00.000Z"); // 02:00 in Asia/Kolkata
    expect(isInQuietHours(atTwoAm, "Asia/Kolkata", "01:00:00", "06:00:00")).toBe(true);

    const atNoon = new Date("2026-11-05T06:30:00.000Z"); // 12:00 in Asia/Kolkata
    expect(isInQuietHours(atNoon, "Asia/Kolkata", "01:00:00", "06:00:00")).toBe(false);
  });

  it("produces deterministic idempotency keys", () => {
    const key1 = generateNotificationIdempotencyKey({
      userId: "u-123",
      category: "revision_due",
      sourceId: "topic-456",
      channel: "EMAIL",
      dateKey: "2026-11-05",
    });
    const key2 = generateNotificationIdempotencyKey({
      userId: "u-123",
      category: "revision_due",
      sourceId: "topic-456",
      channel: "EMAIL",
      dateKey: "2026-11-05",
    });

    expect(key1).toBe("u-123:revision_due:topic-456:EMAIL:2026-11-05");
    expect(key1).toBe(key2);
  });

  it("evaluates delivery eligibility honoring channel and category preferences", () => {
    const mockPreferences: NotificationPreferences = {
      id: "pref-1",
      userId: "u-123",
      timezone: "Asia/Kolkata",
      inAppEnabled: true,
      emailEnabled: false, // emails disabled
      revisionEmailEnabled: true,
      sessionEmailEnabled: true,
      assessmentEmailEnabled: true,
      missedTaskEmailEnabled: true,
      aptitudeReminderEnabled: true,
      dailyDigestEnabled: true,
      weeklyReportEnabled: true,
      sessionLeadTimeMinutes: 15,
      dailyDigestLocalTime: "07:00:00",
      weeklyReportDay: 0,
      weeklyReportLocalTime: "19:00:00",
      quietHoursEnabled: false,
      quietHoursStart: "22:00:00",
      quietHoursEnd: "07:00:00",
      unsubscribeToken: "token-abc",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In-app should be eligible
    const inAppCheck = isEligibleForDelivery({
      channel: "IN_APP",
      category: "revision_due",
      preferences: mockPreferences,
    });
    expect(inAppCheck.eligible).toBe(true);

    // Email should be rejected because emailEnabled = false
    const emailCheck = isEligibleForDelivery({
      channel: "EMAIL",
      category: "revision_due",
      preferences: mockPreferences,
    });
    expect(emailCheck.eligible).toBe(false);
    expect(emailCheck.reason).toContain("Email notifications disabled by user");
  });

  it("suppresses non-urgent notifications during quiet hours", () => {
    const mockPreferences: NotificationPreferences = {
      id: "pref-1",
      userId: "u-123",
      timezone: "Asia/Kolkata",
      inAppEnabled: true,
      emailEnabled: true,
      revisionEmailEnabled: true,
      sessionEmailEnabled: true,
      assessmentEmailEnabled: true,
      missedTaskEmailEnabled: true,
      aptitudeReminderEnabled: true,
      dailyDigestEnabled: true,
      weeklyReportEnabled: true,
      sessionLeadTimeMinutes: 15,
      dailyDigestLocalTime: "07:00:00",
      weeklyReportDay: 0,
      weeklyReportLocalTime: "19:00:00",
      quietHoursEnabled: true,
      quietHoursStart: "22:00:00",
      quietHoursEnd: "07:00:00",
      unsubscribeToken: "token-abc",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 23:30 late night (in quiet hours)
    const lateNight = new Date("2026-11-05T18:00:00.000Z");

    const nonUrgent = isEligibleForDelivery({
      channel: "EMAIL",
      category: "daily_study_digest",
      preferences: mockPreferences,
      currentTime: lateNight,
    });
    expect(nonUrgent.eligible).toBe(false);
    expect(nonUrgent.reason).toContain("quiet hours");

    // Urgent notification should bypass quiet hours
    const urgent = isEligibleForDelivery({
      channel: "EMAIL",
      category: "revision_overdue",
      isUrgent: true,
      preferences: mockPreferences,
      currentTime: lateNight,
    });
    expect(urgent.eligible).toBe(true);
  });

  it("returns appropriate category metadata", () => {
    const meta = getNotificationCategoryMeta("revision_due");
    expect(meta.label).toBe("Revision Ready");
    expect(meta.defaultPriority).toBe("high");
    expect(meta.badgeColor).toBe("#FF4D4D");

    const aptMeta = getNotificationCategoryMeta("aptitude_daily_practice");
    expect(aptMeta.label).toBe("Aptitude Practice");
    expect(aptMeta.badgeColor).toBe("#FF4D4D");
  });
});
