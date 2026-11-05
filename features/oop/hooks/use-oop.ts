"use client";

import { toast } from "sonner";
import { useState, useTransition, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { OOPDashboardData, OOPTab } from "../types";
import type {
  OOPVideoItem,
  OOPSegmentItem,
  UserOOPVideoProgress,
  UserOOPSegmentProgress,
  UserOOPDayProgress,
  UserOOPLabAttempt,
  UserOOPDesignAttempt,
} from "@/domain/oop";
import { calculateOOPMetrics, getRecommendedNextOOPDay } from "@/domain/oop";
import type { CourseFocusRecommendation } from "@/components/shared/course-focus-card";
import {
  enrollOOPCourseAction,
  planOOPCourseInPlannerAction,
  toggleOOPVideoWatchedAction,
  toggleOOPSegmentCompletedAction,
  saveOOPVideoNoteAction,
  recordOOPLabAttemptAction,
  recordOOPDesignAttemptAction,
  completeOOPDayAssignmentAction,
  toggleOOPVideoBookmarkAction,
  toggleOOPVideoRevisionAction,
} from "../server/actions";

const LOCAL_STORAGE_KEY = "prime_oop_guest_state_v1";

interface UseOOPProps {
  initialData: OOPDashboardData;
}

export function useOOP({ initialData }: UseOOPProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Local navigation & view states
  const [activeTab, setActiveTab] = useState<OOPTab>("overview");
  const [activeDay, setActiveDay] = useState<number>(1);
  const [selectedVideo, setSelectedVideo] = useState<OOPVideoItem | null>(null);
  const [activeLabSlug, setActiveLabSlug] = useState<string>("class-object");
  const [activeCaseId, setActiveCaseId] = useState<string>("lld-parking-lot");

  // Search & Filter state for videos
  const [filters, setFilters] = useState({
    searchQuery: "",
    selectedDay: null as number | null,
    selectedDifficulty: "all" as "all" | "easy" | "medium" | "hard",
    statusFilter: "all" as "all" | "watched" | "unwatched",
  });

  // Query Key for OOP Course
  const queryKey = ["oop-course-data", initialData.course.slug];

  const { data } = useQuery<OOPDashboardData>({
    queryKey,
    queryFn: () => initialData,
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Local state tracking (initialized from query data and merged with localStorage for guest mode)
  const [enrolled, setEnrolled] = useState<boolean>(data.userState.enrolled);
  const [videoProgress, setVideoProgress] = useState<
    Record<string, UserOOPVideoProgress>
  >(data.userState.videoProgress);
  const [segmentProgress, setSegmentProgress] = useState<
    Record<string, UserOOPSegmentProgress>
  >(data.userState.segmentProgress);
  const [dayProgress, setDayProgress] = useState<Record<number, UserOOPDayProgress>>(
    data.userState.dayProgress
  );
  const [labAttempts, setLabAttempts] = useState<Record<string, UserOOPLabAttempt>>(
    data.userState.labAttempts
  );
  const [designAttempts, setDesignAttempts] = useState<
    Record<string, UserOOPDesignAttempt>
  >(data.userState.designAttempts);

  // Restore guest progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.videoProgress)
          setVideoProgress((prev) => ({ ...prev, ...parsed.videoProgress }));
        if (parsed.segmentProgress)
          setSegmentProgress((prev) => ({ ...prev, ...parsed.segmentProgress }));
        if (parsed.dayProgress)
          setDayProgress((prev) => ({ ...prev, ...parsed.dayProgress }));
        if (parsed.labAttempts)
          setLabAttempts((prev) => ({ ...prev, ...parsed.labAttempts }));
        if (parsed.designAttempts)
          setDesignAttempts((prev) => ({ ...prev, ...parsed.designAttempts }));
      }
    } catch (e) {
      console.warn("Could not read local guest storage for OOP", e);
    }
  }, []);

  // Save guest progress
  const saveGuestState = (
    updates: Partial<{
      videoProgress: Record<string, UserOOPVideoProgress>;
      segmentProgress: Record<string, UserOOPSegmentProgress>;
      dayProgress: Record<number, UserOOPDayProgress>;
      labAttempts: Record<string, UserOOPLabAttempt>;
      designAttempts: Record<string, UserOOPDesignAttempt>;
    }>
  ) => {
    try {
      const current = {
        videoProgress,
        segmentProgress,
        dayProgress,
        labAttempts,
        designAttempts,
        ...updates,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn("Could not write local guest storage for OOP", e);
    }
  };

  // Recalculate metrics dynamically on any progress change
  const currentMetrics = useMemo(() => {
    return calculateOOPMetrics(
      data.days,
      data.videos,
      data.segments,
      videoProgress,
      segmentProgress,
      labAttempts,
      dayProgress,
      designAttempts
    );
  }, [
    data.days,
    data.videos,
    data.segments,
    videoProgress,
    segmentProgress,
    labAttempts,
    dayProgress,
    designAttempts,
  ]);

  const nextRecommendedDay = useMemo(() => {
    return getRecommendedNextOOPDay(data.days, dayProgress);
  }, [data.days, dayProgress]);

  // Mutations with Optimistic Updates
  const enroll = (onStarted: () => void) => {
    startTransition(async () => {
      const result = await enrollOOPCourseAction(data.course.slug);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Roadmap started & scheduled in Planner.");
      setEnrolled(true);
      onStarted();
    });
  };

  const schedule = () => {
    startTransition(async () => {
      const result = await planOOPCourseInPlannerAction(data.course.slug);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setEnrolled(true);
      toast.success("Scheduled 12-day OOP roadmap into your Planner & Calendar!");
    });
  };

  const toggleVideoWatchedMutation = useMutation({
    mutationFn: async ({ video, watched }: { video: OOPVideoItem; watched: boolean }) => {
      const updated: Record<string, UserOOPVideoProgress> = {
        ...videoProgress,
        [video.youtubeVideoId]: {
          videoId: video.youtubeVideoId,
          watched,
          watchedAt: watched ? new Date().toISOString() : null,
        },
      };
      setVideoProgress(updated);
      saveGuestState({ videoProgress: updated });
      return toggleOOPVideoWatchedAction(video.youtubeVideoId, watched);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleSegmentCompletedMutation = useMutation({
    mutationFn: async ({
      segment,
      completed,
    }: {
      segment: OOPSegmentItem;
      completed: boolean;
    }) => {
      const updated: Record<string, UserOOPSegmentProgress> = {
        ...segmentProgress,
        [segment.segmentId]: {
          segmentId: segment.segmentId,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        },
      };
      setSegmentProgress(updated);
      saveGuestState({ segmentProgress: updated });
      return toggleOOPSegmentCompletedAction(segment.segmentId, completed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async ({ videoId, notes }: { videoId: string; notes: string }) => {
      const updated: Record<string, UserOOPVideoProgress> = {
        ...videoProgress,
        [videoId]: {
          ...(videoProgress[videoId] || { videoId, watched: false, watchedAt: null }),
          notes,
        },
      };
      setVideoProgress(updated);
      saveGuestState({ videoProgress: updated });
      return saveOOPVideoNoteAction(videoId, notes);
    },
  });

  const recordLabAttemptMutation = useMutation({
    mutationFn: async ({
      labId,
      scenarioId = "default",
      isSuccess = true,
      notes,
    }: {
      labId: string;
      scenarioId?: string;
      isSuccess?: boolean;
      notes?: string;
    }) => {
      const labKey = `oop-lab-${labId}`;
      const updated: Record<string, UserOOPLabAttempt> = {
        ...labAttempts,
        [labKey]: {
          labId: labKey,
          scenarioId,
          status: isSuccess ? "completed" : "attempted",
          solutionNotes: notes,
          completedAt: new Date().toISOString(),
        },
      };
      setLabAttempts(updated);
      saveGuestState({ labAttempts: updated });
      return recordOOPLabAttemptAction(labId, scenarioId, isSuccess, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const recordDesignAttemptMutation = useMutation({
    mutationFn: async ({
      caseId,
      selfAssessment = "proficient",
      notes,
    }: {
      caseId: string;
      selfAssessment?: "proficient" | "adequate" | "needs_review";
      notes?: string;
    }) => {
      const updated: Record<string, UserOOPDesignAttempt> = {
        ...designAttempts,
        [caseId]: {
          caseId,
          selfAssessment,
          notes,
          completedAt: new Date().toISOString(),
        },
      };
      setDesignAttempts(updated);
      saveGuestState({ designAttempts: updated });
      return recordOOPDesignAttemptAction(caseId, selfAssessment, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const completeDayMutation = useMutation({
    mutationFn: async ({ dayNumber, notes }: { dayNumber: number; notes?: string }) => {
      const updated: Record<number, UserOOPDayProgress> = {
        ...dayProgress,
        [dayNumber]: {
          dayNumber,
          assignmentCompleted: true,
          notes,
          completedAt: new Date().toISOString(),
        },
      };
      setDayProgress(updated);
      saveGuestState({ dayProgress: updated });
      return completeOOPDayAssignmentAction(dayNumber, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Next recommendation focus
  const nextRecommendation: CourseFocusRecommendation = useMemo(() => {
    for (const day of data.days) {
      const dayVids = data.videos.filter(
        (v) => v.assignedDays.includes(day.dayNumber) && !v.isSupplementary
      );
      const firstUnwatched = dayVids.find((v) => !videoProgress[v.youtubeVideoId]?.watched);
      if (firstUnwatched) {
        return {
          type: "video",
          dayNumber: day.dayNumber,
          itemTitle: firstUnwatched.title,
          itemSubtitle: `Day ${day.dayNumber}: ${day.title}`,
          videoId: firstUnwatched.youtubeVideoId,
          estimatedMinutes: Math.round(firstUnwatched.durationSeconds / 60),
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
    }
    return {
      type: "course_completed",
      dayNumber: 12,
      itemTitle: "All 12 OOP Days Completed!",
      itemSubtitle: "Ready for Object-Oriented Design & LLD Interviews",
    };
  }, [data.days, data.videos, videoProgress, dayProgress]);

  const toggleBookmark = (video: OOPVideoItem) => {
    const prev = videoProgress[video.youtubeVideoId]?.isBookmarked ?? false;
    const next = !prev;
    const updated = {
      ...videoProgress,
      [video.youtubeVideoId]: {
        ...videoProgress[video.youtubeVideoId],
        videoId: video.youtubeVideoId,
        watched: videoProgress[video.youtubeVideoId]?.watched ?? false,
        watchedAt: videoProgress[video.youtubeVideoId]?.watchedAt ?? null,
        isBookmarked: next,
      },
    };
    setVideoProgress(updated);
    saveGuestState({ videoProgress: updated });
    startTransition(async () => {
      const res = await toggleOOPVideoBookmarkAction(video.youtubeVideoId, next);
      if (!res.ok) {
        toast.info("Bookmark saved locally.");
      } else {
        toast.success(next ? "Added to bookmarks" : "Removed from bookmarks");
      }
    });
  };

  const toggleRevision = (video: OOPVideoItem) => {
    const prev = videoProgress[video.youtubeVideoId]?.revisionDue ?? false;
    const next = !prev;
    const updated = {
      ...videoProgress,
      [video.youtubeVideoId]: {
        ...videoProgress[video.youtubeVideoId],
        videoId: video.youtubeVideoId,
        watched: videoProgress[video.youtubeVideoId]?.watched ?? false,
        watchedAt: videoProgress[video.youtubeVideoId]?.watchedAt ?? null,
        revisionDue: next,
      },
    };
    setVideoProgress(updated);
    saveGuestState({ videoProgress: updated });
    startTransition(async () => {
      const res = await toggleOOPVideoRevisionAction(video.youtubeVideoId, next);
      if (!res.ok) {
        toast.info("Revision status saved locally.");
      } else {
        toast.success(next ? "Flagged for revision" : "Revision cleared");
      }
    });
  };

  // Filtered Video List
  const filteredVideos = useMemo(() => {
    return data.videos.filter((v) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = v.title.toLowerCase().includes(query);
        const matchTopic = v.topicIds.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchTopic) return false;
      }
      if (filters.selectedDay !== null && !v.assignedDays.includes(filters.selectedDay)) {
        return false;
      }
      if (
        filters.selectedDifficulty !== "all" &&
        v.difficulty !== filters.selectedDifficulty
      ) {
        return false;
      }
      if (filters.statusFilter !== "all") {
        const isWatched = Boolean(videoProgress[v.youtubeVideoId]?.watched);
        if (filters.statusFilter === "watched" && !isWatched) return false;
        if (filters.statusFilter === "unwatched" && isWatched) return false;
      }
      return true;
    });
  }, [data.videos, filters, videoProgress]);

  return {
    course: data.course,
    days: data.days,
    videos: data.videos,
    segments: data.segments,
    prerequisites: data.prerequisites,
    supplementaryVideos: data.supplementaryVideos,
    outputPredictions: data.outputPredictions,
    lldCases: data.lldCases,
    activeTab,
    setActiveTab,
    activeDay,
    setActiveDay,
    selectedVideo,
    setSelectedVideo,
    activeLabSlug,
    setActiveLabSlug,
    activeCaseId,
    setActiveCaseId,
    filters,
    setFilters,
    filteredVideos,
    enrolled,
    videoProgress,
    segmentProgress,
    dayProgress,
    labAttempts,
    designAttempts,
    metrics: currentMetrics,
    nextRecommendedDay,
    nextRecommendation,
    isPending,
    actions: {
      enroll,
      schedule,
      toggleVideoWatched: (video: OOPVideoItem) => {
        const currentlyWatched = Boolean(videoProgress[video.youtubeVideoId]?.watched);
        startTransition(() =>
          toggleVideoWatchedMutation.mutate({ video, watched: !currentlyWatched })
        );
      },
      toggleBookmark,
      toggleRevision,
      toggleSegmentCompleted: (segment: OOPSegmentItem) => {
        const currentlyCompleted = Boolean(segmentProgress[segment.segmentId]?.completed);
        startTransition(() =>
          toggleSegmentCompletedMutation.mutate({
            segment,
            completed: !currentlyCompleted,
          })
        );
      },
      saveNote: (videoId: string, notes: string) =>
        startTransition(() => saveNoteMutation.mutate({ videoId, notes })),
      recordLabAttempt: (labId: string, isSuccess = true, notes?: string) =>
        startTransition(() =>
          recordLabAttemptMutation.mutate({ labId, isSuccess, notes })
        ),
      recordDesignAttempt: (
        caseId: string,
        selfAssessment?: "proficient" | "adequate" | "needs_review",
        notes?: string
      ) =>
        startTransition(() =>
          recordDesignAttemptMutation.mutate({ caseId, selfAssessment, notes })
        ),
      completeDay: (dayNumber: number, notes?: string) =>
        startTransition(() => completeDayMutation.mutate({ dayNumber, notes })),
    },
  };
}
