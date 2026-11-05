"use client";

import { motion } from "motion/react";
import { DotGrid } from "../backgrounds/dot-grid";
import { AmbientGlow } from "../backgrounds/ambient-glow";
import { ProductShowcaseCarousel } from "../carousels/product-showcase-carousel";
import { RotatingText } from "../motion/text/rotating-text";
import { ScrambleText } from "../motion/text/scramble-text";
import { usePrimeReducedMotion } from "@/lib/motion";

const SHOWCASE_TAGLINES = [
  "Slide through real PRIME operational workspaces.",
  "Watch algorithms rebalance your 90-day trajectory in real time.",
  "Inspect scheduled spaced-repetition intervals and retention curves.",
  "Diagnose your readiness before scheduling real interviews.",
];

export function InteractiveProductShowcase() {
  const reduced = usePrimeReducedMotion();

  return (
    <section
      id="showcase"
      className="relative overflow-hidden border-b border-[#1E1E1E] bg-[#050505] py-20 sm:py-28 lg:py-36"
    >
      <DotGrid mask="radial" className="opacity-20" />
      <AmbientGlow position="center" intensity="subtle" />

      <div className="landing-container relative z-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <ScrambleText
            text="04 / INTERACTIVE PRODUCT SHOWCASE"
            className="text-xs uppercase tracking-widest text-[#FF4D4D] block"
          />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Live preview of your
            <br />
            preparation cockpit.
          </h2>
          <div className="min-h-12 flex items-center justify-center">
            <RotatingText
              phrases={SHOWCASE_TAGLINES}
              textClassName="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed text-center"
            />
          </div>
        </div>

        {/* Embla-backed Product Showcase Carousel */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductShowcaseCarousel />
        </motion.div>
      </div>
    </section>
  );
}
