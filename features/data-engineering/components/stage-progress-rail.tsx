"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Tick02Icon, PlayIcon } from "@hugeicons/core-free-icons";
import type {
  DataEngineeringStageSchedule,
  UserVideoProgress,
  UserStageProgress,
  DataEngineeringVideoItem,
} from "@/domain/data-engineering";

interface StageProgressRailProps {
  stages: DataEngineeringStageSchedule[];
  videos: DataEngineeringVideoItem[];
  videoProgress: Record<string, UserVideoProgress>;
  stageProgress: Record<number, UserStageProgress>;
  activeStage: number;
  onSelectStage: (stageNumber: number) => void;
}

export function StageProgressRail({
  stages,
  videos,
  videoProgress,
  stageProgress,
  activeStage,
  onSelectStage,
}: StageProgressRailProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-xs font-semibold tracking-wider text-[#888888] uppercase">
          8-Stage Industry Milestone Progression
        </h2>
        <span className="text-xs text-[var(--text-secondary)]">
          Select any stage to inspect modules, labs & system architectures
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2 @min-[38rem]:grid-cols-4 @min-[64rem]:grid-cols-8">
        {stages.map((stage) => {
          const stageVideos = videos.filter(
            (v) => v.stageNumber === stage.stageNumber
          );
          const watchedCount = stageVideos.filter(
            (v) => videoProgress[v.youtubeVideoId]?.watched
          ).length;
          const isAllWatched =
            stageVideos.length > 0 && watchedCount === stageVideos.length;
          const isAssignmentDone =
            !!stageProgress[stage.stageNumber]?.assignmentCompleted;
          const isComplete = isAllWatched && isAssignmentDone;
          const isCurrent = stage.stageNumber === activeStage;

          return (
            <button
              key={stage.stageNumber}
              type="button"
              onClick={() => onSelectStage(stage.stageNumber)}
              aria-pressed={isCurrent}
              className={cn(
                "group flex min-w-0 flex-col justify-between rounded-[var(--radius-sm)] border p-3 text-left transition-all",
                isCurrent
                  ? "border-[var(--accent-border)] bg-[var(--accent-muted)] shadow-sm"
                  : isComplete
                    ? "border-[#242424] bg-[#0E0E0E] hover:border-[#383838]"
                    : "border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#2C2C2C] hover:bg-[#0F0F0F]"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-[11px] font-bold tracking-tight",
                    isCurrent
                      ? "text-[var(--foreground)]"
                      : isComplete
                        ? "text-white"
                        : "text-[#888888]"
                  )}
                >
                  STAGE {String(stage.stageNumber).padStart(2, "0")}
                </span>

                {isComplete ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                    <Icon icon={Tick02Icon} size={12} strokeWidth={2.5} />
                  </span>
                ) : isCurrent ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                    <Icon icon={PlayIcon} size={11} />
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {watchedCount}/{stageVideos.length}
                  </span>
                )}
              </div>

              <div className="mt-2.5">
                <p
                  className={cn(
                    "line-clamp-2 text-xs font-semibold transition-colors",
                    isCurrent
                      ? "text-white"
                      : "text-[#D4D4D4] group-hover:text-white"
                  )}
                >
                  {stage.title}
                </p>
                <p className="mt-1 line-clamp-1 text-[10px] text-[#71717A]">
                  {stage.level}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#18181B]">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isComplete
                      ? "bg-white"
                      : isCurrent
                        ? "bg-[var(--accent)]"
                        : "bg-[#3F3F46]"
                  )}
                  style={{
                    width: `${
                      stageVideos.length > 0
                        ? Math.round((watchedCount / stageVideos.length) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
