"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  SparklesIcon,
  Award01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";

interface TodayFocusCardProps {
  recommendation: {
    type: "video" | "assignment" | "exercise";
    stageNumber: number;
    videoId?: string;
    videoTitle?: string;
    exerciseId?: string;
    title: string;
    description: string;
  };
  onWatchVideo?: (videoId: string) => void;
  onToggleWatched?: (videoId: string) => void;
  onToggleAssignment?: (stageNumber: number) => void;
  onSolveExercise?: (exerciseId: string) => void;
}

export function TodayFocusCard({
  recommendation,
  onWatchVideo,
  onToggleWatched,
  onToggleAssignment,
  onSolveExercise,
}: TodayFocusCardProps) {
  if (recommendation.title === "Curriculum Completed!") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#222222] bg-[#0E0E0E] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--foreground)] border border-[var(--accent-border)]">
            <Icon icon={Award01Icon} size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              All 8 Data Engineering Stages Mastered!
            </h3>
            <p className="text-xs text-[#888888]">
              You have completed all 54 lectures, distributed processing architectures, open table formats, and hands-on labs.
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto rounded-full border border-[#333333] bg-[#1A1A1A] px-3.5 py-1 text-xs font-semibold text-white">
          Senior Ready
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 sm:flex-row sm:items-center">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-[var(--accent-muted)] border border-[var(--accent-border)] px-2 py-0.5 text-[11px] font-semibold text-[var(--foreground)]">
            <Icon icon={SparklesIcon} size={12} />
            NEXT RECOMMENDED STEP
          </span>
          <span className="text-xs text-[#777777]">
            Stage {recommendation.stageNumber} Priority
          </span>
        </div>

        <h3 className="text-base font-bold text-white sm:text-lg">
          {recommendation.title}
        </h3>

        <p className="line-clamp-2 text-xs text-[#888888]">
          {recommendation.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 shrink-0">
        {recommendation.type === "video" && recommendation.videoId && (
          <>
            <Button
              onClick={() => onWatchVideo?.(recommendation.videoId!)}
              className="h-9 px-4 text-xs font-semibold"
            >
              <Icon icon={PlayIcon} size={14} className="mr-1.5" />
              Watch Lesson
            </Button>
            <Button
              variant="outline"
              onClick={() => onToggleWatched?.(recommendation.videoId!)}
              className="h-9 border-[#262626] bg-[#141414] px-3 text-xs font-medium text-white hover:bg-[#1E1E1E]"
            >
              <Icon icon={Tick02Icon} size={14} className="mr-1.5 text-[#555555]" />
              Mark Completed
            </Button>
          </>
        )}

        {recommendation.type === "assignment" && (
          <Button
            onClick={() => onToggleAssignment?.(recommendation.stageNumber)}
            className="h-9 px-4 text-xs font-semibold"
          >
            <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
            Complete Milestone
          </Button>
        )}

        {recommendation.type === "exercise" && recommendation.exerciseId && (
          <Button
            onClick={() => onSolveExercise?.(recommendation.exerciseId!)}
            className="h-9 px-4 text-xs font-semibold"
          >
            <Icon icon={SourceCodeIcon} size={14} className="mr-1.5" />
            Launch Lab
          </Button>
        )}
      </div>
    </div>
  );
}
