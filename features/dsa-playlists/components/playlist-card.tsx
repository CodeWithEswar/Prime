"use client";

import Image from "next/image";
import Link from "next/link";
import {
  PlayIcon,
  CheckmarkCircle01Icon,
  VideoReplayIcon,
  TeacherIcon,
  Layers01Icon,
  Time02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DSAPlaylistSummary } from "../types";

function formatDuration(totalSecs: number): string {
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  }
  return `${minutes}m`;
}

interface PlaylistCardProps {
  playlist: DSAPlaylistSummary;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const isEnrolled = playlist.isEnrolled;
  const isCompleted = playlist.progressPercentage === 100;
  const nextLessonUrl = playlist.nextLesson
    ? `/practice/dsa/playlists/${playlist.slug}?v=${playlist.nextLesson.youtubeVideoId}`
    : `/practice/dsa/playlists/${playlist.slug}`;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0A0A0A] p-4 transition-all duration-300 hover:border-white/[0.2] hover:bg-[#111111] hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      <div>
        {/* Thumbnail & Badges Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/60 border border-white/[0.05]">
          {playlist.thumbnailUrl ? (
            <Image
              src={playlist.thumbnailUrl}
              alt={playlist.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-600">
              <Icon icon={Layers01Icon} size={32} />
            </div>
          )}

          {/* Dark gradient overlay for bottom tags */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* Top Left Flag */}
          {playlist.isDefault && (
            <div className="absolute top-2.5 left-2.5">
              <span className="rounded bg-[#FF0000] px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                PRIMARY TRACK
              </span>
            </div>
          )}

          {playlist.isFeatured && !playlist.isDefault && (
            <div className="absolute top-2.5 left-2.5">
              <span className="rounded bg-white/10 backdrop-blur-md border border-white/20 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-white uppercase">
                FEATURED
              </span>
            </div>
          )}

          {/* Bottom Right Duration & Video Count */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
            <span className="rounded bg-black/80 backdrop-blur-md px-1.5 py-0.5 font-mono text-[11px] font-medium text-neutral-300 flex items-center gap-1 border border-white/10">
              <Icon icon={Layers01Icon} size={11} className="text-neutral-400" />
              {playlist.videoCount} lessons
            </span>
            {playlist.totalDurationSeconds > 0 && (
              <span className="rounded bg-black/80 backdrop-blur-md px-1.5 py-0.5 font-mono text-[11px] font-medium text-neutral-300 flex items-center gap-1 border border-white/10">
                <Icon icon={Time02Icon} size={11} className="text-neutral-400" />
                {formatDuration(playlist.totalDurationSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-3.5 space-y-2">
          {/* Instructor & Level Pill */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
              <Icon icon={TeacherIcon} size={13} className="text-[#FF4D4D]" />
              <span>{playlist.instructor}</span>
            </div>
            <span className="rounded bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 font-mono text-[10px] text-neutral-400">
              {playlist.level}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 font-semibold text-white group-hover:text-[#FF4D4D] transition-colors">
            {playlist.title}
          </h3>

          {/* Focus Description */}
          <p className="line-clamp-2 text-xs text-neutral-400 leading-relaxed min-h-[34px]">
            {playlist.focus}
          </p>

          {/* Topic Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {playlist.topicTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#181818] border border-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-neutral-400"
              >
                #{tag}
              </span>
            ))}
            {playlist.topicTags.length > 3 && (
              <span className="text-[10px] font-mono text-neutral-600 self-center">
                +{playlist.topicTags.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer & Progress Actions */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.06] space-y-3">
        {/* Progress Bar for Enrolled Learners */}
        {isEnrolled && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-neutral-400">
                {playlist.completedLessonsCount} / {playlist.videoCount} lessons
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
        )}

        {/* CTA Actions */}
        <div className="flex items-center gap-2">
          {isEnrolled ? (
            <Button
              className="w-full bg-[#161616] hover:bg-[#202020] text-white border border-white/[0.1] hover:border-white/[0.2] h-9 text-xs font-medium gap-2 active:scale-[0.98] transition-all"
              asChild
            >
              <Link href={nextLessonUrl}>
                {isCompleted ? (
                  <>
                    <Icon icon={VideoReplayIcon} size={14} className="text-emerald-400" />
                    <span>Review Course</span>
                  </>
                ) : (
                  <>
                    <Icon icon={PlayIcon} size={14} className="text-[#FF0000]" />
                    <span>Resume Lesson</span>
                  </>
                )}
              </Link>
            </Button>
          ) : (
            <Button
              className="w-full bg-[#FF0000] hover:bg-[#D90000] text-white font-medium h-9 text-xs gap-2 active:scale-[0.98] transition-all shadow-[0_2px_12px_rgba(255,0,0,0.25)]"
              asChild
            >
              <Link href={`/practice/dsa/playlists/${playlist.slug}`}>
                <Icon icon={PlayIcon} size={14} />
                <span>Start Learning</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

