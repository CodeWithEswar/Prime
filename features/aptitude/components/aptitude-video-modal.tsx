"use client";

import { useState } from "react";
import { LinkSquare01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
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
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-4 overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="min-w-0 pr-7">
          <p className="text-xs text-[var(--text-tertiary)]">
            Day {topic.dayNumber} · {topic.title}
          </p>
          <DialogTitle className="break-words text-base leading-6 sm:text-lg">
            {video.title}
          </DialogTitle>
          <DialogDescription>
            {video.channelTitle}
            {video.durationFormatted ? " · " + video.durationFormatted : ""}
          </DialogDescription>
        </DialogHeader>
        {videos.length > 1 && (
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
            <SelectTrigger aria-label="Choose lesson" className="min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {videos.map((v, index) => (
                <SelectItem key={v.videoId} value={v.videoId}>
                  {index === 0 ? "Main" : "Alternative"} · {v.channelTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-black">
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
            <div className="flex h-full items-center justify-center p-4 text-center text-xs text-[var(--text-secondary)]">
              This lesson can be watched directly on YouTube.
            </div>
          )}
        </div>
        <p className="text-[11px] leading-5 text-[var(--text-secondary)]">
          {loadError || !loaded
            ? "If the player does not load, "
            : "If YouTube restricts playback, "}
          use the YouTube link below.
          {video.reviewStatus === "candidate_review_required"
            ? " English instruction checked through audio/caption metadata or a matching speech transcript. Full topic coverage is not certified."
            : ""}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
          <Button asChild variant="outline" size="sm">
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon={LinkSquare01Icon} size={14} />
              Open on YouTube
            </a>
          </Button>
          <Button
            variant={watched ? "outline" : "primary"}
            size="sm"
            aria-pressed={watched}
            onClick={() => onToggleWatched(topic.id, video.videoId, !watched)}
          >
            <Icon icon={Tick02Icon} size={14} />
            {watched ? "Watched" : "Mark as watched"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
