import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.10)] bg-[var(--prime-canvas)] px-3 py-1.5 text-sm text-[#ffffff] placeholder:text-[rgba(255,255,255,0.35)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] transition-all duration-100 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-[rgba(255,0,0,0.65)] focus-visible:shadow-[0_0_0_1px_#000000,0_0_0_3px_rgba(255,0,0,0.72)] disabled:cursor-not-allowed disabled:opacity-30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
