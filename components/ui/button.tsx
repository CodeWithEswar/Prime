import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)]",
  {
    variants: {
      variant: {
        // PRIME Precision Hardware Control - Solid Neumorphic Primary
        primary:
          "btn-neumorphic-primary rounded-[var(--radius-sm)] font-semibold text-white",
        // Solid Elevated Secondary Surface Control
        secondary: "btn-neumorphic-secondary rounded-[var(--radius-sm)]",
        // Clean Minimal Outline
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] rounded-[var(--radius-sm)] active:translate-y-[0.5px]",
        // Restrained Ghost
        ghost:
          "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-[var(--radius-sm)]",
        // Destructive Precision Control
        destructive:
          "bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/30 active:bg-red-950/60 rounded-[var(--radius-sm)] shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
        // Subtle Link Variant
        link: "text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-10 px-5 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
