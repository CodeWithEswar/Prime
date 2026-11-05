"use client";

import * as React from "react";
import { motion, useSpring, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface CursorGlowProps {
  className?: string;
  size?: number;
  color?: string;
  opacity?: number;
}

export function CursorGlow({
  className,
  size = 480,
  color = "rgba(255, 0, 0, 0.08)",
  opacity = 1,
}: CursorGlowProps) {
  const reduced = usePrimeReducedMotion();
  const [isHovering, setIsHovering] = React.useState(false);
  const isTouchRef = React.useRef(false);

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { stiffness: 120, damping: 20, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  React.useEffect(() => {
    isTouchRef.current =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  React.useEffect(() => {
    if (reduced || isTouchRef.current) return;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isHovering) setIsHovering(true);
    };

    const handlePointerLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reduced, isHovering, mouseX, mouseY]);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: smoothX,
        y: smoothY,
        translateX: "-50%",
        translateY: "-50%",
        width: size,
        height: size,
        opacity: isHovering ? opacity : 0,
        pointerEvents: "none",
        zIndex: 5,
        borderRadius: "9999px",
        background: `radial-gradient(circle at 50% 50%, ${color} 0%, rgba(255, 0, 0, 0.02) 45%, transparent 70%)`,
        filter: "blur(20px)",
        transition: "opacity 0.4s ease-out",
      }}
      className={cn("pointer-events-none", className)}
    />
  );
}

