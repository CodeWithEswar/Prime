"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlowBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentColor?: string;
}

export const GlowBorderCard = React.forwardRef<HTMLDivElement, GlowBorderCardProps>(
  ({ children, className, accentColor = "rgba(255, 0, 0, 0.4)", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 transition-all duration-300 hover:border-[#333333] hover:shadow-[0_0_24px_rgba(255,0,0,0.06)]",
          className
        )}
        {...props}
      >
        {/* Subtle accent border reveal on hover */}
        <div
          aria-hidden="true"
          style={{
            background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
          }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {children}
      </div>
    );
  }
);

GlowBorderCard.displayName = "GlowBorderCard";

