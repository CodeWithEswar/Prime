"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { CheckmarkCircle02Icon, ArrowRight01Icon, SourceCodeIcon } from "@hugeicons/core-free-icons";
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
      <div className="p-6 rounded-lg bg-[#0C0C0C] border border-[#222222] text-center space-y-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.6)] mx-auto">
          <Icon icon={CheckmarkCircle02Icon} size={22} />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white">Day Complete.</h2>
          <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
            Everything planned for today is finished. Your retention ladder and curriculum progress are updated.
          </p>
        </div>

        {/* Telemetry Summary */}
        <div className="flex items-center justify-center gap-6 pt-2 font-mono text-xs">
          <div>
            <span className="text-[#666666] uppercase text-[10px] block">Tasks Done</span>
            <span className="font-bold text-white">
              {totalTasks} / {totalTasks}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-[#1F1F1F]" />
          <div>
            <span className="text-[#666666] uppercase text-[10px] block">Planned Time</span>
            <span className="font-bold text-white">{formatDuration(plannedMinutes)}</span>
          </div>
          {focusedMinutes > 0 && (
            <>
              <div className="w-[1px] h-6 bg-[#1F1F1F]" />
              <div>
                <span className="text-[#666666] uppercase text-[10px] block">Focused Time</span>
                <span className="font-bold text-white">{formatDuration(focusedMinutes)}</span>
              </div>
            </>
          )}
        </div>

        {/* Optional Practice Link */}
        <div className="pt-3">
          <Button asChild variant="secondary" size="sm">
            <Link href={"/plan?optional=yes&date=" + date}><Icon icon={SourceCodeIcon} size={14} />Optional next practice</Link>
          </Button>
        </div>
      </div>

      {/* Tomorrow Preview */}
      {tomorrowPreview && (
        <div className="p-4 rounded-lg bg-[#080808] border border-[#161616] flex items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-mono text-[10px] uppercase text-[#666666] tracking-wider block mb-0.5">
              UP NEXT TOMORROW
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
            <span>View Full Plan</span>
            <Icon icon={ArrowRight01Icon} size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}

