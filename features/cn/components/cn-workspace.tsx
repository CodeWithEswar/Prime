"use client";

import { useMemo } from "react";
import { focusCourseDay, CourseTabs } from "@/components/shared/course-roadmap";
import { TabsContent } from "@/components/ui/tabs";
import { CourseFocusCard } from "@/components/shared/course-focus-card";
import { CourseInterviewBank } from "@/components/shared/course-interview-bank";
import { CourseVideoModal, type UnifiedVideoItem } from "@/components/shared/course-video-modal";

import { useCN } from "../hooks/use-cn";
import type { CNDashboardData } from "../types";
import { CNHero } from "./cn-hero";
import { CNProgressRail } from "./cn-progress-rail";
import { CNDayWorkspace } from "./cn-day-workspace";
import { CNVideoLibrary } from "./cn-video-library";
import { CNLabPanel } from "./cn-lab-panel";
import { CNAnalytics } from "./cn-analytics";

interface CNWorkspaceProps {
  initialData: CNDashboardData;
}

export function CNWorkspace({ initialData }: CNWorkspaceProps) {
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
  } = useCN({ initialData });

  const currentDayData =
    initialData.days.find((d) => d.dayNumber === activeDay) || initialData.days[0];

  const handleOpenLab = (labSlug: string) => {
    setActiveLabSlug(labSlug);
    setActiveTab("labs");
  };

  const unifiedVideos: UnifiedVideoItem[] = useMemo(() => {
    return initialData.videos.map((v) => ({
      id: v.progressId ?? v.youtubeVideoId ?? String(v.playlistPosition),
      youtubeVideoId: v.youtubeVideoId,
      title: v.verifiedTitle ?? `Lesson #${v.playlistPosition}`,
      position: v.isSupplementary ? null : v.playlistPosition,
      dayNumber: v.assignedStudyDay || 1,
      channel: v.channel ?? "Neso Academy",
      estimatedMinutes: v.durationSeconds
        ? Math.round(v.durationSeconds / 60)
        : 15,
      canonicalUrl: v.canonicalWatchUrl ?? v.playlistContextUrl,
      difficulty: v.difficulty,
      importance: v.interviewImportance,
    }));
  }, [initialData.videos]);

  const activeUnifiedVideo = selectedVideo
    ? unifiedVideos.find(
        (v) =>
          (selectedVideo.youtubeVideoId && v.youtubeVideoId === selectedVideo.youtubeVideoId) ||
          v.id === (selectedVideo.progressId ?? String(selectedVideo.playlistPosition))
      ) || null
    : null;

  return (
    <div className="@container min-w-0 space-y-4 sm:space-y-5">
      {/* Hero Section */}
      <CNHero
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
          ["labs", "Network Laboratories (10)"],
          ["interview", "Interview Prep"],
          ["analytics", "Analytics & Observability"],
        ]}
        label="Computer Networks course views"
        layoutId="cn-course-views"
      >
        <TabsContent value="roadmap" className="mt-0 min-w-0">
          <div className="space-y-6">
            {/* 12-Day Progression Rail */}
            <CNProgressRail
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
              courseName="Computer Networks"
              recommendation={nextRecommendation}
              onWatchVideo={(vid) => {
                const found = initialData.videos.find(
                  (v) =>
                    v.youtubeVideoId === vid ||
                    v.progressId === vid ||
                    String(v.playlistPosition) === vid
                );
                if (found) setSelectedVideo(found);
              }}
              onToggleWatched={(vid) => {
                const found = initialData.videos.find(
                  (v) =>
                    v.youtubeVideoId === vid ||
                    v.progressId === vid ||
                    String(v.playlistPosition) === vid
                );
                if (found) actions.toggleWatched(found);
              }}
              onToggleAssignment={(dayNum) => actions.completeDay(dayNum)}
              onOpenLab={handleOpenLab}
            />

            {/* Day Workspace */}
            <CNDayWorkspace
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
          <CNVideoLibrary
            videos={filteredVideos}
            videoProgress={videoProgress}
            filters={filters}
            onToggleWatched={actions.toggleWatched}
            onToggleBookmark={actions.toggleBookmark}
            onToggleRevision={actions.toggleRevision}
            onOpenVideo={(v) => setSelectedVideo(v)}
          />
        </TabsContent>

        <TabsContent value="labs" className="mt-0 min-w-0">
          <CNLabPanel
            activeLabSlug={activeLabSlug}
            onRecordLabAttempt={actions.recordLabAttempt}
          />
        </TabsContent>

        <TabsContent value="interview" className="mt-0 min-w-0">
          <CourseInterviewBank
            title="12-Day Comprehensive CN Interview Question Bank"
            description="Model answers and packet-level breakdowns for essential network protocols, socket architectures, and distributed systems interview questions."
            days={initialData.days}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 min-w-0">
          <CNAnalytics metrics={metrics} days={initialData.days} />
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
              String(v.playlistPosition) === vid
          );
          if (found) setSelectedVideo(found);
        }}
        isWatched={
          selectedVideo
            ? Boolean(
                videoProgress[
                  selectedVideo.progressId ??
                    selectedVideo.youtubeVideoId ??
                    `pos-${selectedVideo.playlistPosition}`
                ]?.watched ||
                  videoProgress[String(selectedVideo.playlistPosition)]?.watched
              )
            : false
        }
        isBookmarked={
          selectedVideo
            ? Boolean(
                videoProgress[
                  selectedVideo.progressId ??
                    selectedVideo.youtubeVideoId ??
                    `pos-${selectedVideo.playlistPosition}`
                ]?.isBookmarked ||
                  videoProgress[String(selectedVideo.playlistPosition)]?.isBookmarked
              )
            : false
        }
        isRevisionDue={
          selectedVideo
            ? Boolean(
                videoProgress[
                  selectedVideo.progressId ??
                    selectedVideo.youtubeVideoId ??
                    `pos-${selectedVideo.playlistPosition}`
                ]?.revisionDue ||
                  videoProgress[String(selectedVideo.playlistPosition)]?.revisionDue
              )
            : false
        }
        notes={
          selectedVideo
            ? videoProgress[
                selectedVideo.progressId ??
                  selectedVideo.youtubeVideoId ??
                  `pos-${selectedVideo.playlistPosition}`
              ]?.notes ||
              videoProgress[String(selectedVideo.playlistPosition)]?.notes
            : ""
        }
        onToggleWatched={() => selectedVideo && actions.toggleWatched(selectedVideo)}
        onToggleBookmark={() => selectedVideo && actions.toggleBookmark(selectedVideo)}
        onToggleRevision={() => selectedVideo && actions.toggleRevision(selectedVideo)}
        onSaveNotes={(note) =>
          selectedVideo &&
          actions.saveNote(selectedVideo, note, selectedVideo.difficulty ?? undefined)
        }
      />
    </div>
  );
}
