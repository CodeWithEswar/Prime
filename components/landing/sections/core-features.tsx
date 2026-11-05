"use client";

import { motion } from "motion/react";
import {
  Calendar03Icon,
  SourceCodeIcon,
  Brain02Icon,
  Database01Icon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { InteractiveDotGrid } from "../effects/interactive-dot-grid";
import { SpotlightCard } from "../cards/spotlight-card";
import { CharacterReveal } from "../motion/text/character-reveal";
import { ScrambleText } from "../motion/text/scramble-text";
import { usePrimeReducedMotion } from "@/lib/motion";

export function CoreFeatures() {
  const reduced = usePrimeReducedMotion();

  return (
    <section
      id="features"
      className="relative overflow-hidden border-b border-[#1E1E1E] bg-[#000000] py-20 sm:py-28 lg:py-36"
    >
      {/* Signature Interactive Glowing Dot Grid */}
      <InteractiveDotGrid spacing={30} dotSize={1.2} glowRadius={140} mask="radial" />

      <div className="landing-container relative z-20">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-14 sm:mb-16">
          <ScrambleText
            text="03 / SYSTEM CAPABILITIES"
            className="text-xs uppercase tracking-widest text-[#FF4D4D] block"
          />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            <CharacterReveal
              text="Engineered for serious technical candidates."
              accentWord="technical"
            />
          </h2>
          <p className="text-sm text-[#888888] leading-relaxed">
            Every module in PRIME coordinates with your central schedule. Practice informs
            revision, revision feeds mastery, and mastery sets your interview readiness.
          </p>
        </div>

        {/* Bento Grid with Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1: 90-Day Adaptive Study Planner (Span 7) */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7"
          >
            <SpotlightCard
              spotlightColor="rgba(255, 0, 0, 0.09)"
              borderColor="rgba(255, 0, 0, 0.4)"
              className="h-full p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="font-mono">MODULE / PLANNER</span>
                  <span className="font-mono text-[#FF4D4D]">AUTO-REBALANCING</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#FF0000]/30 bg-[#FF0000]/10 text-[#FF0000]">
                    <Icon icon={Calendar03Icon} size={20} />
                  </div>
                  <div>
                    <h3 className="font-mono text-lg font-bold text-white">
                      90-Day Adaptive Study Planner
                    </h3>
                    <p className="text-xs text-[#888888]">
                      Dynamic capacity &amp; carry-forward intelligence
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#999999] leading-relaxed max-w-xl">
                  Unlike static spreadsheets or linear calendars, PRIME recalculates daily allocations based on your actual availability, commitments, and historical velocity. If you miss a target date, it recalculates without creating guilt.
                </p>

                {/* Capacity UI preview */}
                <div className="rounded-lg border border-[#1C1C1C] bg-[#050505] p-3 sm:p-4 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between text-[#888888]">
                    <span>Weekly Capacity Allocation</span>
                    <span className="text-white">18.5h / 21h Planned</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#181818]">
                    <div className="h-full w-[88%] rounded-full bg-[#FF0000]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#666666]">
                    <span>Mon–Fri: 3h daily</span>
                    <span>Weekend: 4h buffer</span>
                    <span className="text-[#22C55E]">✓ Feasible</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#161616] mt-6 flex items-center justify-between text-xs font-mono text-[#666666]">
                <span>Status: Production verified</span>
                <span className="text-[#CCCCCC]">Supports rest day constraints</span>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 2: Curated DSA Practice Lab (Span 5) */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5"
          >
            <SpotlightCard
              spotlightColor="rgba(0, 229, 255, 0.08)"
              borderColor="rgba(0, 229, 255, 0.35)"
              className="h-full p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="font-mono">MODULE / DSA LAB</span>
                  <span className="font-mono text-[#00E5FF]">75+ PATTERNS</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]">
                    <Icon icon={SourceCodeIcon} size={20} />
                  </div>
                  <div>
                    <h3 className="font-mono text-lg font-bold text-white">
                      Algorithmic Practice Lab
                    </h3>
                    <p className="text-xs text-[#888888]">
                      Pattern-first problem solving
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#999999] leading-relaxed">
                  Avoid LeetCode random walk. Solve curated patterns with step-by-step interactive array, pointer, and graph visualizers.
                </p>

                {/* Micro Visualizer */}
                <div className="rounded-lg border border-[#1A1A1A] bg-[#050505] p-3 text-center font-mono">
                  <div className="flex items-center justify-between text-[10px] text-[#666666] mb-1.5">
                    <span>Array Search</span>
                    <span className="text-[#00E5FF]">O(log n)</span>
                  </div>
                  <div className="flex justify-center gap-1">
                    {["12", "24", "35", "42", "58", "67", "91"].map((val, i) => (
                      <div
                        key={val}
                        className={`w-7 h-7 rounded text-[11px] flex items-center justify-center border ${
                          i === 3
                            ? "bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold"
                            : "bg-[#111111] border-[#222222] text-[#666666]"
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#161616] mt-6 flex items-center justify-between text-xs font-mono text-[#666666]">
                <span>Difficulty distribution</span>
                <span className="text-[#CCCCCC]">Easy 35% · Med 50% · Hard 15%</span>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 3: Complete Aptitude & Reasoning Track (Span 4) */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4"
          >
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.08)"
              borderColor="rgba(245, 158, 11, 0.35)"
              className="h-full p-6 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="font-mono">MODULE / APTITUDE</span>
                  <span className="font-mono text-[#F59E0B]">40 DAYS</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]">
                    <Icon icon={Brain02Icon} size={18} />
                  </div>
                  <h3 className="font-mono text-base font-bold text-white">
                    Aptitude &amp; Reasoning
                  </h3>
                </div>

                <p className="text-xs text-[#888888] leading-relaxed">
                  132 syllabus topics across Quantitative, Logical, Verbal, and Data Interpretation tailored for TCS NQT, standard hiring tests, and cognitive assessments.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#AAAAAA] pt-1">
                  <span className="px-2 py-1 rounded bg-[#111111] border border-[#1A1A1A]">Quant 52 Topics</span>
                  <span className="px-2 py-1 rounded bg-[#111111] border border-[#1A1A1A]">Logic 32 Topics</span>
                  <span className="px-2 py-1 rounded bg-[#111111] border border-[#1A1A1A]">Verbal 24 Topics</span>
                  <span className="px-2 py-1 rounded bg-[#111111] border border-[#1A1A1A]">DI 16 Topics</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#161616] mt-4 text-[11px] font-mono text-[#666666]">
                Timed sectionals &amp; full mocks
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 4: CS Fundamentals & Interactive Simulators (Span 4) */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4"
          >
            <SpotlightCard
              spotlightColor="rgba(59, 130, 246, 0.08)"
              borderColor="rgba(59, 130, 246, 0.35)"
              className="h-full p-6 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="font-mono">MODULE / CORE CS</span>
                  <span className="font-mono text-[#3B82F6]">4 CURRICULA</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]">
                    <Icon icon={Database01Icon} size={18} />
                  </div>
                  <h3 className="font-mono text-base font-bold text-white">
                    CS Core &amp; Simulators
                  </h3>
                </div>

                <p className="text-xs text-[#888888] leading-relaxed">
                  DBMS, Operating Systems, Computer Networks, and OOP with Java. Complete structured video libraries and interactive browser simulators.
                </p>

                <div className="space-y-1.5 text-[11px] font-mono text-[#AAAAAA] pt-1">
                  <div className="flex justify-between p-1.5 rounded bg-[#111111] border border-[#1A1A1A]">
                    <span>DBMS (14 Days)</span>
                    <span className="text-[#3B82F6]">SQL Studio</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded bg-[#111111] border border-[#1A1A1A]">
                    <span>OS (12 Days)</span>
                    <span className="text-[#F59E0B]">CPU &amp; Deadlocks</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#161616] mt-4 text-[11px] font-mono text-[#666666]">
                Browser-executable laboratories
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 5: Adaptive Spaced Revision Engine (Span 4) */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4"
          >
            <SpotlightCard
              spotlightColor="rgba(34, 197, 94, 0.08)"
              borderColor="rgba(34, 197, 94, 0.35)"
              className="h-full p-6 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <span className="font-mono">MODULE / REVISION</span>
                  <span className="font-mono text-[#22C55E]">DECAY MODEL</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]">
                    <Icon icon={RepeatIcon} size={18} />
                  </div>
                  <h3 className="font-mono text-base font-bold text-white">
                    Spaced Revision Engine
                  </h3>
                </div>

                <p className="text-xs text-[#888888] leading-relaxed">
                  Never forget a solved algorithm. Automatic interval expansion (Day 1 $\rightarrow$ 3 $\rightarrow$ 7 $\rightarrow$ 14 $\rightarrow$ 28) guarantees long-term retention.
                </p>

                <div className="rounded border border-[#1A1A1A] bg-[#080808] p-2.5 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-[#888888]">
                    <span>Memory Decay Model</span>
                    <span className="text-[#22C55E]">Optimal</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#666666]">
                    <span>Day 1</span>
                    <span>→</span>
                    <span>Day 3</span>
                    <span>→</span>
                    <span className="text-[#22C55E] font-bold">Day 7</span>
                    <span>→</span>
                    <span>Day 28</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#161616] mt-4 text-[11px] font-mono text-[#666666]">
                SuperMemo SM-2 mathematical model
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
