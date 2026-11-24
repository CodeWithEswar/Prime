"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  Award01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";
import type { PythonVideoItem } from "@/domain/python";

interface TodayFocusCardProps {
  recommendation: {
    type: "video" | "assignment" | "exercise";
    stageNumber: number;
    video?: PythonVideoItem;
    exerciseId?: string;
    title: string;
    description: string;
  };
  onWatchVideo?: (video: PythonVideoItem) => void;
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
                All 8 Python & DSA Stages Mastered
              </h3>
              <p className="text-xs text-[#A1A1AA] max-w-2xl">
                You have reviewed all 43 canonical English lectures, solved hands-on algorithmic labs, and mastered full-stack Python data structures.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--accent-border)] bg-gradient-to-r from-[#1A0A0A] via-[#100707] to-[#0A0A0A] p-5 sm:p-6 shadow-elevation-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--foreground)] text-[10px] font-mono font-bold"
            >
              TODAY&apos;S RECOMMENDED FOCUS · STAGE {recommendation.stageNumber}
            </Badge>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
            {recommendation.title}
          </h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2 max-w-3xl">
            {recommendation.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {recommendation.type === "video" && recommendation.video && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onWatchVideo?.(recommendation.video!)}
                className="h-9 px-4 text-xs font-semibold shadow-md"
              >
                <Icon icon={PlayIcon} size={14} className="mr-1.5" />
                Resume Lecture
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleWatched?.(recommendation.video!.youtubeVideoId)}
                className="h-9 text-xs border-[#2B2B33]"
              >
                <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
                Mark Watched
              </Button>
            </>
          )}

          {recommendation.type === "exercise" && recommendation.exerciseId && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSolveExercise?.(recommendation.exerciseId!)}
              className="h-9 px-4 text-xs font-semibold"
            >
              <Icon icon={SourceCodeIcon} size={14} className="mr-1.5" />
              Solve Lab
            </Button>
          )}

          {recommendation.type === "assignment" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onToggleAssignment?.(recommendation.stageNumber)}
              className="h-9 px-4 text-xs font-semibold"
            >
              <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
              Submit Assignment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
