"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  borderColor?: string;
  glowRadius?: number;
}

export const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  (
    {
      children,
      className,
      spotlightColor = "rgba(255, 0, 0, 0.08)",
      borderColor = "rgba(255, 0, 0, 0.35)",
      glowRadius = 320,
      ...props
    },
    ref
  ) => {
    const reduced = usePrimeReducedMotion();
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (reduced) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      },
      [mouseX, mouseY, reduced]
    );

    const handleMouseLeave = () => {
      mouseX.set(-1000);
      mouseY.set(-1000);
    };

    const background = useMotionTemplate`radial-gradient(${glowRadius}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;
    const borderGlow = useMotionTemplate`radial-gradient(${glowRadius}px circle at ${mouseX}px ${mouseY}px, ${borderColor}, transparent 70%)`;

    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#080808] transition-all duration-300 hover:border-[#2E2E2E] hover:bg-[#0B0B0B]",
          className
        )}
        {...props}
      >
        {/* Border glow layer */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
            style={{
              background: borderGlow,
              maskImage:
                "linear-gradient(black, black) content-box, linear-gradient(black, black)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              padding: "1px",
            }}
          />
        )}

        {/* Interior spotlight gradient */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
            style={{ background }}
          />
        )}

        {/* Card Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

SpotlightCard.displayName = "SpotlightCard";

