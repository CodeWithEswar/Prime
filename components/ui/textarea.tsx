import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.10)] bg-[var(--prime-canvas)] px-3 py-2 text-sm text-white placeholder:text-[rgba(255,255,255,0.35)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] transition-all duration-100 focus-visible:outline-none focus-visible:border-[rgba(255,0,0,0.65)] focus-visible:shadow-[0_0_0_1px_#000000,0_0_0_3px_rgba(255,0,0,0.72)] disabled:cursor-not-allowed disabled:opacity-30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
