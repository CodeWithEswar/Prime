"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  Clock01Icon,
  SparklesIcon,
  Award01Icon,
  Route01Icon,
} from "@hugeicons/core-free-icons";

export interface CourseFocusRecommendation {
  type: "video" | "assignment" | "lab" | "exercise" | "course_completed";
  dayNumber: number;
  itemTitle: string;
  itemSubtitle: string;
  videoId?: string;
  exerciseId?: string;
  labSlug?: string;
  estimatedMinutes?: number;
}

interface CourseFocusCardProps {
  courseName: string;
  recommendation: CourseFocusRecommendation;
  onWatchVideo?: (videoId: string) => void;
  onToggleWatched?: (videoId: string) => void;
  onToggleAssignment?: (dayNumber: number) => void;
  onOpenLab?: (labSlug: string) => void;
  onSolveExercise?: (exerciseId: string) => void;
}

export function CourseFocusCard({
  courseName,
  recommendation,
  onWatchVideo,
  onToggleWatched,
  onToggleAssignment,
  onOpenLab,
  onSolveExercise,
}: CourseFocusCardProps) {
  if (recommendation.type === "course_completed") {
    return (
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#222222] bg-[#0E0E0E] p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF4D4D]">
            <Icon icon={Award01Icon} size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white sm:text-lg">
              All 12 {courseName} Days Completed!
            </h3>
            <p className="text-xs text-[#888888]">
              You have completed all curriculum lessons, practical exercises, and laboratories.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[#333333] bg-[#1A1A1A] px-3 py-1 text-xs font-semibold text-white">
          Ready for Interview
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#242424] bg-[#0D0D0D] p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-[#FF0000]/10 px-2 py-0.5 text-[11px] font-semibold text-[#FF4D4D]">
            <Icon icon={SparklesIcon} size={12} />
            NEXT RECOMMENDED STEP
          </span>
          <span className="text-xs text-[#777777]">{recommendation.itemSubtitle}</span>
        </div>

        <h3 className="text-base font-bold text-white sm:text-lg leading-snug">
          {recommendation.itemTitle}
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[#888888]">
          {recommendation.estimatedMinutes != null && (
            <>
              <span className="inline-flex items-center gap-1">
                <Icon icon={Clock01Icon} size={13} />
                {recommendation.estimatedMinutes} mins
              </span>
              <span>•</span>
            </>
          )}
          <span className="capitalize">{recommendation.type} checkpoint</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 shrink-0">
        {recommendation.type === "video" && recommendation.videoId && (
          <>
            <Button
              onClick={() => onWatchVideo?.(recommendation.videoId!)}
              className="h-8.5 bg-[#FF0000] px-4 text-xs font-semibold text-white hover:bg-[#D90000]"
            >
              <Icon icon={PlayIcon} size={13} className="mr-1.5 fill-white shrink-0" />
              Watch Video
            </Button>
            <Button
              variant="outline"
              onClick={() => onToggleWatched?.(recommendation.videoId!)}
              className="h-8.5 border-[#262626] bg-[#141414] px-3 text-xs font-medium text-white hover:bg-[#1E1E1E]"
            >
              <Icon icon={Tick02Icon} size={13} className="mr-1.5 text-[#666666]" />
              Mark Watched
            </Button>
          </>
        )}

        {recommendation.type === "assignment" && (
          <Button
            onClick={() => onToggleAssignment?.(recommendation.dayNumber)}
            className="h-8.5 bg-[#FF0000] px-4 text-xs font-semibold text-white hover:bg-[#D90000]"
          >
            <Icon icon={Tick02Icon} size={13} className="mr-1.5" />
            Complete Day Assignment
          </Button>
        )}

        {recommendation.type === "lab" && recommendation.labSlug && (
          <Button
            onClick={() => onOpenLab?.(recommendation.labSlug!)}
            className="h-8.5 bg-[#FF0000] px-4 text-xs font-semibold text-white hover:bg-[#D90000]"
          >
            <Icon icon={Route01Icon} size={13} className="mr-1.5" />
            Launch Laboratory
          </Button>
        )}

        {recommendation.type === "exercise" && recommendation.exerciseId && (
          <Button
            onClick={() => onSolveExercise?.(recommendation.exerciseId!)}
            className="h-8.5 bg-[#FF0000] px-4 text-xs font-semibold text-white hover:bg-[#D90000]"
          >
            <Icon icon={PlayIcon} size={13} className="mr-1.5 fill-white shrink-0" />
            Solve Exercise
          </Button>
        )}
      </div>
    </div>
  );
}

