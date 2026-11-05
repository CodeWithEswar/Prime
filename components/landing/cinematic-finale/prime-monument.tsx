"use client";

import { motion } from "motion/react";
import {
  PRIME_MARK_PATH_LOWER,
  PRIME_MARK_PATH_UPPER,
} from "@/components/branding/prime-mark";
import { PRIME_WORDMARK_PATH } from "@/components/branding/prime-wordmark";
import { usePrimeReducedMotion } from "@/lib/motion";
import { cinematicMotion } from "./motion-config";
import { cn } from "@/lib/utils";

export interface PrimeMonumentProps {
  className?: string;
}

/**
 * Distant monumental PRIME logo integrated into the bridge's vanishing point.
 * The brightest element in the composition: pure white core with atmospheric red halo.
 * Strictly free of extraneous badges or neon clutter.
 */
export function PrimeMonument({ className = "" }: PrimeMonumentProps) {
  const reduced = usePrimeReducedMotion();

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {/* 1. Volumetric Backlit Fog Glow Dome behind Logo */}
      <motion.div
        initial={reduced ? undefined : { opacity: 0.3, scale: 0.88 }}
        whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: cinematicMotion.logo.duration, ease: cinematicMotion.logo.ease }}
        className="absolute -top-24 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#FF0000]/22 blur-[65px] pointer-events-none"
      />

      {/* 2. Hot White Inner Fog Core */}
      <div className="absolute -top-10 w-44 h-44 rounded-full bg-white/12 blur-2xl pointer-events-none" />

      {/* 3. Subtle Vertical Light Pillar piercing the night mist */}
      <div
        className="absolute -top-72 w-28 sm:w-36 h-96 opacity-25 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(255, 255, 255, 0.35) 0%, rgba(255, 0, 0, 0.25) 30%, transparent 100%)",
          filter: "blur(18px)",
        }}
      />

      {/* 4. The Monumental PRIME Mark & Wordmark */}
      <motion.div
        initial={reduced ? undefined : { opacity: 0, y: 14, filter: "blur(4px)" }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: cinematicMotion.logo.duration,
          delay: cinematicMotion.logo.delay,
          ease: cinematicMotion.logo.ease,
        }}
        className="relative z-10 flex flex-col items-center gap-2.5 sm:gap-3"
      >
        {/* PRIME Mark */}
        <div className="relative">
          {/* Subtle outer red bloom */}
          <div className="absolute inset-0 scale-150 rounded-full bg-[#FF0000]/35 blur-xl pointer-events-none" />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)] drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]"
            fill="none"
          >
            <path d={PRIME_MARK_PATH_LOWER} fill="#FFFFFF" />
            <path d={PRIME_MARK_PATH_UPPER} fill="#FF1E1E" />
          </svg>
        </div>

        {/* PRIME Wordmark */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 109 20"
            className="w-32 sm:w-40 lg:w-44 drop-shadow-[0_0_20px_rgba(255,0,0,0.65)] drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            fill="none"
          >
            <path d={PRIME_WORDMARK_PATH} fill="#FFFFFF" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
