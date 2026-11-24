"use client";

import { useState } from "react";
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
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-gradient-to-b from-[#110A0A] via-[#0D0D0F] to-[#0A0A0A] p-5 sm:p-6 lg:p-7 space-y-4 shadow-elevation-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-[var(--accent-border)] bg-[var(--accent-muted)] font-mono text-[11px] font-bold text-[var(--foreground)]"
            >
              STAGE {stage.stageNumber.toString().padStart(2, "0")}
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              {stage.level}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
            <Icon icon={Clock01Icon} size={13} className="text-[#71717A]" />
            <span>~{Math.round(stage.estimatedMinutes / 60)} hours total</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {stage.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-4xl">
            {stage.description}
          </p>
        </div>

        {/* Learning Outcomes */}
        {stage.learningOutcomes.length > 0 && (
          <div className="pt-3 border-t border-[#1C1C22] space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] block font-semibold">
              Stage Core Competencies
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stage.learningOutcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-[#E4E4E7] bg-[#121216] p-2.5 rounded-lg border border-[#1E1E24]"
                >
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    size={14}
                    className="text-[var(--accent)] shrink-0 mt-0.5"
                  />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Structured Modules & Video Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Icon icon={BookOpen01Icon} size={16} className="text-[var(--accent)]" />
            Curriculum Modules & Verified Video Lessons ({stageVideos.length})
          </h3>
          <span className="text-xs font-mono text-[#71717A]">
            Language: Pure English
          </span>
        </div>

        <div className="space-y-4">
          {stage.modules.map((mod) => (
            <div
              key={mod.id}
              className="rounded-xl border border-[#1E1E24] bg-[#0A0A0E] overflow-hidden"
            >
              <div className="p-4 bg-[#0E0E14] border-b border-[#1A1A22] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-[#888888] mt-0.5">{mod.summary}</p>
                </div>
                <Badge variant="outline" className="text-[10px] self-start sm:self-auto border-[#27272A] text-[#A1A1AA]">
                  {mod.videos.length} lectures
                </Badge>
              </div>

              <div className="divide-y divide-[#15151C]">
                {mod.videos.map((vid) => {
                  const isWatched = !!videoProgress[vid.youtubeVideoId]?.watched;

                  return (
                    <div
                      key={vid.youtubeVideoId}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#0E0E12] transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onToggleWatched(vid.youtubeVideoId)}
                          className={cn(
                            "size-5 rounded flex items-center justify-center border mt-0.5 shrink-0 transition-colors",
                            isWatched
                              ? "bg-emerald-600 border-emerald-500 text-white"
                              : "border-[#3F3F46] hover:border-[#71717A] bg-[#141418]"
                          )}
                          title={isWatched ? "Mark unwatched" : "Mark watched"}
                        >
                          {isWatched && <Icon icon={Tick02Icon} size={13} />}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] text-[var(--accent)] font-semibold">
                              #{vid.position.toString().padStart(2, "0")}
                            </span>
                            <h5
                              onClick={() => onWatchVideo(vid)}
                              className={cn(
                                "text-xs font-semibold cursor-pointer hover:text-[var(--accent)] transition-colors leading-snug",
                                isWatched ? "line-through text-[#71717A]" : "text-white"
                              )}
                            >
                              {vid.title}
                            </h5>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-[#71717A]">
                            <span className="text-[#A1A1AA]">{vid.channel}</span>
                            <span>•</span>
                            <span>{vid.estimatedMinutes} mins</span>
                            <span>•</span>
                            <span className={cn(
                              vid.difficulty === "Easy" && "text-emerald-400",
                              vid.difficulty === "Medium" && "text-amber-400",
                              vid.difficulty === "Hard" && "text-red-400"
                            )}>
                              {vid.difficulty}
                            </span>
                          </div>

                          {/* Key Takeaways */}
                          {vid.keyTakeaways && vid.keyTakeaways.length > 0 && (
                            <ul className="pt-1.5 space-y-0.5">
                              {vid.keyTakeaways.map((takeaway, tIdx) => (
                                <li key={tIdx} className="text-[11px] text-[#9CA3AF] flex items-center gap-1.5">
                                  <span className="size-1 rounded-full bg-[var(--accent)] shrink-0" />
                                  <span>{takeaway}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onWatchVideo(vid)}
                          className="h-8 text-xs border-[#27272A] bg-[#141418] text-[#E4E4E7] hover:text-white"
                        >
                          <Icon icon={PlayIcon} size={12} className="mr-1.5 text-[var(--accent)]" />
                          Watch Lecture
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
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Icon icon={SourceCodeIcon} size={15} className="text-[var(--accent)]" />
              Stage Hands-On Labs ({stageExercises.length})
            </h4>
            <span className="text-xs font-mono text-[#71717A]">
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
                  className="rounded-xl border border-[#1E1E24] bg-[#0A0A0E] p-4 flex flex-col justify-between gap-3 hover:border-[#2F2F38] transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[var(--accent)] font-semibold">
                        {ex.topic}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                        {ex.difficulty}
                      </Badge>
                    </div>

                    <h5 className="text-xs font-bold text-white tracking-tight">
                      {ex.title}
                    </h5>
                    <p className="text-[11px] text-[#A1A1AA] line-clamp-2 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#18181F]">
                    <span className="text-[10px] font-mono text-[#71717A]">
                      ~{ex.estimatedMinutes} mins
                    </span>
                    <Button
                      size="sm"
                      variant={isSolved ? "secondary" : "outline"}
                      onClick={() => onSolveExercise(ex.id)}
                      className="h-7 text-xs px-2.5 border-[#27272A]"
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
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Icon icon={Award01Icon} size={15} className="text-[var(--accent)]" />
              High-Yield Interview Questions ({stage.interviewQuestions.length})
            </h4>
            <span className="text-xs font-mono text-[#71717A]">
              FAANG & top tech evaluations
            </span>
          </div>

          <div className="space-y-2.5">
            {stage.interviewQuestions.map((q) => {
              const isRevealed = !!revealedQuestions[q.id];

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#1E1E24] bg-[#0A0A0E] p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-[#71717A] bg-[#121216] px-1.5 py-0.5 rounded border border-[#1E1E24]">
                          {q.category}
                        </span>
                        <span className="text-[10px] font-mono text-red-400">
                          {q.importance}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white leading-snug">
                        {q.question}
                      </h5>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleQuestionReveal(q.id)}
                      className="h-7 text-[11px] border-[#27272A] shrink-0"
                    >
                      {isRevealed ? "Hide Answer" : "Reveal Answer"}
                    </Button>
                  </div>

                  {isRevealed && (
                    <div className="pt-2 border-t border-[#1C1C24] space-y-2 animate-in fade-in duration-150">
                      <p className="text-xs text-[#D4D4D8] leading-relaxed bg-[#111116] p-3 rounded-lg border border-[#1B1B22]">
                        {q.answer}
                      </p>
                      {q.codeSnippet && (
                        <pre className="font-mono text-[11px] text-emerald-400 bg-[#07070A] p-2.5 rounded-lg border border-[#181820] overflow-x-auto">
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
      <div className="rounded-xl border border-[var(--accent-border)] bg-gradient-to-r from-[#180C0C] via-[#0E0707] to-[#0A0A0A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
              STAGE {stage.stageNumber} CAPSTONE
            </span>
            {isAssignmentDone && (
              <Badge variant="secondary" className="text-[10px] bg-emerald-950 text-emerald-400 border-emerald-800">
                Completed
              </Badge>
            )}
          </div>
          <h4 className="text-sm font-bold text-white">
            {stage.practicalAssignment.title}
          </h4>
          <p className="text-xs text-[#A1A1AA] max-w-2xl leading-relaxed">
            {stage.practicalAssignment.description}
          </p>
        </div>

        <Button
          variant={isAssignmentDone ? "secondary" : "primary"}
          size="sm"
          onClick={() => onToggleAssignment(stage.stageNumber)}
          className="h-9 px-4 text-xs shrink-0 self-start sm:self-center"
        >
          <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
          {isAssignmentDone ? "Assignment Submitted" : "Submit Capstone"}
        </Button>
      </div>
    </div>
  );
}
