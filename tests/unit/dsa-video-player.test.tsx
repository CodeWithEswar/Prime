import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DSAVideoPlayer } from "@/features/dsa-playlists/components/dsa-video-player";
import type { DSALessonItem } from "@/features/dsa-playlists/types";

const mockLesson: DSALessonItem = {
  id: "lesson-1",
  playlistItemId: "pli-1",
  videoDbId: "vdb-1",
  youtubeVideoId: "dQw4w9WgXcQ",
  title: "C++ Basics in One Shot - Strivers A2Z DSA Course - L1",
  position: 3,
  durationSeconds: 5160,
  durationFormatted: "1h 26m",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  channelTitle: "take U forward",
  canonicalTopicSlug: "arrays",
  difficulty: "medium",
  embedAllowed: true,
  isCompleted: false,
  isBookmarked: false,
  lastPositionSeconds: 0,
  watchedSeconds: 0,
  completedAt: null,
  hasNotes: false,
  notesContent: "",
  linkedProblems: [],
};

describe("DSAVideoPlayer Component", () => {
  it("renders the lesson title and duration metadata", () => {
    render(
      <DSAVideoPlayer
        lesson={mockLesson}
        hasPrevious={true}
        hasNext={true}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onToggleComplete={vi.fn()}
        onToggleBookmark={vi.fn()}
        onOpenScheduleDialog={vi.fn()}
        onOpenRevisionDialog={vi.fn()}
        isCompleted={false}
        isBookmarked={false}
      />
    );

    expect(screen.getByText(/C\+\+ Basics in One Shot/i)).toBeInTheDocument();
    expect(screen.getByText("1h 26m")).toBeInTheDocument();
    expect(screen.getByText("#arrays")).toBeInTheDocument();
    expect(screen.getByText(/medium difficulty/i)).toBeInTheDocument();
  });

  it("handles navigation Previous and Next button clicks", () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(
      <DSAVideoPlayer
        lesson={mockLesson}
        hasPrevious={true}
        hasNext={true}
        onPrevious={onPrev}
        onNext={onNext}
        onToggleComplete={vi.fn()}
        onToggleBookmark={vi.fn()}
        onOpenScheduleDialog={vi.fn()}
        onOpenRevisionDialog={vi.fn()}
        isCompleted={false}
        isBookmarked={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^previous$/i }));
    expect(onPrev).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("renders the mobile three dots dropdown menu trigger", () => {
    render(
      <DSAVideoPlayer
        lesson={mockLesson}
        hasPrevious={true}
        hasNext={true}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onToggleComplete={vi.fn()}
        onToggleBookmark={vi.fn()}
        onOpenScheduleDialog={vi.fn()}
        onOpenRevisionDialog={vi.fn()}
        isCompleted={false}
        isBookmarked={false}
      />
    );

    const moreButton = screen.getByRole("button", { name: /more lesson actions/i });
    expect(moreButton).toBeInTheDocument();
  });

  it("opens the mobile dropdown menu and triggers actions", async () => {
    const onToggleBookmark = vi.fn();
    const onSchedule = vi.fn();
    const onRevision = vi.fn();

    render(
      <DSAVideoPlayer
        lesson={mockLesson}
        hasPrevious={true}
        hasNext={true}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onToggleComplete={vi.fn()}
        onToggleBookmark={onToggleBookmark}
        onOpenScheduleDialog={onSchedule}
        onOpenRevisionDialog={onRevision}
        isCompleted={false}
        isBookmarked={false}
      />
    );

    const moreButton = screen.getByRole("button", { name: /more lesson actions/i });
    fireEvent.keyDown(moreButton, { key: "Enter" });

    // Menu items should now be visible
    const saveBookmark = await screen.findByText(/Save Bookmark/i);
    expect(saveBookmark).toBeInTheDocument();

    const schedulePlan = screen.getByText(/Schedule in Plan/i);
    expect(schedulePlan).toBeInTheDocument();

    const createRev = screen.getByText(/Create Revision/i);
    expect(createRev).toBeInTheDocument();

    fireEvent.click(saveBookmark);
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);
  });
});
