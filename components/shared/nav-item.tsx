import * as React from "react";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface NavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: IconSvgElement;
  label: string;
  badge?: string | number;
  active?: boolean;
}

/**
 * PRIME Navigation Item Primitive
 * Precision sidebar/tab nav element with Pure Red active line accent.
 */
export function NavItem({
  icon,
  label,
  badge,
  active = false,
  className,
  ...props
}: NavItemProps) {
  return (
    <a
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-all duration-120 cursor-pointer select-none",
        active
          ? "bg-[var(--surface-raised)] text-white font-semibold"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-white",
        className
      )}
      {...props}
    >
      {/* Pure Red Active Indicator Bar */}
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
      )}

      <Icon
        icon={icon}
        size={17}
        className={cn(
          "transition-colors",
          active
            ? "text-[var(--accent)]"
            : "text-[var(--text-tertiary)] group-hover:text-white"
        )}
      />

      <span className="truncate">{label}</span>

      {badge !== undefined && (
        <span
          className={cn(
            "ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono rounded-[var(--radius-xs)]",
            active
              ? "bg-[var(--accent)] text-white font-bold"
              : "bg-[var(--surface-elevated)] text-[var(--text-tertiary)]"
          )}
        >
          {badge}
        </span>
      )}
    </a>
  );
}
