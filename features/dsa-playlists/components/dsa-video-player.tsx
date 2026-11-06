"use client";

import { useState } from "react";
import {
  PlayIcon,
  Tick02Icon,
  CheckmarkCircle01Icon,
  LinkSquare01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Bookmark01Icon,
  CalendarAdd01Icon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { DSALessonItem } from "../types";

interface DSAVideoPlayerProps {
  lesson: DSALessonItem;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleComplete: () => void;
  onToggleBookmark: () => void;
  onOpenScheduleDialog: () => void;
  onOpenRevisionDialog: () => void;
  isCompleted: boolean;
  isBookmarked: boolean;
  isActionPending?: boolean;
}

export function DSAVideoPlayer({
  lesson,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onToggleComplete,
  onToggleBookmark,
  onOpenScheduleDialog,
  onOpenRevisionDialog,
  isCompleted,
  isBookmarked,
  isActionPending = false,
}: DSAVideoPlayerProps) {
  const watchUrl = `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}`;

  return (
    <div className="flex flex-col rounded-xl border border-white/[0.08] bg-[#0A0A0A] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* 1. Video Player Container (16:9 responsive embed) */}
      <div className="relative aspect-video w-full bg-black">
        <iframe
          key={lesson.youtubeVideoId}
          src={`https://www.youtube-nocookie.com/embed/${lesson.youtubeVideoId}?rel=0&enablejsapi=1`}
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full border-none"
        />
      </div>

      {/* 2. Top Notice & External Watch Fallback */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0E0E0E] border-b border-white/[0.06] text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[#FF4D4D] font-bold">Lesson #{lesson.position}</span>
          <span className="text-neutral-600">·</span>
          <span className="truncate">{lesson.channelTitle}</span>
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors flex-shrink-0"
        >
          <span>Open on YouTube</span>
          <Icon icon={LinkSquare01Icon} size={11} className="text-[#FF4D4D]" />
        </a>
      </div>

      {/* 3. Lesson Meta Header & Controls Bar */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {lesson.title}
            </h2>
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px]">
                {lesson.durationFormatted}
              </span>
              <span>·</span>
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px]">
                #{lesson.canonicalTopicSlug}
              </span>
              <span>·</span>
              <span className="capitalize text-[10px] text-neutral-400">
                {lesson.difficulty} difficulty
              </span>
            </div>
          </div>

          {/* Primary Complete Action */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={onToggleComplete}
              disabled={isActionPending}
              className={`h-9 px-4 text-xs font-mono font-medium gap-2 transition-all active:scale-[0.98] ${
                isCompleted
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-[#FF0000] hover:bg-[#D90000] text-white shadow-[0_2px_12px_rgba(255,0,0,0.25)]"
              }`}
            >
              <Icon
                icon={isCompleted ? CheckmarkCircle01Icon : Tick02Icon}
                size={14}
              />
              <span>{isCompleted ? "Completed" : "Mark Complete"}</span>
            </Button>
          </div>
        </div>

        {/* 4. Action Strip: Prev/Next, Plan, Revision, Bookmark */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
          {/* Navigation controls */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="h-8 px-2.5 text-xs font-mono text-neutral-300 hover:text-white bg-[#111111] border-white/10 gap-1 disabled:opacity-30"
            >
              <Icon icon={ArrowLeft01Icon} size={12} />
              <span>Previous</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
              className="h-8 px-2.5 text-xs font-mono text-neutral-300 hover:text-white bg-[#111111] border-white/10 gap-1 disabled:opacity-30"
            >
              <span>Next</span>
              <Icon icon={ArrowRight01Icon} size={12} />
            </Button>
          </div>

          {/* Cross-module integrations */}
          <div className="flex items-center gap-1.5">
            {/* Bookmark button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleBookmark}
              className={`h-8 px-2.5 text-xs font-mono gap-1.5 bg-[#111111] border-white/10 transition-colors ${
                isBookmarked ? "text-amber-400 border-amber-400/30" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Icon icon={Bookmark01Icon} size={12} />
              <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
            </Button>

            {/* Schedule in Plan */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenScheduleDialog}
              className="h-8 px-2.5 text-xs font-mono text-neutral-300 hover:text-white bg-[#111111] border-white/10 gap-1.5"
            >
              <Icon icon={CalendarAdd01Icon} size={12} className="text-[#FF4D4D]" />
              <span className="hidden sm:inline">Add to Plan</span>
            </Button>

            {/* Create Revision */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenRevisionDialog}
              className="h-8 px-2.5 text-xs font-mono text-neutral-300 hover:text-white bg-[#111111] border-white/10 gap-1.5"
            >
              <Icon icon={RepeatIcon} size={12} className="text-[#FF4D4D]" />
              <span className="hidden sm:inline">Revise</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

