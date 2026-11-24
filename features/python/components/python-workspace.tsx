"use client";

import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import {
  Route01Icon,
  PlayIcon,
  SourceCodeIcon,
  Award01Icon,
} from "@hugeicons/core-free-icons";
import {
  CourseVideoModal,
  type UnifiedVideoItem,
} from "@/components/shared/course-video-modal";

import { usePython } from "../hooks/use-python";
import { PythonHero } from "./python-hero";
import { StageProgressRail } from "./stage-progress-rail";
import { TodayFocusCard } from "./today-focus-card";
import { StageWorkspace } from "./stage-workspace";
import { PythonVideoLibrary } from "./python-video-library";
import { PythonLabsPanel } from "./python-labs-panel";
import { PythonAnalytics } from "./python-analytics";
import type { PythonDashboardData } from "@/domain/python";

interface PythonWorkspaceProps {
  initialData: PythonDashboardData;
}

export function PythonWorkspace({ initialData }: PythonWorkspaceProps) {
  const {
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
  } = usePython({ initialData });

  const currentStage =
    initialData.stages.find((s) => s.stageNumber === activeStage) ||
    initialData.stages[0];

  const unifiedVideos: UnifiedVideoItem[] = useMemo(() => {
    return initialData.videos.map((v) => ({
      id: v.youtubeVideoId,
      youtubeVideoId: v.youtubeVideoId,
      title: v.title,
      position: v.position,
      dayNumber: v.stageNumber,
      channel: v.channel,
      estimatedMinutes: v.estimatedMinutes,
      canonicalUrl: v.canonicalUrl,
      difficulty: v.difficulty,
      importance: v.importance,
    }));
  }, [initialData.videos]);

  const activeUnifiedVideo: UnifiedVideoItem | null = useMemo(() => {
    if (!selectedVideo) return null;
    return (
      unifiedVideos.find(
        (uv) => uv.youtubeVideoId === selectedVideo.youtubeVideoId
      ) || null
    );
  }, [selectedVideo, unifiedVideos]);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Hero Header */}
      <PythonHero
        metrics={initialData.metrics}
        enrolled={enrolled}
        onEnroll={handleToggleEnroll}
        onResume={() => {
          if (nextRecommendation.video) {
            setSelectedVideo(nextRecommendation.video);
          }
        }}
      />

      {/* 2. Today's Recommended Focus Card */}
      <TodayFocusCard
        recommendation={nextRecommendation}
        onWatchVideo={(vid) => setSelectedVideo(vid)}
        onToggleWatched={handleToggleWatched}
        onToggleAssignment={handleToggleAssignment}
        onSolveExercise={handleSolveExercise}
      />

      {/* 3. Stage Progress Rail */}
      <StageProgressRail
        stages={initialData.stages}
        videos={initialData.videos}
        videoProgress={videoProgress}
        stageProgress={stageProgress}
        activeStage={activeStage}
        onSelectStage={(sNum) => {
          setActiveStage(sNum);
          setActiveTab("stage");
        }}
      />

      {/* 4. Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) =>
          setActiveTab(val as "stage" | "library" | "labs" | "analytics")
        }
        className="w-full space-y-5"
      >
        <TabsList className="h-10 bg-[#0E0E12] border border-[#222228] p-1 rounded-xl">
          <TabsTrigger
            value="stage"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#1C1C24] data-[state=active]:text-white rounded-lg px-3"
          >
            <Icon icon={Route01Icon} size={14} />
            <span>Stage {activeStage} Workspace</span>
          </TabsTrigger>
          <TabsTrigger
            value="library"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#1C1C24] data-[state=active]:text-white rounded-lg px-3"
          >
            <Icon icon={PlayIcon} size={14} />
            <span>Video Library ({initialData.videos.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="labs"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#1C1C24] data-[state=active]:text-white rounded-lg px-3"
          >
            <Icon icon={SourceCodeIcon} size={14} />
            <span>Practical Labs ({initialData.exercises.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#1C1C24] data-[state=active]:text-white rounded-lg px-3"
          >
            <Icon icon={Award01Icon} size={14} />
            <span>Mastery & Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stage" className="mt-0 outline-none">
          <StageWorkspace
            stage={currentStage}
            videos={initialData.videos}
            exercises={initialData.exercises}
            videoProgress={videoProgress}
            stageProgress={stageProgress}
            exerciseAttempts={exerciseAttempts}
            onWatchVideo={(vid) => setSelectedVideo(vid)}
            onToggleWatched={handleToggleWatched}
            onToggleAssignment={handleToggleAssignment}
            onSolveExercise={handleSolveExercise}
          />
        </TabsContent>

        <TabsContent value="library" className="mt-0 outline-none">
          <PythonVideoLibrary
            videos={initialData.videos}
            videoProgress={videoProgress}
            onWatchVideo={(vid) => setSelectedVideo(vid)}
            onToggleWatched={handleToggleWatched}
          />
        </TabsContent>

        <TabsContent value="labs" className="mt-0 outline-none">
          <PythonLabsPanel
            exercises={initialData.exercises}
            exerciseAttempts={exerciseAttempts}
            onSolveExercise={handleSolveExercise}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 outline-none">
          <PythonAnalytics
            metrics={initialData.metrics}
            topicMastery={initialData.topicMastery}
          />
        </TabsContent>
      </Tabs>

      {/* 5. Video Player Dialog Modal with Notes & Completion Tracking */}
      {selectedVideo && activeUnifiedVideo && (
        <CourseVideoModal
          video={activeUnifiedVideo}
          isOpen={true}
          onClose={() => setSelectedVideo(null)}
          isWatched={!!videoProgress[selectedVideo.youtubeVideoId]?.watched}
          onToggleWatched={() => handleToggleWatched(selectedVideo.youtubeVideoId)}
          notes={videoProgress[selectedVideo.youtubeVideoId]?.notes}
        />
      )}
    </div>
  );
}
