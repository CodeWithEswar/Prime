"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  SourceCodeIcon,
  Tick02Icon,
  LinkSquare01Icon,
  Clock01Icon,
  Copy01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import type {
  DataEngineeringExercise,
  UserExerciseAttempt,
} from "@/domain/data-engineering";

interface LabsPanelProps {
  exercises: DataEngineeringExercise[];
  exerciseAttempts: Record<string, UserExerciseAttempt>;
  activeLabId: string | null;
  onSelectLab: (labId: string) => void;
  onRecordExerciseAttempt: (
    exerciseId: string,
    status: "attempted" | "solved" | "skipped",
    notes?: string
  ) => void;
}

export function DataEngineeringLabsPanel({
  exercises,
  exerciseAttempts,
  activeLabId,
  onSelectLab,
  onRecordExerciseAttempt,
}: LabsPanelProps) {
  const currentLab =
    exercises.find((e) => e.id === activeLabId) || exercises[0];

  const attempt = currentLab ? exerciseAttempts[currentLab.id] : undefined;
  const isSolved = attempt?.status === "solved";

  const [notes, setNotes] = useState<string>(attempt?.solutionNotes ?? "");

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Starter code copied to clipboard!");
  };

  const solvedCount = Object.values(exerciseAttempts).filter(
    (a) => a.status === "solved"
  ).length;

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#222222] bg-[#0E0E0E] p-4 sm:p-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Icon icon={SourceCodeIcon} size={18} />
            Data Engineering Hands-On Practice Labs
          </h3>
          <p className="mt-0.5 text-xs text-[#888888]">
            16 production code challenges: PySpark salting, Iceberg partition evolution, Airflow idempotent DAGs, Kafka streams & dbt models.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-white/20 bg-white/5 font-mono text-xs text-white"
          >
            {solvedCount} / {exercises.length} Solved
          </Badge>
        </div>
      </div>

      {/* Two-column layout: Lab list & Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lab selector list */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {exercises.map((lab) => {
            const labAttempt = exerciseAttempts[lab.id];
            const labSolved = labAttempt?.status === "solved";
            const isActive = lab.id === currentLab?.id;

            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => {
                  onSelectLab(lab.id);
                  setNotes(exerciseAttempts[lab.id]?.solutionNotes ?? "");
                }}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all flex flex-col justify-between gap-2",
                  isActive
                    ? "border-[var(--accent-border)] bg-[var(--accent-muted)]"
                    : labSolved
                      ? "border-[#222222] bg-[#0A0A0A] hover:border-[#333333]"
                      : "border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#282828]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#71717A]">
                    Stage {lab.stageNumber} • {lab.topic}
                  </span>

                  {labSolved ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      <Icon icon={CheckmarkCircle02Icon} size={13} />
                      Solved
                    </span>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1 py-0"
                    >
                      {lab.difficulty}
                    </Badge>
                  )}
                </div>

                <p
                  className={cn(
                    "text-xs font-semibold line-clamp-1",
                    isActive ? "text-white" : "text-[#D4D4D4]"
                  )}
                >
                  {lab.title}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                  <span>{lab.sourcePlatform}</span>
                  <span>~{lab.estimatedMinutes}m</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Lab Detail & Code Workbench */}
        {currentLab && (
          <div className="lg:col-span-7 xl:col-span-8 rounded-xl border border-[#222222] bg-[#0E0E0E] p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#1A1A1A]">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge
                    variant="outline"
                    className="border-[var(--accent-border)] bg-[var(--accent-muted)] text-[10px] text-[var(--foreground)]"
                  >
                    STAGE {currentLab.stageNumber}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {currentLab.difficulty}
                  </Badge>
                  <span className="text-xs font-mono text-[#888888] flex items-center gap-1">
                    <Icon icon={Clock01Icon} size={12} />
                    {currentLab.estimatedMinutes} mins
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  {currentLab.title}
                </h4>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Platform: {currentLab.sourcePlatform} • Focus: {currentLab.topic}
                </p>
              </div>

              {currentLab.externalUrl && (
                <a
                  href={currentLab.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#2C2C2C] bg-[#141414] px-3 py-1.5 text-xs text-white hover:bg-[#1E1E1E] transition-colors"
                >
                  <span>Documentation / Lab</span>
                  <Icon icon={LinkSquare01Icon} size={13} />
                </a>
              )}
            </div>

            {/* Problem Statement */}
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                Problem Architecture & Objectives
              </h5>
              <p className="text-xs sm:text-sm leading-relaxed text-[#D4D4D4]">
                {currentLab.description}
              </p>
            </div>

            {/* Starter Code snippet */}
            {currentLab.starterCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                    Starter Template / Implementation Pattern
                  </h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(currentLab.starterCode!)}
                    className="h-7 text-xs text-[#888888] hover:text-white"
                  >
                    <Icon icon={Copy01Icon} size={13} className="mr-1" />
                    Copy Code
                  </Button>
                </div>
                <div className="rounded-lg border border-[#222222] bg-[#080808] p-3.5 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
                  {currentLab.starterCode}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1A1A1A]">
              <span className="text-xs text-[#71717A]">
                {isSolved ? "Marked as solved and tested" : "Ready to verify"}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onRecordExerciseAttempt(currentLab.id, "attempted", notes)
                  }
                  className="h-8 text-xs text-white border-[#2A2A2A] bg-[#141414]"
                >
                  Mark Attempted
                </Button>

                <Button
                  size="sm"
                  variant={isSolved ? "secondary" : "primary"}
                  onClick={() =>
                    onRecordExerciseAttempt(
                      currentLab.id,
                      isSolved ? "attempted" : "solved",
                      notes
                    )
                  }
                  className="h-8 text-xs font-semibold"
                >
                  <Icon icon={Tick02Icon} size={14} className="mr-1.5" />
                  {isSolved ? "Mark Unsolved" : "Mark as Solved"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
