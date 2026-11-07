"use client";

import * as React from "react";
import {
  InformationCircleIcon,
  Tick02Icon,
  AlertCircleIcon,
  FireIcon,
  Cancel01Icon,
  BookOpen01Icon,
  Award01Icon,
  CodeCircleIcon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type CalloutType =
  | "note"
  | "tip"
  | "warning"
  | "important"
  | "caution"
  | "definition"
  | "example"
  | "key-takeaway";

interface CalloutConfig {
  icon: IconSvgElement;
  title: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  badgeBg: string;
}

const calloutConfigs: Record<CalloutType, CalloutConfig> = {
  note: {
    icon: InformationCircleIcon,
    title: "NOTE",
    borderColor: "border-[#3B82F6]/40",
    bgColor: "bg-[#3B82F6]/[0.06]",
    textColor: "text-[#93C5FD]",
    badgeBg: "bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/30",
  },
  tip: {
    icon: Tick02Icon,
    title: "TIP",
    borderColor: "border-[#10B981]/40",
    bgColor: "bg-[#10B981]/[0.06]",
    textColor: "text-[#6EE7B7]",
    badgeBg: "bg-[#10B981]/15 text-[#6EE7B7] border-[#10B981]/30",
  },
  warning: {
    icon: AlertCircleIcon,
    title: "WARNING",
    borderColor: "border-[#F59E0B]/40",
    bgColor: "bg-[#F59E0B]/[0.06]",
    textColor: "text-[#FCD34D]",
    badgeBg: "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30",
  },
  important: {
    icon: FireIcon,
    title: "IMPORTANT",
    borderColor: "border-[#FF0000]/40",
    bgColor: "bg-[#FF0000]/[0.06]",
    textColor: "text-[#FCA5A5]",
    badgeBg: "bg-[#FF0000]/15 text-[#FF0000] border-[#FF0000]/30",
  },
  caution: {
    icon: Cancel01Icon,
    title: "CAUTION",
    borderColor: "border-[#EF4444]/40",
    bgColor: "bg-[#EF4444]/[0.06]",
    textColor: "text-[#FCA5A5]",
    badgeBg: "bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/30",
  },
  definition: {
    icon: BookOpen01Icon,
    title: "DEFINITION",
    borderColor: "border-[#8B5CF6]/40",
    bgColor: "bg-[#8B5CF6]/[0.06]",
    textColor: "text-[#C4B5FD]",
    badgeBg: "bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30",
  },
  example: {
    icon: CodeCircleIcon,
    title: "EXAMPLE",
    borderColor: "border-[#06B6D4]/40",
    bgColor: "bg-[#06B6D4]/[0.06]",
    textColor: "text-[#67E8F9]",
    badgeBg: "bg-[#06B6D4]/15 text-[#67E8F9] border-[#06B6D4]/30",
  },
  "key-takeaway": {
    icon: Award01Icon,
    title: "KEY TAKEAWAY",
    borderColor: "border-[#EAB308]/40",
    bgColor: "bg-[#EAB308]/[0.06]",
    textColor: "text-[#FDE047]",
    badgeBg: "bg-[#EAB308]/15 text-[#FDE047] border-[#EAB308]/30",
  },
};

export interface RichCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function RichCallout({
  type = "note",
  title,
  children,
  className,
}: RichCalloutProps) {
  const config = calloutConfigs[type] ?? calloutConfigs.note;
  const displayTitle = title ?? config.title;

  return (
    <aside
      className={cn(
        "my-4 rounded-xl border-l-4 border p-3.5 sm:p-4 text-xs sm:text-sm font-sans transition-all shadow-sm",
        config.borderColor,
        config.bgColor,
        className
      )}
      role="note"
      aria-label={`${displayTitle} callout`}
    >
      <div className="flex items-center gap-2 mb-2 font-mono">
        <div
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border",
            config.badgeBg
          )}
        >
          <Icon icon={config.icon} size={12} />
        </div>
        <span className={cn("text-[11px] font-bold tracking-wider uppercase", config.textColor)}>
          {displayTitle}
        </span>
      </div>
      <div className="text-neutral-200 leading-relaxed font-sans space-y-2 [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

