import { describe, it, expect } from "vitest";
import { renderEmailLayout } from "@/server/email/templates/layout";
import { renderRevisionReminderEmail } from "@/server/email/templates/revision-reminder";
import { renderDailyDigestEmail } from "@/server/email/templates/daily-digest";
import { renderStudySessionReminderEmail } from "@/server/email/templates/study-session-reminder";

describe("Nodemailer Branded Email Templates", () => {
  it("renders email layout with correct DOCTYPE, unsubscribe link, and styles", () => {
    const rendered = renderEmailLayout({
      title: "Test Layout",
      eyebrow: "REVISION ALERT",
      recipientName: "Alex",
      contentHtml: "<p>Main email body content</p>",
      actionText: "Open PRIME",
      actionUrl: "https://prime.app/practice",
      unsubscribeUrl: "https://prime.app/unsubscribe?token=test-123",
      preferencesUrl: "https://prime.app/settings/notifications",
    });

    expect(rendered.html).toContain("<!DOCTYPE html>");
    expect(rendered.html).toContain("Test Layout");
    expect(rendered.html).toContain("REVISION ALERT");
    expect(rendered.html).toContain("Main email body content");
    expect(rendered.html).toContain("https://prime.app/unsubscribe?token=test-123");
    expect(rendered.html).toContain("#FF0000"); // PRIME Pure Red accent
    expect(rendered.text).toContain("Test Layout");
  });

  it("builds revision reminder template with HTML and text fallback", () => {
    const email = renderRevisionReminderEmail({
      recipientName: "Alex",
      payload: {
        overdueCount: 1,
        dueTodayCount: 2,
        actionUrl: "https://prime.app/practice/two-sum",
        items: [
          {
            id: "rev-1",
            title: "Two Sum & Hash Maps",
            topicName: "Arrays & Hashing",
            intervalDays: 3,
            difficulty: "MEDIUM",
          },
        ],
      },
      unsubscribeUrl: "https://prime.app/unsubscribe",
      preferencesUrl: "https://prime.app/settings/notifications",
    });

    expect(email.html).toContain("3 Items Due");
    expect(email.html).toContain("Two Sum & Hash Maps");
    expect(email.html).toContain("3d interval");
    expect(email.text).toContain("Two Sum & Hash Maps");
    expect(email.text).toContain("Unsubscribe:");
  });

  it("builds daily digest template with scheduled tasks and targets", () => {
    const email = renderDailyDigestEmail({
      recipientName: "Alex",
      payload: {
        date: "2026-11-05",
        plannedMinutes: 120,
        availableMinutes: 180,
        taskCount: 2,
        revisionCount: 2,
        actionUrl: "https://prime.app/today",
        tasks: [
          { id: "task-1", title: "Binary Search Tree Validation", plannedMinutes: 45 },
          { id: "task-2", title: "Database Normalization (3NF/BCNF)", plannedMinutes: 60 },
        ],
      },
      unsubscribeUrl: "https://prime.app/unsubscribe",
      preferencesUrl: "https://prime.app/settings/notifications",
    });

    expect(email.html).toContain("120m");
    expect(email.html).toContain("Binary Search Tree Validation");
    expect(email.html).toContain("Database Normalization (3NF/BCNF)");
    expect(email.text).toContain("Binary Search Tree Validation");
  });

  it("builds study session reminder template with lead time", () => {
    const email = renderStudySessionReminderEmail({
      recipientName: "Alex",
      payload: {
        sessionId: "sess-1",
        title: "Computer Networks: TCP Congestion Control",
        subject: "Computer Networks",
        scheduledTime: "2026-11-05T19:00:00.000Z",
        plannedMinutes: 60,
        leadTimeMinutes: 15,
        actionUrl: "https://prime.app/calendar",
      },
      unsubscribeUrl: "https://prime.app/unsubscribe",
      preferencesUrl: "https://prime.app/settings/notifications",
    });

    expect(email.html).toContain("Computer Networks: TCP Congestion Control");
    expect(email.html).toContain("15 minutes");
    expect(email.text).toContain("Computer Networks: TCP Congestion Control");
  });
});
