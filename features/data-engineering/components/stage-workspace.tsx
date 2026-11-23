"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  Bookmark01Icon,
  RotateRight01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  BookOpen01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";
import type {
  DataEngineeringStageSchedule,
  DataEngineeringVideoItem,
  DataEngineeringExercise,
  UserVideoProgress,
  UserStageProgress,
  UserExerciseAttempt,
} from "@/domain/data-engineering";

interface StageWorkspaceProps {
  stage: DataEngineeringStageSchedule;
  videos: DataEngineeringVideoItem[];
  exercises: DataEngineeringExercise[];
  videoProgress: Record<string, UserVideoProgress>;
  stageProgress: Record<number, UserStageProgress>;
  exerciseAttempts: Record<string, UserExerciseAttempt>;
  onWatchVideo: (videoId: string) => void;
  onToggleWatched: (videoId: string) => void;
  onToggleBookmark: (videoId: string) => void;
  onToggleRevision: (videoId: string) => void;
  onToggleAssignment: (stageNumber: number) => void;
  onSolveExercise: (exerciseId: string) => void;
}

export function StageWorkspace({
  stage,
  videos,
  exercises,
  videoProgress,
  stageProgress,
  exerciseAttempts,
  onWatchVideo,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
  onToggleAssignment,
  onSolveExercise,
}: StageWorkspaceProps) {
  const stageVideos = videos.filter((v) => v.stageNumber === stage.stageNumber);
  const stageExercises = exercises.filter(
    (e) => e.stageNumber === stage.stageNumber
  );
  const isAssignmentDone =
    !!stageProgress[stage.stageNumber]?.assignmentCompleted;

  return (
    <div className="space-y-6">
      {/* 1. Stage Overview Header */}
      <div className="rounded-xl border border-[#222222] bg-[#0E0E0E] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-[var(--accent-border)] bg-[var(--accent-muted)] font-mono text-[11px] text-[var(--foreground)]"
            >
              STAGE {String(stage.stageNumber).padStart(2, "0")}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-[#1A1A1A] text-[#A1A1AA] text-[11px]"
            >
              {stage.level}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
            <Icon icon={Clock01Icon} size={13} />
            <span>{stage.estimatedMinutes} minutes</span>
            <span>•</span>
            <span>{stageVideos.length} lectures</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {stage.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--accent)] font-medium">
            {stage.subtitle}
          </p>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#A1A1AA]">
            {stage.description}
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-[#1C1C1C] bg-[#0A0A0A] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2.5 flex items-center gap-1.5">
            <Icon icon={CheckmarkCircle02Icon} size={14} className="text-white" />
            Core Competencies & Learning Outcomes
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stage.learningOutcomes.map((outcome, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-[#D4D4D4] leading-normal"
              >
                <span className="mt-1 size-1.5 rounded-full bg-white shrink-0" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Modules & Video Lectures */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wider text-[#A1A1AA] uppercase flex items-center gap-2">
            <Icon icon={BookOpen01Icon} size={15} />
            Curriculum Modules & Video Lectures
          </h3>
          <span className="text-xs text-[#71717A]">
            {stage.modules.length} modules
          </span>
        </div>

        {stage.modules.map((mod) => {
          const modVideos = stageVideos.filter((v) => v.moduleId === mod.id);

          return (
            <div
              key={mod.id}
              className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] overflow-hidden"
            >
              {/* Module Header */}
              <div className="border-b border-[#1A1A1A] bg-[#0E0E0E] px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {mod.title}
                  </h4>
                  <span className="text-xs font-mono text-[#71717A]">
                    {modVideos.length} {modVideos.length === 1 ? "lecture" : "lectures"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#888888]">{mod.summary}</p>
              </div>

              {/* Videos list */}
              <div className="divide-y divide-[#161616]">
                {modVideos.map((video) => {
                  const prog = videoProgress[video.youtubeVideoId];
                  const isWatched = !!prog?.watched;
                  const isBookmarked = !!prog?.isBookmarked;
                  const isRevision = !!prog?.revisionDue;

                  return (
                    <div
                      key={video.youtubeVideoId}
                      className={cn(
                        "p-4 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between",
                        isWatched
                          ? "bg-[#090909] opacity-80 hover:opacity-100"
                          : "hover:bg-[#0E0E0E]"
                      )}
                    >
                      {/* Video info */}
                      <div className="flex gap-3.5 items-start min-w-0">
                        {/* Thumbnail preview with play overlay */}
                        <button
                          type="button"
                          onClick={() => onWatchVideo(video.youtubeVideoId)}
                          className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md border border-[#222222] bg-[#121212] group"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                            <span className="flex size-7 items-center justify-center rounded-full bg-white text-black shadow-md">
                              <Icon icon={PlayIcon} size={13} />
                            </span>
                          </div>
                          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 font-mono text-[9px] text-white">
                            {video.estimatedMinutes}m
                          </span>
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[10px] text-[#71717A]">
                              #{video.position}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px] px-1.5 py-0 font-medium",
                                video.difficulty === "Easy"
                                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                                  : video.difficulty === "Medium"
                                    ? "bg-amber-950/40 text-amber-400 border border-amber-900/50"
                                    : "bg-rose-950/40 text-rose-400 border border-rose-900/50"
                              )}
                            >
                              {video.difficulty}
                            </Badge>
                            {video.importance === "Critical" && (
                              <Badge
                                variant="outline"
                                className="border-rose-900/60 bg-rose-950/30 text-[10px] text-rose-300 px-1.5 py-0"
                              >
                                Core Interview
                              </Badge>
                            )}
                          </div>

                          <h5
                            onClick={() => onWatchVideo(video.youtubeVideoId)}
                            className={cn(
                              "text-xs sm:text-sm font-semibold cursor-pointer transition-colors hover:text-white line-clamp-2",
                              isWatched ? "text-[#999999]" : "text-white"
                            )}
                          >
                            {video.title}
                          </h5>

                          <p className="text-[11px] text-[#71717A]">
                            {video.channel}
                          </p>

                          {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                            <ul className="mt-1 space-y-0.5 hidden sm:block">
                              {video.keyTakeaways.slice(0, 2).map((takeaway, kIdx) => (
                                <li
                                  key={kIdx}
                                  className="text-[11px] text-[#888888] line-clamp-1 flex items-center gap-1.5"
                                >
                                  <span className="size-1 rounded-full bg-[#52525B]" />
                                  <span>{takeaway}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Video Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleBookmark(video.youtubeVideoId)}
                          className={cn(
                            "size-8 rounded border border-transparent hover:border-[#262626]",
                            isBookmarked
                              ? "text-amber-400 hover:text-amber-300"
                              : "text-[#71717A] hover:text-white"
                          )}
                          title={isBookmarked ? "Remove Bookmark" : "Bookmark Lesson"}
                        >
                          <Icon icon={Bookmark01Icon} size={15} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleRevision(video.youtubeVideoId)}
                          className={cn(
                            "size-8 rounded border border-transparent hover:border-[#262626]",
                            isRevision
                              ? "text-sky-400 hover:text-sky-300"
                              : "text-[#71717A] hover:text-white"
                          )}
                          title={isRevision ? "Remove from Revision" : "Mark for Revision"}
                        >
                          <Icon icon={RotateRight01Icon} size={15} />
                        </Button>

                        <Button
                          variant={isWatched ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => onToggleWatched(video.youtubeVideoId)}
                          className={cn(
                            "h-8 text-xs font-medium px-2.5",
                            isWatched
                              ? "bg-white text-black hover:bg-neutral-200"
                              : "border-[#262626] bg-[#141414] text-white hover:bg-[#1E1E1E]"
                          )}
                        >
                          <Icon
                            icon={Tick02Icon}
                            size={14}
                            className={cn(
                              "mr-1.5",
                              isWatched ? "text-black" : "text-[#71717A]"
                            )}
                          />
                          {isWatched ? "Completed" : "Complete"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Practical Capstone Assignment */}
      <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-wider text-[#A1A1AA] uppercase flex items-center gap-2">
            <Icon icon={SourceCodeIcon} size={16} />
            Stage {stage.stageNumber} Capstone Milestone
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2.5 py-0.5 font-medium",
              isAssignmentDone
                ? "border-emerald-900 bg-emerald-950/40 text-emerald-400"
                : "border-[#333333] bg-[#18181B] text-[#A1A1AA]"
            )}
          >
            {isAssignmentDone ? "Verified Completed" : "Pending Verification"}
          </Badge>
        </div>

        <div>
          <h4 className="text-base font-bold text-white">
            {stage.practicalAssignment.title}
          </h4>
          <p className="mt-1 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            {stage.practicalAssignment.description}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#1C1C1C]">
          <span className="text-xs text-[#71717A]">
            Architectural implementation artifact check
          </span>
          <Button
            onClick={() => onToggleAssignment(stage.stageNumber)}
            variant={isAssignmentDone ? "secondary" : "primary"}
            size="sm"
            className="h-8 text-xs font-semibold"
          >
            <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
            {isAssignmentDone ? "Mark Incomplete" : "Verify Milestone"}
          </Button>
        </div>
      </div>

      {/* 4. Stage Hands-on Labs & Exercises preview */}
      {stageExercises.length > 0 && (
        <div className="rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
              <Icon icon={SourceCodeIcon} size={14} className="text-white" />
              Stage Hands-On Labs ({stageExercises.length})
            </h4>
            <span className="text-xs text-[#71717A]">Interactive coding & pipelines</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stageExercises.map((ex) => {
              const attempt = exerciseAttempts[ex.id];
              const isSolved = attempt?.status === "solved";

              return (
                <div
                  key={ex.id}
                  className="rounded-lg border border-[#1E1E1E] bg-[#0E0E0E] p-3.5 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#888888]">
                        {ex.topic}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {ex.difficulty}
                      </Badge>
                    </div>
                    <h5 className="mt-1 text-xs font-semibold text-white">
                      {ex.title}
                    </h5>
                    <p className="mt-1 text-[11px] text-[#888888] line-clamp-2">
                      {ex.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#181818]">
                    <span className="text-[10px] text-[#71717A]">
                      ~{ex.estimatedMinutes} min
                    </span>
                    <Button
                      size="sm"
                      variant={isSolved ? "secondary" : "outline"}
                      onClick={() => onSolveExercise(ex.id)}
                      className="h-7 text-[11px] px-2.5"
                    >
                      <Icon icon={SourceCodeIcon} size={12} className="mr-1" />
                      {isSolved ? "Solved" : "Open Lab"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
