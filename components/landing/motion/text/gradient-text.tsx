"use client";

import { motion } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";

export interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** Primary accent tone, defaults to pure red (#FF0000) */
  accentColor?: string;
}

export function GradientText({
  children,
  className = "",
  accentColor = "#FF0000",
}: GradientTextProps) {
  const reduced = usePrimeReducedMotion();

  if (reduced) {
    return (
      <span className={`text-[#FF0000] font-semibold ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, #FFFFFF 0%, ${accentColor} 50%, #FFFFFF 100%)`,
        backgroundSize: "200% auto",
      }}
      animate={{
        backgroundPosition: ["0% center", "-200% center"],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
}

