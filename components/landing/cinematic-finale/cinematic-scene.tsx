"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { BridgeSvg } from "./bridge-svg";
import { CharacterSilhouette } from "./character-silhouette";
import { PrimeMonument } from "./prime-monument";
import { AtmosphericFog } from "./atmospheric-fog";
import { CinematicParticles } from "./cinematic-particles";
import { usePrimeReducedMotion } from "@/lib/motion";
import { cinematicMotion } from "./motion-config";
import { cn } from "@/lib/utils";

export interface CinematicSceneProps {
  className?: string;
}

/**
 * Full-width atmospheric cinematic viewport:
 * Lone silhouette on a dark metallic bridge gazing at the illuminated monumental PRIME apex.
 */
export function CinematicScene({ className = "" }: CinematicSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrimeReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Slow virtual camera push-in on the bridge environment
  const cameraScale = useTransform(scrollYProgress, [0, 1], cinematicMotion.camera.scale);
  const cameraY = useTransform(scrollYProgress, [0, 1], cinematicMotion.camera.y);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[520px] sm:h-[600px] md:h-[680px] lg:h-[740px] xl:h-[780px] overflow-hidden select-none bg-[#000000]",
        className
      )}
      aria-label="Cinematic scene: Solitary figure standing on a dark metallic bridge gazing at the distant illuminated PRIME monument"
      role="img"
    >
      {/* Top seamless transition fade from preceding section */}
      <div
        className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent z-25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Bottom seamless transition fade into footer */}
      <div
        className="absolute inset-x-0 bottom-0 h-36 sm:h-48 bg-gradient-to-t from-[#000000] via-[#000000]/85 to-transparent z-25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Side Vignettes for cinematic widescreen focus */}
      <div
        className="absolute inset-0 pointer-events-none z-25 opacity-75"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, #000000 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 1: Distant Atmospheric Red Fog */}
      <AtmosphericFog variant="distant" />

      {/* Layer 2: Moving Virtual Camera Frame containing Metallic Bridge & Distant Monument */}
      <motion.div
        style={{
          scale: reduced ? 1 : cameraScale,
          y: reduced ? 0 : cameraY,
        }}
        className="absolute inset-0 w-full h-full"
      >
        {/* Powerful Metallic Bridge Vector Superstructure */}
        <BridgeSvg />

        {/* Monumental Illuminated PRIME Apex anchored at bridge vanishing point */}
        <div className="absolute top-[23%] sm:top-[25%] md:top-[26%] left-1/2 -translate-x-1/2 z-10">
          <PrimeMonument />
        </div>
      </motion.div>

      {/* Layer 3: Mid-Ground Volumetric Mist */}
      <AtmosphericFog variant="mid" />

      {/* Layer 4: Solitary Boy Silhouette standing on the bridge deck */}
      <div className="absolute bottom-[16%] sm:bottom-[18%] md:bottom-[20%] left-1/2 -translate-x-1/2 z-20">
        <CharacterSilhouette />
      </div>

      {/* Layer 5: Low-Lying Foreground Mist across deck */}
      <AtmosphericFog variant="foreground" />

      {/* Layer 6: Subtle Floating Atmospheric Embers */}
      <CinematicParticles count={16} />
    </div>
  );
}
