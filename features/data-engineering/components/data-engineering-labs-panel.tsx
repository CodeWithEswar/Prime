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
  SparklesIcon,
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
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-gradient-to-r from-[#110B0B] via-[#0D0D10] to-[#0A0A0A] p-4 sm:p-5 lg:p-6 shadow-elevation-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--accent-muted)] border border-[var(--accent-border)] text-[var(--accent)]">
                <Icon icon={SourceCodeIcon} size={16} />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Data Engineering Hands-On Practice Labs
              </h3>
            </div>
            <p className="mt-1 text-xs text-[#A1A1AA] max-w-2xl">
              16 production code challenges: PySpark salting, Iceberg partition evolution, Airflow idempotent DAGs, Kafka streams & dbt models.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 font-mono text-xs text-white px-3 py-1"
            >
              {solvedCount} / {exercises.length} Labs Solved
            </Badge>
          </div>
        </div>
      </div>

      {/* Mobile Lab Selector Dropdown (< 1024px) */}
      <div className="lg:hidden rounded-xl border border-[#1E1E24] bg-[#0A0A0C] p-3.5 space-y-2">
        <label className="text-xs font-semibold text-[#A1A1AA] flex items-center justify-between">
          <span>Active Practice Lab</span>
          <span className="font-mono text-[10px] text-[var(--accent)]">
            Lab {exercises.findIndex((e) => e.id === currentLab?.id) + 1} of {exercises.length}
          </span>
        </label>
        <select
          value={currentLab?.id}
          onChange={(e) => {
            onSelectLab(e.target.value);
            setNotes(exerciseAttempts[e.target.value]?.solutionNotes ?? "");
          }}
          className="w-full h-10 rounded-lg border border-[#27272F] bg-[#101014] px-3 text-xs text-white outline-none focus:border-white"
        >
          {exercises.map((lab, idx) => (
            <option key={lab.id} value={lab.id}>
              {idx + 1}. [Stage {lab.stageNumber}] {lab.title} ({lab.difficulty})
            </option>
          ))}
        </select>
      </div>

      {/* Two-Column Layout for Desktop (1024px+) & Tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lab List Sidebar (Visible on Desktop) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 space-y-2 max-h-[780px] overflow-y-auto pr-1">
          {exercises.map((lab, idx) => {
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
                  "w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-2.5",
                  isActive
                    ? "border-[var(--accent-border)] bg-gradient-to-r from-[#160B0B] to-[#0A0A0D] shadow-sm ring-1 ring-[var(--accent)]/30"
                    : labSolved
                      ? "border-[#222226] bg-[#0A0A0C] hover:border-[#333338]"
                      : "border-[#1A1A1E] bg-[#08080A] hover:border-[#27272E] hover:bg-[#0C0C0F]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--accent)]">
                    LAB {String(idx + 1).padStart(2, "0")} • STAGE {lab.stageNumber}
                  </span>

                  {labSolved ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <Icon icon={CheckmarkCircle02Icon} size={13} />
                      Solved
                    </span>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {lab.difficulty}
                    </Badge>
                  )}
                </div>

                <p
                  className={cn(
                    "text-xs font-semibold line-clamp-1 leading-snug",
                    isActive ? "text-white" : "text-[#D4D4D8]"
                  )}
                >
                  {lab.title}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[#71717A] pt-1 border-t border-[#16161A]">
                  <span className="truncate max-w-[140px]">{lab.topic}</span>
                  <span className="font-mono">~{lab.estimatedMinutes}m</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Lab Workbench */}
        {currentLab && (
          <div className="lg:col-span-7 xl:col-span-8 rounded-xl border border-[var(--border-default)] bg-[#0A0A0C] p-5 sm:p-6 lg:p-7 space-y-5 shadow-elevation-1">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1A1A1E]">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-[var(--accent-border)] bg-[var(--accent-muted)] font-mono text-[10px] font-bold text-[var(--foreground)]"
                  >
                    STAGE {currentLab.stageNumber}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    {currentLab.difficulty}
                  </Badge>
                  <span className="text-xs font-mono text-[#888888] flex items-center gap-1">
                    <Icon icon={Clock01Icon} size={12} />
                    {currentLab.estimatedMinutes} mins
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {currentLab.title}
                </h4>
                <p className="text-xs text-[#71717A]">
                  Platform: {currentLab.sourcePlatform} • Focus: {currentLab.topic}
                </p>
              </div>

              {currentLab.externalUrl && (
                <a
                  href={currentLab.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#27272F] bg-[#121216] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1C1C22] transition-colors shrink-0"
                >
                  <span>Lab Specs & Docs</span>
                  <Icon icon={LinkSquare01Icon} size={13} />
                </a>
              )}
            </div>

            {/* Problem Statement & Architecture */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                <Icon icon={SparklesIcon} size={13} className="text-white" />
                Problem Architecture & Objectives
              </h5>
              <p className="text-xs sm:text-sm leading-relaxed text-[#D4D4D8] bg-[#070709] p-4 rounded-lg border border-[#16161A]">
                {currentLab.description}
              </p>
            </div>

            {/* Starter Code snippet */}
            {currentLab.starterCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                    Starter Template / Implementation Pattern
                  </h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(currentLab.starterCode!)}
                    className="h-7 text-xs text-[#A1A1AA] hover:text-white"
                  >
                    <Icon icon={Copy01Icon} size={13} className="mr-1.5" />
                    Copy Code
                  </Button>
                </div>
                <div className="relative rounded-lg border border-[#202026] bg-[#040406] p-4 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                  {currentLab.starterCode}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1A1A1E]">
              <span className="text-xs text-[#71717A]">
                {isSolved ? "Marked as solved and tested in your local pipeline" : "Ready to verify against your test suite"}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onRecordExerciseAttempt(currentLab.id, "attempted", notes)
                  }
                  className="h-8 text-xs text-white border-[#27272F] bg-[#121216] hover:bg-[#1A1A20]"
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
                  className="h-8 text-xs font-semibold bg-white text-black hover:bg-neutral-200"
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
