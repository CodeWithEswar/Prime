"use client";

import { Icon } from "@/components/ui/icon";
import { Route01Icon, RotateRight01Icon } from "@hugeicons/core-free-icons";
import type { CurriculumProgressSummary } from "@/domain/curriculum/types";
import Link from "next/link";

interface RoadmapHeaderProps {
  progress: CurriculumProgressSummary;
}

export function RoadmapHeader({ progress }: RoadmapHeaderProps) {
  return (
    <div className="space-y-4 pb-6 border-b border-[#1A1A1A]">
      {/* Category Tag & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF0000] uppercase">
            CURRICULUM · PRIME CORE
          </span>
        </div>

        {/* Roadmap Switcher */}
        <div className="flex flex-wrap items-center rounded-lg border border-[#222222] bg-[#0E0E0E] p-1 gap-1">
          <span className="rounded-md bg-[#1F1F1F] px-2.5 py-1 text-xs font-semibold text-white">
            DSA Roadmap
          </span>
          <Link
            href="/roadmap/dbms"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-[#888888] transition-colors hover:text-white"
          >
            DBMS (12-Day)
          </Link>
          <Link
            href="/roadmap/os"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-[#888888] transition-colors hover:text-white"
          >
            OS (12-Day)
          </Link>
          <Link
            href="/roadmap/cn"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-[#888888] transition-colors hover:text-white"
          >
            CN (12-Day)
          </Link>
          <Link
            href="/roadmap/oop"
            className="rounded-md px-2.5 py-1 text-xs font-medium text-[#888888] transition-colors hover:text-white"
          >
            OOP Java (12-Day)
          </Link>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DSA Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] max-w-xl mt-1 leading-relaxed">
            Build technical interview patterns in the order they become useful.
            Curated from foundational primitives to multi-pattern mastery.
          </p>
        </div>

        {/* Revision Due quick link if any */}
        {progress.revisionDueCount > 0 && (
          <Link
            href="/revision"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#1A0505] border border-[#7F1D1D]/50 text-xs font-semibold text-[#FF4D4D] hover:bg-[#2A0808] transition-colors self-start md:self-auto shrink-0"
          >
            <Icon icon={RotateRight01Icon} size={14} className="text-[#FF0000]" />
            <span>{progress.revisionDueCount} Revisions Due</span>
          </Link>
        )}
      </div>

      {/* Compact Preparation Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {/* Solved */}
        <div className="flex items-center gap-3 p-3 rounded border border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="w-2 h-2 rounded-full bg-white" />
          <div>
            <div className="font-mono text-lg font-bold text-white leading-tight">
              {progress.completedRequired}{" "}
              <span className="text-xs text-[#666666] font-normal">
                / {progress.totalRequired}
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
              Solved ({progress.completionPercentage}%)
            </div>
          </div>
        </div>

        {/* Attempted */}
        <div className="flex items-center gap-3 p-3 rounded border border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="w-2 h-2 rounded-full bg-[#EAB308]" />
          <div>
            <div className="font-mono text-lg font-bold text-white leading-tight">
              {progress.totalAttempted}
            </div>
            <div className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
              In Progress
            </div>
          </div>
        </div>

        {/* Revision Due */}
        <div className="flex items-center gap-3 p-3 rounded border border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="w-2 h-2 rounded-full bg-[#FF0000] shadow-[0_0_6px_#FF0000]" />
          <div>
            <div className="font-mono text-lg font-bold text-[#FF4D4D] leading-tight">
              {progress.revisionDueCount}
            </div>
            <div className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
              Revision Due
            </div>
          </div>
        </div>

        {/* Remaining */}
        <div className="flex items-center gap-3 p-3 rounded border border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="w-2 h-2 rounded-full bg-[#333333]" />
          <div>
            <div className="font-mono text-lg font-bold text-[#888888] leading-tight">
              {progress.remainingRequiredCount}
            </div>
            <div className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
              Remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

