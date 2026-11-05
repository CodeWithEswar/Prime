"use client";

import { motion } from "motion/react";
import {
  DashboardSpeed01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { DotGrid } from "../backgrounds/dot-grid";
import { AmbientGlow } from "../backgrounds/ambient-glow";
import { SpotlightCard } from "../cards/spotlight-card";
import { CountingNumber } from "../motion/text/counting-number";
import { ScrambleText } from "../motion/text/scramble-text";
import { usePrimeReducedMotion } from "@/lib/motion";

export function ProgressAnalytics() {
  const reduced = usePrimeReducedMotion();

  return (
    <section
      id="analytics"
      className="relative overflow-hidden border-b border-[#1E1E1E] bg-[#050505] py-20 sm:py-28 lg:py-36"
    >
      <DotGrid mask="radial" className="opacity-20" />
      <AmbientGlow position="top-left" intensity="subtle" />

      <div className="landing-container relative z-20">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 sm:mb-20">
          <div className="lg:col-span-7 space-y-3">
            <ScrambleText
              text="06 / OBSERVABILITY & EVIDENCE"
              className="text-xs uppercase tracking-widest text-[#FF4D4D] block"
            />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Understand where you stand.
              <br />
              Beyond the superficial streak.
            </h2>
          </div>

          <div className="lg:col-span-5 text-xs sm:text-sm text-[#888888] leading-relaxed lg:pt-6">
            A streak tells you that you opened an app. PRIME tells you which patterns
            are interview-ready, which algorithms you hesitate on, and whether your recall
            will hold under pressure.
          </div>
        </div>

        {/* Analytics Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1: Readiness Score & Radar */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpotlightCard
              spotlightColor="rgba(255, 0, 0, 0.08)"
              borderColor="rgba(255, 0, 0, 0.35)"
              className="h-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
                <span className="font-mono text-[#AAAAAA]">INTERVIEW READINESS</span>
                <Icon icon={DashboardSpeed01Icon} size={15} className="text-[#FF4D4D]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-bold text-white">
                    <CountingNumber value={82} suffix="%" />
                  </span>
                  <span className="text-xs text-[#22C55E] font-mono">
                    <CountingNumber value={14} prefix="+" suffix="% this month" />
                  </span>
                </div>
                <p className="text-xs text-[#777777]">
                  Calculated across DSA mastery, aptitude scores, and recall freshness.
                </p>
              </div>

              {/* Dimensional Bars */}
              <div className="space-y-3 pt-2 border-t border-[#161616]">
                {[
                  { label: "DSA Pattern Mastery", val: 86, color: "bg-[#FF4D4D]" },
                  { label: "CS Fundamentals", val: 88, color: "bg-[#00E5FF]" },
                  { label: "Aptitude & Verbal", val: 78, color: "bg-[#F59E0B]" },
                  { label: "Recall Retention", val: 76, color: "bg-[#A855F7]" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1 text-xs">
                    <div className="flex justify-between text-[#888888]">
                      <span>{item.label}</span>
                      <span className="font-mono font-medium text-white">{item.val}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#181818] overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 2: Mastery Distribution */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpotlightCard
              spotlightColor="rgba(34, 197, 94, 0.08)"
              borderColor="rgba(34, 197, 94, 0.35)"
              className="h-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
                <span className="font-mono text-[#AAAAAA]">SYLLABUS PROGRESSION</span>
                <span className="font-mono text-[11px] text-[#22C55E]">214 / 285 TOPICS</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg border border-[#1C1C1C] bg-[#0E0E0E] p-3 text-center">
                  <span className="text-[10px] text-[#777777] block font-mono uppercase">Mastered</span>
                  <span className="text-2xl font-mono font-bold text-white mt-1 block">
                    <CountingNumber value={142} />
                  </span>
                  <span className="text-[10px] text-[#22C55E]">High Confidence</span>
                </div>
                <div className="rounded-lg border border-[#1C1C1C] bg-[#0E0E0E] p-3 text-center">
                  <span className="text-[10px] text-[#777777] block font-mono uppercase">In Review</span>
                  <span className="text-2xl font-mono font-bold text-white mt-1 block">
                    <CountingNumber value={46} />
                  </span>
                  <span className="text-[10px] text-[#F59E0B]">Spaced Due</span>
                </div>
                <div className="rounded-lg border border-[#1C1C1C] bg-[#0E0E0E] p-3 text-center">
                  <span className="text-[10px] text-[#777777] block font-mono uppercase">Attempted</span>
                  <span className="text-2xl font-mono font-bold text-white mt-1 block">
                    <CountingNumber value={26} />
                  </span>
                  <span className="text-[10px] text-[#00E5FF]">Needs Revisit</span>
                </div>
                <div className="rounded-lg border border-[#1C1C1C] bg-[#0E0E0E] p-3 text-center">
                  <span className="text-[10px] text-[#777777] block font-mono uppercase">Unreached</span>
                  <span className="text-2xl font-mono font-bold text-[#666666] mt-1 block">
                    <CountingNumber value={71} />
                  </span>
                  <span className="text-[10px] text-[#666666]">In Roadmap</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#161616] flex items-center justify-between text-xs font-mono text-[#666666]">
                <span>Confidence index</span>
                <span className="text-[#22C55E]">● 84% Validated</span>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 3: Practice Velocity */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.08)"
              borderColor="rgba(245, 158, 11, 0.35)"
              className="h-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
                <span className="font-mono text-[#AAAAAA]">PRACTICE VELOCITY</span>
                <Icon icon={Clock01Icon} size={15} className="text-[#F59E0B]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-bold text-white">
                    <CountingNumber value={4.2} decimals={1} suffix="h" />
                  </span>
                  <span className="text-xs text-[#AAAAAA] font-mono">avg / day this week</span>
                </div>
                <p className="text-xs text-[#777777]">
                  Sustained daily pace without spike-and-crash preparation fatigue.
                </p>
              </div>

              {/* Weekly bar sparkline */}
              <div className="pt-2 border-t border-[#161616] space-y-2">
                <div className="flex items-end justify-between gap-2 h-24 pt-4">
                  {[
                    { day: "W1", hours: 18, max: 25 },
                    { day: "W2", hours: 22, max: 25 },
                    { day: "W3", hours: 26, max: 25 },
                    { day: "W4", hours: 24, max: 25 },
                  ].map((w, idx) => (
                    <div key={w.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className={`w-full rounded-t transition-all ${
                          idx === 3 ? "bg-[#FF0000]" : "bg-[#2A2A2A]"
                        }`}
                        style={{ height: `${(w.hours / w.max) * 100}%` }}
                      />
                      <span className="text-[10px] font-mono text-[#666666]">{w.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#161616] flex items-center justify-between text-xs font-mono text-[#666666]">
                <span>Consistency status</span>
                <span className="text-white">96% On-Schedule</span>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
