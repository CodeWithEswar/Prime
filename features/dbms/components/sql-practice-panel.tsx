"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Tick02Icon,
  LinkSquare01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import type { DBMSSQLExercise, UserExerciseAttempt } from "@/domain/dbms";

interface SQLPracticePanelProps {
  exercises: DBMSSQLExercise[];
  exerciseAttempts: Record<string, UserExerciseAttempt>;
  onSolveExercise: (exerciseId: string) => void;
}

export function SQLPracticePanel({
  exercises,
  exerciseAttempts,
  onSolveExercise,
}: SQLPracticePanelProps) {
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const platforms = ["all", ...new Set(exercises.map((e) => e.sourcePlatform))];

  const filteredExercises = exercises.filter((e) => {
    if (platformFilter !== "all" && e.sourcePlatform !== platformFilter) return false;
    return true;
  });

  const solvedCount = Object.values(exerciseAttempts).filter((a) => a.status === "solved").length;

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1A1A1A] pb-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-[#FF4D4D] uppercase">
              <Icon icon={CheckmarkBadge01Icon} size={14} />
              Practical Lab Work
            </span>
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Hands-on SQL Query & Practice Suites
          </h2>
          <p className="text-xs text-[#888888] sm:text-sm">
            Curated exercises from SQLBolt, LeetCode SQL 50, and Harvard CS50 mapped to your study days.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#222222] bg-[#121212] px-4 py-2.5">
          <span className="text-xs text-[#888888]">Solved:</span>
          <span className="font-mono text-base font-bold text-white">
            {solvedCount} / {exercises.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => setPlatformFilter(platform)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              platformFilter === platform
                ? "bg-[#FF0000] text-white"
                : "border border-[#222222] bg-[#111111] text-[#888888] hover:text-white"
            }`}
          >
            {platform === "all" ? "All Platforms" : platform}
          </button>
        ))}
      </div>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => {
          const attempt = exerciseAttempts[exercise.id];
          const isSolved = attempt?.status === "solved";

          return (
            <div
              key={exercise.id}
              className={`flex flex-col justify-between rounded-lg border p-4 transition-colors ${
                isSolved
                  ? "border-[#1F1F1F] bg-[#0E0E0E]/70"
                  : "border-[#242424] bg-[#111111] hover:border-[#383838]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-semibold text-[#888888]">
                    Day {exercise.dayNumber} • {exercise.sourcePlatform}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      exercise.difficulty === "Hard"
                        ? "text-[#FF4D4D]"
                        : exercise.difficulty === "Medium"
                        ? "text-[#E5A83B]"
                        : "text-[#4ADE80]"
                    }`}
                  >
                    {exercise.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{exercise.title}</h3>
                <p className="line-clamp-2 text-xs text-[#888888]">{exercise.description}</p>
                <div className="text-[11px] text-[#666666]">Topic: {exercise.topic}</div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#1C1C1C] pt-3">
                <a
                  href={exercise.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#CCCCCC] hover:text-white"
                >
                  Solve Exercise
                  <Icon icon={LinkSquare01Icon} size={12} />
                </a>

                <Button
                  size="sm"
                  onClick={() => onSolveExercise(exercise.id)}
                  className={
                    isSolved
                      ? "h-7 bg-white px-3 text-xs text-black"
                      : "h-7 bg-[#1A1A1A] px-3 text-xs text-[#888888] hover:bg-[#FF0000] hover:text-white"
                  }
                >
                  <Icon icon={Tick02Icon} size={12} className="mr-1" />
                  {isSolved ? "Solved" : "Mark Solved"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

