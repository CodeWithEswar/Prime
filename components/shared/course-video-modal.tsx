"use client";

import { useState } from "react";
import {
  Bookmark01Icon,
  LinkSquare01Icon,
  PlayIcon,
  RotateRight01Icon,
  Tick02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";

export interface UnifiedVideoItem {
  id: string;
  youtubeVideoId: string | null;
  title: string;
  position?: number | null;
  dayNumber: number;
  channel: string;
  estimatedMinutes?: number | null;
  canonicalUrl?: string | null;
  difficulty?: string | null;
  importance?: string | null;
}

interface CourseVideoModalProps {
  video: UnifiedVideoItem | null;
  videoList?: UnifiedVideoItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo?: (videoId: string) => void;
  isWatched?: boolean;
  isBookmarked?: boolean;
  isRevisionDue?: boolean;
  notes?: string | null;
  onToggleWatched: () => void;
  onToggleBookmark?: () => void;
  onToggleRevision?: () => void;
  onSaveNotes?: (notes: string) => void;
}

export function CourseVideoModal({
  video,
  videoList = [],
  isOpen,
  onClose,
  onSelectVideo,
  isWatched = false,
  isBookmarked = false,
  isRevisionDue = false,
  notes: initialNotes,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
  onSaveNotes,
}: CourseVideoModalProps) {
  const [prevVideoId, setPrevVideoId] = useState(video?.id);
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaved, setIsSaved] = useState(false);

  if (video?.id !== prevVideoId) {
    setPrevVideoId(video?.id);
    setNotes(initialNotes || "");
    setIsSaved(false);
  }

  if (!video) return null;

  const currentIndex = videoList.findIndex(
    (v) => (v.youtubeVideoId && v.youtubeVideoId === video.youtubeVideoId) || v.id === video.id
  );
  const prevVideo = currentIndex > 0 ? videoList[currentIndex - 1] : null;
  const nextVideo =
    currentIndex >= 0 && currentIndex < videoList.length - 1
      ? videoList[currentIndex + 1]
      : null;

  const directId =
    video.youtubeVideoId && /^[\w-]{11}$/.test(video.youtubeVideoId)
      ? video.youtubeVideoId
      : null;

  const watchUrl =
    video.canonicalUrl ||
    (directId ? `https://www.youtube.com/watch?v=${directId}` : null);

  const handleNotesSave = () => {
    if (onSaveNotes) {
      onSaveNotes(notes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh_-_1.5rem)] w-[calc(100%_-_1.5rem)] max-w-4xl overflow-y-auto border-[#222222] bg-[#0A0A0A] p-0 text-white sm:rounded-xl">
        {/* Video Embed Header */}
        <div className="relative aspect-video w-full bg-black">
          {directId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${directId}?rel=0&enablejsapi=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-[#888888]">Direct embedded stream is not available for this lesson.</p>
              {watchUrl && (
                <Button asChild size="sm" className="mt-3 bg-[#FF0000] text-white">
                  <a href={watchUrl} target="_blank" rel="noopener noreferrer">
                    <Icon icon={PlayIcon} size={14} className="mr-1.5" />
                    Open Lesson on YouTube
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Fallback helper bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A] bg-[#111111] px-4 py-2 text-[11px] text-[#888888]">
          <span>Having trouble playing in browser? Some videos restrict embedding.</span>
          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#FF4D4D] hover:underline"
            >
              Watch directly on YouTube
              <Icon icon={LinkSquare01Icon} size={12} />
            </a>
          )}
        </div>

        {/* Content Body */}
        <div className="space-y-6 p-4 sm:p-6">
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
                {video.estimatedMinutes != null && (
                  <span className="text-xs text-[#555555]">
                    • {video.estimatedMinutes} mins
                  </span>
                )}
                {video.difficulty && (
                  <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-[#AAAAAA]">
                    {video.difficulty}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-white sm:text-xl leading-snug">
                {video.title}
              </h2>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={onToggleWatched}
                className={
                  isWatched
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-[#FF0000] text-white hover:bg-[#D90000]"
                }
              >
                <Icon
                  icon={Tick02Icon}
                  size={14}
                  className={`mr-1.5 ${isWatched ? "text-black" : "text-white"}`}
                />
                {isWatched ? "Watched" : "Mark Watched"}
              </Button>

              {onToggleBookmark && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleBookmark}
                  className={`border-[#262626] ${
                    isBookmarked
                      ? "border-[#FF0000]/50 bg-[#FF0000]/10 text-[#FF4D4D]"
                      : "bg-[#141414] text-[#888888] hover:text-white"
                  }`}
                  aria-label="Bookmark lesson"
                >
                  <Icon icon={Bookmark01Icon} size={15} />
                </Button>
              )}

              {onToggleRevision && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleRevision}
                  className={`border-[#262626] ${
                    isRevisionDue
                      ? "border-[#FF0000]/50 bg-[#FF0000]/10 text-[#FF4D4D]"
                      : "bg-[#141414] text-[#888888] hover:text-white"
                  }`}
                  aria-label="Flag for revision"
                >
                  <Icon icon={RotateRight01Icon} size={15} />
                </Button>
              )}
            </div>
          </div>

          {/* Lesson Study Notes */}
          {onSaveNotes && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
                  Lesson Revision Notes
                </label>
                {isSaved && (
                  <span className="text-xs font-medium text-[#4ade80]">
                    Saved to learning profile
                  </span>
                )}
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your personal takeaways, edge cases, or interview pointers..."
                rows={3}
                className="resize-none border-[#262626] bg-[#111111] text-xs text-white placeholder:text-[#555555] focus:border-[#FF0000]"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNotesSave}
                  className="border-[#262626] bg-[#141414] text-xs text-white hover:bg-[#1E1E1E]"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Controls: Previous / Next Video */}
          {videoList.length > 0 && onSelectVideo && (
            <div className="flex items-center justify-between border-t border-[#1A1A1A] pt-4">
              {prevVideo ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onSelectVideo(prevVideo.youtubeVideoId ?? prevVideo.id)
                  }
                  className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-white"
                >
                  <Icon icon={ArrowLeft01Icon} size={14} />
                  <span className="max-w-[140px] truncate sm:max-w-[200px]">
                    Prev: {prevVideo.title}
                  </span>
                </Button>
              ) : (
                <div />
              )}

              {nextVideo ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onSelectVideo(nextVideo.youtubeVideoId ?? nextVideo.id)
                  }
                  className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-white ml-auto"
                >
                  <span className="max-w-[140px] truncate sm:max-w-[200px]">
                    Next: {nextVideo.title}
                  </span>
                  <Icon icon={ArrowRight01Icon} size={14} />
                </Button>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

