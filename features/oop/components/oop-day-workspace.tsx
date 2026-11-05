"use client";

import { CourseStudyDay } from "@/components/shared/course-study-day";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  OOPDaySchedule,
  OOPVideoItem,
  OOPSegmentItem,
  UserOOPDayProgress,
  UserOOPVideoProgress,
  UserOOPSegmentProgress,
} from "@/domain/oop";

interface OOPDayWorkspaceProps {
  day: OOPDaySchedule;
  videos: OOPVideoItem[];
  segments: OOPSegmentItem[];
  dayProgress?: UserOOPDayProgress;
  videoProgress: Record<string, UserOOPVideoProgress>;
  segmentProgress: Record<string, UserOOPSegmentProgress>;
  onToggleVideoWatched: (video: OOPVideoItem) => void;
  onToggleBookmark?: (video: OOPVideoItem) => void;
  onToggleRevision?: (video: OOPVideoItem) => void;
  onToggleSegmentCompleted: (segment: OOPSegmentItem) => void;
  onOpenVideo: (video: OOPVideoItem) => void;
  onCompleteDay: (dayNumber: number, notes?: string) => void;
  onOpenLab?: (labSlug: string) => void;
}

export function OOPDayWorkspace({
  day,
  videos,
  segments,
  dayProgress,
  videoProgress,
  segmentProgress,
  onToggleVideoWatched,
  onToggleBookmark,
  onToggleRevision,
  onToggleSegmentCompleted,
  onOpenVideo,
  onCompleteDay,
  onOpenLab,
}: OOPDayWorkspaceProps) {
  const lessons = videos
    .filter((video) => video.assignedDays.includes(day.dayNumber))
    .map((video) => ({
      key: video.youtubeVideoId,
      title: video.title,
      position: video.order,
      channel: video.channelTitle,
      minutes: Math.ceil(video.durationSeconds / 60),
      difficulty: video.difficulty,
      watched: Boolean(videoProgress[video.youtubeVideoId]?.watched),
      isBookmarked: Boolean(videoProgress[video.youtubeVideoId]?.isBookmarked),
      revisionDue: Boolean(videoProgress[video.youtubeVideoId]?.revisionDue),
      onToggle: () => onToggleVideoWatched(video),
      onWatch: () => onOpenVideo(video),
      onToggleBookmark: onToggleBookmark ? () => onToggleBookmark(video) : undefined,
      onToggleRevision: onToggleRevision ? () => onToggleRevision(video) : undefined,
    }));
  const daySegments = segments.filter((segment) => segment.assignedDay === day.dayNumber);

  return (
    <CourseStudyDay
      key={day.dayNumber}
      course="OOP"
      day={{ ...day, labSlug: day.signatureLab.id }}
      lessons={lessons}
      notes={dayProgress?.notes}
      complete={Boolean(dayProgress?.assignmentCompleted)}
      onComplete={(notes) => onCompleteDay(day.dayNumber, notes)}
      onOpenLab={onOpenLab}
      checkpoints={
        daySegments.length > 0 && (
          <section className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold">Video checkpoints</h3>
            {daySegments.map((segment) => (
              <Card
                key={segment.segmentId}
                elevation="base"
                className="flex min-w-0 flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <Checkbox
                    checked={Boolean(segmentProgress[segment.segmentId]?.completed)}
                    onCheckedChange={() => onToggleSegmentCompleted(segment)}
                    aria-label={"Mark checkpoint " + segment.conceptTitle}
                    containerClassName="mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium [overflow-wrap:anywhere]">
                      {segment.conceptTitle}
                    </p>
                    <p className="font-mono text-xs text-[var(--text-secondary)]">
                      {Math.floor(segment.startSeconds / 60)}:
                      {String(segment.startSeconds % 60).padStart(2, "0")}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href={segment.directTimestampUrl} target="_blank" rel="noreferrer">
                    Open timestamp
                  </a>
                </Button>
              </Card>
            ))}
          </section>
        )
      }
      assignmentDetails={
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <ul className="list-disc space-y-1 pl-4 marker:text-[var(--accent)]">
            {day.practicalAssignment.tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
          <p>{day.practicalAssignment.submissionHint}</p>
          <div className="border-t border-[var(--border-subtle)] pt-2">
            <p className="font-medium text-[var(--foreground)]">
              {day.signatureLab.name}
            </p>
            <p>{day.signatureLab.description}</p>
          </div>
        </div>
      }
    />
  );
}
