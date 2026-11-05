"use client";

import { CourseStudyDay } from "@/components/shared/course-study-day";
import type {
  OSDaySchedule,
  OSVideoItem,
  UserOSDayProgress,
  UserOSVideoProgress,
} from "@/domain/os";

interface OSDayWorkspaceProps {
  day: OSDaySchedule;
  videos: OSVideoItem[];
  dayProgress?: UserOSDayProgress;
  videoProgress: Record<string, UserOSVideoProgress>;
  onToggleWatched: (video: OSVideoItem) => void;
  onToggleBookmark?: (video: OSVideoItem) => void;
  onToggleRevision?: (video: OSVideoItem) => void;
  onOpenVideo: (video: OSVideoItem) => void;
  onCompleteDay: (dayNumber: number, notes?: string) => void;
  onOpenLab?: (labSlug: string) => void;
}

export function OSDayWorkspace({
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
}: OSDayWorkspaceProps) {
  const lessons = videos
    .filter((video) => video.dayNumber === day.dayNumber)
    .map((video) => {
      const key = video.progressId ?? video.youtubeVideoId ?? `pos-${video.position}`;
      const progress = videoProgress[key] ?? videoProgress[String(video.position)];
      return {
        key,
        title: video.title,
        position: video.isSupplementary ? undefined : video.position,
        channel: video.channel,
        minutes: video.estimatedMinutes,
        kind: video.isSupplementary
          ? "Deep dive"
          : video.isChapterIntro
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
      course="Operating Systems"
      day={day}
      lessons={lessons}
      notes={dayProgress?.notes}
      complete={Boolean(dayProgress?.assignmentCompleted)}
      onComplete={(notes) => onCompleteDay(day.dayNumber, notes)}
      onOpenLab={onOpenLab}
    />
  );
}
