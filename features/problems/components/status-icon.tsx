import * as React from "react";
import {
  CircleIcon,
  Loading02Icon,
  CheckmarkCircle02Icon,
  ReloadIcon,
  Diamond02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface StatusIconProps {
  status?: string | null;
  size?: number;
  className?: string;
}

/**
 * Prime Status Icon Component
 * Vectorized Hugeicons representation for all user practice statuses with calibrated colors.
 */
export function StatusIcon({ status, size = 14, className }: StatusIconProps) {
  switch (status) {
    case "solved":
      return (
        <Icon
          icon={CheckmarkCircle02Icon}
          size={size}
          className={cn("text-[#10B981] shrink-0", className)}
        />
      );
    case "needs_revision":
      return (
        <Icon
          icon={ReloadIcon}
          size={size}
          className={cn("text-[var(--accent)] shrink-0", className)}
        />
      );
    case "mastered":
      return (
        <Icon
          icon={Diamond02Icon}
          size={size}
          className={cn("text-purple-400 shrink-0", className)}
        />
      );
    case "attempted":
      return (
        <Icon
          icon={Loading02Icon}
          size={size}
          className={cn("text-[#F59E0B] shrink-0", className)}
        />
      );
    case "not_started":
      return (
        <Icon
          icon={CircleIcon}
          size={size}
          className={cn("text-[var(--text-disabled)] shrink-0", className)}
        />
      );
    default:
      return (
        <Icon
          icon={CircleIcon}
          size={size}
          className={cn("text-[var(--text-tertiary)] shrink-0", className)}
        />
      );
  }
}
