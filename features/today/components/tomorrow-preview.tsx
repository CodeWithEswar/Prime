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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-[#080808] border border-white/[0.08] text-xs shadow-sm">
      {/* Left: Metadata */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-neutral-900 border border-white/[0.08] text-neutral-400 shrink-0">
          <Icon icon={Calendar01Icon} size={16} className="text-[#FF0000]" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              TOMORROW · {preview.dayOfWeek}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="font-mono text-xs font-bold text-white">
              {formatDuration(preview.plannedMinutes)}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 font-sans">
            {preview.taskCount} planned task{preview.taskCount !== 1 ? "s" : ""}
            {preview.revisionCount > 0 && ` (${preview.revisionCount} spaced review)`}
          </div>
        </div>
      </div>

      {/* Right: Link to full planner */}
      <Link
        href="/plan"
        className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-neutral-400 hover:text-white transition-colors shrink-0 self-start sm:self-auto"
      >
        <span>Open Planner</span>
        <Icon icon={ArrowRight01Icon} size={13} />
      </Link>
    </div>
  );
}
