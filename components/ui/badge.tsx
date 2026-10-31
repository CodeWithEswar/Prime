import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2 py-0.5 text-xs font-medium transition-colors select-none font-mono",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface-raised)] text-[var(--foreground)] border border-[var(--border-default)]",
        secondary:
          "bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
        outline:
          "border border-[var(--border-default)] text-[var(--text-secondary)] bg-transparent",
        accent:
          "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-semibold",
        // Monochromatic Difficulty System (Amendment Section 18)
        easy: "bg-[var(--surface-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-normal",
        medium:
          "bg-[var(--surface-raised)] text-white border border-[var(--border-default)] font-medium",
        hard: "bg-[var(--surface-elevated)] text-white border border-[var(--border-strong)] font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
