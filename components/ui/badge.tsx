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
        success:
          "bg-[var(--success-soft)] text-[var(--success-foreground)] border border-[var(--success-border)]",
        warning:
          "bg-[var(--warning-soft)] text-[var(--warning-foreground)] border border-[var(--warning-border)]",
        destructive:
          "bg-[var(--destructive-soft)] text-red-400 border border-[var(--destructive-border)]",
        // DSA Sheet Difficulty Variants
        easy: "bg-[var(--success-soft)] text-[var(--success-foreground)] border border-[var(--success-border)]",
        medium:
          "bg-[var(--warning-soft)] text-[var(--warning-foreground)] border border-[var(--warning-border)]",
        hard: "bg-[var(--destructive-soft)] text-red-400 border border-[var(--destructive-border)] font-semibold",
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
