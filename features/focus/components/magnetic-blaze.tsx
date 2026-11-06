/**
 * PRIME Focus Mode — 360° Magnetic Blaze Background
 * Full-viewport deep-black workspace with inward-accelerating red energy rays,
 * subtle atmospheric glow, and a protected central exclusion zone for countdown clarity.
 */

"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { MagneticBlazeRays } from "./magnetic-blaze-rays";

interface MagneticBlazeProps {
  isRunning: boolean;
  isPaused: boolean;
  reducedMotion?: boolean;
}

export const MagneticBlaze = memo(function MagneticBlaze({
  isRunning,
  isPaused,
  reducedMotion = false,
}: MagneticBlazeProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#000000]">
      {/* Layer 1: Ambient Deep Red Gravitational Aura */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          opacity: isRunning ? (reducedMotion ? 0.18 : [0.15, 0.25, 0.15]) : 0.08,
          scale: isRunning ? [1, 1.04, 1] : 0.96,
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="w-[500px] h-[360px] sm:w-[720px] sm:h-[480px] lg:w-[960px] lg:h-[600px] rounded-[50%] blur-[90px] sm:blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,0,0,0.45) 0%, rgba(200,0,0,0.18) 45%, rgba(100,0,0,0.04) 70%, transparent 85%)",
          }}
        />
      </motion.div>

      {/* Layer 2: 360° Inward-Converging Magnetic Rays (Canvas 2D Engine) */}
      <MagneticBlazeRays
        isRunning={isRunning}
        isPaused={isPaused}
        reducedMotion={reducedMotion}
      />

      {/* Layer 3: Central Soft Energy Bloom (with smooth falloff around the timer text) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        animate={{
          opacity: isRunning ? 0.28 : 0.1,
          scale: isRunning ? 1 : 0.94,
        }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="w-[360px] h-[220px] sm:w-[480px] sm:h-[280px] rounded-[50%] blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,50,50,0.3) 0%, rgba(255,0,0,0.12) 50%, transparent 75%)",
          }}
        />
      </motion.div>

      {/* Layer 4: Peripheral Darkness Vignette (Focus concentration tunnel) */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.92) 85%, #000000 100%)",
        }}
      />
    </div>
  );
});
