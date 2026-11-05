"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  ArrowRight01Icon,
  RotateRight01Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
  Clock01Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import type { RoadmapProblemItem } from "../types";
import { cleanProblemTitle } from "@/lib/utils";

interface CurriculumProblemRowProps {
  item: RoadmapProblemItem;
  isNextUp?: boolean;
}

const difficultyColors = {
  EASY: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30",
  MEDIUM: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
  HARD: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30",
};

export function CurriculumProblemRow({
  item,
  isNextUp = false,
}: CurriculumProblemRowProps) {
  const isSolved = item.userStatus === "solved" || item.userStatus === "mastered";
  const isAttempted = item.userStatus === "attempted";
  const isRevisionDue = item.isRevisionDue;
  const seqFormatted = item.sequence.toString().padStart(3, "0");

  const unsatisfiedPrereqs = item.prerequisites.filter((p) => !p.isSatisfied);
  const isLocked = !isSolved && unsatisfiedPrereqs.length > 0;

  return (
    <div
      className={`relative group flex items-center justify-between gap-2.5 sm:gap-4 p-3 sm:px-4 sm:py-3 rounded-lg border transition-all w-full max-w-full ${
        isNextUp
          ? "bg-[#140808] border-[#FF0000]/40 shadow-[0_0_12px_rgba(255,0,0,0.1)]"
          : isSolved
            ? "bg-[#0A0A0A]/60 border-[#161616] hover:border-[#262626] hover:bg-[#0D0D0D]"
            : "bg-[#080808] border-[#141414] hover:border-[#222222] hover:bg-[#0C0C0C]"
      }`}
    >
      {/* Left section: Spine Node + Sequence + Title + Badges */}
      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {/* Node indicator */}
        <div className="pt-0.5 sm:pt-0 shrink-0">
          {isNextUp ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
            </span>
          ) : isRevisionDue ? (
            <span className="inline-flex items-center justify-center h-3 w-3 rounded-full border-2 border-[#FF0000] bg-[#2A0505]" />
          ) : isSolved ? (
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)]" />
          ) : isAttempted ? (
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#EAB308]" />
          ) : (
            <span className="inline-flex h-2.5 w-2.5 rounded-full border border-[#333333] bg-[#111111]" />
          )}
        </div>

        {/* Sequence Number */}
        <span className="font-mono text-xs text-[#555555] shrink-0 font-medium pt-0.5 sm:pt-0">
          {seqFormatted}
        </span>

        {/* Title, Badges & Prerequisites */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0">
            <Link
              href={`/practice/dsa/${item.problemSlug}?from=roadmap`}
              title={cleanProblemTitle(item.title)}
              className={`text-xs sm:text-sm font-semibold transition-colors leading-snug line-clamp-2 sm:line-clamp-1 min-w-0 break-words ${
                isSolved
                  ? "text-[#CCCCCC] hover:text-white"
                  : isNextUp
                    ? "text-white hover:text-[#FF4D4D] font-bold"
                    : "text-[#E0E0E0] hover:text-white"
              }`}
            >
              {cleanProblemTitle(item.title)}
            </Link>

            {/* Badges strip: clean horizontal row under title on mobile, inline on desktop */}
            <div className="flex items-center flex-wrap gap-1.5 shrink-0">
              {item.masteryLevel === "mastered" && (
                <span className="rounded border border-white/25 px-1.5 py-0.5 font-mono text-[10px] text-white">Mastered</span>
              )}
              {item.isCheckpoint && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/25 uppercase tracking-wider shrink-0">
                  <Icon icon={SparklesIcon} size={10} />
                  Checkpoint
                </span>
              )}

              {/* Difficulty Badge */}
              <span
                className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                  difficultyColors[item.difficulty || "MEDIUM"]
                }`}
              >
                {item.difficulty}
              </span>

              {/* Target Time */}
              <span className="inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] text-[#666666] shrink-0">
                <Icon icon={Clock01Icon} size={11} />
                {item.recommendedMinutes}m
              </span>
            </div>
          </div>

          {/* Prerequisite Tags if present */}
          {item.prerequisites.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[#666666] pt-0.5">
              <span className="text-[#444444]">Requires:</span>
              {item.prerequisites.map((p) => (
                <span
                  key={p.problemSlug}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                    p.isSatisfied
                      ? "text-[#777777] bg-[#111111] border-[#222222]"
                      : "text-[#F59E0B] bg-[#1A1505] border-[#F59E0B]/30"
                  }`}
                >
                  <span className="truncate max-w-[120px] sm:max-w-[140px]">{p.problemTitle}</span>
                  {p.isSatisfied ? "✓" : "○"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Status badge + Quick action button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-center">
        {/* Status indicator */}
        {isRevisionDue ? (
          <Link
            href="/revision"
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#2A0505] border border-[#FF0000]/30 text-[10px] font-mono font-semibold text-[#FF4D4D] hover:bg-[#3A0707] transition-colors"
          >
            <Icon icon={RotateRight01Icon} size={11} />
            Revision Due
          </Link>
        ) : isSolved ? (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#22C55E]">
            <Icon icon={CheckmarkCircle02Icon} size={12} />
            Solved
          </span>
        ) : isAttempted ? (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#EAB308]">
            Attempted
          </span>
        ) : isLocked ? (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#666666]">
            <Icon icon={LockIcon} size={11} />
            Prereq Open
          </span>
        ) : null}

        {/* Action Link */}
        <Button
          asChild
          variant={isNextUp || isRevisionDue ? "primary" : "secondary"}
          size="sm"
          className="h-7 px-2.5 font-mono text-xs font-semibold shrink-0"
        >
          <Link
            href={isRevisionDue ? "/revision" : `/practice/dsa/${item.problemSlug}?from=roadmap`}
            aria-label={`Open ${cleanProblemTitle(item.title)}`}
          >
            <span>{isRevisionDue ? "Review" : isSolved ? "Review" : isNextUp ? "Solve" : "Open"}</span>
            <Icon icon={ArrowRight01Icon} size={13} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
