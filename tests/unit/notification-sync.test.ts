import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createNotification,
} from "@/features/notifications/server/sync-notifications";
import { createAdminClient } from "@/lib/supabase/admin";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

describe("notification synchronizer and event integration", () => {
  const mockUserId = "bbff4288-bf4b-4d49-88b8-e9f9a20331e2";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("suppresses notification when user disabled in_app notifications", async () => {
    const mockAdmin = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { in_app_enabled: false },
              error: null,
            }),
          }),
        }),
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(
      mockAdmin as unknown as ReturnType<typeof createAdminClient>
    );

    const result = await createNotification({
      userId: mockUserId,
      category: "revision_due",
      title: "Test Due",
      body: "Test Body",
    });

    expect(result).toBeNull();
  });

  it("creates in-app notification when enabled and not duplicate", async () => {
    const mockAdmin = {
      from: vi.fn((table: string) => {
        if (table === "notification_preferences") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { in_app_enabled: true },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "notifications") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    gte: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "notif-1",
                    user_id: mockUserId,
                    event_id: null,
                    category: "revision_due",
                    title: "Test Due",
                    body: "Test Body",
                    action_url: "/revision",
                    priority: "high",
                    read_at: null,
                    dismissed_at: null,
                    deleted_at: null,
                    created_at: new Date().toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(
      mockAdmin as unknown as ReturnType<typeof createAdminClient>
    );

    const result = await createNotification({
      userId: mockUserId,
      category: "revision_due",
      title: "Test Due",
      body: "Test Body",
      actionUrl: "/revision",
      priority: "high",
    });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Test Due");
    expect(result?.category).toBe("revision_due");
  });

  it("safely remaps extended categories to database constraint compliant enums", async () => {
    const insertedPayload: { category?: unknown; [key: string]: unknown } = {};

    const mockAdmin = {
      from: vi.fn((table: string) => {
        if (table === "notification_preferences") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { in_app_enabled: true },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "notifications") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    gte: vi.fn().mockReturnValue({
                      limit: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
            insert: vi.fn((payload: Record<string, unknown>) => {
              Object.assign(insertedPayload, payload);
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: "notif-2",
                      user_id: mockUserId,
                      event_id: null,
                      category: payload.category,
                      title: payload.title,
                      body: payload.body,
                      action_url: payload.action_url,
                      priority: payload.priority,
                      read_at: null,
                      dismissed_at: null,
                      deleted_at: null,
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                }),
              };
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(
      mockAdmin as unknown as ReturnType<typeof createAdminClient>
    );

    const result = await createNotification({
      userId: mockUserId,
      category: "aptitude_daily_practice" as unknown as Parameters<typeof createNotification>[0]["category"],
      title: "Aptitude Drill",
      body: "Time for aptitude",
    });

    expect(result).not.toBeNull();
    expect(insertedPayload.category).toBe("assessment_upcoming");
  });
});
