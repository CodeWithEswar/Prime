"use client";

import { focusCourseDay, CourseTabs } from "@/components/shared/course-roadmap";
import { TabsContent } from "@/components/ui/tabs";
import { aptitudeVideoProgressKey } from "@/domain/aptitude/videos";
import { useAptitude } from "../hooks/use-aptitude";
import { AptitudeHero } from "./aptitude-hero";
import { AptitudeProgressRail } from "./aptitude-progress-rail";
import { AptitudeDayWorkspace } from "./aptitude-day-workspace";
import { AptitudeDirectory } from "./aptitude-directory";
import { AptitudeTracksPanel } from "./aptitude-tracks-panel";
import { AptitudeAssessmentsPanel } from "./aptitude-assessments-panel";
import { AptitudeAnalytics } from "./aptitude-analytics";
import { AptitudeVideoModal } from "./aptitude-video-modal";
import type { AptitudeDashboardData } from "../types";

interface AptitudeWorkspaceProps {
  initialData: AptitudeDashboardData;
}

export function AptitudeWorkspace({ initialData }: AptitudeWorkspaceProps) {
  const {
    isPending,
    enrolled,
    activeDay,
    setActiveDay,
    activeTab,
    setActiveTab,
    activeVideo,
    topicProgress,
    videoProgress,
    metrics,
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
  } = useAptitude({ initialData });

  const currentDay =
    initialData.days.find((d) => d.dayNumber === activeDay) || initialData.days[0];

  const handleResume = () => {
    setActiveDay(nextRecommendation.dayNumber);
    setActiveTab("roadmap");
    focusCourseDay();
  };

  const handleSelectTrackStartDay = (startDay: number) => {
    setActiveDay(startDay);
    setActiveTab("roadmap");
    focusCourseDay();
  };

  return (
    <div className="@container min-w-0 space-y-4 sm:space-y-5">
      {/* 1. Hero Section */}
      <AptitudeHero
        metrics={metrics}
        enrolled={enrolled}
        onEnroll={() => handleEnroll("standard")}
        onResume={handleResume}
        onSchedule={handleSchedulePlanner}
        isPending={isPending}
      />

      {/* 2. Course Navigation Tabs */}
      <CourseTabs
        value={activeTab}
        onValueChange={setActiveTab}
        options={[
          ["roadmap", "Learning plan"],
          ["directory", "All concepts"],
          ["tracks", "Subjects"],
          ["assessments", "Review & practice"],
          ["analytics", "Progress"],
        ]}
        label="Aptitude & Reasoning course views"
        layoutId="aptitude-course-views"
      >
        {/* TAB 1: 40-Day Sequential Roadmap */}
        <TabsContent value="roadmap" className="space-y-4">
          <div className="grid min-w-0 gap-4 @min-[60rem]:grid-cols-[220px_minmax(0,1fr)]">
            <AptitudeProgressRail
              days={initialData.days}
              activeDay={activeDay}
              onSelectDay={setActiveDay}
              topicProgress={topicProgress}
            />

            {currentDay && (
              <AptitudeDayWorkspace
                day={currentDay}
                totalDays={initialData.days.length}
                onSelectDay={setActiveDay}
                topicProgress={topicProgress}
                videoProgress={videoProgress}
                onToggleTopicStatus={handleToggleTopicStatus}
                onToggleBookmark={handleToggleBookmark}
                onSaveNotes={handleSaveNotes}
                onWatchVideo={handleWatchVideo}
              />
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Complete 132-Topic Directory */}
        <TabsContent value="directory">
          <AptitudeDirectory
            topics={initialData.allTopics}
            filteredTopics={filteredTopics}
            topicProgress={topicProgress}
            videoProgress={videoProgress}
            filterTrack={filterTrack}
            filterDay={filterDay}
            filterDifficulty={filterDifficulty}
            filterPriority={filterPriority}
            filterStatus={filterStatus}
            searchQuery={searchQuery}
            onFilterTrackChange={setFilterTrack}
            onFilterDayChange={setFilterDay}
            onFilterDifficultyChange={setFilterDifficulty}
            onFilterPriorityChange={setFilterPriority}
            onFilterStatusChange={setFilterStatus}
            onSearchQueryChange={setSearchQuery}
            onWatchVideo={handleWatchVideo}
            onToggleTopicStatus={handleToggleTopicStatus}
            onToggleBookmark={handleToggleBookmark}
          />
        </TabsContent>

        {/* TAB 3: Syllabus Tracks */}
        <TabsContent value="tracks">
          <AptitudeTracksPanel
            tracks={initialData.tracks}
            metrics={metrics}
            onSelectTrackStartDay={handleSelectTrackStartDay}
          />
        </TabsContent>

        {/* TAB 4: Placement Assessments */}
        <TabsContent value="assessments">
          <AptitudeAssessmentsPanel
            days={initialData.days}
            onOpenDay={handleSelectTrackStartDay}
          />
        </TabsContent>

        {/* TAB 5: Analytics */}
        <TabsContent value="analytics">
          <AptitudeAnalytics metrics={metrics} />
        </TabsContent>
      </CourseTabs>

      {/* 3. Modal Video Player */}
      {activeVideo && (
        <AptitudeVideoModal
          topic={activeVideo.topic}
          video={activeVideo.video}
          videoProgress={
            videoProgress[
              aptitudeVideoProgressKey(activeVideo.topic.id, activeVideo.video.videoId)
            ]
          }
          onClose={handleCloseVideoModal}
          onToggleWatched={handleToggleVideoWatched}
          onSelectVideo={handleWatchVideo}
        />
      )}
    </div>
  );
}
