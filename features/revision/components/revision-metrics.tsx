"use client";

import { Icon } from "@/components/ui/icon";
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Overdue */}
      <button
        type="button"
        onClick={() => onSelectTab("due_queue")}
        className="flex items-center gap-4 p-4 rounded-md border border-[#222222] bg-[#0A0A0A] hover:border-[#333333] transition-all text-left"
      >
        <div className="w-10 h-10 rounded bg-[#160808] border border-[#331111] flex items-center justify-center flex-shrink-0 text-[#FF0000]">
          <Icon icon={RotateRight01Icon} size={20} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-[#FF0000] font-mono leading-none">
            {counts.overdue}
          </div>
          <div className="text-xs text-[#888888] font-medium mt-1">Overdue</div>
        </div>
      </button>

      {/* Due Today - active highlight */}
      <button
        type="button"
        onClick={() => onSelectTab("due_queue")}
        className={`flex items-center gap-4 p-4 rounded-md border transition-all text-left ${
          activeTab === "due_queue"
            ? "border-[#7F1D1D] bg-[#120505] shadow-[0_0_12px_rgba(255,0,0,0.1)]"
            : "border-[#222222] bg-[#0A0A0A] hover:border-[#333333]"
        }`}
      >
        <div className="w-10 h-10 rounded bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center flex-shrink-0 text-[#EDEDED]">
          <Icon icon={Calendar03Icon} size={20} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-white font-mono leading-none">
            {counts.dueToday}
          </div>
          <div className="text-xs text-[#888888] font-medium mt-1">Due Today</div>
        </div>
      </button>

      {/* Upcoming */}
      <button
        type="button"
        onClick={() => onSelectTab("upcoming")}
        className={`flex items-center gap-4 p-4 rounded-md border transition-all text-left ${
          activeTab === "upcoming"
            ? "border-[#7F1D1D] bg-[#120505]"
            : "border-[#222222] bg-[#0A0A0A] hover:border-[#333333]"
        }`}
      >
        <div className="w-10 h-10 rounded bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center flex-shrink-0 text-[#EDEDED]">
          <Icon icon={Layers01Icon} size={20} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-white font-mono leading-none">
            {counts.upcoming}
          </div>
          <div className="text-xs text-[#888888] font-medium mt-1">Upcoming</div>
        </div>
      </button>

      {/* This Week */}
      <div className="flex items-center gap-4 p-4 rounded-md border border-[#222222] bg-[#0A0A0A] text-left">
        <div className="w-10 h-10 rounded bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center flex-shrink-0 text-[#EDEDED]">
          <Icon icon={Analytics01Icon} size={20} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-white font-mono leading-none">
            {counts.thisWeek}
          </div>
          <div className="text-xs text-[#888888] font-medium mt-1">This Week</div>
        </div>
      </div>
    </div>
  );
}

