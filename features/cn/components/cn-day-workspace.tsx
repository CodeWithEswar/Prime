"use client";

import { CourseStudyDay } from "@/components/shared/course-study-day";
import type {
  CNDaySchedule,
  CNVideoItem,
  UserCNDayProgress,
  UserCNVideoProgress,
} from "@/domain/cn";

interface CNDayWorkspaceProps {
  day: CNDaySchedule;
  videos: CNVideoItem[];
  dayProgress?: UserCNDayProgress;
  videoProgress: Record<string, UserCNVideoProgress>;
  onToggleWatched: (video: CNVideoItem) => void;
  onToggleBookmark?: (video: CNVideoItem) => void;
  onToggleRevision?: (video: CNVideoItem) => void;
  onOpenVideo: (video: CNVideoItem) => void;
  onCompleteDay: (dayNumber: number, notes?: string) => void;
  onOpenLab?: (labSlug: string) => void;
}

export function CNDayWorkspace({
  day,
  videos,
  dayProgress,
  videoProgress,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
  onOpenVideo,
  onCompleteDay,
  onOpenLab,
}: CNDayWorkspaceProps) {
  const lessons = videos
    .filter((video) => video.assignedStudyDay === day.dayNumber)
    .map((video) => {
      const key =
        video.progressId ?? video.youtubeVideoId ?? `pos-${video.playlistPosition}`;
      const progress =
        videoProgress[key] ?? videoProgress[String(video.playlistPosition)];
      return {
        key,
        title: video.verifiedTitle ?? `Lesson #${video.playlistPosition}`,
        position: video.isSupplementary ? undefined : video.playlistPosition,
        channel: video.channel ?? "Neso Academy",
        minutes: video.durationSeconds
          ? Math.ceil(video.durationSeconds / 60)
          : undefined,
        kind: video.isSupplementary
          ? "Deep dive"
          : video.contentKind === "chapter_preview"
            ? "Chapter preview"
            : undefined,
        difficulty: video.difficulty,
        watched: Boolean(progress?.watched),
        isBookmarked: Boolean(progress?.isBookmarked),
        revisionDue: Boolean(progress?.revisionDue),
        onToggle: () => onToggleWatched(video),
        onWatch: () => onOpenVideo(video),
        onToggleBookmark: onToggleBookmark ? () => onToggleBookmark(video) : undefined,
        onToggleRevision: onToggleRevision ? () => onToggleRevision(video) : undefined,
      };
    });

  return (
    <CourseStudyDay
      key={day.dayNumber}
      course="Computer Networks"
      day={day}
      lessons={lessons}
      notes={dayProgress?.notes}
      complete={Boolean(dayProgress?.assignmentCompleted)}
      onComplete={(notes) => onCompleteDay(day.dayNumber, notes)}
      onOpenLab={onOpenLab}
    />
  );
}
