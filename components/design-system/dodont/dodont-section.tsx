import * as React from "react";
import { Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import type { DoDontItem } from "@/lib/design-system/types";

export interface DoDontSectionProps {
  dodont?: DoDontItem[];
  className?: string;
}

export function DoDontSection({ dodont, className }: DoDontSectionProps) {
  if (!dodont || dodont.length === 0) return null;

  return (
    <section id="usage" className={className}>
      <h2 className="text-lg font-bold text-white mb-2">Usage Guidelines</h2>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Best practices and anti-patterns for implementing this component.
      </p>

      <div className="space-y-4">
        {dodont.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DO Card */}
            <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.14)] bg-[#030303] space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(255,255,255,0.10)] text-white">
                  <Icon icon={Tick02Icon} size={13} />
                </div>
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  DO
                </span>
              </div>
              <div className="text-xs font-semibold text-white">{item.do}</div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {item.doDescription}
              </p>
            </div>

            {/* DON'T Card */}
            <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,0,0,0.30)] bg-[#030303] space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(255,0,0,0.15)] text-[#ff0000]">
                  <Icon icon={Cancel01Icon} size={13} />
                </div>
                <span className="font-mono text-xs font-bold text-[#ff0000] tracking-wider">
                  DON&apos;T
                </span>
              </div>
              <div className="text-xs font-semibold text-white">{item.dont}</div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {item.dontDescription}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
