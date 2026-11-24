"use client";

import Image from "next/image";
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
      <div className="relative overflow-hidden rounded-md border border-emerald-900/40 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-black p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 shadow-inner">
              <Icon icon={Award01Icon} size={24} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-700/60 bg-emerald-950/40 text-emerald-400 text-[10px] font-semibold rounded-md font-mono"
                >
                  COMPLETE
                </Badge>
                <span className="text-xs text-zinc-500">Curriculum Mastered</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                All 8 Python & DSA Stages Mastered
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl">
                You have reviewed all 43 canonical English lectures, solved hands-on algorithmic labs, and mastered full-stack Python data structures.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-zinc-800 bg-gradient-to-r from-zinc-900/60 via-zinc-950/80 to-black p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Thumbnail & Focus Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          {recommendation.type === "video" && recommendation.video && (
            <div
              onClick={() => onWatchVideo?.(recommendation.video!)}
              className="relative aspect-video w-full sm:w-44 shrink-0 rounded-md overflow-hidden bg-black border border-zinc-800 cursor-pointer group shadow-md"
            >
              <Image
                src={`https://i.ytimg.com/vi/${recommendation.video.youtubeVideoId}/hqdefault.jpg`}
                alt={recommendation.video.title}
                fill
                sizes="(max-width: 640px) 100vw, 176px"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                <span className="flex size-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Icon icon={PlayIcon} size={15} className="text-white fill-white ml-0.5" />
                </span>
              </div>
              <span className="absolute bottom-1.5 right-1.5 font-mono text-[10px] font-semibold text-zinc-200 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-zinc-800">
                {recommendation.video.estimatedMinutes}m
              </span>
            </div>
          )}

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-300 text-[10px] font-mono font-bold rounded-md"
              >
                TODAY&apos;S RECOMMENDED FOCUS · STAGE {recommendation.stageNumber}
              </Badge>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight truncate">
              {recommendation.title}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 max-w-2xl">
              {recommendation.description}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          {recommendation.type === "video" && recommendation.video && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onWatchVideo?.(recommendation.video!)}
                className="h-9 px-4 text-xs font-semibold rounded-md bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm"
              >
                <Icon icon={PlayIcon} size={14} className="mr-1.5" />
                Resume Lecture
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleWatched?.(recommendation.video!.youtubeVideoId)}
                className="h-9 text-xs rounded-md border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
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
              className="h-9 px-4 text-xs font-semibold rounded-md bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm"
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
              className="h-9 px-4 text-xs font-semibold rounded-md bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm"
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
