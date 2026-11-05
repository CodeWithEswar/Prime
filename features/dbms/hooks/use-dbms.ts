"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type {
  DBMSDashboardData,
  UserVideoProgress,
  UserDayProgress,
  UserExerciseAttempt,
  DBMSVideoItem,
  DBMSVideoDifficulty,
  DBMSVideoImportance,
} from "@/domain/dbms";
import {
  calculateDBMSProgress,
  filterVideos,
  getNextRecommendedItem,
} from "@/domain/dbms";
import {
  enrollCourseAction,
  scheduleDBMSToPlannerAction,
  toggleVideoWatchedAction,
  saveVideoNotesAction,
  toggleVideoBookmarkAction,
  toggleVideoRevisionAction,
  recordExerciseAttemptAction,
  completeDayAssignmentAction,
} from "../server/actions";

export interface UseDBMSProps {
  initialData: DBMSDashboardData;
}

export function useDBMS({ initialData }: UseDBMSProps) {
  const [isPending, startTransition] = useTransition();

  const [activeDay, setActiveDay] = useState<number>(
    initialData.userState.currentDay || 1
  );
  const [activeTab, setActiveTab] = useState<
    "roadmap" | "videos" | "sql" | "interview" | "analytics"
  >("roadmap");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // User state
  const [videoProgress, setVideoProgress] = useState<Record<string, UserVideoProgress>>(
    initialData.userState.videoProgress
  );
  const [dayProgress, setDayProgress] = useState<Record<number, UserDayProgress>>(
    initialData.userState.dayProgress
  );
  const [exerciseAttempts, setExerciseAttempts] = useState<
    Record<string, UserExerciseAttempt>
  >(initialData.userState.exerciseAttempts);
  const [enrolled, setEnrolled] = useState<boolean>(initialData.userState.enrolled);

  // Filters for video library
  const [filterDay, setFilterDay] = useState<number | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<DBMSVideoDifficulty | "all">(
    "all"
  );
  const [filterImportance, setFilterImportance] = useState<DBMSVideoImportance | "all">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "watched" | "unwatched" | "bookmarked" | "revision_due"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Recalculate metrics reactively
  const metrics = useMemo(() => {
    return calculateDBMSProgress(
      initialData.days,
      initialData.videos,
      videoProgress,
      dayProgress,
      initialData.exercises,
      exerciseAttempts
    );
  }, [
    initialData.days,
    initialData.videos,
    videoProgress,
    dayProgress,
    initialData.exercises,
    exerciseAttempts,
  ]);

  // Recalculate filtered videos
  const filteredVideos = useMemo(() => {
    return filterVideos(
      initialData.videos,
      {
        dayNumber: filterDay,
        difficulty: filterDifficulty,
        importance: filterImportance,
        status: filterStatus,
        searchQuery,
      },
      videoProgress
    );
  }, [
    initialData.videos,
    filterDay,
    filterDifficulty,
    filterImportance,
    filterStatus,
    searchQuery,
    videoProgress,
  ]);

  // Next recommendation
  const nextRecommendation = useMemo(() => {
    return getNextRecommendedItem(
      initialData.days,
      initialData.videos,
      videoProgress,
      dayProgress,
      initialData.exercises,
      exerciseAttempts
    );
  }, [
    initialData.days,
    initialData.videos,
    videoProgress,
    dayProgress,
    initialData.exercises,
    exerciseAttempts,
  ]);

  // Video currently open in modal/embed
  const activeVideo = useMemo(() => {
    if (!selectedVideoId) return null;
    return initialData.videos.find((v) => v.youtubeVideoId === selectedVideoId) || null;
  }, [selectedVideoId, initialData.videos]);

  // Handlers
  const handleEnroll = useCallback((onStarted: () => void) => {
    startTransition(async () => {
      const result = await enrollCourseAction();
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
      const result = await scheduleDBMSToPlannerAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEnrolled(true);
      toast.success("Scheduled 12-day DBMS roadmap into your Planner & Calendar!");
    });
  }, []);

  const handleToggleWatched = useCallback(
    (videoId: string) => {
      const prev = videoProgress[videoId]?.watched ?? false;
      const next = !prev;

      setVideoProgress((curr) => ({
        ...curr,
        [videoId]: {
          ...curr[videoId],
          videoId,
          watched: next,
          watchedAt: next ? new Date().toISOString() : null,
        },
      }));

      startTransition(async () => {
        const res = await toggleVideoWatchedAction(videoId, next);
        if (!res.ok) {
          // Rollback
          setVideoProgress((curr) => ({
            ...curr,
            [videoId]: {
              ...curr[videoId],
              watched: prev,
            },
          }));
          toast.error(res.error);
        } else {
          toast.success(next ? "Marked lesson as watched" : "Unmarked lesson");
        }
      });
    },
    [videoProgress]
  );

  const handleSaveNotes = useCallback(
    (videoId: string, notes: string, difficulty?: DBMSVideoDifficulty) => {
      setVideoProgress((curr) => ({
        ...curr,
        [videoId]: {
          ...curr[videoId],
          videoId,
          watched: curr[videoId]?.watched ?? false,
          notes,
          difficultyRating: difficulty ?? curr[videoId]?.difficultyRating ?? null,
        },
      }));

      startTransition(async () => {
        const res = await saveVideoNotesAction(videoId, notes, difficulty);
        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success("Lesson notes saved");
        }
      });
    },
    []
  );

  const handleToggleBookmark = useCallback(
    (videoId: string) => {
      const prev = videoProgress[videoId]?.isBookmarked ?? false;
      const next = !prev;

      setVideoProgress((curr) => ({
        ...curr,
        [videoId]: {
          ...curr[videoId],
          videoId,
          watched: curr[videoId]?.watched ?? false,
          isBookmarked: next,
        },
      }));

      startTransition(async () => {
        const res = await toggleVideoBookmarkAction(videoId, next);
        if (!res.ok) {
          setVideoProgress((curr) => ({
            ...curr,
            [videoId]: {
              ...curr[videoId],
              isBookmarked: prev,
            },
          }));
          toast.error(res.error);
        } else {
          toast.success(next ? "Added to bookmarks" : "Removed from bookmarks");
        }
      });
    },
    [videoProgress]
  );

  const handleToggleRevision = useCallback(
    (videoId: string) => {
      const prev = videoProgress[videoId]?.revisionDue ?? false;
      const next = !prev;

      setVideoProgress((curr) => ({
        ...curr,
        [videoId]: {
          ...curr[videoId],
          videoId,
          watched: curr[videoId]?.watched ?? false,
          revisionDue: next,
        },
      }));

      startTransition(async () => {
        const res = await toggleVideoRevisionAction(videoId, next);
        if (!res.ok) {
          setVideoProgress((curr) => ({
            ...curr,
            [videoId]: {
              ...curr[videoId],
              revisionDue: prev,
            },
          }));
          toast.error(res.error);
        } else {
          toast.success(next ? "Marked for revision recall" : "Removed from revision");
        }
      });
    },
    [videoProgress]
  );

  const handleToggleAssignment = useCallback(
    (dayNumber: number) => {
      const prev = dayProgress[dayNumber]?.assignmentCompleted ?? false;
      const next = !prev;

      setDayProgress((curr) => ({
        ...curr,
        [dayNumber]: {
          ...curr[dayNumber],
          dayNumber,
          assignmentCompleted: next,
          completedAt: next ? new Date().toISOString() : null,
        },
      }));

      startTransition(async () => {
        const res = await completeDayAssignmentAction(dayNumber, next);
        if (!res.ok) {
          setDayProgress((curr) => ({
            ...curr,
            [dayNumber]: {
              ...curr[dayNumber],
              assignmentCompleted: prev,
            },
          }));
          toast.error(res.error);
        } else {
          toast.success(
            next
              ? `Day ${dayNumber} assignment completed!`
              : `Day ${dayNumber} assignment unmarked`
          );
        }
      });
    },
    [dayProgress]
  );

  const handleRecordExerciseAttempt = useCallback(
    (
      exerciseId: string,
      status: "attempted" | "solved" | "skipped",
      solutionNotes?: string
    ) => {
      setExerciseAttempts((curr) => ({
        ...curr,
        [exerciseId]: {
          exerciseId,
          status,
          solutionNotes: solutionNotes ?? curr[exerciseId]?.solutionNotes ?? null,
          completedAt: status === "solved" ? new Date().toISOString() : null,
        },
      }));

      startTransition(async () => {
        const res = await recordExerciseAttemptAction(exerciseId, status, solutionNotes);
        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success(
            status === "solved" ? "SQL exercise solved!" : "Progress updated"
          );
        }
      });
    },
    []
  );

  return {
    isPending,
    enrolled,
    activeDay,
    setActiveDay,
    activeTab,
    setActiveTab,
    selectedVideoId,
    setSelectedVideoId,
    activeVideo,
    videoProgress,
    dayProgress,
    exerciseAttempts,
    metrics,
    filteredVideos,
    nextRecommendation,
    filterDay,
    setFilterDay,
    filterDifficulty,
    setFilterDifficulty,
    filterImportance,
    setFilterImportance,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    handleEnroll,
    handleSchedulePlanner,
    handleToggleWatched,
    handleSaveNotes,
    handleToggleBookmark,
    handleToggleRevision,
    handleToggleAssignment,
    handleRecordExerciseAttempt,
  };
}
