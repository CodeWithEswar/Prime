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
      {/* 1. Stage Overview Header Card */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-gradient-to-b from-[#110A0A] via-[#0D0D0F] to-[#0A0A0A] p-5 sm:p-6 lg:p-7 space-y-4 shadow-elevation-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-[var(--accent-border)] bg-[var(--accent-muted)] font-mono text-[11px] font-bold text-[var(--foreground)]"
            >
              STAGE {String(stage.stageNumber).padStart(2, "0")} OF 08
            </Badge>
            <Badge
              variant="secondary"
              className="bg-[#18181B] text-[#D4D4D8] border border-[#27272A] text-[11px]"
            >
              {stage.level}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
            <Icon icon={Clock01Icon} size={13} className="text-[#71717A]" />
            <span>{Math.round(stage.estimatedMinutes / 60)} hours total</span>
            <span>•</span>
            <span>{stageVideos.length} lectures</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
            {stage.title}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--accent)] font-medium">
            {stage.subtitle}
          </p>
          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#A1A1AA] max-w-4xl">
            {stage.description}
          </p>
        </div>

        {/* Learning Outcomes Checklist */}
        <div className="rounded-lg border border-[#1F1F23] bg-[#09090B] p-4 sm:p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-3 flex items-center gap-2">
            <Icon icon={CheckmarkCircle02Icon} size={15} className="text-white" />
            Core Competencies & Senior Engineering Outcomes
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {stage.learningOutcomes.map((outcome, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-[#D4D4D8] leading-relaxed"
              >
                <span className="mt-1.5 size-1.5 rounded-full bg-white shrink-0" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Modules & Verified Video Lectures */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#A1A1AA] uppercase flex items-center gap-2">
            <Icon icon={BookOpen01Icon} size={16} />
            Curriculum Modules & Video Lectures
          </h3>
          <span className="text-xs font-mono text-[#71717A]">
            {stage.modules.length} modules • {stageVideos.length} lessons
          </span>
        </div>

        {stage.modules.map((mod) => {
          const modVideos = stageVideos.filter((v) => v.moduleId === mod.id);

          return (
            <div
              key={mod.id}
              className="rounded-xl border border-[#1E1E22] bg-[#0A0A0C] overflow-hidden shadow-sm"
            >
              {/* Module Sub-Header */}
              <div className="border-b border-[#1A1A1E] bg-[#0E0E12] px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-white" />
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {mod.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-[#71717A] bg-[#141418] px-2 py-0.5 rounded border border-[#222226]">
                    {modVideos.length} {modVideos.length === 1 ? "lecture" : "lectures"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#888888] leading-relaxed">
                  {mod.summary}
                </p>
              </div>

              {/* Videos list */}
              <div className="divide-y divide-[#151518]">
                {modVideos.map((video) => {
                  const prog = videoProgress[video.youtubeVideoId];
                  const isWatched = !!prog?.watched;
                  const isBookmarked = !!prog?.isBookmarked;
                  const isRevision = !!prog?.revisionDue;

                  return (
                    <div
                      key={video.youtubeVideoId}
                      className={cn(
                        "p-4 sm:p-5 transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between",
                        isWatched
                          ? "bg-[#08080A] opacity-85 hover:opacity-100"
                          : "hover:bg-[#0D0D10]"
                      )}
                    >
                      {/* Video visual & details */}
                      <div className="flex flex-col sm:flex-row gap-3.5 items-start min-w-0 flex-1">
                        {/* 16:9 Thumbnail preview with play badge */}
                        <button
                          type="button"
                          onClick={() => onWatchVideo(video.youtubeVideoId)}
                          className="relative aspect-video w-full sm:w-44 md:w-48 shrink-0 overflow-hidden rounded-lg border border-[#222226] bg-[#121214] group select-none"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/20">
                            <span className="flex size-8 items-center justify-center rounded-full bg-white text-black shadow-lg">
                              <Icon icon={PlayIcon} size={14} />
                            </span>
                          </div>
                          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">
                            {video.estimatedMinutes}m
                          </span>
                        </button>

                        <div className="space-y-1.5 min-w-0 flex-1">
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
                                className="border-rose-900/60 bg-rose-950/30 text-[10px] text-rose-300 px-1.5 py-0 font-semibold"
                              >
                                Core Architectural Priority
                              </Badge>
                            )}
                            <span className="text-[11px] text-[#71717A] ml-auto hidden sm:inline">
                              {video.channel}
                            </span>
                          </div>

                          <h5
                            onClick={() => onWatchVideo(video.youtubeVideoId)}
                            className={cn(
                              "text-xs sm:text-sm font-semibold cursor-pointer transition-colors hover:text-white leading-snug line-clamp-2",
                              isWatched ? "text-[#A1A1AA]" : "text-white"
                            )}
                          >
                            {video.title}
                          </h5>

                          <p className="text-[11px] text-[#71717A] sm:hidden">
                            {video.channel}
                          </p>

                          {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                            <ul className="mt-1 space-y-1 hidden sm:block">
                              {video.keyTakeaways.slice(0, 2).map((takeaway, kIdx) => (
                                <li
                                  key={kIdx}
                                  className="text-[11px] text-[#888888] line-clamp-1 flex items-center gap-1.5"
                                >
                                  <span className="size-1 rounded-full bg-[#52525B] shrink-0" />
                                  <span>{takeaway}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Video Actions Toolbar */}
                      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t border-[#18181A] md:border-t-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleBookmark(video.youtubeVideoId)}
                          className={cn(
                            "size-8 rounded-md border border-transparent hover:border-[#2C2C32]",
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
                            "size-8 rounded-md border border-transparent hover:border-[#2C2C32]",
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
                            "h-8 text-xs font-medium px-3",
                            isWatched
                              ? "bg-white text-black hover:bg-neutral-200"
                              : "border-[#27272A] bg-[#121214] text-white hover:bg-[#1C1C20]"
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

      {/* 3. Practical Capstone Assignment Card */}
      <div className="relative overflow-hidden rounded-xl border border-[#222226] bg-[#0B0B0E] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded bg-white/10 text-white">
              <Icon icon={SourceCodeIcon} size={14} />
            </span>
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
              Stage {stage.stageNumber} Capstone Milestone Deliverable
            </h3>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2.5 py-0.5 font-medium",
              isAssignmentDone
                ? "border-emerald-800 bg-emerald-950/40 text-emerald-400"
                : "border-[#2E2E33] bg-[#141418] text-[#A1A1AA]"
            )}
          >
            {isAssignmentDone ? "Verified Completed" : "Pending Architecture Review"}
          </Badge>
        </div>

        <div>
          <h4 className="text-base font-bold text-white tracking-tight">
            {stage.practicalAssignment.title}
          </h4>
          <p className="mt-1.5 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-3xl">
            {stage.practicalAssignment.description}
          </p>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#1C1C20]">
          <span className="text-xs text-[#71717A]">
            Verify your architecture design, local docker environment, and pipeline code.
          </span>
          <Button
            onClick={() => onToggleAssignment(stage.stageNumber)}
            variant={isAssignmentDone ? "secondary" : "primary"}
            size="sm"
            className="h-8 text-xs font-semibold shrink-0"
          >
            <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
            {isAssignmentDone ? "Mark Incomplete" : "Verify Milestone"}
          </Button>
        </div>
      </div>

      {/* 4. Stage Hands-on Labs & Exercises preview */}
      {stageExercises.length > 0 && (
        <div className="rounded-xl border border-[#1E1E22] bg-[#0A0A0C] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
              <Icon icon={SourceCodeIcon} size={14} className="text-white" />
              Stage Hands-On Labs ({stageExercises.length})
            </h4>
            <span className="text-xs font-mono text-[#71717A]">Interactive coding & pipelines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stageExercises.map((ex) => {
              const attempt = exerciseAttempts[ex.id];
              const isSolved = attempt?.status === "solved";

              return (
                <div
                  key={ex.id}
                  className="rounded-lg border border-[#1E1E24] bg-[#0C0C10] p-4 flex flex-col justify-between gap-3 transition-colors hover:border-[#2C2C33]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[var(--accent)] font-medium">
                        {ex.topic}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {ex.difficulty}
                      </Badge>
                    </div>
                    <h5 className="mt-1.5 text-xs font-semibold text-white tracking-tight">
                      {ex.title}
                    </h5>
                    <p className="mt-1 text-[11px] text-[#888888] line-clamp-2 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#18181E]">
                    <span className="text-[10px] font-mono text-[#71717A]">
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
