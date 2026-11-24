"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Tick02Icon, PlayIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import type {
  PythonStageSchedule,
  UserVideoProgress,
  UserStageProgress,
  PythonVideoItem,
} from "@/domain/python";

interface StageProgressRailProps {
  stages: PythonStageSchedule[];
  videos: PythonVideoItem[];
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
  const renderStageCard = (stage: PythonStageSchedule, isMobileScroll = false) => {
    const stageVideos = videos.filter(
      (v) => v.stageNumber === stage.stageNumber
    );
    const watchedCount = stageVideos.filter(
      (v) => videoProgress[v.youtubeVideoId]?.watched
    ).length;
    const isAllWatched =
      stageVideos.length > 0 && watchedCount === stageVideos.length;
    const isAssignmentDone =
      !!stageProgress[stage.stageNumber]?.practicalAssignmentSubmitted;
    const isComplete = isAllWatched && isAssignmentDone;
    const isCurrent = stage.stageNumber === activeStage;
    const progressPercent =
      stageVideos.length > 0
        ? Math.round((watchedCount / stageVideos.length) * 100)
        : 0;

    return (
      <button
        key={stage.stageNumber}
        type="button"
        onClick={() => onSelectStage(stage.stageNumber)}
        aria-pressed={isCurrent}
        className={cn(
          "group relative flex min-w-0 flex-col justify-between rounded-md border p-3 sm:p-3.5 text-left transition-all duration-200 outline-none select-none",
          isMobileScroll && "w-[175px] shrink-0 snap-start",
          isCurrent
            ? "border-zinc-600 bg-zinc-900 shadow-lg ring-1 ring-zinc-500/50"
            : isComplete
              ? "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/60"
              : "border-zinc-800/80 bg-zinc-950/80 hover:border-zinc-700 hover:bg-zinc-900/40"
        )}
      >
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <span
            className={cn(
              "font-mono text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-sm",
              isCurrent
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : isComplete
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                  : "bg-zinc-900 text-zinc-500 border border-zinc-800"
            )}
          >
            STAGE {stage.stageNumber}
          </span>

          {isComplete ? (
            <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Icon icon={Tick02Icon} size={11} />
            </span>
          ) : (
            <span className="font-mono text-[10px] text-zinc-400">
              {progressPercent}%
            </span>
          )}
        </div>

        <div className="space-y-1 mb-3">
          <h4
            className={cn(
              "text-xs font-bold leading-tight line-clamp-2 transition-colors",
              isCurrent
                ? "text-white"
                : isComplete
                  ? "text-zinc-200"
                  : "text-zinc-300 group-hover:text-white"
            )}
          >
            {stage.title}
          </h4>
          <p className="text-[11px] text-zinc-500 line-clamp-1">
            {stage.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-1">
            <Icon icon={PlayIcon} size={11} />
            <span>
              {watchedCount}/{stageVideos.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon={Clock01Icon} size={11} />
            <span>{Math.round(stage.estimatedMinutes / 60)}h</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full space-y-2">
      {/* Mobile Horizontal Snap Rail */}
      <div className="flex md:hidden gap-2.5 overflow-x-auto pb-2 prime-scrollbar-none snap-x snap-mandatory">
        {stages.map((stage) => renderStageCard(stage, true))}
      </div>

      {/* Tablet & Desktop Grid Rail */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {stages.map((stage) => renderStageCard(stage, false))}
      </div>
    </div>
  );
}
