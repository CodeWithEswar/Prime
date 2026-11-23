"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { toast } from "sonner";
import type {
  DataEngineeringDashboardData,
  UserVideoProgress,
  UserStageProgress,
  UserExerciseAttempt,
  DataEngineeringDifficulty,
  DataEngineeringImportance,
  DataEngineeringActiveTab,
} from "@/domain/data-engineering";
import {
  calculateDataEngineeringProgress,
  getNextRecommendation,
} from "@/domain/data-engineering";
import {
  enrollCourseAction,
  schedulePlannerAction,
  toggleVideoWatchedAction,
  saveVideoNotesAction,
  toggleVideoBookmarkAction,
  toggleVideoRevisionAction,
  recordExerciseAttemptAction,
  completeStageAssignmentAction,
} from "../server/actions";

export interface UseDataEngineeringProps {
  initialData: DataEngineeringDashboardData;
}

export function useDataEngineering({ initialData }: UseDataEngineeringProps) {
  const [isPending, startTransition] = useTransition();

  const [activeStage, setActiveStage] = useState<number>(
    initialData.userState.currentStage || 1
  );
  const [activeTab, setActiveTab] =
    useState<DataEngineeringActiveTab>("roadmap");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [activeLabId, setActiveLabId] = useState<string | null>(
    initialData.exercises[0]?.id ?? null
  );

  // User progress states
  const [videoProgress, setVideoProgress] = useState<
    Record<string, UserVideoProgress>
  >(initialData.userState.videoProgress);

  const [stageProgress, setStageProgress] = useState<
    Record<number, UserStageProgress>
  >(initialData.userState.stageProgress);

  const [exerciseAttempts, setExerciseAttempts] = useState<
    Record<string, UserExerciseAttempt>
  >(initialData.userState.exerciseAttempts);

  const [enrolled, setEnrolled] = useState<boolean>(
    initialData.userState.enrolled
  );

  // Video Library filter states
  const [filterStage, setFilterStage] = useState<number | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<
    DataEngineeringDifficulty | "all"
  >("all");
  const [filterImportance, setFilterImportance] = useState<
    DataEngineeringImportance | "all"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "watched" | "unwatched" | "bookmarked" | "revision_due"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Recalculate progress metrics reactively
  const metrics = useMemo(() => {
    return calculateDataEngineeringProgress(
      initialData.stages,
      initialData.videos,
      videoProgress,
      stageProgress,
      initialData.exercises,
      exerciseAttempts
    );
  }, [
    initialData.stages,
    initialData.videos,
    initialData.exercises,
    videoProgress,
    stageProgress,
    exerciseAttempts,
  ]);

  // Derive next recommended study task
  const nextRecommendation = useMemo(() => {
    return getNextRecommendation(
      initialData.stages,
      initialData.videos,
      videoProgress,
      stageProgress,
      initialData.exercises,
      exerciseAttempts
    );
  }, [
    initialData.stages,
    initialData.videos,
    initialData.exercises,
    videoProgress,
    stageProgress,
    exerciseAttempts,
  ]);

  // Filter video library
  const filteredVideos = useMemo(() => {
    return initialData.videos.filter((video) => {
      if (filterStage !== "all" && video.stageNumber !== filterStage) {
        return false;
      }
      if (filterDifficulty !== "all" && video.difficulty !== filterDifficulty) {
        return false;
      }
      if (filterImportance !== "all" && video.importance !== filterImportance) {
        return false;
      }

      const prog = videoProgress[video.youtubeVideoId];
      if (filterStatus === "watched" && !prog?.watched) return false;
      if (filterStatus === "unwatched" && prog?.watched) return false;
      if (filterStatus === "bookmarked" && !prog?.isBookmarked) return false;
      if (filterStatus === "revision_due" && !prog?.revisionDue) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = video.title.toLowerCase().includes(query);
        const matchesChannel = video.channel.toLowerCase().includes(query);
        const matchesTopic = video.topicSlug.toLowerCase().includes(query);
        const matchesKeyTakeaways = video.keyTakeaways?.some((k) =>
          k.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesChannel && !matchesTopic && !matchesKeyTakeaways) {
          return false;
        }
      }

      return true;
    });
  }, [
    initialData.videos,
    filterStage,
    filterDifficulty,
    filterImportance,
    filterStatus,
    searchQuery,
    videoProgress,
  ]);

  const activeVideo = useMemo(() => {
    if (!selectedVideoId) return null;
    return (
      initialData.videos.find((v) => v.youtubeVideoId === selectedVideoId) ?? null
    );
  }, [initialData.videos, selectedVideoId]);

  // Enrollment handler
  const handleEnroll = useCallback(
    (onStarted?: () => void) => {
      startTransition(async () => {
        const res = await enrollCourseAction();
        if (res.ok) {
          setEnrolled(true);
          toast.success("Enrolled in Data Engineering Mastery Roadmap!");
          onStarted?.();
        } else {
          toast.error(res.error || "Enrollment failed. Please try again.");
        }
      });
    },
    []
  );

  // Auto-schedule to planner
  const handleSchedulePlanner = useCallback(() => {
    startTransition(async () => {
      await schedulePlannerAction();
      toast.success(
        `Scheduled Data Engineering modules into your study calendar!`
      );
    });
  }, []);

  // Toggle video watched state
  const handleToggleWatched = useCallback(
    (videoId: string) => {
      const current = videoProgress[videoId]?.watched ?? false;
      const nextWatched = !current;

      setVideoProgress((prev) => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          videoId,
          watched: nextWatched,
          watchedAt: nextWatched ? new Date().toISOString() : null,
        },
      }));

      startTransition(async () => {
        const res = await toggleVideoWatchedAction(videoId, nextWatched);
        if (!res.ok) {
          // Revert optimistic update
          setVideoProgress((prev) => ({
            ...prev,
            [videoId]: {
              ...prev[videoId],
              videoId,
              watched: current,
            },
          }));
          toast.error(res.error || "Could not update video progress.");
        } else {
          toast.success(
            nextWatched ? "Lesson marked as completed!" : "Lesson marked as unwatched."
          );
        }
      });
    },
    [videoProgress]
  );

  // Save notes
  const handleSaveNotes = useCallback(
    (videoId: string, notes: string) => {
      setVideoProgress((prev) => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          videoId,
          watched: prev[videoId]?.watched ?? false,
          notes,
        },
      }));

      startTransition(async () => {
        const res = await saveVideoNotesAction(videoId, notes);
        if (res.ok) {
          toast.success("Notes saved.");
        } else {
          toast.error(res.error || "Failed to save notes.");
        }
      });
    },
    []
  );

  // Toggle bookmark
  const handleToggleBookmark = useCallback(
    (videoId: string) => {
      const current = videoProgress[videoId]?.isBookmarked ?? false;
      const next = !current;

      setVideoProgress((prev) => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          videoId,
          watched: prev[videoId]?.watched ?? false,
          isBookmarked: next,
        },
      }));

      startTransition(async () => {
        const res = await toggleVideoBookmarkAction(videoId, next);
        if (res.ok) {
          toast.success(next ? "Lesson bookmarked." : "Bookmark removed.");
        }
      });
    },
    [videoProgress]
  );

  // Toggle revision
  const handleToggleRevision = useCallback(
    (videoId: string) => {
      const current = videoProgress[videoId]?.revisionDue ?? false;
      const next = !current;

      setVideoProgress((prev) => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          videoId,
          watched: prev[videoId]?.watched ?? false,
          revisionDue: next,
        },
      }));

      startTransition(async () => {
        const res = await toggleVideoRevisionAction(videoId, next);
        if (res.ok) {
          toast.success(
            next ? "Added to Revision Queue." : "Removed from Revision Queue."
          );
        }
      });
    },
    [videoProgress]
  );

  // Complete stage assignment
  const handleToggleAssignment = useCallback(
    (stageNumber: number) => {
      const current =
        stageProgress[stageNumber]?.assignmentCompleted ?? false;
      const next = !current;

      setStageProgress((prev) => ({
        ...prev,
        [stageNumber]: {
          stageNumber,
          assignmentCompleted: next,
          completedAt: next ? new Date().toISOString() : null,
        },
      }));

      startTransition(async () => {
        const res = await completeStageAssignmentAction(stageNumber, next);
        if (res.ok) {
          toast.success(
            next
              ? `Stage ${stageNumber} milestone verified!`
              : `Stage ${stageNumber} milestone unverified.`
          );
        } else {
          // Revert
          setStageProgress((prev) => ({
            ...prev,
            [stageNumber]: {
              stageNumber,
              assignmentCompleted: current,
            },
          }));
          toast.error(res.error || "Could not update milestone progress.");
        }
      });
    },
    [stageProgress]
  );

  // Record lab exercise attempt
  const handleRecordExerciseAttempt = useCallback(
    (
      exerciseId: string,
      status: "attempted" | "solved" | "skipped",
      solutionNotes?: string
    ) => {
      setExerciseAttempts((prev) => ({
        ...prev,
        [exerciseId]: {
          exerciseId,
          status,
          solutionNotes,
          completedAt: status === "solved" ? new Date().toISOString() : null,
        },
      }));

      startTransition(async () => {
        const res = await recordExerciseAttemptAction(
          exerciseId,
          status,
          solutionNotes
        );
        if (res.ok) {
          if (status === "solved") {
            toast.success("Lab exercise solved! Mastery recorded.");
          }
        } else {
          toast.error(res.error || "Could not record exercise attempt.");
        }
      });
    },
    []
  );

  return {
    isPending,
    enrolled,
    activeStage,
    setActiveStage,
    activeTab,
    setActiveTab,
    selectedVideoId,
    setSelectedVideoId,
    activeVideo,
    activeLabId,
    setActiveLabId,
    videoProgress,
    stageProgress,
    exerciseAttempts,
    metrics,
    filteredVideos,
    nextRecommendation,
    filterStage,
    setFilterStage,
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
