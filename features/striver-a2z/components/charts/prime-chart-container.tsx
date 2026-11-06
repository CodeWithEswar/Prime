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
  mobileControls?: React.ReactNode;
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
  mobileControls,
  children,
  className,
  minHeight = 260,
}: PrimeChartContainerProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 p-3.5 sm:p-5 backdrop-blur-md space-y-3.5 sm:space-y-4 shadow-sm relative overflow-hidden",
        className
      )}
    >
      {/* Chart Header Bar - Anchors title on left and controls/dropdown on top-right */}
      <div className="flex items-start justify-between gap-2.5 sm:gap-4 border-b border-white/[0.06] pb-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-tight sm:tracking-wider text-white break-words leading-snug">
              {title}
            </h3>
            {badge && (
              <Badge
                variant={badgeVariant}
                className="font-mono text-[9px] sm:text-[10px] px-1.5 py-0 bg-white/[0.04] text-neutral-300 border-white/[0.1] shrink-0"
              >
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-sans leading-relaxed break-words">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Controls Container - Anchored Top-Right */}
        {(controls || mobileControls) && (
          <div className="shrink-0 flex items-center gap-1.5 self-start pt-0.5">
            {controls && (
              <div className={cn("items-center gap-1.5", mobileControls ? "hidden sm:flex" : "flex")}>
                {controls}
              </div>
            )}
            {mobileControls && (
              <div className="flex sm:hidden items-center">
                {mobileControls}
              </div>
            )}
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
