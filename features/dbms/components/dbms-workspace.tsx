"use client";

import { focusCourseDay, CourseTabs } from "@/components/shared/course-roadmap";
import { TabsContent } from "@/components/ui/tabs";
import { CourseInterviewBank } from "@/components/shared/course-interview-bank";

import { useDBMS } from "../hooks/use-dbms";
import { DBMSHero } from "./dbms-hero";
import { CourseProgressRail } from "./course-progress-rail";
import { TodayFocusCard } from "./today-focus-card";
import { CourseDayWorkspace } from "./course-day-workspace";
import { VideoLibrary } from "./video-library";
import { SQLPracticePanel } from "./sql-practice-panel";
import { DBMSAnalytics } from "./dbms-analytics";
import { VideoModalPlayer } from "./video-modal-player";
import type { DBMSDashboardData } from "@/domain/dbms";

interface DBMSWorkspaceProps {
  initialData: DBMSDashboardData;
}

export function DBMSWorkspace({ initialData }: DBMSWorkspaceProps) {
  const {
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
  } = useDBMS({ initialData });

  const currentDaySchedule =
    initialData.days.find((d) => d.dayNumber === activeDay) || initialData.days[0];

  const openRecommendedDay = () => {
    setActiveDay(nextRecommendation.dayNumber);
    setActiveTab("roadmap");
    focusCourseDay();
  };

  const handleResume = () => {
    if (nextRecommendation.type === "video" && nextRecommendation.videoId) {
      setSelectedVideoId(nextRecommendation.videoId);
    } else {
      openRecommendedDay();
    }
  };

  return (
    <div className="@container min-w-0 space-y-4 sm:space-y-5">
      {/* 1. Hero Section */}
      <DBMSHero
        metrics={metrics}
        enrolled={enrolled}
        onEnroll={handleEnroll}
        onResume={handleResume}
        onStarted={openRecommendedDay}
        onSchedule={handleSchedulePlanner}
        isPending={isPending}
      />

      <CourseTabs
        value={activeTab}
        onValueChange={setActiveTab}
        options={[
          ["roadmap", "Roadmap & Days"],
          ["videos", "91 Video Directory"],
          ["sql", "SQL Practice (" + initialData.exercises.length + ")"],
          ["interview", "Interview Prep"],
          ["analytics", "Analytics & Mastery"],
        ]}
        label="DBMS course views"
        layoutId="dbms-course-views"
      >
        <TabsContent value="roadmap" className="mt-0 min-w-0">
          <div className="space-y-6">
            {/* Timeline rail */}
            <CourseProgressRail
              days={initialData.days}
              videos={initialData.videos}
              videoProgress={videoProgress}
              dayProgress={dayProgress}
              activeDay={activeDay}
              onSelectDay={setActiveDay}
            />

            {/* Next focus recommendation */}
            <TodayFocusCard
              recommendation={nextRecommendation}
              onWatchVideo={(vid) => setSelectedVideoId(vid)}
              onToggleWatched={handleToggleWatched}
              onToggleAssignment={handleToggleAssignment}
              onSolveExercise={(exId) => handleRecordExerciseAttempt(exId, "solved")}
            />

            {/* Active day deep dive */}
            <CourseDayWorkspace
              day={currentDaySchedule}
              videos={initialData.videos}
              exercises={initialData.exercises}
              videoProgress={videoProgress}
              dayProgress={dayProgress}
              exerciseAttempts={exerciseAttempts}
              onWatchVideo={(vid) => setSelectedVideoId(vid)}
              onToggleWatched={handleToggleWatched}
              onToggleBookmark={handleToggleBookmark}
              onToggleRevision={handleToggleRevision}
              onToggleAssignment={handleToggleAssignment}
              onSolveExercise={(exId) => handleRecordExerciseAttempt(exId, "solved")}
            />
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-0 min-w-0">
          <VideoLibrary
            videos={initialData.videos}
            filteredVideos={filteredVideos}
            videoProgress={videoProgress}
            filterDay={filterDay}
            filterDifficulty={filterDifficulty}
            filterImportance={filterImportance}
            filterStatus={filterStatus}
            searchQuery={searchQuery}
            onFilterDayChange={setFilterDay}
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

        <TabsContent value="sql" className="mt-0 min-w-0">
          <SQLPracticePanel
            exercises={initialData.exercises}
            exerciseAttempts={exerciseAttempts}
            onSolveExercise={(exId) => handleRecordExerciseAttempt(exId, "solved")}
          />
        </TabsContent>

        <TabsContent value="interview" className="mt-0 min-w-0">
          <CourseInterviewBank
            title="12-Day Comprehensive DBMS Interview Question Bank"
            description="Model answers and architectural breakdowns for essential senior software engineer interview questions."
            days={initialData.days}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 min-w-0">
          <DBMSAnalytics
            metrics={metrics}
            days={initialData.days}
            dayProgress={dayProgress}
          />
        </TabsContent>
      </CourseTabs>

      {/* 4. Video Modal Player */}
      <VideoModalPlayer
        video={activeVideo}
        videoList={initialData.videos}
        progress={activeVideo ? videoProgress[activeVideo.youtubeVideoId] : undefined}
        isOpen={!!selectedVideoId}
        onClose={() => setSelectedVideoId(null)}
        onSelectVideo={(vid) => setSelectedVideoId(vid)}
        onToggleWatched={handleToggleWatched}
        onToggleBookmark={handleToggleBookmark}
        onToggleRevision={handleToggleRevision}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
}
