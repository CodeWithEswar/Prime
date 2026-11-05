"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ArrowRight01Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import type { TomorrowPreview } from "../types";
import { formatDuration } from "./daily-load-strip";

interface TomorrowPreviewProps {
  preview: TomorrowPreview | null;
}

export function TomorrowPreviewSection({ preview }: TomorrowPreviewProps) {
  if (!preview) return null;

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-[#080808] border border-[#161616] text-xs">
      {/* Left: Metadata */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-[#111111] border border-[#222222] text-[#888888]">
          <Icon icon={Calendar01Icon} size={15} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              TOMORROW · {preview.dayOfWeek}
            </span>
            <span className="text-[#333333]">·</span>
            <span className="font-mono text-xs font-semibold text-white">
              {formatDuration(preview.plannedMinutes)}
            </span>
          </div>
          <div className="text-[11px] text-[#666666] mt-0.5">
            {preview.taskCount} planned task{preview.taskCount !== 1 ? "s" : ""}
            {preview.revisionCount > 0 && ` (${preview.revisionCount} revision)`}
          </div>
        </div>
      </div>

      {/* Right: Link to full planner */}
      <Link
        href="/plan"
        className="inline-flex items-center gap-1 text-xs font-medium text-[#888888] hover:text-white transition-colors shrink-0"
      >
        <span>View in Plan</span>
        <Icon icon={ArrowRight01Icon} size={12} />
      </Link>
    </div>
  );
}

