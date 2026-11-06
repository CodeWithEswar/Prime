"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ArrowRight01Icon, SourceCodeIcon, Route01Icon } from "@hugeicons/core-free-icons";
import type { TomorrowPreview } from "../types";
import { formatDuration } from "./daily-load-strip";

interface RestDayViewProps {
  tomorrowPreview: TomorrowPreview | null;
}

export function RestDayView({ tomorrowPreview }: RestDayViewProps) {
  return (
    <div className="space-y-6">
      <div className="p-8 sm:p-10 rounded-lg bg-[#070707] border border-white/[0.08] text-center space-y-4 shadow-md">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF0000] bg-[#FF0000]/10 px-3 py-1 rounded border border-[#FF0000]/20 inline-block">
          SCHEDULED REST DAY
        </span>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Recovery is a core part of the system.
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed font-sans">
          No new learning or heavy problem sets are scheduled for today. Rest allows neural memory consolidation and ensures consistent high-performance execution.
        </p>

        <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
          <Button variant="secondary" size="sm" asChild className="gap-2 font-mono">
            <Link href="/roadmap">
              <Icon icon={Route01Icon} size={15} />
              <span>Review Roadmap</span>
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild className="gap-2 font-mono">
            <Link href="/practice/dsa">
              <Icon icon={SourceCodeIcon} size={15} />
              <span>Optional Practice</span>
            </Link>
          </Button>
        </div>
      </div>

      {tomorrowPreview && (
        <div className="p-4 rounded-lg bg-[#080808] border border-white/[0.08] flex items-center justify-between gap-4 text-xs shadow-sm">
          <div>
            <span className="font-mono text-[10px] uppercase text-neutral-400 font-bold tracking-wider block mb-0.5">
              PREPARATION RESUMES TOMORROW
            </span>
            <span className="font-semibold text-white">
              {formatDuration(tomorrowPreview.plannedMinutes)} planned ({tomorrowPreview.taskCount} task
              {tomorrowPreview.taskCount !== 1 ? "s" : ""})
            </span>
          </div>

          <Link
            href="/plan"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-neutral-400 hover:text-white transition-colors"
          >
            <span>Open Planner</span>
            <Icon icon={ArrowRight01Icon} size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
