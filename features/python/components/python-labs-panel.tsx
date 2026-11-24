"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  SourceCodeIcon,
  CheckmarkCircle02Icon,
  LinkSquare01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type { PythonExercise, UserExerciseAttempt } from "@/domain/python";

interface PythonLabsPanelProps {
  exercises: PythonExercise[];
  exerciseAttempts: Record<string, UserExerciseAttempt>;
  onSolveExercise: (exerciseId: string) => void;
}

export function PythonLabsPanel({
  exercises,
  exerciseAttempts,
  onSolveExercise,
}: PythonLabsPanelProps) {
  const [activeCodeId, setActiveCodeId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Icon icon={SourceCodeIcon} size={16} className="text-[var(--accent)]" />
          Hands-On Python Algorithmic Labs ({exercises.length})
        </h3>
        <span className="text-xs font-mono text-[#71717A]">
          16 coding exercises with starter templates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {exercises.map((ex) => {
          const attempt = exerciseAttempts[ex.id];
          const isSolved = attempt?.status === "completed";
          const isCodeOpen = activeCodeId === ex.id;

          return (
            <div
              key={ex.id}
              className="rounded-xl border border-[#1E1E24] bg-[#0A0A0E] p-4 flex flex-col justify-between gap-3 hover:border-[#2C2C35] transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[var(--accent)] font-semibold bg-[#181010] px-2 py-0.5 rounded border border-red-950/60">
                    STAGE {ex.stageNumber} · {ex.topic}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                    {ex.difficulty}
                  </Badge>
                </div>

                <h4 className="text-xs font-bold text-white tracking-tight">
                  {ex.title}
                </h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {ex.description}
                </p>

                {/* Collapsible Starter Code Template */}
                {ex.starterCode && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveCodeId(isCodeOpen ? null : ex.id)}
                      className="text-[11px] font-mono text-[#0D99FF] hover:underline"
                    >
                      {isCodeOpen ? "Hide Starter Code" : "View Starter Code"}
                    </button>
                    {isCodeOpen && (
                      <pre className="mt-1.5 font-mono text-[11px] text-emerald-400 bg-[#07070A] p-3 rounded-lg border border-[#181820] overflow-x-auto">
                        {ex.starterCode}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-[#18181F]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#71717A]">
                  <Icon icon={Clock01Icon} size={12} />
                  <span>~{ex.estimatedMinutes} mins</span>
                </div>

                <div className="flex items-center gap-2">
                  {ex.externalUrl && (
                    <a
                      href={ex.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#71717A] hover:text-white p-1 rounded transition-colors"
                      title="External Resource"
                    >
                      <Icon icon={LinkSquare01Icon} size={14} />
                    </a>
                  )}

                  <Button
                    size="sm"
                    variant={isSolved ? "secondary" : "outline"}
                    onClick={() => onSolveExercise(ex.id)}
                    className="h-7 text-xs px-2.5 border-[#27272A]"
                  >
                    <Icon
                      icon={isSolved ? CheckmarkCircle02Icon : SourceCodeIcon}
                      size={12}
                      className="mr-1 text-[var(--accent)]"
                    />
                    {isSolved ? "Solved" : "Open Lab"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
