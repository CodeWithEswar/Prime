"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";
import type { TomorrowPreview } from "../types";
import { formatDuration } from "./daily-load-strip";

interface DayCompleteViewProps {
  totalTasks: number;
  focusedMinutes: number;
  plannedMinutes: number;
  tomorrowPreview: TomorrowPreview | null;
  date: string;
}

export function DayCompleteView({
  totalTasks,
  focusedMinutes,
  plannedMinutes,
  tomorrowPreview,
  date,
}: DayCompleteViewProps) {
  return (
    <div className="space-y-6">
      {/* Complete Banner */}
      <div className="p-8 rounded-lg bg-[#070707] border border-white/[0.08] text-center space-y-4 shadow-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-black shadow-[0_0_16px_rgba(16,185,129,0.5)] mx-auto">
          <Icon icon={CheckmarkCircle02Icon} size={24} className="stroke-[3]" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Day Execution Complete.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Everything planned for today is finished. Your retention ladder and interview readiness trajectory are updated.
          </p>
        </div>

        {/* Telemetry Summary */}
        <div className="flex items-center justify-center gap-6 pt-2 font-mono text-xs">
          <div>
            <span className="text-neutral-500 uppercase text-[10px] block font-bold">Tasks Finished</span>
            <span className="font-bold text-white text-sm">
              {totalTasks} / {totalTasks}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-white/[0.08]" />
          <div>
            <span className="text-neutral-500 uppercase text-[10px] block font-bold">Planned Time</span>
            <span className="font-bold text-white text-sm">{formatDuration(plannedMinutes)}</span>
          </div>
          {focusedMinutes > 0 && (
            <>
              <div className="w-[1px] h-6 bg-white/[0.08]" />
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block font-bold">Focused Time</span>
                <span className="font-bold text-emerald-400 text-sm">{formatDuration(focusedMinutes)}</span>
              </div>
            </>
          )}
        </div>

        {/* Optional Practice Link */}
        <div className="pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-mono font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border-white/[0.1] gap-2 transition-all active:scale-[0.98]"
          >
            <Link href={"/plan?optional=yes&date=" + date}>
              <Icon icon={SourceCodeIcon} size={14} className="text-[#FF0000]" />
              <span>Optional extra practice</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Tomorrow Preview */}
      {tomorrowPreview && (
        <div className="p-4 rounded-lg bg-[#080808] border border-white/[0.08] flex items-center justify-between gap-4 text-xs shadow-sm">
          <div>
            <span className="font-mono text-[10px] uppercase text-neutral-400 font-bold tracking-wider block mb-0.5">
              UP NEXT TOMORROW
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
