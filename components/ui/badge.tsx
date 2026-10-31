import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface-raised)] text-[var(--foreground)] border border-[var(--border)]",
        secondary:
          "bg-[var(--surface-elevated)] text-[var(--foreground-secondary)] border border-[var(--border-subtle)]",
        accent:
          "bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-border)] font-semibold",
        outline:
          "border border-[var(--border)] text-[var(--foreground-muted)] bg-transparent",
        subtle:
          "bg-[var(--surface)] text-[var(--foreground-muted)] border border-transparent",
        destructive: "bg-red-950/40 text-red-400 border border-red-900/50",
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
