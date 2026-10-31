"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--surface-overlay)] group-[.toaster]:text-white group-[.toaster]:border-[var(--border-strong)] group-[.toaster]:shadow-elevation-4 group-[.toaster]:rounded-[var(--radius-md)]",
          description: "group-[.toast]:text-[var(--text-secondary)]",
          actionButton:
            "group-[.toast]:bg-[var(--accent)] group-[.toast]:text-white font-medium group-[.toast]:rounded-[var(--radius-xs)]",
          cancelButton:
            "group-[.toast]:bg-[var(--surface-hover)] group-[.toast]:text-[var(--text-secondary)] group-[.toast]:rounded-[var(--radius-xs)]",
        },
      }}
      {...props}
    />
  );
}

export { toast };
