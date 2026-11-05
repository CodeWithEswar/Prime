"use client";

import { Icon } from "@/components/ui/icon";
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  RotateRight01Icon,
  Target02Icon,
} from "@hugeicons/core-free-icons";
import type { CurriculumProgressSummary } from "@/domain/curriculum/types";
import Link from "next/link";

interface RoadmapHeaderProps {
  progress: CurriculumProgressSummary;
}

export function RoadmapHeader({ progress }: RoadmapHeaderProps) {
  return (
    <div className="space-y-4 pb-6 border-b border-[#1A1A1A]">
      {/* Category Eyebrow & Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          {/* Eyebrow Label */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] shadow-[0_0_6px_#FF0000]" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF0000] uppercase">
              CURRICULUM · PRIME CORE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            DSA Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] max-w-xl leading-relaxed">
            Build technical interview patterns in the order they become useful.
            Curated from foundational primitives to multi-pattern mastery.
          </p>
        </div>

        {/* Revision Due quick link if any */}
        {progress.revisionDueCount > 0 && (
          <Link
            href="/revision"
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#200707] to-[#140404] border border-[#FF0000]/40 text-xs font-semibold text-[#FF4D4D] hover:border-[#FF0000] hover:text-white transition-all shadow-sm self-start sm:self-auto shrink-0"
          >
            <Icon
              icon={RotateRight01Icon}
              size={15}
              className="text-[#FF0000] group-hover:rotate-45 transition-transform"
            />
            <span>{progress.revisionDueCount} Revisions Due</span>
          </Link>
        )}
      </div>

      {/* Telemetry Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2">
        {/* Solved Card */}
        <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#131313] to-[#080808] p-3.5 sm:p-4 transition-all duration-200 hover:border-emerald-500/30 hover:shadow-[0_4px_24px_rgba(16,185,129,0.08)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <Icon icon={CheckmarkCircle02Icon} size={15} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-[#999999] truncate">
                Solved
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {progress.completionPercentage}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {progress.completedRequired}
            </span>
            <span className="font-mono text-xs sm:text-sm font-normal text-[#666666]">
              / {progress.totalRequired}
            </span>
          </div>

          {/* Micro progress track */}
          <div className="mt-2.5 sm:mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, progress.completionPercentage))}%`,
              }}
            />
          </div>
        </div>

        {/* In Progress Card */}
        <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#131313] to-[#080808] p-3.5 sm:p-4 transition-all duration-200 hover:border-amber-500/30 hover:shadow-[0_4px_24px_rgba(245,158,11,0.08)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <Icon icon={Clock01Icon} size={15} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-[#999999] truncate">
                In Progress
              </span>
            </div>
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)] shrink-0" />
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {progress.totalAttempted}
            </span>
            <span className="text-[11px] font-mono text-[#666666]">active</span>
          </div>

          <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[10px] font-mono text-[#777777]">
            <span>Attempted items</span>
            <span className="text-[#999999]">in flight</span>
          </div>
        </div>

        {/* Revision Due Card */}
        <div
          className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
            progress.revisionDueCount > 0
              ? "border-[#FF0000]/30 bg-gradient-to-b from-[#180909] to-[#0A0606] hover:border-[#FF0000]/60 hover:shadow-[0_4px_24px_rgba(255,0,0,0.12)]"
              : "border-white/[0.08] bg-gradient-to-b from-[#131313] to-[#080808] hover:border-white/20"
          } p-3.5 sm:p-4`}
        >
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF0000]/70 to-transparent ${
              progress.revisionDueCount > 0
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-300`}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  progress.revisionDueCount > 0
                    ? "border-red-500/30 bg-red-500/15 text-[#FF4D4D]"
                    : "border-white/[0.08] bg-white/[0.04] text-[#888888]"
                }`}
              >
                <Icon icon={RotateRight01Icon} size={15} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-[#999999] truncate">
                Revision Due
              </span>
            </div>
            {progress.revisionDueCount > 0 ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0000] shadow-[0_0_6px_#FF0000]" />
              </span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-[#333333] shrink-0" />
            )}
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span
              className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight ${
                progress.revisionDueCount > 0 ? "text-[#FF4D4D]" : "text-[#777777]"
              }`}
            >
              {progress.revisionDueCount}
            </span>
            <span className="text-[11px] font-mono text-[#666666]">due</span>
          </div>

          <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[10px] font-mono text-[#777777]">
            <span>
              {progress.revisionDueCount > 0 ? "Spaced repetition" : "All caught up"}
            </span>
            <span
              className={
                progress.revisionDueCount > 0
                  ? "text-[#FF4D4D] font-medium"
                  : "text-[#555555]"
              }
            >
              {progress.revisionDueCount > 0 ? "Action required" : "Clear"}
            </span>
          </div>
        </div>

        {/* Remaining Card */}
        <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#131313] to-[#080808] p-3.5 sm:p-4 transition-all duration-200 hover:border-white/20 hover:shadow-[0_4px_24px_rgba(255,255,255,0.04)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[#888888]">
                <Icon icon={Target02Icon} size={15} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-[#999999] truncate">
                Remaining
              </span>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-[#444444] shrink-0" />
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {progress.remainingRequiredCount}
            </span>
            <span className="text-[11px] font-mono text-[#666666]">problems</span>
          </div>

          <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[10px] font-mono text-[#777777]">
            <span>Curriculum target</span>
            <span className="text-[#999999]">
              {progress.totalRequired > 0
                ? `${Math.round(
                    (progress.remainingRequiredCount / progress.totalRequired) * 100
                  )}% left`
                : "0%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

