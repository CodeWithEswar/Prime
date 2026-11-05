"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import {
  Tick02Icon,
  Bookmark01Icon,
  RotateRight01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  LinkSquare01Icon,
  Note01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import type {
  DBMSVideoItem,
  UserVideoProgress,
  DBMSVideoDifficulty,
} from "@/domain/dbms";

interface VideoModalPlayerProps {
  video: DBMSVideoItem | null;
  videoList: DBMSVideoItem[];
  progress: UserVideoProgress | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (videoId: string) => void;
  onToggleWatched: (videoId: string) => void;
  onToggleBookmark: (videoId: string) => void;
  onToggleRevision: (videoId: string) => void;
  onSaveNotes: (videoId: string, notes: string, difficulty?: DBMSVideoDifficulty) => void;
}

export function VideoModalPlayer({
  video,
  videoList,
  progress,
  isOpen,
  onClose,
  onSelectVideo,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
  onSaveNotes,
}: VideoModalPlayerProps) {
  const videoId = video?.youtubeVideoId;
  const [source, setSource] = useState({ videoId, progress });
  const [notes, setNotes] = useState(progress?.notes ?? "");
  const [difficulty, setDifficulty] = useState<DBMSVideoDifficulty>(
    progress?.difficultyRating ?? "Medium"
  );
  const [isSaved, setIsSaved] = useState(false);

  if (source.videoId !== videoId || source.progress !== progress) {
    setSource({ videoId, progress });
    setNotes(progress?.notes ?? "");
    if (progress?.difficultyRating) setDifficulty(progress.difficultyRating);
    setIsSaved(false);
  }

  if (!video) return null;

  const currentIndex = videoList.findIndex(
    (v) => v.youtubeVideoId === video.youtubeVideoId
  );
  const prevVideo = currentIndex > 0 ? videoList[currentIndex - 1] : null;
  const nextVideo =
    currentIndex >= 0 && currentIndex < videoList.length - 1
      ? videoList[currentIndex + 1]
      : null;

  const isWatched = progress?.watched ?? false;
  const isBookmarked = progress?.isBookmarked ?? false;
  const isRevisionDue = progress?.revisionDue ?? false;

  const handleNotesSave = () => {
    onSaveNotes(video.youtubeVideoId, notes, difficulty);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh_-_1.5rem)] w-[calc(100%_-_1.5rem)] max-w-4xl overflow-y-auto border-[#222222] bg-[#0A0A0A] p-0 text-white sm:rounded-xl">
        {/* Video Embed Header */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?rel=0&enablejsapi=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>

        {/* Fallback helper bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A] bg-[#111111] px-4 py-2 text-[11px] text-[#888888]">
          <span>Having trouble playing in browser? Some videos restrict embedding.</span>
          <a
            href={video.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#FF4D4D] hover:underline"
          >
            Watch directly on YouTube
            <Icon icon={LinkSquare01Icon} size={12} />
          </a>
        </div>

        {/* Content Body */}
        <div className="space-y-6 p-6">
          {/* Top metadata & controls */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#1A1A1A] pb-5 md:flex-row md:items-start">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#1A1A1A] px-2 py-0.5 font-mono text-xs text-[#888888]">
                  {video.position == null ? "Deep dive" : `#${video.position}`}
                </span>
                <span className="rounded bg-[#FF0000]/10 px-2 py-0.5 text-xs font-semibold text-[#FF4D4D]">
                  Day {video.dayNumber}
                </span>
                <span className="text-xs text-[#666666]">{video.channel}</span>
                <span className="text-xs text-[#555555]">
                  • {video.estimatedMinutes} mins
                </span>
              </div>

              <h2 className="text-lg font-bold text-white sm:text-xl">{video.title}</h2>

              <a
                href={video.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#888888] underline underline-offset-4 hover:text-[#FFFFFF]"
              >
                Watch directly on YouTube
                <Icon icon={LinkSquare01Icon} size={12} />
              </a>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => onToggleWatched(video.youtubeVideoId)}
                className={
                  isWatched
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-[#FF0000] text-white hover:bg-[#D90000]"
                }
              >
                <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
                {isWatched ? "Completed" : "Mark Watched"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleBookmark(video.youtubeVideoId)}
                className={
                  isBookmarked
                    ? "border-[#FF0000] bg-[#FF0000]/10 text-[#FF4D4D]"
                    : "border-[#262626] bg-[#141414] text-[#888888] hover:text-white"
                }
              >
                <Icon icon={Bookmark01Icon} size={14} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleRevision(video.youtubeVideoId)}
                className={
                  isRevisionDue
                    ? "border-[#FF0000] bg-[#FF0000]/10 text-[#FF4D4D]"
                    : "border-[#262626] bg-[#141414] text-[#888888] hover:text-white"
                }
              >
                <Icon icon={RotateRight01Icon} size={14} />
              </Button>
            </div>
          </div>

          {/* Notes and difficulty rating section */}
          <div className="space-y-3 rounded-lg border border-[#1A1A1A] bg-[#101010] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#A0A0A0] uppercase">
                <Icon icon={Note01Icon} size={14} />
                Personal Study Notes & Key Takeaways
              </label>

              <div className="flex items-center gap-1.5">
                {(["Easy", "Medium", "Hard"] as DBMSVideoDifficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      difficulty === level
                        ? "bg-[#FF0000] text-white"
                        : "border border-[#222222] bg-[#141414] text-[#777777] hover:text-[#CCCCCC]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record definitions, edge cases, formulas, or tricky interview questions from this lecture..."
              className="min-h-[90px] border-[#222222] bg-[#0A0A0A] text-sm text-white placeholder:text-[#555555] focus:border-[#FF0000]"
            />

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleNotesSave}
                className="h-8 bg-[#1E1E1E] px-4 text-xs font-medium text-white hover:bg-[#2C2C2C]"
              >
                {isSaved ? "Saved!" : "Save Notes"}
              </Button>
            </div>
          </div>

          {/* Stepper Navigation: Previous / Next */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1A1A1A] pt-4">
            {prevVideo ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectVideo(prevVideo.youtubeVideoId)}
                className="text-xs text-[#888888] hover:text-white"
              >
                <Icon icon={ArrowLeft01Icon} size={14} className="mr-1" />#
                {prevVideo.position} {prevVideo.title.slice(0, 25)}...
              </Button>
            ) : (
              <div />
            )}

            {nextVideo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectVideo(nextVideo.youtubeVideoId)}
                className="text-xs text-[#888888] hover:text-white"
              >
                #{nextVideo.position} {nextVideo.title.slice(0, 25)}...
                <Icon icon={ArrowRight01Icon} size={14} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
