"use client";

import { CourseLessonPlayer } from "@/components/shared/course-lesson-player";
import type { OSVideoItem, UserOSVideoProgress } from "@/domain/os";

interface OSVideoPlayerProps {
  video: OSVideoItem | null;
  progress?: UserOSVideoProgress;
  onClose: () => void;
  onToggleWatched: (video: OSVideoItem) => void;
  onSaveNotes: (
    video: OSVideoItem,
    notes: string,
    difficulty?: OSVideoItem["difficulty"],
    revisionDue?: boolean
  ) => void;
}

export function OSVideoPlayer({
  video,
  progress,
  onClose,
  onToggleWatched,
  onSaveNotes,
}: OSVideoPlayerProps) {
  if (!video) return null;

  return (
    <CourseLessonPlayer
      key={video.youtubeVideoId ?? video.position}
      title={video.title}
      position={video.isSupplementary ? undefined : video.position}
      channel={video.channel}
      videoId={video.youtubeVideoId}
      fallbackUrl={video.canonicalUrl ?? video.playlistUrl}
      watched={Boolean(progress?.watched)}
      notes={progress?.notes}
      revisionDue={progress?.revisionDue}
      onClose={onClose}
      onToggleWatched={() => onToggleWatched(video)}
      onSave={(notes, revisionDue) =>
        onSaveNotes(video, notes, video.difficulty, revisionDue)
      }
    />
  );
}
