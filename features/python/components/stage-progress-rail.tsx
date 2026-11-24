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
          "group relative flex min-w-0 flex-col justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-all duration-200 outline-none select-none",
          isMobileScroll && "w-[175px] shrink-0 snap-start",
          isCurrent
            ? "border-[var(--accent-border)] bg-gradient-to-b from-[#180C0C] via-[#0E0707] to-[#0A0A0A] shadow-md shadow-[var(--accent)]/10 ring-1 ring-[var(--accent)]/30"
            : isComplete
              ? "border-[#27272A] bg-[#0E0E0E] hover:border-[#3F3F46] hover:bg-[#121212]"
              : "border-[#1F1F24] bg-[#0A0A0C] hover:border-[#2D2D35] hover:bg-[#0E0E12]"
        )}
      >
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <span
            className={cn(
              "font-mono text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded",
              isCurrent
                ? "bg-[var(--accent)]/20 text-[var(--foreground)]"
                : isComplete
                  ? "bg-emerald-950/60 text-emerald-400"
                  : "bg-[#18181F] text-[#71717A]"
            )}
          >
            STAGE {stage.stageNumber}
          </span>

          {isComplete ? (
            <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Icon icon={Tick02Icon} size={11} />
            </span>
          ) : (
            <span className="font-mono text-[10px] text-[#A1A1AA]">
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
                  ? "text-[#E4E4E7]"
                  : "text-[#A1A1AA] group-hover:text-white"
            )}
          >
            {stage.title}
          </h4>
          <p className="text-[11px] text-[#71717A] line-clamp-1">
            {stage.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] pt-2 border-t border-[#1C1C22]">
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
      <div className="flex md:hidden gap-2.5 overflow-x-auto pb-2 prime-scrollbar-thin snap-x snap-mandatory">
        {stages.map((stage) => renderStageCard(stage, true))}
      </div>

      {/* Tablet & Desktop Grid Rail */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {stages.map((stage) => renderStageCard(stage, false))}
      </div>
    </div>
  );
}
