import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockUpsert = vi.fn(() => ({ select: mockSelect }));
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

import {
  toggleAptitudeTopicAction,
  recordAptitudeVideoWatchAction,
  enrollAptitudeAction,
} from "@/features/aptitude/server/actions";
import { revalidatePath } from "next/cache";

describe("Aptitude Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails gracefully with sign_in error when user is not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const result = await toggleAptitudeTopicAction("D01_T01", "completed");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Please sign in");
    }
  });

  it("successfully upserts topic progress for D01_T01 and revalidates paths", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "test-user-123" } },
    });
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "prog-1",
        user_id: "test-user-123",
        topic_id: "D01_T01",
        status: "completed",
      },
      error: null,
    });

    const result = await toggleAptitudeTopicAction("D01_T01", "completed");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.topic_id).toBe("D01_T01");
      expect(result.data.status).toBe("completed");
    }

    expect(mockFrom).toHaveBeenCalledWith("aptitude_topic_progress");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "test-user-123",
        topic_id: "D01_T01",
        status: "completed",
      }),
      { onConflict: "user_id,topic_id" }
    );
    expect(revalidatePath).toHaveBeenCalledWith("/aptitude");
    expect(revalidatePath).toHaveBeenCalledWith("/practice/aptitude");
  });

  it("records video watch progress with composite key", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "test-user-123" } },
    });
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "vid-prog-1",
        user_id: "test-user-123",
        topic_id: "D01_T01",
        video_id: "vid-abc-123",
        watched: true,
      },
      error: null,
    });

    const result = await recordAptitudeVideoWatchAction(
      "D01_T01",
      "vid-abc-123",
      true,
      300
    );
    expect(result.ok).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("aptitude_video_progress");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "test-user-123",
        topic_id: "D01_T01",
        video_id: "vid-abc-123",
        watched: true,
        watched_seconds: 300,
      }),
      { onConflict: "user_id,topic_id,video_id" }
    );
  });
});
