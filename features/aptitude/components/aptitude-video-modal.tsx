"use client";

import { useState } from "react";
import {
  Tick02Icon,
  YoutubeIcon,
  Clock01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAptitudeTopicVideos } from "@/domain/aptitude/videos";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  AptitudeTopic,
  AptitudeVideoItem,
  UserAptitudeVideoProgress,
} from "../types";

interface AptitudeVideoModalProps {
  topic: AptitudeTopic;
  video: AptitudeVideoItem;
  videoProgress?: UserAptitudeVideoProgress;
  onClose: () => void;
  onToggleWatched: (topicId: string, videoId: string, watched: boolean) => void;
  onSelectVideo: (topic: AptitudeTopic, video: AptitudeVideoItem) => void;
}

export function AptitudeVideoModal({
  topic,
  video,
  videoProgress,
  onClose,
  onToggleWatched,
  onSelectVideo,
}: AptitudeVideoModalProps) {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const videos = getAptitudeTopicVideos(topic);
  const watched = !!videoProgress?.watched;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-3.5 sm:gap-4 overflow-y-auto p-4 sm:p-6 bg-[#080808]/95 backdrop-blur-xl border border-[#222222] shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_24px_rgba(255,0,0,0.06)] rounded-2xl">
        {/* Premium Eyebrow & Title Header */}
        <DialogHeader className="min-w-0 pr-8 text-left space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] text-[10px] sm:text-[11px] font-mono font-medium text-[var(--text-secondary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]" />
              Day {topic.dayNumber} · {topic.title}
            </span>
            {watched && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                ✓ Watched
              </span>
            )}
          </div>

          <DialogTitle className="break-words text-base sm:text-lg font-semibold tracking-tight text-white leading-snug">
            {video.title}
          </DialogTitle>

          <DialogDescription className="flex items-center gap-2 text-xs font-mono text-[var(--text-tertiary)] pt-0.5">
            <span className="text-[var(--text-secondary)] font-medium">
              {video.channelTitle}
            </span>
            {video.durationFormatted && (
              <>
                <span className="text-[var(--border-strong)]">·</span>
                <span className="inline-flex items-center gap-1 text-[var(--text-tertiary)]">
                  <Icon icon={Clock01Icon} size={12} />
                  {video.durationFormatted}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Alternative Lessons Selector */}
        {videos.length > 1 && (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] shrink-0">
              Lesson:
            </span>
            <Select
              value={video.videoId}
              onValueChange={(id) => {
                const next = videos.find((v) => v.videoId === id);
                if (next) {
                  setLoaded(false);
                  setLoadError(false);
                  onSelectVideo(topic, next);
                }
              }}
            >
              <SelectTrigger
                aria-label="Choose lesson"
                className="min-w-0 h-8 text-xs font-mono bg-[var(--surface-base)] border-[var(--border-subtle)] text-white hover:border-[var(--border-default)]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-[var(--border-default)] text-xs font-mono">
                {videos.map((v, index) => (
                  <SelectItem key={v.videoId} value={v.videoId}>
                    {index === 0 ? "★ Main Lesson" : "Alternative"} · {v.channelTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Cinema Video Player Frame */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-[#222222] bg-[#050505] shadow-[0_8px_32px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
          {video.embeddable && !loadError ? (
            <iframe
              key={video.videoId}
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&hl=en&cc_lang_pref=en`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setLoaded(true)}
              onError={() => setLoadError(true)}
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 h-full p-4 text-center text-xs text-[var(--text-secondary)]">
              <Icon
                icon={YoutubeIcon}
                size={28}
                className="text-[#FF0000] opacity-80"
              />
              <p>This lesson can be watched directly on YouTube.</p>
            </div>
          )}
        </div>

        {/* Playback Disclaimer / Guidance Card */}
        <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[11px] font-mono leading-relaxed">
          <Icon
            icon={InformationCircleIcon}
            size={14}
            className="text-[var(--text-tertiary)] shrink-0 mt-0.5"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[var(--text-secondary)]">
              {loadError || !loaded
                ? "If the player does not load, use the YouTube link below."
                : "If YouTube restricts playback, use the YouTube link below."}
            </p>
            {video.reviewStatus === "candidate_review_required" && (
              <p className="text-[10px] text-[var(--text-tertiary)]">
                English instruction checked via metadata & speech transcript. Full
                coverage not certified.
              </p>
            )}
          </div>
        </div>

        {/* Short, Premium Action Buttons Bar */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 border-t border-[var(--border-subtle)] pt-3.5 mt-0.5">
          {/* Short YouTube Link Button */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-3 sm:px-3.5 text-xs font-mono shrink-0 bg-[var(--surface-base)] hover:bg-[var(--surface-raised)] border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
          >
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open on YouTube"
              className="inline-flex items-center gap-1.5"
            >
              <Icon icon={YoutubeIcon} size={14} className="text-[#FF0000]" />
              <span>YouTube</span>
              <span className="text-[var(--text-tertiary)] font-normal text-[11px]">
                ↗
              </span>
            </a>
          </Button>

          {/* Short Mark Watched Button */}
          <Button
            variant={watched ? "outline" : "primary"}
            size="sm"
            aria-pressed={watched}
            aria-label={watched ? "Watched" : "Mark as watched"}
            onClick={() => onToggleWatched(topic.id, video.videoId, !watched)}
            className={cn(
              "h-9 px-3.5 sm:px-4 text-xs font-mono font-medium shrink-0 transition-all gap-1.5",
              watched
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                : "bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white shadow-[0_0_12px_rgba(255,0,0,0.35)]"
            )}
          >
            <Icon
              icon={Tick02Icon}
              size={14}
              className={watched ? "text-emerald-400" : "text-white"}
            />
            <span>{watched ? "Watched" : "Mark watched"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
