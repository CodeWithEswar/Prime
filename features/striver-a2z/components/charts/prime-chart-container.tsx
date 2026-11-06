"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PrimeChartContainerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
  controls?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  minHeight?: number | string;
}

export function PrimeChartContainer({
  title,
  subtitle,
  badge,
  badgeVariant = "outline",
  controls,
  children,
  className,
  minHeight = 260,
}: PrimeChartContainerProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-sm relative overflow-hidden",
        className
      )}
    >
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              {title}
            </h3>
            {badge && (
              <Badge
                variant={badgeVariant}
                className="font-mono text-[10px] px-1.5 py-0 bg-white/[0.04] text-neutral-300 border-white/[0.1] shrink-0"
              >
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {controls && (
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
            {controls}
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div style={{ minHeight }} className="w-full relative">
        {children}
      </div>
    </div>
  );
}

