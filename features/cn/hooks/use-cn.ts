"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type {
  CNVideoItem,
  CNDifficulty,
  CNImportance,
  UserCNVideoProgress,
  UserCNDayProgress,
  UserCNLabAttempt,
} from "@/domain/cn";
import { calculateCNMetrics, getRecommendedNextCNDay } from "@/domain/cn";
import type { CNDashboardData, CNTab } from "../types";
import type { CourseFocusRecommendation } from "@/components/shared/course-focus-card";
import {
  enrollCNCourseAction,
  planCNCourseInPlannerAction,
  toggleCNVideoWatchedAction,
  saveCNVideoNoteAction,
  recordCNLabAttemptAction,
  completeCNDayAssignmentAction,
  toggleCNVideoBookmarkAction,
  toggleCNVideoRevisionAction,
} from "../server/actions";

export interface UseCNProps {
  initialData: CNDashboardData;
}

export function useCN({ initialData }: UseCNProps) {
  const [isPending, startTransition] = useTransition();

  const [activeDay, setActiveDay] = useState<number>(
    initialData.userState.currentDay || 1
  );
  const [activeTab, setActiveTab] = useState<CNTab>("roadmap");
  const [selectedVideo, setSelectedVideo] = useState<CNVideoItem | null>(null);
  const [activeLabSlug, setActiveLabSlug] = useState<string>("osi-tcpip");

  // User progress state
  const [videoProgress, setVideoProgress] = useState<Record<string, UserCNVideoProgress>>(
    initialData.userState.videoProgress
  );
  const [dayProgress, setDayProgress] = useState<Record<number, UserCNDayProgress>>(
    initialData.userState.dayProgress
  );
  const [labAttempts, setLabAttempts] = useState<Record<string, UserCNLabAttempt>>(
    initialData.userState.labAttempts
  );
  const [enrolled, setEnrolled] = useState<boolean>(initialData.userState.enrolled);

  // Video library filters
  const [filterDay, setFilterDay] = useState<number | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<CNDifficulty | "all">("all");
  const [filterImportance, setFilterImportance] = useState<CNImportance | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "watched" | "unwatched" | "revision_due"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Recalculate metrics reactively
  const metrics = useMemo(() => {
    return calculateCNMetrics(
      initialData.videos,
      initialData.days,
      videoProgress,
      dayProgress,
      labAttempts
    );
  }, [initialData.videos, initialData.days, videoProgress, dayProgress, labAttempts]);

  // Next recommended day
  const nextRecommendedDay = useMemo(() => {
    return getRecommendedNextCNDay(
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
        (v) => v.assignedStudyDay === day.dayNumber && !v.isSupplementary
      );
      const firstUnwatched = dayVids.find((v) => {
        const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.playlistPosition}`;
        return (
          !videoProgress[key]?.watched && !videoProgress[String(v.playlistPosition)]?.watched
        );
      });
      if (firstUnwatched) {
        return {
          type: "video",
          dayNumber: day.dayNumber,
          itemTitle: firstUnwatched.verifiedTitle ?? "Computer Networks lesson",
          itemSubtitle: `Day ${day.dayNumber}: ${day.title}`,
          videoId: firstUnwatched.youtubeVideoId ?? String(firstUnwatched.playlistPosition),
          estimatedMinutes: firstUnwatched.durationSeconds
            ? Math.round(firstUnwatched.durationSeconds / 60)
            : 15,
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
      itemTitle: "All 12 Computer Networks Days Completed!",
      itemSubtitle: "Ready for Networking & Distributed Systems Interviews",
    };
  }, [initialData.days, initialData.videos, videoProgress, dayProgress, labAttempts]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return initialData.videos.filter((v) => {
      if (filterDay !== "all" && v.assignedStudyDay !== filterDay) return false;
      if (filterDifficulty !== "all" && v.difficulty !== filterDifficulty) return false;
      if (filterImportance !== "all" && v.interviewImportance !== filterImportance)
        return false;

      const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.playlistPosition}`;
      const prog = videoProgress[key] || videoProgress[String(v.playlistPosition)];
      const isWatched = Boolean(prog?.watched);
      const isRevDue = Boolean(prog?.revisionDue);

      if (filterStatus === "watched" && !isWatched) return false;
      if (filterStatus === "unwatched" && isWatched) return false;
      if (filterStatus === "revision_due" && !isRevDue) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = v.verifiedTitle?.toLowerCase().includes(q) ?? false;
        const matchesTopic = v.topicIds.some((t) => t.toLowerCase().includes(q));
        const matchesPos = String(v.playlistPosition).includes(q);
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
      const result = await enrollCNCourseAction();
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
      const result = await planCNCourseInPlannerAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEnrolled(true);
      toast.success("Scheduled 12-day Computer Networks roadmap into your Planner & Calendar!");
    });
  }, []);

  const handleToggleWatched = useCallback(
    (video: CNVideoItem) => {
      const key =
        video.progressId ?? video.youtubeVideoId ?? `pos-${video.playlistPosition}`;
      const current = videoProgress[key] || videoProgress[String(video.playlistPosition)];
      const newWatched = !current?.watched;

      setVideoProgress((prev) => ({
        ...prev,
        [key]: {
          videoId: key,
          watched: newWatched,
          watchedAt: newWatched ? new Date().toISOString() : null,
          notes: current?.notes,
          revisionDue: current?.revisionDue,
        },
      }));

      startTransition(async () => {
        const idToSave =
          video.progressId ?? video.youtubeVideoId ?? String(video.playlistPosition);
        const res = await toggleCNVideoWatchedAction(idToSave, newWatched);
        if (res.ok) {
          toast.success(newWatched ? "Marked as completed" : "Marked as unwatched");
        } else {
          toast.info("Progress saved locally.");
        }
      });
    },
    [videoProgress]
  );

  const handleSaveNote = useCallback(
    (
      video: CNVideoItem,
      note: string,
      difficultyRating?: CNDifficulty,
      needsRevision?: boolean
    ) => {
      const key =
        video.progressId ?? video.youtubeVideoId ?? `pos-${video.playlistPosition}`;
      const current = videoProgress[key] || videoProgress[String(video.playlistPosition)];

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
          video.progressId ?? video.youtubeVideoId ?? String(video.playlistPosition);
        const res = await saveCNVideoNoteAction(
          idToSave,
          note,
          difficultyRating,
          needsRevision
        );
        if (res.ok) {
          toast.success("Note saved successfully.");
        } else {
          toast.info("Note saved locally.");
        }
      });
    },
    [videoProgress]
  );

  const handleToggleBookmark = useCallback(
    (video: CNVideoItem) => {
      const key = video.progressId ?? video.youtubeVideoId ?? `pos-${video.playlistPosition}`;
      const current = videoProgress[key] || videoProgress[String(video.playlistPosition)];
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
          video.progressId ?? video.youtubeVideoId ?? String(video.playlistPosition);
        const res = await toggleCNVideoBookmarkAction(idToSave, next);
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
    (video: CNVideoItem) => {
      const key = video.progressId ?? video.youtubeVideoId ?? `pos-${video.playlistPosition}`;
      const current = videoProgress[key] || videoProgress[String(video.playlistPosition)];
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
          video.progressId ?? video.youtubeVideoId ?? String(video.playlistPosition);
        const res = await toggleCNVideoRevisionAction(idToSave, next);
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
        const res = await recordCNLabAttemptAction(labId, status, notes);
        if (res.ok) {
          toast.success(
            status === "completed"
              ? "Laboratory verified and completed!"
              : "Attempt recorded."
          );
        } else {
          toast.info("Lab attempt saved locally.");
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
      const res = await completeCNDayAssignmentAction(dayNumber, notes);
      if (res.ok) {
        toast.success(`Day ${dayNumber} deliverable completed!`);
      } else {
        toast.info("Day progress saved locally.");
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
