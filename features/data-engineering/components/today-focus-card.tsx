"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  SparklesIcon,
  Award01Icon,
  SourceCodeIcon,
  CheckmarkBadge01Icon,
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
      <div className="relative overflow-hidden rounded-xl border border-emerald-900/40 bg-gradient-to-r from-[#06150C] via-[#0A0E0C] to-[#0A0A0A] p-5 sm:p-6 shadow-elevation-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 shadow-inner">
              <Icon icon={Award01Icon} size={24} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-700/60 bg-emerald-950/40 text-emerald-400 text-[10px] font-semibold"
                >
                  COMPLETE
                </Badge>
                <span className="text-xs text-[#71717A]">Curriculum Mastered</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                All 8 Data Engineering Stages Mastered
              </h3>
              <p className="text-xs text-[#A1A1AA] max-w-2xl">
                You have reviewed all 54 canonical lectures, solved hands-on lakehouse and streaming labs, and validated production architecture patterns.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto rounded-lg border border-emerald-800/40 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
            Senior Pipeline Ready
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-gradient-to-r from-[#140A0A] via-[#0E0B0B] to-[#0A0A0A] p-4 sm:p-5 lg:p-6 shadow-elevation-2">
      {/* Subtle ambient highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left column: Context & Recommendation */}
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-muted)] border border-[var(--accent-border)] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent)] shadow-sm">
              <Icon icon={SparklesIcon} size={12} className="animate-pulse" />
              RECOMMENDED NEXT STEP
            </span>
            <span className="text-xs font-mono text-[#71717A]">
              Stage {recommendation.stageNumber} Priority
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            {recommendation.title}
          </h3>

          <p className="line-clamp-2 text-xs text-[#A1A1AA] leading-relaxed max-w-3xl">
            {recommendation.description}
          </p>
        </div>

        {/* Right column: Action buttons (Touch-friendly & Responsive) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
          {recommendation.type === "video" && recommendation.videoId && (
            <>
              <Button
                onClick={() => onWatchVideo?.(recommendation.videoId!)}
                size="sm"
                className="w-full sm:w-auto h-9 px-4 text-xs font-semibold bg-white text-black hover:bg-neutral-200 shadow-sm"
              >
                <Icon icon={PlayIcon} size={14} className="mr-1.5 text-black" />
                Watch Lesson
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleWatched?.(recommendation.videoId!)}
                className="w-full sm:w-auto h-9 border-[#27272A] bg-[#121214] px-3.5 text-xs font-medium text-[#E4E4E7] hover:bg-[#1C1C20] hover:text-white"
              >
                <Icon icon={Tick02Icon} size={14} className="mr-1.5 text-[#71717A]" />
                Mark Completed
              </Button>
            </>
          )}

          {recommendation.type === "assignment" && (
            <Button
              onClick={() => onToggleAssignment?.(recommendation.stageNumber)}
              size="sm"
              className="w-full sm:w-auto h-9 px-4 text-xs font-semibold bg-white text-black hover:bg-neutral-200"
            >
              <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1.5 text-black" />
              Verify Milestone
            </Button>
          )}

          {recommendation.type === "exercise" && recommendation.exerciseId && (
            <Button
              onClick={() => onSolveExercise?.(recommendation.exerciseId!)}
              size="sm"
              className="w-full sm:w-auto h-9 px-4 text-xs font-semibold bg-white text-black hover:bg-neutral-200"
            >
              <Icon icon={SourceCodeIcon} size={14} className="mr-1.5 text-black" />
              Open Lab Workbench
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
