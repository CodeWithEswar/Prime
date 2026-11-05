"use client";

import { CinematicScene } from "./cinematic-scene";
import { CinematicCTA } from "./cinematic-cta";
import { BackgroundTransition } from "../effects/background-transition";
import { cn } from "@/lib/utils";

export interface CinematicFinaleProps {
  className?: string;
}

/**
 * PRIME Cinematic Bridge Finale
 * Full-width cinematic climax featuring a solitary young man on a dark metallic bridge
 * gazing toward the monumental illuminated PRIME logo in the distance.
 * Positioned immediately before the cinematic footer.
 */
export function CinematicFinale({ className = "" }: CinematicFinaleProps) {
  return (
    <section
      id="cta"
      className={cn(
        "relative overflow-hidden border-b border-[#1A1A1A] bg-[#000000] pt-4 sm:pt-8 pb-12 sm:pb-16 lg:pb-20",
        className
      )}
      aria-label="PRIME Cinematic Finale"
    >
      {/* Seamless transition mask from the preceding pricing section */}
      <BackgroundTransition position="top" height="h-20 sm:h-28" />

      {/* Main Full-Width Cinematic Bridge Scene */}
      <div className="relative w-full">
        <CinematicScene />
      </div>

      {/* Closing Headline & Magnetic CTA cleanly positioned beneath the scene */}
      <div className="relative z-30 pt-4 sm:pt-6 pb-2">
        <CinematicCTA />
      </div>
    </section>
  );
}
