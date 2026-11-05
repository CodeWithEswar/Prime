"use client";
import { motion } from "motion/react";
import { motionDuration, motionEase, usePrimeReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
export function RouteTerminal({ className }: { className?: string }) {
  const reduced = usePrimeReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      layoutId={reduced ? undefined : "prime-shell-active-terminal"}
      className={cn("shell-route-terminal", className)}
      transition={{
        duration: reduced ? 0 : motionDuration.normal,
        ease: motionEase.standard,
      }}
    >
      <i />
      <b />
    </motion.span>
  );
}
