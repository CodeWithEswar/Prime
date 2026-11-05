"use client";

import { motion } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";
import { cinematicMotion } from "./motion-config";
import { cn } from "@/lib/utils";

export interface CharacterSilhouetteProps {
  className?: string;
}

/**
 * Solitary young man seen from behind on the bridge deck, gazing toward the distant illuminated PRIME monument.
 * Kept almost completely black to preserve focus on the monumental apex, with minimal natural breathing animation.
 */
export function CharacterSilhouette({ className = "" }: CharacterSilhouetteProps) {
  const reduced = usePrimeReducedMotion();

  return (
    <div
      className={cn(
        "relative flex flex-col items-center select-none pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      <motion.div
        animate={
          reduced
            ? {}
            : {
                y: [0, cinematicMotion.breathing.yOffset, 0],
              }
        }
        transition={{
          duration: cinematicMotion.breathing.duration,
          repeat: Infinity,
          ease: cinematicMotion.breathing.ease,
        }}
        className="relative"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 220"
          className="w-16 sm:w-20 md:w-24 lg:w-28 h-auto drop-shadow-[0_16px_32px_rgba(0,0,0,0.98)]"
          fill="none"
        >
          <defs>
            {/* Extremely subtle rim light from distant foggy backlight */}
            <linearGradient id="charRimLightTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
              <stop offset="40%" stopColor="rgba(255, 80, 80, 0.25)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Dark deck asphalt contact shadow */}
            <radialGradient id="charContactShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 0, 0, 0.98)" />
              <stop offset="60%" stopColor="rgba(10, 0, 0, 0.6)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* 1. Contact Shadow on bridge surface */}
          <ellipse cx="60" cy="212" rx="38" ry="6" fill="url(#charContactShadow)" />

          {/* 2. Shoes / Soles */}
          <g className="char-shoes" fill="#040404">
            <path d="M 40 196 L 53 197 L 54 209 Q 46 211 38 209 L 37 202 Z" />
            <path d="M 67 197 L 80 196 L 83 202 L 82 209 Q 74 211 66 209 Z" />
            {/* Subtle sole trim */}
            <path d="M 38 207 Q 46 209 54 207" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
            <path d="M 66 207 Q 74 209 82 207" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
          </g>

          {/* 3. Trousers / Legs */}
          <g className="char-legs" fill="#030303">
            <path d="M 42 110 L 41 150 Q 42 175 39 198 L 54 198 Q 53 165 57 126 Z" />
            <path d="M 63 126 Q 67 165 66 198 L 81 198 Q 78 175 79 150 L 78 110 Z" />
          </g>

          {/* 4. Torso / Dark Jacket / Hoodie */}
          <g className="char-torso">
            <path
              d="M 33 52 Q 40 46 60 46 Q 80 46 87 52 L 82 116 Q 60 119 38 116 Z"
              fill="#020202"
            />
          </g>

          {/* 5. Arms & Hands */}
          <g className="char-arms" fill="#020202">
            <path d="M 33 52 L 28 85 L 32 118 L 39 116 L 37 84 L 38 58 Z" />
            <path d="M 87 52 L 92 85 L 88 118 L 81 116 L 83 84 L 82 58 Z" />
          </g>

          {/* 6. Hood / Collar resting on upper back */}
          <path
            d="M 46 44 Q 60 52 74 44 Q 70 36 60 38 Q 50 36 46 44 Z"
            fill="#050505"
          />

          {/* 7. Head & Hair (Back of head) */}
          <g className="char-head">
            <ellipse cx="60" cy="27" rx="11" ry="12.5" fill="#020202" />
            <path
              d="M 49 26 Q 48 18 56 15 Q 64 14 71 18 Q 72 26 71 31 Q 67 36 60 36 Q 53 36 49 31 Z"
              fill="#010101"
            />
          </g>

          {/* 8. Restrained Rim Lighting from Distant Backlight */}
          {/* Top hair edge glint */}
          <path
            d="M 52 17 Q 60 14 68 17"
            stroke="url(#charRimLightTop)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Left shoulder glint */}
          <path
            d="M 34 53 Q 45 46 54 45"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          {/* Right shoulder glint */}
          <path
            d="M 66 45 Q 75 46 86 53"
            stroke="rgba(255, 80, 80, 0.22)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}
