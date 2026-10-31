import * as React from "react";
import type { AnatomyItem } from "@/lib/design-system/types";

export interface AnatomySectionProps {
  anatomy?: AnatomyItem[];
  className?: string;
}

export function AnatomySection({ anatomy, className }: AnatomySectionProps) {
  if (!anatomy || anatomy.length === 0) return null;

  return (
    <section id="anatomy" className={className}>
      <h2 className="text-lg font-bold text-white mb-2">Anatomy</h2>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Structural breakdown and component composition slots.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {anatomy.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3.5 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303]"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#111111] border border-[rgba(255,255,255,0.18)] font-mono text-[10px] font-bold text-white">
              {item.id}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white">{item.label}</div>
              <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
