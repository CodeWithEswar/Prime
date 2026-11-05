"use client";

import { motion } from "motion/react";
import {
  RepeatIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { RadialLinePattern } from "../effects/radial-line-pattern";
import { AmbientGlow } from "../backgrounds/ambient-glow";
import { SpotlightCard } from "../cards/spotlight-card";
import { KineticHeading } from "../motion/text/kinetic-heading";
import { ScrambleText } from "../motion/text/scramble-text";
import { usePrimeReducedMotion } from "@/lib/motion";

const REVISION_STEPS = [
  {
    step: "01",
    title: "Initial Problem Solve",
    time: "Day 1",
    desc: "You solve a problem or study a topic. PRIME records your time, hints used, and subjective difficulty rating.",
    tag: "Attempt Logged",
    color: "#888888",
  },
  {
    step: "02",
    title: "First Spaced Revisit",
    time: "Day 3",
    desc: "Before cognitive decay begins, the problem appears in your daily queue for quick active recall.",
    tag: "First Recall",
    color: "#F59E0B",
  },
  {
    step: "03",
    title: "Adaptive Branching",
    time: "Day 7 / Day 4",
    desc: "If solved independently, interval expands to 14 days. If you needed assistance, it returns within 48 hours.",
    tag: "Decay Calibrated",
    color: "#FF4D4D",
  },
  {
    step: "04",
    title: "Permanent Retention",
    time: "Day 28+",
    desc: "Multiple successful recalls promote the topic to 'Interview Ready' with permanent mastery evidence.",
    tag: "Mastery Locked",
    color: "#22C55E",
  },
];

export function AdaptiveRevisionSection() {
  const reduced = usePrimeReducedMotion();

  return (
    <section
      id="revision"
      className="relative overflow-hidden border-b border-[#1E1E1E] bg-[#000000] py-20 sm:py-28 lg:py-36"
    >
      {/* Pattern F: Distinctive Radial Line Pattern */}
      <RadialLinePattern rings={8} center="center" accentColor="rgba(255, 0, 0, 0.15)" />
      <AmbientGlow position="center" intensity="subtle" />

      <div className="landing-container relative z-20">
        {/* Header */}
        <div className="max-w-2xl space-y-4 mb-16 sm:mb-20">
          <ScrambleText
            text="07 / SPACED REPETITION & DECAY CONTROL"
            className="text-xs uppercase tracking-widest text-[#FF4D4D] block"
          />
          <KineticHeading
            title="Never forget a concept"
            highlight="you spent hours learning."
          />
          <p className="text-sm text-[#888888] leading-relaxed">
            Human memory decays following Ebbinghaus&apos;s exponential forgetting curve.
            PRIME automatically schedules active recall at optimal mathematical intervals so
            concepts permanently anchor in long-term memory.
          </p>
        </div>

        {/* 4-Step Spaced Timeline Progression */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
          {REVISION_STEPS.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={reduced ? undefined : { opacity: 0, y: 24 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <SpotlightCard
                spotlightColor={`${step.color}15`}
                borderColor={`${step.color}40`}
                className="h-full p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
                    <span className="font-mono text-[#666666] font-bold">{step.step}</span>
                    <span
                      className="font-mono text-[11px] font-semibold"
                      style={{ color: step.color }}
                    >
                      {step.time}
                    </span>
                  </div>

                  <h3 className="font-mono text-base font-bold text-white tracking-tight">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#888888] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#161616] mt-4">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium border"
                    style={{
                      color: step.color,
                      borderColor: `${step.color}35`,
                      backgroundColor: `${step.color}10`,
                    }}
                  >
                    {step.tag}
                  </span>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Algorithm Evidence Callout */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#FF0000]/30 bg-[#FF0000]/10 text-[#FF0000] flex-shrink-0">
              <Icon icon={RepeatIcon} size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono">
                Decay-Resistant Spaced Repetition (SuperMemo SM-2)
              </h4>
              <p className="text-xs text-[#777777]">
                Every review dynamically calibrates future intervals based on recall difficulty.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 font-mono text-xs text-[#22C55E]">
            <Icon icon={CheckmarkCircle02Icon} size={15} />
            <span>94% average interview retention rate</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
