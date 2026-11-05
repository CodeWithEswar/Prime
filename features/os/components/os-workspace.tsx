"use client";

import { useMemo } from "react";
import { focusCourseDay, CourseTabs } from "@/components/shared/course-roadmap";
import { TabsContent } from "@/components/ui/tabs";
import { CourseFocusCard } from "@/components/shared/course-focus-card";
import { CourseInterviewBank } from "@/components/shared/course-interview-bank";
import { CourseVideoModal, type UnifiedVideoItem } from "@/components/shared/course-video-modal";

import { useOS } from "../hooks/use-os";
import type { OSDashboardData } from "../types";
import { OSHero } from "./os-hero";
import { OSProgressRail } from "./os-progress-rail";
import { OSDayWorkspace } from "./os-day-workspace";
import { OSVideoLibrary } from "./os-video-library";
import { OSSimulatorsPanel } from "./os-simulators-panel";
import { OSAnalytics } from "./os-analytics";

interface OSWorkspaceProps {
  initialData: OSDashboardData;
}

export function OSWorkspace({ initialData }: OSWorkspaceProps) {
  const {
    activeDay,
    setActiveDay,
    activeTab,
    setActiveTab,
    selectedVideo,
    setSelectedVideo,
    activeLabSlug,
    setActiveLabSlug,
    videoProgress,
    dayProgress,
    enrolled,
    metrics,
    nextRecommendedDay,
    nextRecommendation,
    filteredVideos,
    filters,
    actions,
    isPending,
  } = useOS({ initialData });

  const currentDayData =
    initialData.days.find((d) => d.dayNumber === activeDay) || initialData.days[0];

  const handleOpenLab = (labSlug: string) => {
    setActiveLabSlug(labSlug);
    setActiveTab("simulators");
  };

  const unifiedVideos: UnifiedVideoItem[] = useMemo(() => {
    return initialData.videos.map((v) => ({
      id: v.progressId ?? v.youtubeVideoId ?? String(v.position),
      youtubeVideoId: v.youtubeVideoId,
      title: v.title,
      position: v.isSupplementary ? null : v.position,
      dayNumber: v.dayNumber,
      channel: v.channel,
      estimatedMinutes: v.estimatedMinutes,
      canonicalUrl: v.canonicalUrl ?? v.playlistUrl,
      difficulty: v.difficulty,
      importance: v.importance,
    }));
  }, [initialData.videos]);

  const activeUnifiedVideo = selectedVideo
    ? unifiedVideos.find(
        (v) =>
          (selectedVideo.youtubeVideoId && v.youtubeVideoId === selectedVideo.youtubeVideoId) ||
          v.id === (selectedVideo.progressId ?? String(selectedVideo.position))
      ) || null
    : null;

  return (
    <div className="@container min-w-0 space-y-4 sm:space-y-5">
      {/* Hero Section */}
      <OSHero
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
          ["simulators", "OS Laboratories (6)"],
          ["interview", "Interview Prep"],
          ["analytics", "Analytics & Coverage"],
        ]}
        label="Operating Systems course views"
        layoutId="os-course-views"
      >
        <TabsContent value="roadmap" className="mt-0 min-w-0">
          <div className="space-y-6">
            {/* 12-Day Progression Rail */}
            <OSProgressRail
              days={initialData.days}
              activeDay={activeDay}
              onSelectDay={(dayNum) => {
                setActiveDay(dayNum);
              }}
              dayProgress={dayProgress}
              videoProgress={videoProgress}
            />

            {/* Next Focus Card */}
            <CourseFocusCard
              courseName="Operating Systems"
              recommendation={nextRecommendation}
              onWatchVideo={(vid) => {
                const found = initialData.videos.find(
                  (v) =>
                    v.youtubeVideoId === vid ||
                    v.progressId === vid ||
                    String(v.position) === vid
                );
                if (found) setSelectedVideo(found);
              }}
              onToggleWatched={(vid) => {
                const found = initialData.videos.find(
                  (v) =>
                    v.youtubeVideoId === vid ||
                    v.progressId === vid ||
                    String(v.position) === vid
                );
                if (found) actions.toggleWatched(found);
              }}
              onToggleAssignment={(dayNum) => actions.completeDay(dayNum)}
              onOpenLab={handleOpenLab}
            />

            {/* Day Workspace */}
            <OSDayWorkspace
              day={currentDayData}
              videos={initialData.videos}
              dayProgress={dayProgress[activeDay]}
              videoProgress={videoProgress}
              onToggleWatched={actions.toggleWatched}
              onToggleBookmark={actions.toggleBookmark}
              onToggleRevision={actions.toggleRevision}
              onOpenVideo={(v) => setSelectedVideo(v)}
              onCompleteDay={actions.completeDay}
              onOpenLab={handleOpenLab}
            />
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-0 min-w-0">
          <OSVideoLibrary
            videos={filteredVideos}
            videoProgress={videoProgress}
            filters={filters}
            onToggleWatched={actions.toggleWatched}
            onToggleBookmark={actions.toggleBookmark}
            onToggleRevision={actions.toggleRevision}
            onOpenVideo={(v) => setSelectedVideo(v)}
          />
        </TabsContent>

        <TabsContent value="simulators" className="mt-0 min-w-0">
          <OSSimulatorsPanel
            activeLabSlug={activeLabSlug}
            onRecordLabAttempt={actions.recordLabAttempt}
          />
        </TabsContent>

        <TabsContent value="interview" className="mt-0 min-w-0">
          <CourseInterviewBank
            title="12-Day Comprehensive OS Interview Question Bank"
            description="Model answers and architectural breakdowns for essential operating systems and low-level systems engineering interview questions."
            days={initialData.days}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 min-w-0">
          <OSAnalytics metrics={metrics} days={initialData.days} />
        </TabsContent>
      </CourseTabs>

      {/* Video Modal Player */}
      <CourseVideoModal
        video={activeUnifiedVideo}
        videoList={unifiedVideos}
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        onSelectVideo={(vid) => {
          const found = initialData.videos.find(
            (v) =>
              (v.youtubeVideoId && v.youtubeVideoId === vid) ||
              (v.progressId && v.progressId === vid) ||
              String(v.position) === vid
          );
          if (found) setSelectedVideo(found);
        }}
        isWatched={
          selectedVideo
            ? Boolean(
                videoProgress[
                  selectedVideo.progressId ??
                    selectedVideo.youtubeVideoId ??
                    `pos-${selectedVideo.position}`
                ]?.watched || videoProgress[String(selectedVideo.position)]?.watched
              )
            : false
        }
        isBookmarked={
          selectedVideo
            ? Boolean(
                videoProgress[
                  selectedVideo.progressId ??
                    selectedVideo.youtubeVideoId ??
                    `pos-${selectedVideo.position}`
                ]?.isBookmarked || videoProgress[String(selectedVideo.position)]?.isBookmarked
              )
            : false
        }
        isRevisionDue={
          selectedVideo
            ? Boolean(
                videoProgress[
                  selectedVideo.progressId ??
                    selectedVideo.youtubeVideoId ??
                    `pos-${selectedVideo.position}`
                ]?.revisionDue || videoProgress[String(selectedVideo.position)]?.revisionDue
              )
            : false
        }
        notes={
          selectedVideo
            ? videoProgress[
                selectedVideo.progressId ??
                  selectedVideo.youtubeVideoId ??
                  `pos-${selectedVideo.position}`
              ]?.notes || videoProgress[String(selectedVideo.position)]?.notes
            : ""
        }
        onToggleWatched={() => selectedVideo && actions.toggleWatched(selectedVideo)}
        onToggleBookmark={() => selectedVideo && actions.toggleBookmark(selectedVideo)}
        onToggleRevision={() => selectedVideo && actions.toggleRevision(selectedVideo)}
        onSaveNotes={(note) =>
          selectedVideo && actions.saveNote(selectedVideo, note, selectedVideo.difficulty)
        }
      />
    </div>
  );
}
