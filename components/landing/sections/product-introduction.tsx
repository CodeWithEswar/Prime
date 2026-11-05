"use client";

import { motion } from "motion/react";
import {
  Target01Icon,
  Calendar03Icon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { DotGrid } from "../backgrounds/dot-grid";
import { AmbientGlow } from "../backgrounds/ambient-glow";
import { BackgroundTransition } from "../effects/background-transition";
import { LineMaskReveal } from "../motion/text/line-mask-reveal";
import { ScrambleText } from "../motion/text/scramble-text";
import { SpotlightCard } from "../cards/spotlight-card";
import { usePrimeReducedMotion } from "@/lib/motion";

const PILLARS = [
  {
    index: "01",
    title: "Direction Over Drift",
    subtitle: "Curriculum & Roadmap",
    description:
      "A sequential preparation path from foundational algorithms to advanced systems, eliminating the anxiety of deciding what to study next.",
    icon: Target01Icon,
    accent: "#FF4D4D",
    metric: "90 Days Structured",
  },
  {
    index: "02",
    title: "Deliberate Daily Execution",
    subtitle: "Adaptive Study Runway",
    description:
      "Convert distant interview dates into concrete, manageable daily targets calibrated to your real bandwidth and time commitments.",
    icon: Calendar03Icon,
    accent: "#F59E0B",
    metric: "Capacity Rebalancing",
  },
  {
    index: "03",
    title: "Retention as an Asset",
    subtitle: "Spaced Repetition & Decay",
    description:
      "Algorithmic revisit triggers ensure concepts move from fragile short-term recall into permanent, verified interview execution.",
    icon: RepeatIcon,
    accent: "#22C55E",
    metric: "Ebbinghaus Calibrated",
  },
];

export function ProductIntroduction() {
  const reduced = usePrimeReducedMotion();

  return (
    <section
      id="introduction"
      className="relative overflow-hidden border-b border-[#1E1E1E] bg-[#000000] py-20 sm:py-28 lg:py-36"
    >
      {/* Seamless transition mask from the hero */}
      <BackgroundTransition position="top" height="h-28 sm:h-36" />

      <DotGrid mask="radial" className="opacity-25" />
      <AmbientGlow position="top-right" intensity="subtle" />

      <div className="landing-container relative z-20">
        {/* Editorial Header */}
        <div className="max-w-3xl space-y-4 mb-16 sm:mb-20">
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <ScrambleText
              text="01 / ARCHITECTURE OF EXCELLENCE"
              className="text-xs uppercase tracking-widest text-[#FF4D4D] block"
            />
            <LineMaskReveal
              lines={["Interview preparation", "should not feel like", "chaos."]}
              accentLineIndex={2}
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.08]"
            />
          </motion.div>
        </div>

        {/* Three Architectural Pillars */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={reduced ? undefined : { opacity: 0, y: 28 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <SpotlightCard
                spotlightColor={`${pillar.accent}15`}
                borderColor={`${pillar.accent}40`}
                className="h-full p-6 sm:p-7 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
                    <span className="font-mono text-[11px] text-[#666666]">
                      {pillar.index}
                    </span>
                    <span className="font-mono text-[11px] text-[#888888]">
                      {pillar.subtitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: `${pillar.accent}40`,
                        backgroundColor: `${pillar.accent}10`,
                        color: pillar.accent,
                      }}
                    >
                      <Icon icon={pillar.icon} size={18} />
                    </div>
                    <h3 className="font-mono text-base font-bold text-white tracking-tight">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#888888] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#181818] mt-6 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#666666]">Standard</span>
                  <span style={{ color: pillar.accent }} className="font-semibold">
                    {pillar.metric}
                  </span>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
