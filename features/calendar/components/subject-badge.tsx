"use client";

import * as React from "react";
import {
  Database01Icon,
  CpuIcon,
  NetworkIcon,
  JavaIcon,
  SourceCodeIcon,
  Brain02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { CalendarSubject } from "../types";

export const SUBJECT_CONFIG: Record<
  CalendarSubject,
  {
    label: string;
    shortLabel: string;
    icon: typeof Database01Icon;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {
  dsa: {
    label: "DSA",
    shortLabel: "DSA",
    icon: SourceCodeIcon,
    color: "#FF4D4D", // Pure Red accent
    bgColor: "rgba(255, 0, 0, 0.12)",
    borderColor: "rgba(255, 0, 0, 0.35)",
    description: "Data Structures & Algorithms",
  },
  dbms: {
    label: "DBMS",
    shortLabel: "DBMS",
    icon: Database01Icon,
    color: "#00E5FF", // Vibrant Cyan
    bgColor: "rgba(0, 229, 255, 0.12)",
    borderColor: "rgba(0, 229, 255, 0.35)",
    description: "Database Management Systems",
  },
  os: {
    label: "OS",
    shortLabel: "OS",
    icon: CpuIcon,
    color: "#F59E0B", // Vibrant Amber
    bgColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.35)",
    description: "Operating Systems",
  },
  cn: {
    label: "CN",
    shortLabel: "CN",
    icon: NetworkIcon,
    color: "#3B82F6", // Vibrant Blue
    bgColor: "rgba(59, 130, 246, 0.12)",
    borderColor: "rgba(59, 130, 246, 0.35)",
    description: "Computer Networks",
  },
  oop: {
    label: "OOP",
    shortLabel: "OOP",
    icon: JavaIcon,
    color: "#A855F7", // Vibrant Purple
    bgColor: "rgba(168, 85, 247, 0.12)",
    borderColor: "rgba(168, 85, 247, 0.35)",
    description: "Object-Oriented Programming",
  },
  aptitude: {
    label: "Aptitude",
    shortLabel: "APT",
    icon: Brain02Icon,
    color: "#EC4899", // Vibrant Rose
    bgColor: "rgba(236, 72, 153, 0.12)",
    borderColor: "rgba(236, 72, 153, 0.35)",
    description: "Quantitative, Logical & Verbal Aptitude",
  },
};

export interface SubjectBadgeProps {
  subject: CalendarSubject;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function SubjectBadge({
  subject,
  size = "xs",
  showLabel = true,
  className,
}: SubjectBadgeProps) {
  const cfg = SUBJECT_CONFIG[subject];
  if (!cfg) return null;

  const iconSizes = {
    xs: 11,
    sm: 13,
    md: 15,
  };

  const badgePaddings = {
    xs: "px-1.5 py-0.5 text-[9px] gap-1",
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-mono font-bold border transition-all shrink-0 select-none shadow-sm",
        badgePaddings[size],
        className
      )}
      style={{
        color: cfg.color,
        backgroundColor: cfg.bgColor,
        borderColor: cfg.borderColor,
      }}
      title={`${cfg.label}: ${cfg.description}`}
    >
      <Icon icon={cfg.icon} size={iconSizes[size]} className="shrink-0" />
      {showLabel && (
        <span className={size === "xs" ? "hidden sm:inline" : undefined}>
          {cfg.shortLabel}
        </span>
      )}
    </span>
  );
}

