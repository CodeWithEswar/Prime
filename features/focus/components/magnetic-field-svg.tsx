"use client";

import { motion } from "motion/react";

interface MagneticFieldSvgProps {
  isRunning: boolean;
  isPaused: boolean;
  reducedMotion?: boolean;
}

export function MagneticFieldSvg({
  isRunning,
  isPaused,
  reducedMotion = false,
}: MagneticFieldSvgProps) {
  if (reducedMotion) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Outer Magnetic Spiral 1 (clockwise) */}
      <motion.svg
        viewBox="0 0 800 800"
        className="w-[680px] h-[680px] sm:w-[900px] sm:h-[900px] max-w-none opacity-40 mix-blend-screen"
        animate={
          isRunning
            ? { rotate: 360, scale: [1, 1.025, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={{
          rotate: {
            duration: 65,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <defs>
          <radialGradient id="fieldGrad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF0000" stopOpacity="0" />
            <stop offset="35%" stopColor="#FF0000" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#FF0000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="arcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF0000" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF4D4D" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gravitational concentration ellipse tracks */}
        <ellipse
          cx="400"
          cy="400"
          rx="320"
          ry="310"
          fill="none"
          stroke="url(#fieldGrad1)"
          strokeWidth="1"
          strokeDasharray="4 16"
        />
        <ellipse
          cx="400"
          cy="400"
          rx="250"
          ry="240"
          fill="none"
          stroke="url(#fieldGrad1)"
          strokeWidth="1.2"
          strokeDasharray="8 24"
        />
        <ellipse
          cx="400"
          cy="400"
          rx="180"
          ry="175"
          fill="none"
          stroke="url(#fieldGrad1)"
          strokeWidth="1.5"
          strokeDasharray="12 36"
        />

        {/* Luminous energy arcs */}
        <path
          d="M 220,400 A 180,180 0 0,1 400,220"
          fill="none"
          stroke="url(#arcGrad1)"
          strokeWidth="2"
          strokeLinecap="round"
          className="filter drop-shadow-[0_0_8px_#FF0000]"
        />
        <path
          d="M 580,400 A 180,180 0 0,1 400,580"
          fill="none"
          stroke="url(#arcGrad1)"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="filter drop-shadow-[0_0_8px_#FF0000]"
        />
      </motion.svg>

      {/* Inner Magnetic Spiral 2 (counter-clockwise, faster subtle swirl) */}
      <motion.svg
        viewBox="0 0 600 600"
        className="absolute w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] max-w-none opacity-30 mix-blend-screen"
        animate={
          isRunning
            ? { rotate: -360 }
            : { rotate: 0 }
        }
        transition={{
          rotate: {
            duration: 85,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        <ellipse
          cx="300"
          cy="300"
          rx="130"
          ry="125"
          fill="none"
          stroke="rgba(255, 50, 50, 0.4)"
          strokeWidth="1"
          strokeDasharray="3 14"
        />
        <path
          d="M 300,170 A 130,130 0 0,1 430,300"
          fill="none"
          stroke="url(#arcGrad1)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}

