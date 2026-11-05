"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  ArrowRight01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Target02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import type { CurriculumNextRecommendation } from "@/domain/curriculum/types";

interface ContinueHeroProps {
  recommendation: CurriculumNextRecommendation | null;
  totalSolved: number;
  totalCount: number;
}

const difficultyColors = {
  EASY: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30",
  MEDIUM: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
  HARD: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30",
};

export function ContinueHero({
  recommendation,
  totalSolved,
  totalCount,
}: ContinueHeroProps) {
  if (!recommendation) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#22C55E] uppercase">
                CURRICULUM COMPLETE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              All {totalCount} PRIME Core Problems Completed
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] max-w-xl leading-relaxed">
              You have worked through all 16 canonical stages. Keep your patterns sharp
              by clearing your spaced repetition queue daily.
            </p>
          </div>
          <Button asChild variant="primary" size="default" className="shrink-0 font-mono text-xs">
            <Link href="/revision">
              <span>Review Active Queue</span>
              <Icon icon={ArrowRight01Icon} size={15} />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { item, stage } = recommendation;
  const stageSeqFormatted = stage.sequence.toString().padStart(2, "0");
  const itemSeqFormatted = item.sequence.toString().padStart(3, "0");

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#222222] bg-gradient-to-b from-[#0F0F0F] to-[#070707] p-5 sm:p-6 transition-all hover:border-[#333333]">
      {/* Top glowing accent border line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF0000] to-transparent opacity-80" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2.5 min-w-0 flex-1">
          {/* Beacon + Stage Subtitle */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
            </span>
            <span className="text-[#FF4D4D] font-bold tracking-widest uppercase">
              NEXT UP IN YOUR CURRICULUM
            </span>
            <span className="text-[#444444]">·</span>
            <span className="text-[#888888] uppercase tracking-wider">
              STAGE {stageSeqFormatted}: {stage.name}
            </span>
          </div>

          {/* Problem Sequence & Title */}
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-mono text-xs font-semibold text-[#666666]">
              #{itemSeqFormatted}
            </span>
            <Link
              href={`/practice/dsa/${item.problemSlug}?from=roadmap`}
              className="text-xl sm:text-2xl font-extrabold text-white tracking-tight hover:text-[#FF4D4D] transition-colors line-clamp-2 sm:line-clamp-none sm:truncate break-words"
            >
              {item.title}
            </Link>
            {item.isCheckpoint && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF0000]/15 text-[#FF4D4D] border border-[#FF0000]/30 uppercase tracking-wider">
                <Icon icon={SparklesIcon} size={11} />
                Checkpoint
              </span>
            )}
          </div>

          {/* Pedagogical Rationale */}
          {item.selectionReason && (
            <p className="text-xs text-[#AAAAAA] line-clamp-2 leading-relaxed max-w-2xl font-sans">
              {item.selectionReason}
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {/* Priority */}
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#181818] border border-[#2A2A2A] text-white font-bold">
              {item.priority}
            </span>

            {/* Difficulty */}
            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded border font-semibold ${
                difficultyColors[item.difficulty || "MEDIUM"]
              }`}
            >
              {item.difficulty}
            </span>

            {/* Recommended Time */}
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#777777] bg-[#141414] px-2 py-0.5 rounded border border-[#222222]">
              <Icon icon={Clock01Icon} size={12} />
              {item.recommendedMinutes}m target
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex sm:self-start lg:self-center shrink-0 w-full sm:w-auto">
          <Button
            asChild
            variant="primary"
            size="default"
            className="w-full sm:w-auto font-mono text-xs font-semibold tracking-wide"
          >
            <Link href={`/practice/dsa/${item.problemSlug}?from=roadmap`}>
              <span>Continue Step</span>
              <Icon icon={ArrowRight01Icon} size={15} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
