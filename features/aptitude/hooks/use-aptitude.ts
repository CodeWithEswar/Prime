"use client";

import { useState, useMemo, useTransition } from "react";
import {
  aptitudeVideoProgressKey,
  getAptitudeTopicVideos,
} from "@/domain/aptitude/videos";
import { toast } from "sonner";
import type {
  AptitudeDashboardData,
  AptitudeTopic,
  AptitudeVideoItem,
  AptitudeTrackSlug,
  AptitudeDifficulty,
  AptitudePriority,
  UserAptitudeTopicProgress,
  UserAptitudeVideoProgress,
  AptitudeRecommendation,
} from "../types";
import {
  enrollAptitudeAction,
  toggleAptitudeTopicAction,
  toggleAptitudeBookmarkAction,
  saveAptitudeNotesAction,
  recordAptitudeVideoWatchAction,
  scheduleAptitudeRoadmapAction,
} from "../server/actions";

interface UseAptitudeProps {
  initialData: AptitudeDashboardData;
}

export function useAptitude({ initialData }: UseAptitudeProps) {
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<string>("roadmap");
  const [activeDay, setActiveDay] = useState<number>(
    initialData.enrollment.currentDay || 1
  );

  // Selected video for modal
  const [activeVideo, setActiveVideo] = useState<{
    topic: AptitudeTopic;
    video: AptitudeVideoItem;
  } | null>(null);

  // Directory filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTrack, setFilterTrack] = useState<AptitudeTrackSlug | "all">("all");
  const [filterDay, setFilterDay] = useState<number | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<AptitudeDifficulty | "all">(
    "all"
  );
  const [filterPriority, setFilterPriority] = useState<AptitudePriority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "in_progress" | "not_started" | "bookmarked"
  >("all");

  // Optimistic Enrollment
  const [enrolled, setEnrolled] = useState(initialData.enrollment.enrolled);

  // Optimistic topic progress
  const [topicProgress, setTopicProgress] = useState<
    Record<string, UserAptitudeTopicProgress>
  >(initialData.topicProgress);

  // Optimistic video progress
  const [videoProgress, setVideoProgress] = useState<
    Record<string, UserAptitudeVideoProgress>
  >(initialData.videoProgress);

  // Filtered topics calculation
  const filteredTopics = useMemo(() => {
    return initialData.allTopics.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesFormula = t.formulaNotes?.toLowerCase().includes(q) ?? false;
        const matchesId = t.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesFormula && !matchesId) return false;
      }

      // 2. Track
      if (filterTrack !== "all" && t.trackSlug !== filterTrack) {
        return false;
      }

      // 3. Day
      if (filterDay !== "all" && t.dayNumber !== filterDay) {
        return false;
      }

      // 4. Difficulty
      if (filterDifficulty !== "all" && t.difficulty !== filterDifficulty) {
        return false;
      }

      // 5. Priority
      if (filterPriority !== "all" && t.priority !== filterPriority) {
        return false;
      }

      // 6. Status
      const prog = topicProgress[t.id];
      if (filterStatus === "completed" && prog?.status !== "completed") return false;
      if (filterStatus === "in_progress" && prog?.status !== "in_progress") return false;
      if (
        filterStatus === "not_started" &&
        (prog?.status === "completed" || prog?.status === "in_progress")
      )
        return false;
      if (filterStatus === "bookmarked" && !prog?.isBookmarked) return false;

      return true;
    });
  }, [
    initialData.allTopics,
    searchQuery,
    filterTrack,
    filterDay,
    filterDifficulty,
    filterPriority,
    filterStatus,
    topicProgress,
  ]);

  // Next Recommendation
  const nextRecommendation: AptitudeRecommendation = (() => {
    // Find first uncompleted topic
    for (const day of initialData.days) {
      for (const topic of day.topics) {
        if (topicProgress[topic.id]?.status !== "completed") {
          return {
            dayNumber: day.dayNumber,
            topicId: topic.id,
            title: topic.title,
            trackSlug: topic.trackSlug,
            trackTitle:
              initialData.tracks.find((tr) => tr.slug === topic.trackSlug)?.title ||
              "Aptitude",
            type: day.isAssessmentDay ? "assessment" : "topic",
            videoId: topic.primaryVideo?.videoId,
          };
        }
      }
    }

    // Default to Day 1
    const firstDay = initialData.days[0];
    const firstTopic = firstDay?.topics[0];
    return {
      dayNumber: 1,
      topicId: firstTopic?.id || "D01_T01",
      title: firstTopic?.title || "Number systems",
      trackSlug: "quantitative-aptitude",
      trackTitle: "Quantitative Aptitude",
      type: "topic",
      videoId: firstTopic?.primaryVideo?.videoId,
    };
  })();

  // Dynamically calculated live metrics
  const liveMetrics = useMemo(() => {
    let completed = 0;
    let watched = 0;
    for (const t of initialData.allTopics) {
      if (topicProgress[t.id]?.status === "completed") completed++;
      if (
        getAptitudeTopicVideos(t).some(
          (v) => videoProgress[aptitudeVideoProgressKey(t.id, v.videoId)]?.watched
        )
      )
        watched++;
    }

    const totalTopics = initialData.allTopics.length;
    const completionRate = totalTopics > 0 ? completed / totalTopics : 0;
    const placementReadinessIndex = Math.min(
      100,
      Math.round(
        completionRate * 85 +
          (watched / Math.max(1, initialData.metrics.totalVideos)) * 15
      )
    );

    return {
      ...initialData.metrics,
      completedTopics: completed,
      watchedVideos: watched,
      placementReadinessIndex,
      estimatedMinutesRemaining: initialData.allTopics.reduce(
        (sum, t) =>
          sum + (topicProgress[t.id]?.status === "completed" ? 0 : t.estimatedMinutes),
        0
      ),
      trackProgress: Object.fromEntries(
        Object.entries(initialData.metrics.trackProgress).map(([slug, stat]) => {
          const topics = initialData.allTopics.filter((t) => t.trackSlug === slug);
          const done = topics.filter(
            (t) => topicProgress[t.id]?.status === "completed"
          ).length;
          return [
            slug,
            {
              ...stat,
              completedTopics: done,
              percentage: Math.round((done / Math.max(1, topics.length)) * 100),
            },
          ];
        })
      ) as typeof initialData.metrics.trackProgress,
    };
  }, [initialData, topicProgress, videoProgress]);

  // Handlers
  const handleEnroll = async (
    pacing: "accelerated" | "standard" | "relaxed" = "standard"
  ) => {
    setEnrolled(true);
    startTransition(async () => {
      const res = await enrollAptitudeAction({ pacing });
      if (res.ok) {
        toast.success("Enrolled in 40-Day Aptitude & Reasoning Curriculum!");
      } else {
        setEnrolled(initialData.enrollment.enrolled);
        toast.error(res.error || "Failed to enroll. Please sign in.");
      }
    });
  };

  const handleSchedulePlanner = async () => {
    startTransition(async () => {
      const res = await scheduleAptitudeRoadmapAction();
      if (res.ok) {
        toast.success("Aptitude 40-day roadmap scheduled to your planner & calendar!");
      } else {
        toast.error(res.error || "Failed to schedule into planner.");
      }
    });
  };

  const handleToggleTopicStatus = async (
    topicId: string,
    newStatus: "not_started" | "in_progress" | "completed"
  ) => {
    const prev = topicProgress[topicId];
    setTopicProgress((prevMap) => ({
      ...prevMap,
      [topicId]: {
        topicId,
        status: newStatus,
        isBookmarked: prev?.isBookmarked,
        userNotes: prev?.userNotes,
        lastActivityAt: new Date().toISOString(),
        completedAt: newStatus === "completed" ? new Date().toISOString() : null,
      },
    }));

    startTransition(async () => {
      const res = await toggleAptitudeTopicAction(topicId, newStatus);
      if (!res.ok) {
        setTopicProgress((prevMap) => ({
          ...prevMap,
          [topicId]: prev || { topicId, status: "not_started" },
        }));
        toast.error(res.error || "Could not update topic progress.");
      }
    });
  };

  const handleToggleBookmark = async (topicId: string) => {
    const prev = topicProgress[topicId];
    const isBookmarked = !prev?.isBookmarked;

    setTopicProgress((prevMap) => ({
      ...prevMap,
      [topicId]: {
        ...(prev || { topicId, status: "not_started" }),
        isBookmarked,
      },
    }));

    startTransition(async () => {
      const res = await toggleAptitudeBookmarkAction(topicId, isBookmarked);
      if (!res.ok) {
        setTopicProgress((prevMap) => ({
          ...prevMap,
          [topicId]: prev || { topicId, status: "not_started" },
        }));
        toast.error(res.error || "Could not update bookmark.");
      }
    });
  };

  const handleSaveNotes = async (topicId: string, notes: string) => {
    const prev = topicProgress[topicId];
    setTopicProgress((prevMap) => ({
      ...prevMap,
      [topicId]: {
        ...(prev || { topicId, status: "not_started" }),
        userNotes: notes,
      },
    }));

    startTransition(async () => {
      const res = await saveAptitudeNotesAction(topicId, notes);
      if (res.ok) {
        toast.success("Notes saved.");
      } else {
        toast.error(res.error || "Failed to save notes.");
      }
    });
  };

  const handleToggleVideoWatched = async (
    topicId: string,
    videoId: string,
    watched: boolean
  ) => {
    const key = aptitudeVideoProgressKey(topicId, videoId);
    const prev = videoProgress[key];
    setVideoProgress((prevMap) => ({
      ...prevMap,
      [key]: {
        topicId,
        videoId,
        watched,
        userConfirmed: watched,
        watchedSeconds: prev?.watchedSeconds ?? 0,
        watchedAt: watched ? new Date().toISOString() : null,
      },
    }));

    startTransition(async () => {
      const res = await recordAptitudeVideoWatchAction(
        topicId,
        videoId,
        watched,
        prev?.watchedSeconds ?? 0
      );
      if (!res.ok) {
        setVideoProgress((prevMap) => ({
          ...prevMap,
          [key]: prev || {
            topicId,
            videoId,
            watched: false,
            userConfirmed: false,
            watchedSeconds: 0,
          },
        }));
        toast.error(res.error || "Could not update video progress.");
      }
    });
  };

  const handleWatchVideo = (topic: AptitudeTopic, video: AptitudeVideoItem) => {
    const approved = getAptitudeTopicVideos(topic).find(
      (item) => item.videoId === video.videoId
    );
    if (approved) setActiveVideo({ topic, video: approved });
  };

  const handleCloseVideoModal = () => {
    setActiveVideo(null);
  };

  return {
    isPending,
    enrolled,
    activeDay,
    setActiveDay,
    activeTab,
    setActiveTab,
    activeVideo,
    topicProgress,
    videoProgress,
    metrics: liveMetrics,
    filteredTopics,
    nextRecommendation,
    filterTrack,
    setFilterTrack,
    filterDay,
    setFilterDay,
    filterDifficulty,
    setFilterDifficulty,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    handleEnroll,
    handleSchedulePlanner,
    handleToggleTopicStatus,
    handleToggleBookmark,
    handleSaveNotes,
    handleWatchVideo,
    handleCloseVideoModal,
    handleToggleVideoWatched,
  };
}
