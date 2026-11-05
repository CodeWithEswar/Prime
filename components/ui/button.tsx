import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-100 cursor-pointer disabled:pointer-events-none disabled:opacity-30 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_#000000,0_0_0_3px_rgba(255,0,0,0.72)] hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.985]",
  {
    variants: {
      variant: {
        // PRIME Solid Precision Neumorphic Primary (Pure Red #FF0000)
        primary:
          "btn-neumorphic-primary rounded-[var(--radius-sm)] font-semibold text-white",
        // Solid Black Neumorphic Secondary (#050505 with physical edge depth)
        secondary: "btn-neumorphic-secondary rounded-[var(--radius-sm)]",
        // Clean Minimal Outline (White-alpha border)
        outline:
          "border border-[var(--border-default)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] rounded-[var(--radius-sm)] active:translate-y-[0.5px]",
        // Restrained Ghost
        ghost:
          "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] rounded-[var(--radius-sm)]",
        // Destructive Precision Control
        destructive:
          "bg-[var(--prime-accent-soft)] text-white border border-[var(--prime-accent-border)] hover:bg-[var(--prime-accent-border)]/50 active:bg-[var(--prime-accent)] rounded-[var(--radius-sm)]",
        // Subtle Link Variant
        link: "text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        sm: "h-[var(--control-height-sm)] px-2.5 text-xs",
        default: "h-[var(--control-height)] px-3 py-1 text-[13px]",
        lg: "h-[var(--control-height-lg)] px-4 text-sm",
        icon: "h-[var(--control-height)] w-[var(--control-height)] p-0",
        "icon-sm":
          "h-[var(--control-height-sm)] w-[var(--control-height-sm)] p-0 text-xs",
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
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {asChild ? <Slottable>{children}</Slottable> : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
