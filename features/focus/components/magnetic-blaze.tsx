"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { MagneticParticles } from "./magnetic-particles";
import { MagneticFieldSvg } from "./magnetic-field-svg";

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
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Layer A: Ambient Deep Red Field (Oversized radial glow with smooth falloff) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          opacity: isRunning ? (reducedMotion ? 0.2 : [0.18, 0.28, 0.18]) : 0.08,
          scale: isRunning ? [1, 1.05, 1] : 0.95,
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="w-[480px] h-[480px] sm:w-[650px] sm:h-[650px] lg:w-[820px] lg:h-[820px] rounded-full blur-[80px] sm:blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,0,0,0.55) 0%, rgba(200,0,0,0.2) 38%, rgba(100,0,0,0.05) 60%, transparent 75%)",
          }}
        />
      </motion.div>

      {/* Layer E: Concentrated Soft Central Glow behind the countdown */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{
          opacity: isRunning ? 0.35 : 0.12,
          scale: isRunning ? 1 : 0.9,
        }}
        transition={{ duration: 0.8 }}
      >
        <div
          className="w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,50,50,0.45) 0%, rgba(255,0,0,0.15) 50%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Layer C & D: Magnetic Force Lines & Luminous Energy Arcs */}
      <MagneticFieldSvg
        isRunning={isRunning}
        isPaused={isPaused}
        reducedMotion={reducedMotion}
      />

      {/* Layer B: Gravitational Magnetic Particles (Canvas-accelerated) */}
      <MagneticParticles
        isRunning={isRunning}
        isPaused={isPaused}
        reducedMotion={reducedMotion}
      />

      {/* Layer F: Peripheral Darkness Vignette (Focus concentration in center) */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            "radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.85) 80%, #000000 100%)",
        }}
      />
    </div>
  );
});
