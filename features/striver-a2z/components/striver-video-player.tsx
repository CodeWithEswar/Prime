"use client";

import * as React from "react";
import {
  PlayIcon,
  CheckmarkCircle01Icon,
  Bookmark01Icon,
  Note01Icon,
  Calendar01Icon,
  RepeatIcon,
  LinkSquare02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LessonNotesEditor } from "@/features/dsa-playlists/components/lesson-notes-editor";
import { AddToPlanDialog } from "@/features/dsa-playlists/components/add-to-plan-dialog";
import { CreateRevisionDialog } from "@/features/dsa-playlists/components/create-revision-dialog";
import {
  markLessonCompletedAction,
  markLessonIncompleteAction,
  toggleLessonBookmarkAction,
} from "@/features/dsa-playlists/server/playlist-actions";
import type { StriverVideoItem } from "../types";

interface StriverVideoPlayerProps {
  videos: StriverVideoItem[];
  activeVideoId?: string | null;
  onSelectVideo: (video: StriverVideoItem) => void;
  topicTitle: string;
}

export function StriverVideoPlayer({
  videos,
  activeVideoId,
  onSelectVideo,
  topicTitle,
}: StriverVideoPlayerProps) {
  const [activeTab, setActiveTab] = React.useState<"player" | "notes">("player");
  const [showPlanDialog, setShowPlanDialog] = React.useState(false);
  const [showRevisionDialog, setShowRevisionDialog] = React.useState(false);

  // Active video resolution
  const activeVideo = React.useMemo(() => {
    if (!videos.length) return null;
    if (activeVideoId) {
      const match = videos.find(
        (v) => v.id === activeVideoId || v.youtubeVideoId === activeVideoId
      );
      if (match) return match;
    }
    // Default to first incomplete or first video
    return videos.find((v) => !v.isCompleted) || videos[0];
  }, [videos, activeVideoId]);

  // Local optimistic state for video completion & bookmark
  const [isCompleted, setIsCompleted] = React.useState(activeVideo?.isCompleted || false);
  const [isBookmarked, setIsBookmarked] = React.useState(activeVideo?.isBookmarked || false);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (activeVideo) {
      setIsCompleted(activeVideo.isCompleted);
      setIsBookmarked(activeVideo.isBookmarked);
    }
  }, [activeVideo]);

  if (!activeVideo) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A] p-8 text-center text-neutral-400 space-y-2">
        <Icon icon={PlayIcon} size={28} className="mx-auto text-neutral-600" />
        <p className="text-sm">No video lecture mapped to this topic yet.</p>
        <p className="text-xs text-neutral-600">
          Focus on solving the practice problems below directly.
        </p>
      </div>
    );
  }

  const currentIndex = videos.findIndex((v) => v.id === activeVideo.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    startTransition(async () => {
      if (nextState) {
        await markLessonCompletedAction(activeVideo.id);
      } else {
        await markLessonIncompleteAction(activeVideo.id);
      }
    });
  };

  const handleToggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    startTransition(async () => {
      await toggleLessonBookmarkAction(activeVideo.id);
    });
  };

  return (
    <div className="space-y-3.5">
      {/* 16:9 Responsive Player Frame */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/[0.1] bg-black shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
        {activeTab === "player" ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
            title={activeVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <div className="h-full p-4 overflow-y-auto bg-[#0E0E0E]">
            <LessonNotesEditor
              videoId={activeVideo.id}
              initialNotes={activeVideo.notesContent || ""}
            />
          </div>
        )}
      </div>

      {/* Video Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-md">
        {/* Left: Video Details & Multi-video switcher */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
              {topicTitle}
            </span>
            {videos.length > 1 && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] bg-white/[0.04] text-neutral-400 border-white/[0.1] px-1.5 py-0"
              >
                Lesson {currentIndex + 1} of {videos.length}
              </Badge>
            )}
            <span className="font-mono text-[10px] text-neutral-500">
              {activeVideo.durationFormatted}
            </span>
          </div>

          <h3 className="font-mono text-sm font-semibold text-white truncate max-w-xl">
            {activeVideo.title}
          </h3>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Previous / Next buttons if multiple videos in topic */}
          {videos.length > 1 && (
            <div className="flex items-center gap-1 border-r border-white/[0.08] pr-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasPrevious}
                onClick={() => onSelectVideo(videos[currentIndex - 1])}
                className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                title="Previous Lesson"
              >
                <Icon icon={ArrowLeft01Icon} size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasNext}
                onClick={() => onSelectVideo(videos[currentIndex + 1])}
                className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                title="Next Lesson"
              >
                <Icon icon={ArrowRight01Icon} size={14} />
              </Button>
            </div>
          )}

          {/* Toggle Notes tab */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(activeTab === "player" ? "notes" : "player")}
            className={`h-8 px-2.5 text-xs font-mono gap-1.5 border-white/[0.1] ${
              activeTab === "notes"
                ? "bg-[#FF0000]/15 text-white border-[#FF0000]/30"
                : "bg-white/[0.03] text-neutral-300 hover:text-white"
            }`}
          >
            <Icon icon={Note01Icon} size={13} />
            <span>{activeTab === "notes" ? "Video" : "Notes"}</span>
          </Button>

          {/* Bookmark */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleBookmark}
            className={`h-8 w-8 p-0 ${
              isBookmarked ? "text-[#FF0000]" : "text-neutral-400 hover:text-white"
            }`}
            title="Bookmark lesson"
          >
            <Icon icon={Bookmark01Icon} size={14} />
          </Button>

          {/* Add to Study Plan */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPlanDialog(true)}
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
            title="Schedule in Daily Plan"
          >
            <Icon icon={Calendar01Icon} size={14} />
          </Button>

          {/* Create Revision */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRevisionDialog(true)}
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
            title="Schedule Revision Review"
          >
            <Icon icon={RepeatIcon} size={14} />
          </Button>

          {/* Open on YouTube */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
            title="Open on YouTube"
          >
            <a
              href={`https://www.youtube.com/watch?v=${activeVideo.youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon={LinkSquare02Icon} size={14} />
            </a>
          </Button>

          {/* Mark Watched Toggle */}
          <Button
            size="sm"
            onClick={handleToggleComplete}
            disabled={isPending}
            className={`h-8 px-3 text-xs font-mono font-medium gap-1.5 transition-all ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                : "bg-[#FF0000] hover:bg-[#CC0000] text-white shadow-sm"
            }`}
          >
            <Icon icon={CheckmarkCircle01Icon} size={13} />
            <span>{isCompleted ? "Watched" : "Mark Watched"}</span>
          </Button>
        </div>
      </div>

      {/* Distinction Reminder Pill */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.05] bg-white/[0.02] text-neutral-400 text-[11px] font-mono">
        <Icon icon={InformationCircleIcon} size={14} className="text-[#FF0000] flex-shrink-0" />
        <span>
          <strong className="text-white">Note:</strong> Watching this video lesson records lecture completion. Sheet problems must be solved independently to earn practice and mastery credits.
        </span>
      </div>

      {/* Dialogs */}
      <AddToPlanDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        videoId={activeVideo.id}
        title={activeVideo.title}
        durationSeconds={activeVideo.durationSeconds}
      />

      <CreateRevisionDialog
        open={showRevisionDialog}
        onOpenChange={setShowRevisionDialog}
        videoId={activeVideo.id}
        title={activeVideo.title}
      />
    </div>
  );
}

