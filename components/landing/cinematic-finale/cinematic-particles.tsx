"use client";

import { useMemo } from "react";
import { usePrimeReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface CinematicParticlesProps {
  count?: number;
  className?: string;
}

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  isRed: boolean;
  opacity: number;
}

export function CinematicParticles({
  count = 18,
  className = "",
}: CinematicParticlesProps) {
  const reduced = usePrimeReducedMotion();

  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${15 + (i * 73) % 70}%`,
      top: `${30 + (i * 47) % 60}%`,
      size: (i % 3 === 0 ? 2.5 : i % 2 === 0 ? 1.8 : 1.2),
      duration: 12 + (i % 7) * 3,
      delay: (i % 5) * 1.8,
      isRed: i % 3 === 0,
      opacity: 0.25 + (i % 4) * 0.15,
    }));
  }, [count]);

  if (reduced) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden select-none z-15",
        className
      )}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-[particleFloat_linear_infinite]"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.isRed ? "rgba(255, 0, 0, 0.75)" : "rgba(255, 255, 255, 0.65)",
            boxShadow: p.isRed
              ? "0 0 6px rgba(255, 0, 0, 0.9)"
              : "0 0 4px rgba(255, 255, 255, 0.7)",
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

