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
  Clock01Icon,
  Note01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
    (v) =>
      (v.youtubeVideoId && v.youtubeVideoId === video.youtubeVideoId) ||
      v.id === video.id
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
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleNotesSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh_-_1.5rem)] w-[calc(100%_-_1.5rem)] max-w-5xl overflow-hidden border-[#222226] bg-[#070709] p-0 text-white sm:rounded-2xl shadow-2xl flex flex-col">
        <DialogTitle className="sr-only">{video.title}</DialogTitle>

        {/* Top ambient glow accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent z-10" />

        {/* Video Player Cinema Frame */}
        <div className="relative aspect-video w-full bg-black shrink-0 border-b border-[#1A1A1E]">
          {directId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${directId}?rel=0&enablejsapi=1&autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center space-y-3">
              <p className="text-sm text-[#A1A1AA]">
                Direct embedded playback is unavailable for this video stream.
              </p>
              {watchUrl && (
                <Button asChild size="sm" className="bg-white text-black hover:bg-neutral-200">
                  <a href={watchUrl} target="_blank" rel="noopener noreferrer">
                    <Icon icon={PlayIcon} size={14} className="mr-1.5" />
                    Open Lecture on YouTube
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Helper bar underneath video */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#16161A] bg-[#0B0B0E] px-4 sm:px-6 py-2.5 text-[11px] text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span>High-Definition Curriculum Lecture</span>
          </div>
          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-white/80 hover:text-white transition-colors"
            >
              <span>Watch on YouTube</span>
              <Icon icon={LinkSquare01Icon} size={12} />
            </a>
          )}
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {/* Metadata & Controls Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-[#1A1A1E]">
            <div className="space-y-2.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] font-bold text-white bg-[#141418] border-[#27272F] px-2 py-0.5 rounded"
                >
                  {video.position == null ? "Deep Dive" : `LESSON #${video.position}`}
                </Badge>

                <Badge
                  variant="outline"
                  className="border-[var(--accent-border)] bg-[var(--accent-muted)] text-[10px] font-bold text-[var(--accent)] px-2 py-0.5 rounded"
                >
                  Day {video.dayNumber}
                </Badge>

                <span className="text-xs text-[#A1A1AA] font-medium">
                  {video.channel}
                </span>

                {video.estimatedMinutes != null && (
                  <span className="text-xs font-mono text-[#71717A] flex items-center gap-1">
                    <Icon icon={Clock01Icon} size={12} />
                    {video.estimatedMinutes} mins
                  </span>
                )}

                {video.difficulty && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] px-1.5 py-0 font-medium",
                      video.difficulty === "Easy"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                        : video.difficulty === "Medium"
                          ? "bg-amber-950/40 text-amber-400 border border-amber-900/50"
                          : "bg-rose-950/40 text-rose-400 border border-rose-900/50"
                    )}
                  >
                    {video.difficulty}
                  </Badge>
                )}
              </div>

              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight leading-snug">
                {video.title}
              </h2>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={onToggleWatched}
                className={cn(
                  "h-9 px-4 text-xs font-semibold transition-all",
                  isWatched
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                )}
              >
                <Icon
                  icon={Tick02Icon}
                  size={14}
                  className={cn(
                    "mr-1.5",
                    isWatched ? "text-black" : "text-white"
                  )}
                />
                {isWatched ? "Completed" : "Mark Completed"}
              </Button>

              {onToggleBookmark && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleBookmark}
                  className={cn(
                    "size-9 rounded-lg border-[#27272F] bg-[#121216] transition-colors",
                    isBookmarked
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                      : "text-[#71717A] hover:text-white hover:bg-[#1C1C22]"
                  )}
                  aria-label="Bookmark lesson"
                  title={isBookmarked ? "Remove Bookmark" : "Bookmark Lesson"}
                >
                  <Icon icon={Bookmark01Icon} size={15} />
                </Button>
              )}

              {onToggleRevision && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleRevision}
                  className={cn(
                    "size-9 rounded-lg border-[#27272F] bg-[#121216] transition-colors",
                    isRevisionDue
                      ? "border-sky-500/50 bg-sky-500/10 text-sky-400"
                      : "text-[#71717A] hover:text-white hover:bg-[#1C1C22]"
                  )}
                  aria-label="Flag for revision"
                  title={isRevisionDue ? "Remove from Revision" : "Flag for Revision"}
                >
                  <Icon icon={RotateRight01Icon} size={15} />
                </Button>
              )}
            </div>
          </div>

          {/* Lesson Study Notes Workbench */}
          {onSaveNotes && (
            <div className="space-y-3 rounded-xl border border-[#1A1A1E] bg-[#0A0A0D] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
                  <Icon icon={Note01Icon} size={14} className="text-white" />
                  Engineering Study Notes & Takeaways
                </label>
                {isSaved ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Icon icon={CheckmarkCircle02Icon} size={13} />
                    Saved to learning profile
                  </span>
                ) : (
                  <span className="text-[10px] text-[#71717A] font-mono hidden sm:inline">
                    Press Ctrl+Enter to save
                  </span>
                )}
              </div>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Document your architecture findings, edge cases, formulas, or interview talking points..."
                rows={3}
                className="resize-none border-[#222226] bg-[#050507] text-xs sm:text-sm text-white placeholder:text-[#52525B] focus:border-white leading-relaxed p-3.5 rounded-lg shadow-inner"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#71717A]">
                  Notes persist across your sessions and synchronize to revision.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNotesSave}
                  className="h-8 text-xs font-medium border-[#27272F] bg-[#141418] text-white hover:bg-[#1E1E24]"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Controls: Previous / Next Video */}
          {videoList.length > 0 && onSelectVideo && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1A1A1E] pt-4">
              {prevVideo ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onSelectVideo(prevVideo.youtubeVideoId ?? prevVideo.id)
                  }
                  className="w-full sm:w-auto flex items-center justify-start gap-2 text-xs text-[#A1A1AA] hover:text-white p-2 h-auto"
                >
                  <Icon icon={ArrowLeft01Icon} size={15} />
                  <div className="text-left">
                    <span className="block text-[10px] font-mono text-[#71717A]">PREVIOUS</span>
                    <span className="max-w-[180px] sm:max-w-[240px] truncate block font-medium">
                      {prevVideo.title}
                    </span>
                  </div>
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
                  className="w-full sm:w-auto flex items-center justify-end gap-2 text-xs text-[#A1A1AA] hover:text-white p-2 h-auto sm:ml-auto"
                >
                  <div className="text-right">
                    <span className="block text-[10px] font-mono text-[#71717A]">NEXT</span>
                    <span className="max-w-[180px] sm:max-w-[240px] truncate block font-medium">
                      {nextVideo.title}
                    </span>
                  </div>
                  <Icon icon={ArrowRight01Icon} size={15} />
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
