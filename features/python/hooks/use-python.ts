"use client";

import { useState, useCallback } from "react";
import type {
  PythonDashboardData,
  PythonVideoItem,
  UserVideoProgress,
  UserStageProgress,
  UserExerciseAttempt,
} from "@/domain/python";
import {
  togglePythonVideoProgressAction,
  togglePythonEnrollmentAction,
} from "../server/actions";

interface UsePythonProps {
  initialData: PythonDashboardData;
}

export function usePython({ initialData }: UsePythonProps) {
  const [activeStage, setActiveStage] = useState<number>(initialData.activeStageNumber || 1);
  const [activeTab, setActiveTab] = useState<"stage" | "library" | "labs" | "analytics">("stage");
  const [enrolled, setEnrolled] = useState<boolean>(initialData.course.enrolled);
  const [selectedVideo, setSelectedVideo] = useState<PythonVideoItem | null>(null);

  const [videoProgress, setVideoProgress] = useState<Record<string, UserVideoProgress>>(
    initialData.userVideoProgress
  );
  const [stageProgress, setStageProgress] = useState<Record<number, UserStageProgress>>(
    initialData.userStageProgress
  );
  const [exerciseAttempts, setExerciseAttempts] = useState<Record<string, UserExerciseAttempt>>(
    initialData.userExerciseAttempts
  );

  const handleToggleWatched = useCallback(async (videoId: string) => {
    const isCurrentlyWatched = !!videoProgress[videoId]?.watched;
    const nextWatched = !isCurrentlyWatched;

    setVideoProgress((prev) => ({
      ...prev,
      [videoId]: {
        watched: nextWatched,
        watchedAt: nextWatched ? new Date().toISOString() : undefined,
      },
    }));

    await togglePythonVideoProgressAction(videoId, nextWatched);
  }, [videoProgress]);

  const handleToggleEnroll = useCallback(async () => {
    const nextEnrolled = !enrolled;
    setEnrolled(nextEnrolled);
    await togglePythonEnrollmentAction(nextEnrolled);
  }, [enrolled]);

  const handleToggleAssignment = useCallback((stageNumber: number) => {
    setStageProgress((prev) => {
      const current = prev[stageNumber];
      const nextDone = !current?.practicalAssignmentSubmitted;
      return {
        ...prev,
        [stageNumber]: {
          stageNumber,
          completed: nextDone,
          practicalAssignmentSubmitted: nextDone,
          completedAt: nextDone ? new Date().toISOString() : undefined,
        },
      };
    });
  }, []);

  const handleSolveExercise = useCallback((exerciseId: string) => {
    setExerciseAttempts((prev) => ({
      ...prev,
      [exerciseId]: {
        exerciseId,
        status: "completed",
        completedAt: new Date().toISOString(),
      },
    }));
  }, []);

  let nextRecommendation: {
    type: "video" | "assignment" | "exercise";
    stageNumber: number;
    title: string;
    description: string;
    video?: PythonVideoItem;
    exerciseId?: string;
  } = {
    type: "video",
    stageNumber: 1,
    title: "Curriculum Completed!",
    description: "You have completed all 8 Python & DSA stages.",
  };

  for (const stage of initialData.stages) {
    const stageVideos = initialData.videos.filter((v) => v.stageNumber === stage.stageNumber);
    const unwatched = stageVideos.find((v) => !videoProgress[v.youtubeVideoId]?.watched);
    if (unwatched) {
      nextRecommendation = {
        type: "video",
        stageNumber: stage.stageNumber,
        video: unwatched,
        title: unwatched.title,
        description: `Stage ${stage.stageNumber}: ${unwatched.channel} • ~${unwatched.estimatedMinutes} mins`,
      };
      break;
    }

    if (!stageProgress[stage.stageNumber]?.practicalAssignmentSubmitted) {
      nextRecommendation = {
        type: "assignment",
        stageNumber: stage.stageNumber,
        title: `Submit Stage ${stage.stageNumber} Assignment`,
        description: stage.practicalAssignment.title,
      };
      break;
    }
  }

  return {
    activeStage,
    setActiveStage,
    activeTab,
    setActiveTab,
    enrolled,
    handleToggleEnroll,
    selectedVideo,
    setSelectedVideo,
    videoProgress,
    stageProgress,
    exerciseAttempts,
    handleToggleWatched,
    handleToggleAssignment,
    handleSolveExercise,
    nextRecommendation,
  };
}
