"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  BookOpen01Icon,
  SourceCodeIcon,
  Award01Icon,
} from "@hugeicons/core-free-icons";
import type {
  PythonStageSchedule,
  PythonVideoItem,
  PythonExercise,
  UserVideoProgress,
  UserStageProgress,
  UserExerciseAttempt,
} from "@/domain/python";

interface StageWorkspaceProps {
  stage: PythonStageSchedule;
  videos: PythonVideoItem[];
  exercises: PythonExercise[];
  videoProgress: Record<string, UserVideoProgress>;
  stageProgress: Record<number, UserStageProgress>;
  exerciseAttempts: Record<string, UserExerciseAttempt>;
  onWatchVideo: (video: PythonVideoItem) => void;
  onToggleWatched: (videoId: string) => void;
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
  onToggleAssignment,
  onSolveExercise,
}: StageWorkspaceProps) {
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});

  const stageVideos = videos.filter((v) => v.stageNumber === stage.stageNumber);
  const stageExercises = exercises.filter((e) => e.stageNumber === stage.stageNumber);
  const isAssignmentDone = !!stageProgress[stage.stageNumber]?.practicalAssignmentSubmitted;

  const toggleQuestionReveal = (qId: string) => {
    setRevealedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Stage Overview Header Card */}
      <div className="relative overflow-hidden rounded-md border border-zinc-800 bg-gradient-to-b from-zinc-900/60 via-zinc-950/80 to-black p-5 sm:p-6 lg:p-7 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-zinc-700 bg-zinc-900 font-mono text-[11px] font-bold text-zinc-100 rounded-md"
            >
              STAGE {stage.stageNumber.toString().padStart(2, "0")}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-mono rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
              {stage.level}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Icon icon={Clock01Icon} size={13} className="text-zinc-500" />
            <span>~{Math.round(stage.estimatedMinutes / 60)} hours curriculum</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            {stage.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-4xl">
            {stage.description}
          </p>
        </div>

        {/* Learning Outcomes */}
        {stage.learningOutcomes.length > 0 && (
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block font-semibold">
              Stage Core Competencies
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stage.learningOutcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-zinc-300 bg-zinc-900/50 p-2.5 rounded-md border border-zinc-800"
                >
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    size={14}
                    className="text-zinc-400 shrink-0 mt-0.5"
                  />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Structured Modules & Video Lessons with Thumbnails */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Icon icon={BookOpen01Icon} size={16} className="text-zinc-400" />
            Curriculum Modules & Verified Video Lessons ({stageVideos.length})
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            Language: Pure English
          </span>
        </div>

        <div className="space-y-4">
          {stage.modules.map((mod) => (
            <div
              key={mod.id}
              className="rounded-md border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-lg"
            >
              <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100 tracking-tight">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{mod.summary}</p>
                </div>
                <Badge variant="outline" className="text-[10px] self-start sm:self-auto border-zinc-800 bg-zinc-900 text-zinc-300 rounded-md font-mono">
                  {mod.videos.length} lectures
                </Badge>
              </div>

              <div className="divide-y divide-zinc-800/80">
                {mod.videos.map((vid) => {
                  const isWatched = !!videoProgress[vid.youtubeVideoId]?.watched;

                  return (
                    <div
                      key={`${mod.id}-${vid.position}-${vid.youtubeVideoId}`}
                      className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-3.5 sm:gap-4 hover:bg-zinc-900/40 transition-colors group"
                    >
                      {/* Left: Video Thumbnail & Details */}
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Video Thumbnail (16:9 responsive) */}
                        <div
                          onClick={() => onWatchVideo(vid)}
                          className="relative aspect-video w-full sm:w-44 lg:w-48 shrink-0 rounded-md overflow-hidden bg-black border border-zinc-800 group-hover:border-zinc-700 transition-all cursor-pointer shadow-md"
                        >
                          <Image
                            src={`https://i.ytimg.com/vi/${vid.youtubeVideoId}/hqdefault.jpg`}
                            alt={vid.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 192px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                          {/* Dark vignette overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                          {/* Center Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                            <span className="flex size-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-lg group-hover:scale-110 transition-transform">
                              <Icon icon={PlayIcon} size={15} className="text-white fill-white ml-0.5" />
                            </span>
                          </div>

                          {/* Duration Badge Bottom Right */}
                          <span className="absolute bottom-1.5 right-1.5 font-mono text-[10px] font-semibold text-zinc-200 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-zinc-800">
                            {vid.estimatedMinutes}m
                          </span>

                          {/* Watched Status Badge Top Left */}
                          {isWatched && (
                            <span className="absolute top-1.5 left-1.5 flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-400 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-emerald-800/60 shadow">
                              <Icon icon={Tick02Icon} size={10} />
                              DONE
                            </span>
                          )}
                        </div>

                        {/* Video Metadata & Takeaways */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] text-zinc-400 font-semibold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-sm">
                              #{vid.position.toString().padStart(2, "0")}
                            </span>
                            <span
                              className={cn(
                                "font-mono text-[10px] px-1.5 py-0.5 rounded-sm font-medium border",
                                vid.difficulty === "Easy" && "text-emerald-400 bg-emerald-950/40 border-emerald-800/40",
                                vid.difficulty === "Medium" && "text-amber-400 bg-amber-950/40 border-amber-800/40",
                                vid.difficulty === "Hard" && "text-red-400 bg-red-950/40 border-red-800/40"
                              )}
                            >
                              {vid.difficulty}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400 truncate">
                              {vid.channel}
                            </span>
                          </div>

                          <h5
                            onClick={() => onWatchVideo(vid)}
                            className={cn(
                              "text-xs sm:text-sm font-semibold cursor-pointer hover:text-white transition-colors leading-snug",
                              isWatched ? "line-through text-zinc-500" : "text-zinc-100"
                            )}
                          >
                            {vid.title}
                          </h5>

                          {/* Key Takeaways */}
                          {vid.keyTakeaways && vid.keyTakeaways.length > 0 && (
                            <ul className="pt-0.5 space-y-0.5">
                              {vid.keyTakeaways.slice(0, 2).map((takeaway, tIdx) => (
                                <li key={tIdx} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                                  <span className="size-1 rounded-full bg-zinc-600 shrink-0" />
                                  <span className="line-clamp-1">{takeaway}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60 w-full md:w-auto justify-between md:justify-end">
                        <button
                          type="button"
                          onClick={() => onToggleWatched(vid.youtubeVideoId)}
                          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                          title={isWatched ? "Mark unwatched" : "Mark watched"}
                        >
                          <span
                            className={cn(
                              "size-4 rounded-sm flex items-center justify-center border transition-colors",
                              isWatched
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                            )}
                          >
                            {isWatched && <Icon icon={Tick02Icon} size={11} />}
                          </span>
                          <span className="text-[11px] font-mono">{isWatched ? "Completed" : "Mark Done"}</span>
                        </button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onWatchVideo(vid)}
                          className="h-8 text-xs px-3 rounded-md border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-850"
                        >
                          <Icon icon={PlayIcon} size={12} className="mr-1.5 text-zinc-300" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Stage Hands-on Labs & Coding Practice */}
      {stageExercises.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Icon icon={SourceCodeIcon} size={15} className="text-zinc-400" />
              Stage Hands-On Labs ({stageExercises.length})
            </h4>
            <span className="text-xs font-mono text-zinc-500">
              Practical algorithms & code templates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stageExercises.map((ex) => {
              const attempt = exerciseAttempts[ex.id];
              const isSolved = attempt?.status === "completed";

              return (
                <div
                  key={ex.id}
                  className="rounded-md border border-zinc-800 bg-zinc-950/80 p-4 flex flex-col justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-zinc-400 font-semibold bg-zinc-900 px-2 py-0.5 rounded-sm border border-zinc-800">
                        {ex.topic}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {ex.difficulty}
                      </Badge>
                    </div>

                    <h5 className="text-xs font-bold text-zinc-100 tracking-tight">
                      {ex.title}
                    </h5>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80">
                    <span className="text-[10px] font-mono text-zinc-500">
                      ~{ex.estimatedMinutes} mins
                    </span>
                    <Button
                      size="sm"
                      variant={isSolved ? "secondary" : "outline"}
                      onClick={() => onSolveExercise(ex.id)}
                      className="h-7 text-xs px-2.5 rounded-md border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
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

      {/* 4. High-Yield Interview Questions */}
      {stage.interviewQuestions && stage.interviewQuestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Icon icon={Award01Icon} size={15} className="text-zinc-400" />
              High-Yield Interview Questions ({stage.interviewQuestions.length})
            </h4>
            <span className="text-xs font-mono text-zinc-500">
              FAANG & top tech evaluations
            </span>
          </div>

          <div className="space-y-2.5">
            {stage.interviewQuestions.map((q) => {
              const isRevealed = !!revealedQuestions[q.id];

              return (
                <div
                  key={q.id}
                  className="rounded-md border border-zinc-800 bg-zinc-950/80 p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded-sm border border-zinc-800">
                          {q.category}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                          {q.importance}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-zinc-100 leading-snug">
                        {q.question}
                      </h5>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleQuestionReveal(q.id)}
                      className="h-7 text-[11px] rounded-md border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white shrink-0"
                    >
                      {isRevealed ? "Hide Answer" : "Reveal Answer"}
                    </Button>
                  </div>

                  {isRevealed && (
                    <div className="pt-2 border-t border-zinc-800 space-y-2 animate-in fade-in duration-150">
                      <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-md border border-zinc-800">
                        {q.answer}
                      </p>
                      {q.codeSnippet && (
                        <pre className="font-mono text-[11px] text-emerald-400 bg-black/80 p-2.5 rounded-md border border-zinc-800 overflow-x-auto">
                          {q.codeSnippet}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Stage Practical Capstone Assignment */}
      <div className="rounded-md border border-zinc-800 bg-gradient-to-r from-zinc-900/60 via-zinc-950/80 to-black p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              STAGE {stage.stageNumber} CAPSTONE
            </span>
            {isAssignmentDone && (
              <Badge variant="secondary" className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded-md">
                Completed
              </Badge>
            )}
          </div>
          <h4 className="text-sm font-bold text-zinc-100">
            {stage.practicalAssignment.title}
          </h4>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            {stage.practicalAssignment.description}
          </p>
        </div>

        <Button
          variant={isAssignmentDone ? "secondary" : "primary"}
          size="sm"
          onClick={() => onToggleAssignment(stage.stageNumber)}
          className={cn(
            "h-9 px-4 text-xs shrink-0 self-start sm:self-center rounded-md font-semibold transition-colors",
            isAssignmentDone
              ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
              : "bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm"
          )}
        >
          <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
          {isAssignmentDone ? "Assignment Submitted" : "Submit Capstone"}
        </Button>
      </div>
    </div>
  );
}
