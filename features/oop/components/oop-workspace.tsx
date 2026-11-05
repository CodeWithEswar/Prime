"use client";

import { useMemo } from "react";
import { focusCourseDay, CourseTabs } from "@/components/shared/course-roadmap";
import { TabsContent } from "@/components/ui/tabs";
import { CourseFocusCard } from "@/components/shared/course-focus-card";
import { CourseInterviewBank } from "@/components/shared/course-interview-bank";
import { CourseVideoModal, type UnifiedVideoItem } from "@/components/shared/course-video-modal";

import { useOOP } from "../hooks/use-oop";
import type { OOPDashboardData } from "../types";
import { OOPHero } from "./oop-hero";
import { OOPProgressRail } from "./oop-progress-rail";
import { OOPDayWorkspace } from "./oop-day-workspace";
import { OOPVideoLibrary } from "./oop-video-library";
import { OOPLabPanel } from "./oop-lab-panel";
import { OOPPracticePanel } from "./oop-practice-panel";
import { OOPAnalytics } from "./oop-analytics";

interface OOPWorkspaceProps {
  initialData: OOPDashboardData;
}

export function OOPWorkspace({ initialData }: OOPWorkspaceProps) {
  const {
    activeDay,
    setActiveDay,
    activeTab,
    setActiveTab,
    selectedVideo,
    setSelectedVideo,
    activeLabSlug,
    setActiveLabSlug,
    activeCaseId,
    setActiveCaseId,
    videoProgress,
    segmentProgress,
    dayProgress,
    labAttempts,
    designAttempts,
    enrolled,
    metrics,
    nextRecommendedDay,
    nextRecommendation,
    actions,
    isPending,
  } = useOOP({ initialData });

  const currentDayData =
    initialData.days.find((d) => d.dayNumber === activeDay) || initialData.days[0];

  const handleOpenLab = (labSlug: string) => {
    setActiveLabSlug(labSlug);
    setActiveTab("labs");
  };

  const unifiedVideos: UnifiedVideoItem[] = useMemo(() => {
    return initialData.videos.map((v) => ({
      id: v.youtubeVideoId,
      youtubeVideoId: v.youtubeVideoId,
      title: v.title,
      position: v.order,
      dayNumber: v.assignedDays[0] || 1,
      channel: v.channelTitle,
      estimatedMinutes: Math.round(v.durationSeconds / 60),
      canonicalUrl: v.canonicalWatchUrl,
      difficulty: v.difficulty,
      importance: v.interviewImportance,
    }));
  }, [initialData.videos]);

  const activeUnifiedVideo = selectedVideo
    ? unifiedVideos.find(
        (v) =>
          (selectedVideo.youtubeVideoId && v.youtubeVideoId === selectedVideo.youtubeVideoId) ||
          v.id === selectedVideo.youtubeVideoId
      ) || null
    : null;

  return (
    <div className="@container min-w-0 space-y-4 sm:space-y-5">
      {/* Hero Section */}
      <OOPHero
        metrics={metrics}
        enrolled={enrolled}
        onEnroll={actions.enroll}
        onResume={() => {
          setActiveDay(nextRecommendedDay);
          setActiveTab("roadmap");
          focusCourseDay();
        }}
        onSchedule={actions.schedule}
        isPending={isPending}
      />

      <CourseTabs
        value={activeTab === "overview" ? "roadmap" : activeTab}
        onValueChange={setActiveTab}
        options={[
          ["roadmap", "Roadmap & Days"],
          ["videos", `Video Library (${initialData.videos.length})`],
          ["labs", "OOP Concept Labs (10)"],
          ["practice", "Practice & LLD"],
          ["interview", "Interview Prep"],
          ["analytics", "Analytics & Mastery"],
        ]}
        label="OOP course views"
        layoutId="oop-course-views"
      >
        <TabsContent value="roadmap" className="mt-0 min-w-0">
          <div className="space-y-6">
            {/* 12-Day Progression Rail */}
            <OOPProgressRail
              days={initialData.days}
              activeDay={activeDay}
              dayProgress={dayProgress}
              onSelectDay={(dayNum) => {
                setActiveDay(dayNum);
              }}
            />

            {/* Next Focus Card */}
            <CourseFocusCard
              courseName="Object-Oriented Programming"
              recommendation={nextRecommendation}
              onWatchVideo={(vid) => {
                const found = initialData.videos.find(
                  (v) => v.youtubeVideoId === vid || String(v.order) === vid
                );
                if (found) setSelectedVideo(found);
              }}
              onToggleWatched={(vid) => {
                const found = initialData.videos.find(
                  (v) => v.youtubeVideoId === vid || String(v.order) === vid
                );
                if (found) actions.toggleVideoWatched(found);
              }}
              onToggleAssignment={(dayNum) => actions.completeDay(dayNum)}
              onOpenLab={handleOpenLab}
            />

            {/* Day Workspace */}
            <OOPDayWorkspace
              day={currentDayData}
              videos={initialData.videos}
              segments={initialData.segments}
              dayProgress={dayProgress[activeDay]}
              videoProgress={videoProgress}
              segmentProgress={segmentProgress}
              onToggleVideoWatched={actions.toggleVideoWatched}
              onToggleBookmark={actions.toggleBookmark}
              onToggleRevision={actions.toggleRevision}
              onToggleSegmentCompleted={actions.toggleSegmentCompleted}
              onOpenVideo={(video) => setSelectedVideo(video)}
              onCompleteDay={actions.completeDay}
              onOpenLab={handleOpenLab}
            />
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-0 min-w-0">
          <OOPVideoLibrary
            primaryVideos={initialData.videos}
            prerequisites={initialData.prerequisites}
            supplementaryVideos={initialData.supplementaryVideos}
            videoProgress={videoProgress}
            onToggleWatched={actions.toggleVideoWatched}
            onToggleBookmark={actions.toggleBookmark}
            onToggleRevision={actions.toggleRevision}
            onOpenVideo={(video) => setSelectedVideo(video)}
          />
        </TabsContent>

        <TabsContent value="labs" className="mt-0 min-w-0">
          <OOPLabPanel
            activeLabSlug={activeLabSlug}
            onSelectLab={setActiveLabSlug}
            labAttempts={labAttempts}
            onRecordAttempt={actions.recordLabAttempt}
          />
        </TabsContent>

        <TabsContent value="practice" className="mt-0 min-w-0">
          <OOPPracticePanel
            outputPredictions={initialData.outputPredictions}
            lldCases={initialData.lldCases}
            designAttempts={designAttempts}
            activeCaseId={activeCaseId}
            onSelectCase={setActiveCaseId}
            onRecordDesignAttempt={actions.recordDesignAttempt}
          />
        </TabsContent>

        <TabsContent value="interview" className="mt-0 min-w-0">
          <CourseInterviewBank
            title="12-Day Comprehensive OOP & Design Interview Question Bank"
            description="Model answers and structural breakdowns for essential Object-Oriented Design, SOLID principles, design patterns, and Low-Level Design (LLD) interview questions."
            days={initialData.days}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 min-w-0">
          <OOPAnalytics
            metrics={metrics}
            days={initialData.days}
            dayProgress={dayProgress}
          />
        </TabsContent>
      </CourseTabs>

      {/* Global Video Player Modal */}
      <CourseVideoModal
        video={activeUnifiedVideo}
        videoList={unifiedVideos}
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        onSelectVideo={(vid) => {
          const found = initialData.videos.find(
            (v) => v.youtubeVideoId === vid || String(v.order) === vid
          );
          if (found) setSelectedVideo(found);
        }}
        isWatched={
          selectedVideo
            ? Boolean(videoProgress[selectedVideo.youtubeVideoId]?.watched)
            : false
        }
        isBookmarked={
          selectedVideo
            ? Boolean(videoProgress[selectedVideo.youtubeVideoId]?.isBookmarked)
            : false
        }
        isRevisionDue={
          selectedVideo
            ? Boolean(videoProgress[selectedVideo.youtubeVideoId]?.revisionDue)
            : false
        }
        notes={selectedVideo ? videoProgress[selectedVideo.youtubeVideoId]?.notes : ""}
        onToggleWatched={() => selectedVideo && actions.toggleVideoWatched(selectedVideo)}
        onToggleBookmark={() => selectedVideo && actions.toggleBookmark(selectedVideo)}
        onToggleRevision={() => selectedVideo && actions.toggleRevision(selectedVideo)}
        onSaveNotes={(note) => selectedVideo && actions.saveNote(selectedVideo.youtubeVideoId, note)}
      />
    </div>
  );
}
