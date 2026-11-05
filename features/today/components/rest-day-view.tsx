"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ArrowRight01Icon, SourceCodeIcon, Route01Icon } from "@hugeicons/core-free-icons";
import type { TomorrowPreview } from "../types";
import { formatDuration } from "./daily-load-strip";

interface RestDayViewProps {
  tomorrowPreview: TomorrowPreview | null;
}

export function RestDayView({ tomorrowPreview }: RestDayViewProps) {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-lg bg-[#0C0C0C] border border-[#222222] text-center space-y-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#888888]">
          SCHEDULED REST DAY
        </span>

        <h2 className="text-xl font-bold tracking-tight text-white">
          Recovery is part of the plan.
        </h2>

        <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
          No new learning or heavy problem sets are scheduled for today. Rest allows neural memory consolidation of previous patterns.
        </p>

        <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold text-[#CCCCCC] hover:text-white bg-[#141414] hover:bg-[#1C1C1C] border border-[#222222] transition-colors"
          >
            <Icon icon={Route01Icon} size={14} />
            <span>Review Roadmap</span>
          </Link>

          <Link
            href="/practice/dsa"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold text-[#888888] hover:text-white bg-[#0D0D0D] hover:bg-[#141414] border border-[#1A1A1A] transition-colors"
          >
            <Icon icon={SourceCodeIcon} size={14} />
            <span>Optional Practice</span>
          </Link>
        </div>
      </div>

      {tomorrowPreview && (
        <div className="p-4 rounded-lg bg-[#080808] border border-[#161616] flex items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-mono text-[10px] uppercase text-[#666666] tracking-wider block mb-0.5">
              PREPARATION RESUMES TOMORROW
            </span>
            <span className="font-semibold text-white">
              {formatDuration(tomorrowPreview.plannedMinutes)} planned ({tomorrowPreview.taskCount} task
              {tomorrowPreview.taskCount !== 1 ? "s" : ""})
            </span>
          </div>

          <Link
            href="/plan"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#888888] hover:text-white transition-colors"
          >
            <span>View Plan</span>
            <Icon icon={ArrowRight01Icon} size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}

