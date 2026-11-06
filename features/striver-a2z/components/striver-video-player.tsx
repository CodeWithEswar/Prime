"use client";

import * as React from "react";
import {
  PlayIcon,
  CheckmarkCircle01Icon,
  Bookmark01Icon,
  Calendar01Icon,
  RepeatIcon,
  LinkSquare02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  InformationCircleIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddToPlanDialog } from "@/features/dsa-playlists/components/add-to-plan-dialog";
import { CreateRevisionDialog } from "@/features/dsa-playlists/components/create-revision-dialog";
import {
  markLessonCompletedAction,
  markLessonIncompleteAction,
  toggleLessonBookmarkAction,
} from "@/features/dsa-playlists/server/playlist-actions";
import { cn } from "@/lib/utils";
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
        <p className="text-sm font-sans font-medium text-neutral-300">
          No video lecture mapped to this topic yet.
        </p>
        <p className="text-xs text-neutral-500 font-sans">
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
    <div className="space-y-3">
      {/* 16:9 Responsive Video Player Frame */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/[0.1] bg-black shadow-[0_12px_36px_rgba(0,0,0,0.85)]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
          title={activeVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>

      {/* Lesson Details & Actions Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-white/[0.08] bg-[#090909]/95 backdrop-blur-md">
        {/* Left Section: Video Title, Stepper, and Metadata */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {videos.length > 1 && (
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-md px-1 py-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasPrevious}
                  onClick={() => onSelectVideo(videos[currentIndex - 1])}
                  className="h-6 w-6 p-0 text-neutral-400 hover:text-white disabled:opacity-30"
                  aria-label="Previous lesson"
                >
                  <Icon icon={ArrowLeft01Icon} size={12} />
                </Button>

                <span className="font-mono text-[10px] text-neutral-300 px-1 font-semibold select-none">
                  Lesson {currentIndex + 1} of {videos.length}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => onSelectVideo(videos[currentIndex + 1])}
                  className="h-6 w-6 p-0 text-neutral-400 hover:text-white disabled:opacity-30"
                  aria-label="Next lesson"
                >
                  <Icon icon={ArrowRight01Icon} size={12} />
                </Button>
              </div>
            )}

            {activeVideo.durationFormatted && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] bg-white/[0.03] text-neutral-400 border-white/[0.08] px-2 py-0.5"
              >
                {activeVideo.durationFormatted}
              </Badge>
            )}

            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider hidden sm:inline-block">
              {topicTitle}
            </span>
          </div>

          {/* Full readable lesson title with tooltip */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-sans text-sm font-semibold text-white tracking-tight line-clamp-1 cursor-default">
                  {activeVideo.title}
                </h3>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-md text-xs font-sans">
                {activeVideo.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right Section: Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-white/[0.05] sm:border-t-0">
          <TooltipProvider delayDuration={200}>
            {/* Desktop Action Icons */}
            <div className="hidden sm:flex items-center gap-1.5 border-r border-white/[0.08] pr-2">
              {/* Bookmark */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleBookmark}
                    className={cn(
                      "h-8 w-8 p-0 border border-white/[0.06] bg-white/[0.02]",
                      isBookmarked
                        ? "text-[#FF0000] border-[#FF0000]/30 bg-[#FF0000]/10"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                    aria-label="Bookmark lesson"
                  >
                    <Icon icon={Bookmark01Icon} size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {isBookmarked ? "Remove Bookmark" : "Bookmark Lesson"}
                </TooltipContent>
              </Tooltip>

              {/* Add to Daily Plan */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPlanDialog(true)}
                    className="h-8 w-8 p-0 border border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                    aria-label="Schedule in Daily Plan"
                  >
                    <Icon icon={Calendar01Icon} size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Schedule in Daily Plan
                </TooltipContent>
              </Tooltip>

              {/* Add to Spaced Revision */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRevisionDialog(true)}
                    className="h-8 w-8 p-0 border border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                    aria-label="Add to Revision"
                  >
                    <Icon icon={RepeatIcon} size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Schedule Spaced Revision
                </TooltipContent>
              </Tooltip>

              {/* Open on YouTube */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0 border border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                    aria-label="Open on YouTube"
                  >
                    <a
                      href={`https://www.youtube.com/watch?v=${activeVideo.youtubeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon icon={LinkSquare02Icon} size={14} />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Watch on YouTube
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Mobile Overflow Menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 border border-white/[0.08] text-neutral-300 gap-1.5"
                    aria-label="More actions"
                  >
                    <Icon icon={MoreHorizontalIcon} size={14} />
                    <span className="text-xs font-mono">Options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#101010] border-white/10 text-neutral-300">
                  <DropdownMenuItem
                    onClick={handleToggleBookmark}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Icon icon={Bookmark01Icon} size={13} className={isBookmarked ? "text-[#FF0000]" : ""} />
                    <span>{isBookmarked ? "Bookmarked" : "Bookmark Lesson"}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowPlanDialog(true)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Icon icon={Calendar01Icon} size={13} />
                    <span>Schedule in Daily Plan</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowRevisionDialog(true)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Icon icon={RepeatIcon} size={13} />
                    <span>Add to Revision</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/[0.08]" />

                  <DropdownMenuItem asChild className="gap-2 cursor-pointer text-xs">
                    <a
                      href={`https://www.youtube.com/watch?v=${activeVideo.youtubeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon icon={LinkSquare02Icon} size={13} />
                      <span>Watch on YouTube</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Primary Action: Mark Watched */}
            <Button
              size="sm"
              onClick={handleToggleComplete}
              disabled={isPending}
              className={cn(
                "h-8 px-4 flex-1 sm:flex-initial text-xs font-mono font-semibold gap-1.5 transition-all shadow-sm justify-center",
                isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/40"
                  : "bg-[#FF0000] hover:bg-[#CC0000] text-white"
              )}
            >
              <Icon icon={CheckmarkCircle01Icon} size={13} />
              <span>{isCompleted ? "Watched" : "Mark Watched"}</span>
            </Button>
          </TooltipProvider>
        </div>
      </div>

      {/* Distinction Note */}
      <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-neutral-400 text-xs font-sans">
        <Icon icon={InformationCircleIcon} size={14} className="text-[#FF0000] shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong className="text-white font-medium">Progress Rule:</strong> Marking a video as watched tracks your lecture comprehension. Practice problems below must be solved independently to earn verified mastery credits.
        </span>
      </div>

      {/* Plan & Revision Dialogs */}
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
