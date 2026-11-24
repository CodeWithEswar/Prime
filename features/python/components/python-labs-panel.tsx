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
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Icon icon={SourceCodeIcon} size={16} className="text-zinc-400" />
          Hands-On Python Algorithmic Labs ({exercises.length})
        </h3>
        <span className="text-xs font-mono text-zinc-500">
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
              className="rounded-md border border-zinc-800 bg-zinc-950/80 p-4 flex flex-col justify-between gap-3 hover:border-zinc-700 transition-all shadow-md"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-zinc-400 font-semibold bg-zinc-900 px-2 py-0.5 rounded-sm border border-zinc-800">
                    STAGE {ex.stageNumber} · {ex.topic}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 rounded-sm bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {ex.difficulty}
                  </Badge>
                </div>

                <h4 className="text-xs font-bold text-zinc-100 tracking-tight">
                  {ex.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {ex.description}
                </p>

                {/* Collapsible Starter Code Template */}
                {ex.starterCode && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveCodeId(isCodeOpen ? null : ex.id)}
                      className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 underline"
                    >
                      {isCodeOpen ? "Hide Starter Code" : "View Starter Code"}
                    </button>
                    {isCodeOpen && (
                      <pre className="mt-1.5 font-mono text-[11px] text-emerald-400 bg-black/90 p-3 rounded-md border border-zinc-800 overflow-x-auto">
                        {ex.starterCode}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                  <Icon icon={Clock01Icon} size={12} />
                  <span>~{ex.estimatedMinutes} mins</span>
                </div>

                <div className="flex items-center gap-2">
                  {ex.externalUrl && (
                    <a
                      href={ex.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-200 p-1 rounded-sm transition-colors"
                      title="External Resource"
                    >
                      <Icon icon={LinkSquare01Icon} size={13} />
                    </a>
                  )}

                  <Button
                    size="sm"
                    variant={isSolved ? "secondary" : "outline"}
                    onClick={() => onSolveExercise(ex.id)}
                    className="h-7 text-xs px-2.5 rounded-md border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-white"
                  >
                    {isSolved ? (
                      <>
                        <Icon icon={CheckmarkCircle02Icon} size={12} className="mr-1 text-emerald-400" />
                        Solved
                      </>
                    ) : (
                      <>
                        <Icon icon={SourceCodeIcon} size={12} className="mr-1 text-zinc-400" />
                        Open Lab
                      </>
                    )}
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
