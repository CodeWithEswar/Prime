"use client";

import { motion } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";

export const LEFT_BRIDGE_LIGHTS = [
  { x: 195, y: 790, size: 4.5 },
  { x: 248, y: 725, size: 4.0 },
  { x: 300, y: 660, size: 3.5 },
  { x: 352, y: 600, size: 3.0 },
  { x: 402, y: 545, size: 2.6 },
  { x: 448, y: 495, size: 2.2 },
  { x: 490, y: 450, size: 1.8 },
  { x: 526, y: 412, size: 1.5 },
  { x: 548, y: 382, size: 1.2 },
];

export const RIGHT_BRIDGE_LIGHTS = [
  { x: 1005, y: 790, size: 4.5 },
  { x: 952, y: 725, size: 4.0 },
  { x: 900, y: 660, size: 3.5 },
  { x: 848, y: 600, size: 3.0 },
  { x: 798, y: 545, size: 2.6 },
  { x: 752, y: 495, size: 2.2 },
  { x: 710, y: 450, size: 1.8 },
  { x: 674, y: 412, size: 1.5 },
  { x: 652, y: 382, size: 1.2 },
];

export function BridgeLights() {
  const reduced = usePrimeReducedMotion();

  return (
    <g className="bridge-edge-lights" aria-hidden="true">
      {/* Left side edge light runners */}
      {LEFT_BRIDGE_LIGHTS.map((light, i) => (
        <g key={`left-${i}`}>
          {/* Subtle red ground glow reflection */}
          <ellipse
            cx={light.x}
            cy={light.y + light.size * 1.5}
            rx={light.size * 3.5}
            ry={light.size * 1.2}
            fill="rgba(255, 0, 0, 0.35)"
            filter="blur(1px)"
          />
          {/* Light fixture diode */}
          <motion.circle
            cx={light.x}
            cy={light.y}
            r={light.size}
            fill="#FF2626"
            initial={reduced ? undefined : { opacity: 0, scale: 0.5 }}
            whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.45,
              delay: 0.08 * i,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
          {/* Hot white center core */}
          <circle
            cx={light.x}
            cy={light.y}
            r={light.size * 0.4}
            fill="#FFFFFF"
            opacity={0.8}
          />
        </g>
      ))}

      {/* Right side edge light runners */}
      {RIGHT_BRIDGE_LIGHTS.map((light, i) => (
        <g key={`right-${i}`}>
          {/* Subtle red ground glow reflection */}
          <ellipse
            cx={light.x}
            cy={light.y + light.size * 1.5}
            rx={light.size * 3.5}
            ry={light.size * 1.2}
            fill="rgba(255, 0, 0, 0.35)"
            filter="blur(1px)"
          />
          {/* Light fixture diode */}
          <motion.circle
            cx={light.x}
            cy={light.y}
            r={light.size}
            fill="#FF2626"
            initial={reduced ? undefined : { opacity: 0, scale: 0.5 }}
            whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.45,
              delay: 0.08 * i,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
          {/* Hot white center core */}
          <circle
            cx={light.x}
            cy={light.y}
            r={light.size * 0.4}
            fill="#FFFFFF"
            opacity={0.8}
          />
        </g>
      ))}
    </g>
  );
}

