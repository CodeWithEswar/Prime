"use client";

import Image from "next/image";
import Link from "next/link";
import {
  PlayIcon,
  VideoReplayIcon,
  CourseIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { DSAPlaylistSummary } from "../types";

interface ContinueLearningWidgetProps {
  playlist: DSAPlaylistSummary | null;
}

export function ContinueLearningWidget({ playlist }: ContinueLearningWidgetProps) {
  if (!playlist) return null;

  const nextLessonUrl = playlist.nextLesson
    ? `/practice/dsa/playlists/${playlist.slug}?v=${playlist.nextLesson.youtubeVideoId}`
    : `/practice/dsa/playlists/${playlist.slug}`;

  const isCompleted = playlist.progressPercentage === 100;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.12] bg-gradient-to-r from-[#140000] via-[#0E0E0E] to-[#0A0A0A] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Subtle red atmospheric gradient on left */}
      <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[#FF0000]/15 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side: Thumbnail & Lesson Information */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          {/* Small thumbnail preview */}
          <div className="relative h-16 w-28 sm:h-20 sm:w-36 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
            {playlist.thumbnailUrl ? (
              <Image
                src={playlist.thumbnailUrl}
                alt={playlist.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 112px, 144px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-600">
                <Icon icon={CourseIcon} size={24} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF0000] text-white shadow-md">
                <Icon icon={PlayIcon} size={14} className="ml-0.5" />
              </div>
            </div>
          </div>

          {/* Titles & Next Action */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#FF0000]/15 border border-[#FF0000]/30 px-2 py-0.5 font-mono text-[10px] font-bold text-[#FF4D4D] uppercase">
                CONTINUE LEARNING
              </span>
              <span className="font-mono text-xs text-neutral-400 truncate hidden sm:inline">
                {playlist.instructor}
              </span>
            </div>

            <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
              {playlist.title}
            </h3>

            {playlist.nextLesson ? (
              <p className="text-xs text-neutral-300 font-mono line-clamp-1">
                Next:{" "}
                <span className="text-neutral-200">
                  #{playlist.nextLesson.position}. {playlist.nextLesson.title}
                </span>
              </p>
            ) : (
              <p className="text-xs text-neutral-400 font-mono">
                {isCompleted ? "All lessons completed!" : "Track in progress"}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Progress Meter & CTA Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
          {/* Progress indicators */}
          <div className="space-y-1 text-left sm:text-right w-full sm:w-44">
            <div className="flex items-center justify-between sm:justify-end gap-2 font-mono text-[11px]">
              <span className="text-neutral-400">
                {playlist.completedLessonsCount} / {playlist.videoCount}
              </span>
              <span
                className={
                  isCompleted ? "text-emerald-400 font-bold" : "text-[#FF4D4D] font-bold"
                }
              >
                {playlist.progressPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-900">
              <div
                className={`h-full transition-all duration-500 ${
                  isCompleted ? "bg-emerald-500" : "bg-[#FF0000]"
                }`}
                style={{ width: `${playlist.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Action button */}
          <Button
            className="bg-[#FF0000] hover:bg-[#D90000] text-white font-medium h-9 px-4 text-xs gap-1.5 shadow-[0_2px_12px_rgba(255,0,0,0.3)] flex-shrink-0"
            asChild
          >
            <Link href={nextLessonUrl}>
              <span>{isCompleted ? "Review Track" : "Resume"}</span>
              <Icon icon={ArrowRight01Icon} size={13} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

