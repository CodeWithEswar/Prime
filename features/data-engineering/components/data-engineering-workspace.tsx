"use client";

import { useMemo } from "react";
import { focusCourseDay, CourseTabs } from "@/components/shared/course-roadmap";
import { TabsContent } from "@/components/ui/tabs";
import { CourseInterviewBank } from "@/components/shared/course-interview-bank";
import {
  CourseVideoModal,
  type UnifiedVideoItem,
} from "@/components/shared/course-video-modal";

import { useDataEngineering } from "../hooks/use-data-engineering";
import type {
  DataEngineeringDashboardData,
  DataEngineeringActiveTab,
} from "@/domain/data-engineering";
import { DataEngineeringHero } from "./data-engineering-hero";
import { StageProgressRail } from "./stage-progress-rail";
import { TodayFocusCard } from "./today-focus-card";
import { StageWorkspace } from "./stage-workspace";
import { DataEngineeringVideoLibrary } from "./data-engineering-video-library";
import { DataEngineeringLabsPanel } from "./data-engineering-labs-panel";
import { DataEngineeringAnalytics } from "./data-engineering-analytics";

interface WorkspaceProps {
  initialData: DataEngineeringDashboardData;
}

export function DataEngineeringWorkspace({ initialData }: WorkspaceProps) {
  const {
    isPending,
    enrolled,
    activeStage,
    setActiveStage,
    activeTab,
    setActiveTab,
    selectedVideoId,
    setSelectedVideoId,
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
  } = useDataEngineering({ initialData });

  const currentStageSchedule =
    initialData.stages.find((s) => s.stageNumber === activeStage) ||
    initialData.stages[0];

  const openRecommendedStage = () => {
    setActiveStage(nextRecommendation.stageNumber);
    setActiveTab("roadmap");
    focusCourseDay();
  };

  const handleResume = () => {
    if (nextRecommendation.type === "video" && nextRecommendation.videoId) {
      setSelectedVideoId(nextRecommendation.videoId);
    } else {
      openRecommendedStage();
    }
  };

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

  const activeUnifiedVideo = selectedVideoId
    ? unifiedVideos.find(
        (v) =>
          v.youtubeVideoId === selectedVideoId || v.id === selectedVideoId
      ) ?? null
    : null;

  return (
    <div className="@container min-w-0 space-y-4 sm:space-y-5">
      {/* 1. Hero Header */}
      <DataEngineeringHero
        metrics={metrics}
        enrolled={enrolled}
        onEnroll={handleEnroll}
        onResume={handleResume}
        onStarted={openRecommendedStage}
        onSchedule={handleSchedulePlanner}
        isPending={isPending}
      />

      {/* 2. Main Course Tabs */}
      <CourseTabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as DataEngineeringActiveTab)}
        options={[
          ["roadmap", "Roadmap & Stages"],
          ["videos", `Video Library (${initialData.videos.length})`],
          ["labs", `Hands-On Labs (${initialData.exercises.length})`],
          ["interview", "Interview Prep (18)"],
          ["analytics", "Analytics & Observability"],
        ]}
        label="Data Engineering views"
        layoutId="data-engineering-views"
      >
        {/* Tab 1: Roadmap & Stages */}
        <TabsContent value="roadmap" className="mt-0 min-w-0">
          <div className="space-y-6">
            <StageProgressRail
              stages={initialData.stages}
              videos={initialData.videos}
              videoProgress={videoProgress}
              stageProgress={stageProgress}
              activeStage={activeStage}
              onSelectStage={setActiveStage}
            />

            <TodayFocusCard
              recommendation={nextRecommendation}
              onWatchVideo={(vid) => setSelectedVideoId(vid)}
              onToggleWatched={handleToggleWatched}
              onToggleAssignment={handleToggleAssignment}
              onSolveExercise={(exId) => {
                setActiveLabId(exId);
                setActiveTab("labs");
              }}
            />

            <StageWorkspace
              stage={currentStageSchedule}
              videos={initialData.videos}
              exercises={initialData.exercises}
              videoProgress={videoProgress}
              stageProgress={stageProgress}
              exerciseAttempts={exerciseAttempts}
              onWatchVideo={(vid) => setSelectedVideoId(vid)}
              onToggleWatched={handleToggleWatched}
              onToggleBookmark={handleToggleBookmark}
              onToggleRevision={handleToggleRevision}
              onToggleAssignment={handleToggleAssignment}
              onSolveExercise={(exId) => {
                setActiveLabId(exId);
                setActiveTab("labs");
              }}
            />
          </div>
        </TabsContent>

        {/* Tab 2: 54-Video Directory */}
        <TabsContent value="videos" className="mt-0 min-w-0">
          <DataEngineeringVideoLibrary
            videos={filteredVideos}
            videoProgress={videoProgress}
            filterStage={filterStage}
            filterDifficulty={filterDifficulty}
            filterImportance={filterImportance}
            filterStatus={filterStatus}
            searchQuery={searchQuery}
            onFilterStageChange={setFilterStage}
            onFilterDifficultyChange={setFilterDifficulty}
            onFilterImportanceChange={setFilterImportance}
            onFilterStatusChange={setFilterStatus}
            onSearchQueryChange={setSearchQuery}
            onWatchVideo={(vid) => setSelectedVideoId(vid)}
            onToggleWatched={handleToggleWatched}
            onToggleBookmark={handleToggleBookmark}
            onToggleRevision={handleToggleRevision}
          />
        </TabsContent>

        {/* Tab 3: Hands-On Labs */}
        <TabsContent value="labs" className="mt-0 min-w-0">
          <DataEngineeringLabsPanel
            exercises={initialData.exercises}
            exerciseAttempts={exerciseAttempts}
            activeLabId={activeLabId}
            onSelectLab={setActiveLabId}
            onRecordExerciseAttempt={handleRecordExerciseAttempt}
          />
        </TabsContent>

        {/* Tab 4: Interview Question Bank */}
        <TabsContent value="interview" className="mt-0 min-w-0">
          <CourseInterviewBank
            title="Senior Data Engineering Interview Question Bank"
            description="Production architectural tradeoffs: Kimball dimensional modeling, Spark shuffle skew mitigation, Kafka consumer group rebalances, and Iceberg hidden partitioning."
            days={initialData.stages.map((s) => ({
              dayNumber: s.stageNumber,
              title: `Stage ${s.stageNumber}: ${s.title}`,
              interviewQuestions: s.interviewQuestions.map((q) => ({
                id: q.id,
                question: q.question,
                answer: q.answer,
                importance: q.importance,
                category: q.category,
              })),
            }))}
          />
        </TabsContent>

        {/* Tab 5: Observability & Analytics */}
        <TabsContent value="analytics" className="mt-0 min-w-0">
          <DataEngineeringAnalytics
            metrics={metrics}
            stages={initialData.stages}
            stageProgress={stageProgress}
          />
        </TabsContent>
      </CourseTabs>

      {/* 3. Global Video Modal Player */}
      <CourseVideoModal
        video={activeUnifiedVideo}
        videoList={unifiedVideos}
        isOpen={Boolean(selectedVideoId)}
        onClose={() => setSelectedVideoId(null)}
        onSelectVideo={(vid) => setSelectedVideoId(vid)}
        isWatched={
          activeUnifiedVideo
            ? !!videoProgress[activeUnifiedVideo.id]?.watched
            : false
        }
        isBookmarked={
          activeUnifiedVideo
            ? !!videoProgress[activeUnifiedVideo.id]?.isBookmarked
            : false
        }
        isRevisionDue={
          activeUnifiedVideo
            ? !!videoProgress[activeUnifiedVideo.id]?.revisionDue
            : false
        }
        notes={
          activeUnifiedVideo
            ? videoProgress[activeUnifiedVideo.id]?.notes
            : undefined
        }
        onToggleWatched={() => {
          if (activeUnifiedVideo) {
            handleToggleWatched(activeUnifiedVideo.id);
          }
        }}
        onToggleBookmark={() => {
          if (activeUnifiedVideo) {
            handleToggleBookmark(activeUnifiedVideo.id);
          }
        }}
        onToggleRevision={() => {
          if (activeUnifiedVideo) {
            handleToggleRevision(activeUnifiedVideo.id);
          }
        }}
        onSaveNotes={(n) => {
          if (activeUnifiedVideo) {
            handleSaveNotes(activeUnifiedVideo.id, n);
          }
        }}
      />
    </div>
  );
}
