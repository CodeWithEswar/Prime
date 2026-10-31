import * as React from "react";
import { cn } from "@/lib/utils";

export interface KeyboardKeyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

/**
 * PRIME Physical Keycap Primitive
 * Developer-grade physical shortcut indicator with tactile beveling.
 */
export function KeyboardKey({ className, children, ...props }: KeyboardKeyProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center px-1.5 font-mono text-[10px] font-medium text-[var(--text-secondary)] select-none",
        "rounded-[var(--radius-xs)] bg-[var(--surface-raised)] border border-[var(--border-default)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_1px_rgba(0,0,0,0.6)]",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
