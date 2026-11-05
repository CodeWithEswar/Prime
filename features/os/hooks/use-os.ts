"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type {
  OSVideoItem,
  OSVideoDifficulty,
  OSVideoImportance,
  UserOSVideoProgress,
  UserOSDayProgress,
  UserOSLabAttempt,
} from "@/domain/os";
import { calculateOSMetrics, getRecommendedNextOSDay } from "@/domain/os";
import type { OSDashboardData, OSTab } from "../types";
import type { CourseFocusRecommendation } from "@/components/shared/course-focus-card";
import {
  enrollOSCourseAction,
  planOSCourseInPlannerAction,
  toggleOSVideoWatchedAction,
  saveOSVideoNoteAction,
  recordOSLabAttemptAction,
  completeOSDayAssignmentAction,
  toggleOSVideoBookmarkAction,
  toggleOSVideoRevisionAction,
} from "../server/actions";

export interface UseOSProps {
  initialData: OSDashboardData;
}

export function useOS({ initialData }: UseOSProps) {
  const [isPending, startTransition] = useTransition();

  const [activeDay, setActiveDay] = useState<number>(
    initialData.userState.currentDay || 1
  );
  const [activeTab, setActiveTab] = useState<OSTab>("overview");
  const [selectedVideo, setSelectedVideo] = useState<OSVideoItem | null>(null);
  const [activeLabSlug, setActiveLabSlug] = useState<string>("process-state");

  // User progress state
  const [videoProgress, setVideoProgress] = useState<Record<string, UserOSVideoProgress>>(
    initialData.userState.videoProgress
  );
  const [dayProgress, setDayProgress] = useState<Record<number, UserOSDayProgress>>(
    initialData.userState.dayProgress
  );
  const [labAttempts, setLabAttempts] = useState<Record<string, UserOSLabAttempt>>(
    initialData.userState.labAttempts
  );
  const [enrolled, setEnrolled] = useState<boolean>(initialData.userState.enrolled);

  // Video library filters
  const [filterDay, setFilterDay] = useState<number | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<OSVideoDifficulty | "all">(
    "all"
  );
  const [filterImportance, setFilterImportance] = useState<OSVideoImportance | "all">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "watched" | "unwatched" | "revision_due"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Recalculate metrics reactively
  const metrics = useMemo(() => {
    return calculateOSMetrics(
      initialData.videos,
      initialData.days,
      videoProgress,
      dayProgress,
      labAttempts
    );
  }, [initialData.videos, initialData.days, videoProgress, dayProgress, labAttempts]);

  // Next recommended day
  const nextRecommendedDay = useMemo(() => {
    return getRecommendedNextOSDay(
      initialData.days,
      dayProgress,
      videoProgress,
      initialData.videos
    );
  }, [initialData.days, dayProgress, videoProgress, initialData.videos]);

  // Next recommendation focus
  const nextRecommendation: CourseFocusRecommendation = useMemo(() => {
    for (const day of initialData.days) {
      const dayVids = initialData.videos.filter(
        (v) => v.dayNumber === day.dayNumber && !v.isSupplementary
      );
      const firstUnwatched = dayVids.find((v) => {
        const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.position}`;
        return !videoProgress[key]?.watched && !videoProgress[String(v.position)]?.watched;
      });
      if (firstUnwatched) {
        return {
          type: "video",
          dayNumber: day.dayNumber,
          itemTitle: firstUnwatched.title,
          itemSubtitle: `Day ${day.dayNumber}: ${day.title}`,
          videoId: firstUnwatched.youtubeVideoId ?? String(firstUnwatched.position),
          estimatedMinutes: firstUnwatched.estimatedMinutes,
        };
      }
      if (!dayProgress[day.dayNumber]?.assignmentCompleted) {
        return {
          type: "assignment",
          dayNumber: day.dayNumber,
          itemTitle: day.practicalAssignment.title,
          itemSubtitle: `Day ${day.dayNumber} Practical Deliverable`,
          estimatedMinutes: 30,
        };
      }
      if (day.labSlug && !labAttempts[day.labSlug]?.status) {
        return {
          type: "lab",
          dayNumber: day.dayNumber,
          itemTitle: `Complete Day ${day.dayNumber} Laboratory Simulation`,
          itemSubtitle: `Day ${day.dayNumber} Laboratory`,
          labSlug: day.labSlug,
          estimatedMinutes: 25,
        };
      }
    }
    return {
      type: "course_completed",
      dayNumber: 12,
      itemTitle: "All 12 Operating Systems Days Completed!",
      itemSubtitle: "Ready for Systems Engineering Interviews",
    };
  }, [initialData.days, initialData.videos, videoProgress, dayProgress, labAttempts]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return initialData.videos.filter((v) => {
      if (filterDay !== "all" && v.dayNumber !== filterDay) return false;
      if (filterDifficulty !== "all" && v.difficulty !== filterDifficulty) return false;
      if (filterImportance !== "all" && v.importance !== filterImportance) return false;

      const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.position}`;
      const prog = videoProgress[key] || videoProgress[String(v.position)];
      const isWatched = Boolean(prog?.watched);
      const isRevDue = Boolean(prog?.revisionDue);

      if (filterStatus === "watched" && !isWatched) return false;
      if (filterStatus === "unwatched" && isWatched) return false;
      if (filterStatus === "revision_due" && !isRevDue) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(q);
        const matchesTopic = v.topicSlug.toLowerCase().includes(q);
        const matchesPos = String(v.position).includes(q);
        if (!matchesTitle && !matchesTopic && !matchesPos) return false;
      }

      return true;
    });
  }, [
    initialData.videos,
    filterDay,
    filterDifficulty,
    filterImportance,
    filterStatus,
    searchQuery,
    videoProgress,
  ]);

  // Actions
  const handleEnroll = useCallback((onStarted: () => void) => {
    startTransition(async () => {
      const result = await enrollOSCourseAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEnrolled(true);
      toast.success("Roadmap started & scheduled in Planner.");
      onStarted();
    });
  }, []);

  const handleSchedulePlanner = useCallback(() => {
    startTransition(async () => {
      const result = await planOSCourseInPlannerAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEnrolled(true);
      toast.success("Scheduled 12-day Operating Systems roadmap into your Planner & Calendar!");
    });
  }, []);

  const handleToggleWatched = useCallback(
    (video: OSVideoItem) => {
      const key = video.progressId ?? video.youtubeVideoId ?? `pos-${video.position}`;
      const current = videoProgress[key] || videoProgress[String(video.position)];
      const nextWatched = !current?.watched;

      setVideoProgress((prev) => ({
        ...prev,
        [key]: {
          videoId: key,
          watched: nextWatched,
          watchedAt: nextWatched ? new Date().toISOString() : null,
          notes: current?.notes,
          revisionDue: current?.revisionDue,
        },
      }));

      startTransition(async () => {
        const idToSave =
          video.progressId ?? video.youtubeVideoId ?? String(video.position);
        const res = await toggleOSVideoWatchedAction(idToSave, nextWatched);
        if (!res.ok) {
          toast.info("Progress saved locally.");
        } else {
          toast.success(nextWatched ? "Lesson marked as watched!" : "Marked unwatched.");
        }
      });
    },
    [videoProgress]
  );

  const handleSaveNote = useCallback(
    (
      video: OSVideoItem,
      note: string,
      difficultyRating?: OSVideoDifficulty,
      needsRevision?: boolean
    ) => {
      const key = video.progressId ?? video.youtubeVideoId ?? `pos-${video.position}`;
      const current = videoProgress[key] || videoProgress[String(video.position)];

      setVideoProgress((prev) => ({
        ...prev,
        [key]: {
          videoId: key,
          watched: current?.watched ?? false,
          watchedAt: current?.watchedAt,
          notes: note,
          difficultyRating: difficultyRating ?? current?.difficultyRating,
          revisionDue: needsRevision ?? current?.revisionDue,
        },
      }));

      startTransition(async () => {
        const idToSave =
          video.progressId ?? video.youtubeVideoId ?? String(video.position);
        const res = await saveOSVideoNoteAction(
          idToSave,
          note,
          difficultyRating,
          needsRevision
        );
        if (!res.ok) {
          toast.info("Note saved locally.");
        } else {
          toast.success("Note saved successfully.");
        }
      });
    },
    [videoProgress]
  );

  const handleToggleBookmark = useCallback(
    (video: OSVideoItem) => {
      const key = video.progressId ?? video.youtubeVideoId ?? `pos-${video.position}`;
      const current = videoProgress[key] || videoProgress[String(video.position)];
      const prev = current?.isBookmarked ?? false;
      const next = !prev;

      setVideoProgress((prevMap) => ({
        ...prevMap,
        [key]: {
          videoId: key,
          watched: current?.watched ?? false,
          watchedAt: current?.watchedAt,
          notes: current?.notes,
          revisionDue: current?.revisionDue,
          isBookmarked: next,
        },
      }));

      startTransition(async () => {
        const idToSave =
          video.progressId ?? video.youtubeVideoId ?? String(video.position);
        const res = await toggleOSVideoBookmarkAction(idToSave, next);
        if (!res.ok) {
          toast.info("Bookmark saved locally.");
        } else {
          toast.success(next ? "Added to bookmarks" : "Removed from bookmarks");
        }
      });
    },
    [videoProgress]
  );

  const handleToggleRevision = useCallback(
    (video: OSVideoItem) => {
      const key = video.progressId ?? video.youtubeVideoId ?? `pos-${video.position}`;
      const current = videoProgress[key] || videoProgress[String(video.position)];
      const prev = current?.revisionDue ?? false;
      const next = !prev;

      setVideoProgress((prevMap) => ({
        ...prevMap,
        [key]: {
          videoId: key,
          watched: current?.watched ?? false,
          watchedAt: current?.watchedAt,
          notes: current?.notes,
          revisionDue: next,
          isBookmarked: current?.isBookmarked,
        },
      }));

      startTransition(async () => {
        const idToSave =
          video.progressId ?? video.youtubeVideoId ?? String(video.position);
        const res = await toggleOSVideoRevisionAction(idToSave, next);
        if (!res.ok) {
          toast.info("Revision status saved locally.");
        } else {
          toast.success(next ? "Flagged for revision" : "Revision cleared");
        }
      });
    },
    [videoProgress]
  );

  const handleRecordLabAttempt = useCallback(
    (
      labId: string,
      status: "attempted" | "completed" | "needs_revision",
      notes?: string
    ) => {
      setLabAttempts((prev) => ({
        ...prev,
        [labId]: {
          labId,
          status,
          solutionNotes: notes,
          completedAt: new Date().toISOString(),
        },
      }));

      startTransition(async () => {
        const res = await recordOSLabAttemptAction(labId, status, notes);
        if (!res.ok) {
          toast.info("Lab attempt saved locally.");
        } else {
          toast.success(
            status === "completed"
              ? "Laboratory verified and completed!"
              : "Attempt recorded."
          );
        }
      });
    },
    []
  );

  const handleCompleteDay = useCallback((dayNumber: number, notes?: string) => {
    setDayProgress((prev) => ({
      ...prev,
      [dayNumber]: {
        dayNumber,
        assignmentCompleted: true,
        notes: notes || null,
        completedAt: new Date().toISOString(),
      },
    }));

    startTransition(async () => {
      const res = await completeOSDayAssignmentAction(dayNumber, notes);
      if (!res.ok) {
        toast.info("Day progress saved locally.");
      } else {
        toast.success(`Day ${dayNumber} deliverable completed!`);
      }
    });
  }, []);

  return {
    isPending,
    activeDay,
    setActiveDay,
    activeTab,
    setActiveTab,
    selectedVideo,
    setSelectedVideo,
    activeLabSlug,
    setActiveLabSlug,
    videoProgress,
    dayProgress,
    labAttempts,
    enrolled,
    metrics,
    nextRecommendedDay,
    nextRecommendation,
    filteredVideos,
    filters: {
      day: filterDay,
      setDay: setFilterDay,
      difficulty: filterDifficulty,
      setDifficulty: setFilterDifficulty,
      importance: filterImportance,
      setImportance: setFilterImportance,
      status: filterStatus,
      setStatus: setFilterStatus,
      search: searchQuery,
      setSearch: setSearchQuery,
    },
    actions: {
      enroll: handleEnroll,
      schedule: handleSchedulePlanner,
      toggleWatched: handleToggleWatched,
      toggleBookmark: handleToggleBookmark,
      toggleRevision: handleToggleRevision,
      saveNote: handleSaveNote,
      recordLabAttempt: handleRecordLabAttempt,
      completeDay: handleCompleteDay,
    },
  };
}
