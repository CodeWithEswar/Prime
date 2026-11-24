"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Tick02Icon, PlayIcon, Clock01Icon } from "@hugeicons/core-free-icons";
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
  const renderStageCard = (stage: DataEngineeringStageSchedule, isMobileScroll = false) => {
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
              : "border-[#1E1E22] bg-[#09090B] hover:border-[#2E2E33] hover:bg-[#0D0D10]"
        )}
      >
        {/* Top bar with stage badge & status icon */}
        <div className="flex items-center justify-between gap-1.5">
          <span
            className={cn(
              "font-mono text-[10px] font-bold tracking-wider",
              isCurrent
                ? "text-[var(--accent)]"
                : isComplete
                  ? "text-white"
                  : "text-[#71717A]"
            )}
          >
            STAGE {String(stage.stageNumber).padStart(2, "0")}
          </span>

          {isComplete ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-black shadow-sm">
              <Icon icon={Tick02Icon} size={12} strokeWidth={2.5} />
            </span>
          ) : isCurrent ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/40 animate-pulse">
              <Icon icon={PlayIcon} size={11} />
            </span>
          ) : (
            <span className="font-mono text-[10px] text-[#71717A]">
              {watchedCount}/{stageVideos.length}
            </span>
          )}
        </div>

        {/* Title and metadata */}
        <div className="my-2.5">
          <p
            className={cn(
              "line-clamp-2 text-xs font-semibold leading-snug transition-colors",
              isCurrent
                ? "text-white"
                : isComplete
                  ? "text-[#E4E4E7] group-hover:text-white"
                  : "text-[#A1A1AA] group-hover:text-white"
            )}
          >
            {stage.title}
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#71717A]">
            <span className="truncate">{stage.level}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5 shrink-0">
              <Icon icon={Clock01Icon} size={11} />
              {Math.round(stage.estimatedMinutes / 60)}h
            </span>
          </div>
        </div>

        {/* Progress bar pill */}
        <div className="mt-auto pt-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-[#71717A] mb-1">
            <span>{progressPercent}%</span>
            <span>{stageVideos.length} lessons</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#18181B]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isComplete
                  ? "bg-white"
                  : isCurrent
                    ? "bg-gradient-to-r from-[var(--accent)] to-[#FF4D4D]"
                    : "bg-[#3F3F46] group-hover:bg-[#52525B]"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <h2 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase">
            8-Stage Industry Milestone Progression
          </h2>
        </div>
        <span className="text-xs text-[#71717A] hidden sm:inline">
          Tap any milestone to inspect modules, verified lectures & hands-on systems
        </span>
      </div>

      {/* Mobile-optimized horizontal snap slider (< 640px) */}
      <div className="flex sm:hidden gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-3 px-3">
        {stages.map((stage) => renderStageCard(stage, true))}
      </div>

      {/* Responsive Grid for Tablets (2-to-4 cols) & Desktops (8 cols) */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {stages.map((stage) => renderStageCard(stage, false))}
      </div>
    </div>
  );
}
