"use client";

import { motion } from "motion/react";
import { LineGridBackground } from "../effects/line-grid-background";
import { LearningCarousel } from "../carousels/learning-carousel";
import { TypingText } from "../motion/text/typing-text";
import { ScrambleText } from "../motion/text/scramble-text";
import { usePrimeReducedMotion } from "@/lib/motion";

const CURRICULUM_PROMISES = [
  "Plan with purpose.",
  "Practice with consistency.",
  "Revise with intelligence.",
  "Prepare with confidence.",
];

export function LearningExperience() {
  const reduced = usePrimeReducedMotion();

  return (
    <section
      id="curriculum"
      className="relative overflow-hidden border-b border-[#1E1E1E] bg-[#000000] py-20 sm:py-28 lg:py-36"
    >
      <LineGridBackground spacing={64} mask={true} className="opacity-15" />

      <div className="landing-container relative z-20">
        {/* Section Header */}
        <div className="max-w-2xl space-y-4 mb-14 sm:mb-16">
          <div className="flex flex-wrap items-center gap-3">
            <ScrambleText
              text="05 / UNIFIED SYLLABUS"
              className="text-xs uppercase tracking-widest text-[#FF4D4D] block"
            />
            <div className="flex items-center gap-2 text-xs font-mono text-[#888888] bg-[#0C0C0C] border border-[#222222] px-3 py-1 rounded-full">
              <span className="text-[#FF4D4D] font-bold">SYSTEM &gt;</span>
              <TypingText
                phrases={CURRICULUM_PROMISES}
                typingSpeed={45}
                deletingSpeed={22}
                pauseDuration={2400}
                className="text-[#E0E0E0]"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything your interview
            <br />
            requires. Nothing redundant.
          </h2>
          <p className="text-sm text-[#888888] leading-relaxed">
            From algorithmic edge cases to relational normalization, computer architecture, and timed cognitive placement diagnostics.
          </p>
        </div>

        {/* Learning Carousel */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <LearningCarousel />
        </motion.div>
      </div>
    </section>
  );
}
