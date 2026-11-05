import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const save = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("@/features/aptitude/server/actions", () => ({
  enrollAptitudeAction: save,
  toggleAptitudeTopicAction: save,
  toggleAptitudeBookmarkAction: save,
  saveAptitudeNotesAction: save,
  recordAptitudeVideoWatchAction: save,
  scheduleAptitudeRoadmapAction: save,
}));
import { getAptitudeDashboardData } from "@/features/aptitude/server/service";
import { useAptitude } from "@/features/aptitude/hooks/use-aptitude";
import { aptitudeVideoProgressKey } from "@/domain/aptitude/videos";

describe("aptitude learning evidence", () => {
  it("keeps watch confirmation separate when two concepts share the same video", async () => {
    const data = await getAptitudeDashboardData(null, null);
    const first = data.allTopics.find((t) => t.id === "D09_T01")!;
    const second = data.allTopics.find((t) => t.id === "D09_T02")!;
    const videoId = first.primaryVideo!.videoId;
    expect(second.primaryVideo!.videoId).toBe(videoId);
    data.videoProgress[aptitudeVideoProgressKey(first.id, videoId)] = {
      topicId: first.id,
      videoId,
      watched: true,
      userConfirmed: true,
      watchedSeconds: 0,
    };
    const { result } = renderHook(() => useAptitude({ initialData: data }));
    expect(result.current.metrics.watchedVideos).toBe(1);
    expect(
      result.current.videoProgress[aptitudeVideoProgressKey(second.id, videoId)]
    ).toBeUndefined();
    await act(() => result.current.handleToggleVideoWatched(second.id, videoId, true));
    expect(result.current.metrics.watchedVideos).toBe(2);
    expect(
      result.current.videoProgress[aptitudeVideoProgressKey(first.id, videoId)]?.watched
    ).toBe(true);
    expect(save).toHaveBeenCalledWith(second.id, videoId, true, 0);
  });
  it("updates subject progress from real completion without fabricating practice results", async () => {
    const data = await getAptitudeDashboardData(null, null);
    expect(data.metrics.overallAccuracyPercentage).toBe(0);
    expect(data.metrics.totalQuestionsPracticed).toBe(0);
    const { result } = renderHook(() => useAptitude({ initialData: data }));
    await act(() => result.current.handleToggleTopicStatus("D01_T01", "completed"));
    expect(result.current.metrics.completedTopics).toBe(1);
    expect(
      result.current.metrics.trackProgress["quantitative-aptitude"].completedTopics
    ).toBe(1);
    expect(
      result.current.metrics.trackProgress["logical-reasoning"].completedTopics
    ).toBe(0);
  });
});
