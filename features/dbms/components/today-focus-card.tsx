"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  Clock01Icon,
  SparklesIcon,
  Award01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import type { NextRecommendation } from "@/domain/dbms";

interface TodayFocusCardProps {
  recommendation: NextRecommendation;
  onWatchVideo?: (videoId: string) => void;
  onToggleWatched?: (videoId: string) => void;
  onToggleAssignment?: (dayNumber: number) => void;
  onSolveExercise?: (exerciseId: string) => void;
}

export function TodayFocusCard({
  recommendation,
  onWatchVideo,
  onToggleWatched,
  onToggleAssignment,
  onSolveExercise,
}: TodayFocusCardProps) {
  if (recommendation.type === "course_completed") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-[#222222] bg-[#0E0E0E] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF4D4D]">
            <Icon icon={Award01Icon} size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">All 12 DBMS Days Completed!</h3>
            <p className="text-xs text-[#888888]">
              You have completed the entire 91-video syllabus, normalization, concurrency, and SQL labs.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[#333333] bg-[#1A1A1A] px-3 py-1 text-xs font-semibold text-white">
          Ready for Interview
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 sm:flex-row sm:items-center">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-[#FF0000]/10 px-2 py-0.5 text-[11px] font-semibold text-[#FF4D4D]">
            <Icon icon={SparklesIcon} size={12} />
            NEXT RECOMMENDED STEP
          </span>
          <span className="text-xs text-[#777777]">{recommendation.itemSubtitle}</span>
        </div>

        <h3 className="text-base font-bold text-white sm:text-lg">
          {recommendation.itemTitle}
        </h3>

        <div className="flex items-center gap-3 text-xs text-[#888888]">
          <span className="inline-flex items-center gap-1">
            <Icon icon={Clock01Icon} size={13} />
            {recommendation.estimatedMinutes} mins
          </span>
          <span>•</span>
          <span className="capitalize">{recommendation.type} checkpoint</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
        {recommendation.type === "video" && recommendation.videoId && (
          <>
            <Button
              onClick={() => onWatchVideo?.(recommendation.videoId!)}
              className="h-9 bg-[#FF0000] px-4 text-xs font-semibold text-white hover:bg-[#D90000]"
            >
              <Icon icon={PlayIcon} size={14} className="mr-1.5" />
              Watch Video
            </Button>
            <Button
              variant="outline"
              onClick={() => onToggleWatched?.(recommendation.videoId!)}
              className="h-9 border-[#262626] bg-[#141414] px-3 text-xs font-medium text-white hover:bg-[#1E1E1E]"
            >
              <Icon icon={Tick02Icon} size={14} className="mr-1.5 text-[#555555]" />
              Mark Watched
            </Button>
          </>
        )}

        {recommendation.type === "assignment" && (
          <Button
            onClick={() => onToggleAssignment?.(recommendation.dayNumber)}
            className="h-9 bg-[#FF0000] px-4 text-xs font-semibold text-white hover:bg-[#D90000]"
          >
            <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
            Complete Assignment
          </Button>
        )}

        {recommendation.type === "exercise" && recommendation.exerciseId && (
          <Button
            onClick={() => onSolveExercise?.(recommendation.exerciseId!)}
            className="h-9 bg-[#FF0000] px-4 text-xs font-semibold text-white hover:bg-[#D90000]"
          >
            <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
            Mark Exercise Solved
          </Button>
        )}
      </div>
    </div>
  );
}

