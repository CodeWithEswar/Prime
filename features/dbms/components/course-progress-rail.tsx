"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Tick02Icon, PlayIcon, LockIcon } from "@hugeicons/core-free-icons";
import type {
  DBMSDaySchedule,
  UserVideoProgress,
  UserDayProgress,
  DBMSVideoItem,
} from "@/domain/dbms";

interface CourseProgressRailProps {
  days: DBMSDaySchedule[];
  videos: DBMSVideoItem[];
  videoProgress: Record<string, UserVideoProgress>;
  dayProgress: Record<number, UserDayProgress>;
  activeDay: number;
  onSelectDay: (dayNumber: number) => void;
}

export function CourseProgressRail({
  days,
  videos,
  videoProgress,
  dayProgress,
  activeDay,
  onSelectDay,
}: CourseProgressRailProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-xs font-semibold tracking-wider text-[#888888] uppercase">
          12-Day Interactive Timeline
        </h2>
        <span className="text-xs text-[var(--text-secondary)]">
          Click any day to inspect lessons & questions
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-3 gap-1.5 @min-[46rem]:grid-cols-4 @min-[64rem]:grid-cols-6">
        {days.map((day) => {
          const dayVideos = videos.filter((v) => v.dayNumber === day.dayNumber);
          const watchedCount = dayVideos.filter(
            (v) => videoProgress[v.youtubeVideoId]?.watched
          ).length;
          const isAllWatched = dayVideos.length > 0 && watchedCount === dayVideos.length;
          const isAssignmentDone = !!dayProgress[day.dayNumber]?.assignmentCompleted;
          const isComplete = isAllWatched && isAssignmentDone;
          const isCurrent = day.dayNumber === activeDay;

          return (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => onSelectDay(day.dayNumber)}
              aria-pressed={isCurrent}
              className={cn(
                "group flex min-w-0 flex-col justify-between rounded-[var(--radius-sm)] border p-2.5 text-left transition-all",
                isCurrent
                  ? "border-[var(--accent-border)] bg-[var(--accent-muted)]"
                  : isComplete
                    ? "border-[#222222] bg-[#0E0E0E] hover:border-[#383838]"
                    : "border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#2C2C2C] hover:bg-[#0F0F0F]"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-xs font-bold",
                    isCurrent
                      ? "text-[var(--foreground)]"
                      : isComplete
                        ? "text-[#FFFFFF]"
                        : "text-[#888888]"
                  )}
                >
                  Day {String(day.dayNumber).padStart(2, "0")}
                </span>

                {isComplete ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                    <Icon icon={Tick02Icon} size={12} strokeWidth={2.5} />
                  </span>
                ) : isCurrent ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0000] text-white">
                    <Icon icon={PlayIcon} size={11} />
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {watchedCount}/{dayVideos.length}
                  </span>
                )}
              </div>

              <div className="mt-2">
                <p
                  className={cn(
                    "line-clamp-2 text-xs font-medium transition-colors",
                    isCurrent ? "text-white" : "text-[#CCCCCC] group-hover:text-white"
                  )}
                >
                  {day.title}
                </p>
                <div className="mt-1 hidden items-center gap-2 text-[11px] @min-[32rem]:flex text-[var(--text-secondary)]">
                  <span>{dayVideos.length} vids</span>
                  <span>•</span>
                  <span>{Math.round(day.estimatedMinutes / 60)}h</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
