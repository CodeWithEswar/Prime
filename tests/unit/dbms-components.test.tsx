import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DBMSHero } from "@/features/dbms/components/dbms-hero";
import { CourseProgressRail } from "@/features/dbms/components/course-progress-rail";
import { TodayFocusCard } from "@/features/dbms/components/today-focus-card";
import { CourseDayWorkspace } from "@/features/dbms/components/course-day-workspace";
import { DBMS_DAYS_CURRICULUM } from "@/domain/dbms";
import type { DBMSProgressMetrics, DBMSVideoItem } from "@/domain/dbms";

describe("DBMS UI Components Unit Tests", () => {
  const mockMetrics: DBMSProgressMetrics = {
    totalVideos: 103,
    watchedVideos: 15,
    totalMinutes: 1710,
    watchedMinutes: 250,
    percentageComplete: 15,
    completedDays: 1,
    currentDay: 2,
    totalExercises: 12,
    solvedExercises: 3,
    topicsMastery: [
      {
        topicSlug: "dbms-fundamentals",
        topicTitle: "DBMS Fundamentals & Architecture",
        totalVideos: 10,
        watchedVideos: 10,
        percentage: 100,
        masteryStatus: "mastered",
      },
    ],
  };

  const sampleVideos: DBMSVideoItem[] = [
    {
      position: 1,
      youtubeVideoId: "vid1",
      title: "Introduction to DBMS",
      channel: "Neso Academy",
      canonicalUrl: "https://www.youtube.com/watch?v=vid1",
      dayNumber: 1,
      difficulty: "Easy",
      importance: "High",
      topicSlug: "dbms-fundamentals",
      estimatedMinutes: 12,
      verificationStatus: "verified",
    },
    {
      position: 2,
      youtubeVideoId: "vid2",
      title: "DBMS Definition",
      channel: "Neso Academy",
      canonicalUrl: "https://www.youtube.com/watch?v=vid2",
      dayNumber: 1,
      difficulty: "Easy",
      importance: "High",
      topicSlug: "dbms-fundamentals",
      estimatedMinutes: 12,
      verificationStatus: "verified",
    },
  ];

  it("renders DBMSHero with title, metrics, and handles actions", () => {
    const handleEnroll = vi.fn();
    const handleResume = vi.fn();

    const { rerender } = render(
      <DBMSHero
        metrics={mockMetrics}
        enrolled={false}
        onEnroll={handleEnroll}
        onResume={handleResume}
      />
    );

    expect(screen.getByText("12-Day DBMS Learning Roadmap")).toBeInTheDocument();
    expect(screen.getByText("15%")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument(); // watched videos

    // Enroll button
    const enrollBtn = screen.getByRole("button", { name: /Start roadmap/i });
    fireEvent.click(enrollBtn);
    expect(handleEnroll).toHaveBeenCalled();

    // Re-render as enrolled
    rerender(
      <DBMSHero
        metrics={mockMetrics}
        enrolled={true}
        onEnroll={handleEnroll}
        onResume={handleResume}
      />
    );

    const resumeBtn = screen.getByRole("button", { name: /Resume roadmap/i });
    fireEvent.click(resumeBtn);
    expect(handleResume).toHaveBeenCalled();

    expect(screen.getByRole("link", { name: /Schedule in Planner/i })).toHaveAttribute(
      "href",
      "/plan?course=dbms"
    );
  });

  it("renders CourseProgressRail with 12 days and allows day selection", () => {
    const handleSelectDay = vi.fn();

    render(
      <CourseProgressRail
        days={DBMS_DAYS_CURRICULUM}
        videos={sampleVideos}
        videoProgress={{}}
        dayProgress={{}}
        activeDay={1}
        onSelectDay={handleSelectDay}
      />
    );

    expect(screen.getByText("Day 01")).toBeInTheDocument();
    expect(screen.getByText("Day 12")).toBeInTheDocument();

    const day3Button = screen.getByText("Day 03");
    fireEvent.click(day3Button);
    expect(handleSelectDay).toHaveBeenCalledWith(3);
  });

  it("renders TodayFocusCard for a video recommendation", () => {
    const handleWatch = vi.fn();
    const handleWatchedToggle = vi.fn();

    render(
      <TodayFocusCard
        recommendation={{
          type: "video",
          dayNumber: 1,
          itemTitle: "Introduction to DBMS",
          itemSubtitle: "Day 1 • Video #1",
          videoId: "vid1",
          estimatedMinutes: 12,
        }}
        onWatchVideo={handleWatch}
        onToggleWatched={handleWatchedToggle}
      />
    );

    expect(screen.getByText("Introduction to DBMS")).toBeInTheDocument();
    expect(screen.getByText("12 mins")).toBeInTheDocument();

    const watchBtn = screen.getByRole("button", { name: /Watch Video/i });
    fireEvent.click(watchBtn);
    expect(handleWatch).toHaveBeenCalledWith("vid1");

    const markBtn = screen.getByRole("button", { name: /Mark Watched/i });
    fireEvent.click(markBtn);
    expect(handleWatchedToggle).toHaveBeenCalledWith("vid1");
  });

  it("renders CourseDayWorkspace with design system Checkbox for day lessons", () => {
    const handleToggleWatched = vi.fn();
    const handleWatchVideo = vi.fn();

    render(
      <CourseDayWorkspace
        day={DBMS_DAYS_CURRICULUM[0]}
        videos={sampleVideos}
        exercises={[]}
        videoProgress={{
          vid1: {
            videoId: "vid1",
            watched: false,
            watchedAt: null,
            notes: null,
            isBookmarked: false,
            revisionDue: false,
            difficultyRating: null,
          },
        }}
        dayProgress={{}}
        exerciseAttempts={{}}
        onWatchVideo={handleWatchVideo}
        onToggleWatched={handleToggleWatched}
        onToggleBookmark={vi.fn()}
        onToggleRevision={vi.fn()}
        onToggleAssignment={vi.fn()}
        onSolveExercise={vi.fn()}
      />
    );

    expect(screen.getByText("Introduction to DBMS")).toBeInTheDocument();

    // Checkbox from design system
    const checkbox = screen.getByRole("checkbox", {
      name: /Mark lesson #1 Introduction to DBMS/i,
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(handleToggleWatched).toHaveBeenCalledWith("vid1");
  });
});
