"use client";

import * as React from "react";
import { motion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface MagneticControlProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

const noopSubscribe = () => () => {};
const getIsTouch = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export function MagneticControl({
  children,
  className,
  intensity = 0.25,
}: MagneticControlProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const reduced = usePrimeReducedMotion();
  const isTouch = React.useSyncExternalStore(noopSubscribe, getIsTouch, () => false);

  const springX = useSpring(0, { stiffness: 350, damping: 25, mass: 0.5 });
  const springY = useSpring(0, { stiffness: 350, damping: 25, mass: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * intensity;
    const distanceY = (e.clientY - centerY) * intensity;
    springX.set(Math.max(-6, Math.min(6, distanceX)));
    springY.set(Math.max(-6, Math.min(6, distanceY)));
  };

  const handleMouseLeave = () => {
    springX.set(0);
    springY.set(0);
  };

  if (reduced || isTouch) {
    return <div className={cn("inline-block", className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

