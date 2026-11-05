"use client";

import { CourseLessonPlayer } from "@/components/shared/course-lesson-player";
import type { OOPVideoItem, UserOOPVideoProgress } from "@/domain/oop";

interface OOPVideoPlayerProps {
  video: OOPVideoItem | null;
  isOpen: boolean;
  onClose: () => void;
  videoProgress: Record<string, UserOOPVideoProgress>;
  onToggleWatched: (video: OOPVideoItem) => void;
  onSaveNote: (videoId: string, note: string) => void;
}

export function OOPVideoPlayer({
  video,
  isOpen,
  onClose,
  videoProgress,
  onToggleWatched,
  onSaveNote,
}: OOPVideoPlayerProps) {
  if (!isOpen || !video) return null;
  const progress = videoProgress[video.youtubeVideoId];

  return (
    <CourseLessonPlayer
      key={video.youtubeVideoId}
      title={video.title}
      position={video.order}
      channel={video.channelTitle}
      videoId={video.youtubeVideoId}
      fallbackUrl={video.canonicalWatchUrl}
      watched={Boolean(progress?.watched)}
      notes={progress?.notes}
      showRevision={false}
      onClose={onClose}
      onToggleWatched={() => onToggleWatched(video)}
      onSave={(notes) => onSaveNote(video.youtubeVideoId, notes)}
    />
  );
}
