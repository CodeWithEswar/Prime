"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  RotateRight01Icon,
  Calendar03Icon,
  Layers01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";
import type { RevisionSummaryCounts } from "../types";

interface RevisionMetricsProps {
  counts: RevisionSummaryCounts;
  activeTab: string;
  onSelectTab: (tab: "due_queue" | "upcoming" | "completed" | "all") => void;
}

export function RevisionMetrics({ counts, activeTab, onSelectTab }: RevisionMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {/* Overdue */}
      <button
        type="button"
        onClick={() => onSelectTab("due_queue")}
        className={cn(
          "flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all text-left cursor-pointer min-w-0",
          activeTab === "due_queue" && counts.overdue > 0
            ? "border-[#FF0000]/60 bg-[#160606] shadow-[0_0_12px_rgba(255,0,0,0.15)]"
            : "border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#333333]"
        )}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#160808] border border-[#331111] flex items-center justify-center flex-shrink-0 text-[#FF0000]">
          <Icon icon={RotateRight01Icon} size={16} className="sm:hidden" />
          <Icon icon={RotateRight01Icon} size={20} className="hidden sm:block" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl sm:text-2xl font-extrabold text-[#FF0000] font-mono leading-none truncate">
            {counts.overdue}
          </div>
          <div className="text-[11px] sm:text-xs text-[#888888] font-medium mt-1 truncate">
            Overdue
          </div>
        </div>
      </button>

      {/* Due Today - active highlight */}
      <button
        type="button"
        onClick={() => onSelectTab("due_queue")}
        className={cn(
          "flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all text-left cursor-pointer min-w-0",
          activeTab === "due_queue"
            ? "border-[#FF0000]/60 bg-[#140606] shadow-[0_0_12px_rgba(255,0,0,0.15)]"
            : "border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#333333]"
        )}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center flex-shrink-0 text-[#EDEDED]">
          <Icon icon={Calendar03Icon} size={16} className="sm:hidden" />
          <Icon icon={Calendar03Icon} size={20} className="hidden sm:block" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono leading-none truncate">
            {counts.dueToday}
          </div>
          <div className="text-[11px] sm:text-xs text-[#888888] font-medium mt-1 truncate">
            Due Today
          </div>
        </div>
      </button>

      {/* Upcoming */}
      <button
        type="button"
        onClick={() => onSelectTab("upcoming")}
        className={cn(
          "flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all text-left cursor-pointer min-w-0",
          activeTab === "upcoming"
            ? "border-[#FF0000]/60 bg-[#140606] shadow-[0_0_12px_rgba(255,0,0,0.15)]"
            : "border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#333333]"
        )}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center flex-shrink-0 text-[#EDEDED]">
          <Icon icon={Layers01Icon} size={16} className="sm:hidden" />
          <Icon icon={Layers01Icon} size={20} className="hidden sm:block" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono leading-none truncate">
            {counts.upcoming}
          </div>
          <div className="text-[11px] sm:text-xs text-[#888888] font-medium mt-1 truncate">
            Upcoming
          </div>
        </div>
      </button>

      {/* This Week */}
      <div className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] text-left min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center flex-shrink-0 text-[#EDEDED]">
          <Icon icon={Analytics01Icon} size={16} className="sm:hidden" />
          <Icon icon={Analytics01Icon} size={20} className="hidden sm:block" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono leading-none truncate">
            {counts.thisWeek}
          </div>
          <div className="text-[11px] sm:text-xs text-[#888888] font-medium mt-1 truncate">
            This Week
          </div>
        </div>
      </div>
    </div>
  );
}

