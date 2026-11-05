"use client";

import { CourseLessonPlayer } from "@/components/shared/course-lesson-player";
import type { CNVideoItem, UserCNVideoProgress } from "@/domain/cn";

interface CNVideoPlayerProps {
  video: CNVideoItem | null;
  progress?: UserCNVideoProgress;
  onClose: () => void;
  onToggleWatched: (video: CNVideoItem) => void;
  onSaveNotes: (
    video: CNVideoItem,
    notes: string,
    difficulty?: NonNullable<CNVideoItem["difficulty"]>,
    revisionDue?: boolean
  ) => void;
}

export function CNVideoPlayer({
  video,
  progress,
  onClose,
  onToggleWatched,
  onSaveNotes,
}: CNVideoPlayerProps) {
  if (!video) return null;

  return (
    <CourseLessonPlayer
      key={video.youtubeVideoId ?? video.playlistPosition}
      title={video.verifiedTitle ?? "Network lesson"}
      position={video.isSupplementary ? undefined : video.playlistPosition}
      channel={video.channel ?? "Neso Academy"}
      videoId={video.youtubeVideoId}
      fallbackUrl={video.canonicalWatchUrl ?? video.playlistContextUrl}
      watched={Boolean(progress?.watched)}
      notes={progress?.notes}
      revisionDue={progress?.revisionDue}
      onClose={onClose}
      onToggleWatched={() => onToggleWatched(video)}
      onSave={(notes, revisionDue) =>
        onSaveNotes(video, notes, video.difficulty ?? undefined, revisionDue)
      }
    />
  );
}
