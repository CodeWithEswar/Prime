"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckmarkCircle02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SpotlightCard } from "../cards/spotlight-card";
import { ScrambleText } from "../motion/text/scramble-text";
import { usePrimeReducedMotion } from "@/lib/motion";

const INCLUDED_CAPABILITIES = [
  "Complete 90-Day Adaptive Study Runway & Capacity Planner",
  "Full 40-Day Aptitude, Reasoning, Verbal & DI (132 Topics)",
  "All CS Fundamentals Curricula (DBMS, OS, CN, OOP) & Virtual Simulators",
  "Curated DSA Practice Catalog & Interactive Algorithmic Lab",
  "Automated Spaced Repetition & Forgetting Curve Protection",
  "Full-Length Placement Mocks & TCS NQT Pattern Diagnostics",
  "Email Reminders, Daily Digests & Timezone-Aware Quiet Hours",
  "Local & Cloud Sync via Supabase Database and RLS Security",
];

export function PricingSection() {
  const reduced = usePrimeReducedMotion();

  return (
    <section
      id="access"
      className="relative overflow-hidden border-b border-[#1E1E1E] bg-[#050505] py-20 sm:py-28 lg:py-36"
    >
      <div className="landing-container relative z-20">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <ScrambleText
            text="08 / TRANSPARENT ACCESS"
            className="text-xs uppercase tracking-widest text-[#FF4D4D] block"
          />
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything included.
            <br />
            No paywalls. No artificial tiers.
          </h2>
          <p className="text-xs sm:text-sm text-[#888888] leading-relaxed">
            PRIME is designed to democratize high-rigor interview preparation. All curriculums,
            simulators, and revision engines are fully accessible.
          </p>
        </div>

        {/* Single Transparent Plan Card */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl"
        >
          <SpotlightCard
            spotlightColor="rgba(255, 0, 0, 0.08)"
            borderColor="rgba(255, 0, 0, 0.35)"
            className="p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle top accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF0000] to-transparent" />

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1A1A] pb-6">
              <div>
                <h3 className="text-xl font-bold text-white font-mono">
                  Full PRIME Access
                </h3>
                <p className="text-xs text-[#888888] mt-1">
                  Complete developer preparation environment
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-[#666666]">/ 100% Free &amp; Open Access</span>
              </div>
            </div>

            {/* Checklist of Included Capabilities */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-6 text-xs text-[#CCCCCC]">
              {INCLUDED_CAPABILITIES.map((cap) => (
                <li key={cap} className="flex items-start gap-2.5">
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    size={14}
                    className="text-[#FF4D4D] flex-shrink-0 mt-0.5"
                  />
                  <span className="leading-relaxed">{cap}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-[#1A1A1A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-mono text-[#777777]">
                Sign in with Google or email. Zero lock-in.
              </span>

              <Button
                asChild
                className="w-full sm:w-auto h-10 bg-[#FF0000] hover:bg-[#CC0000] text-white font-mono text-xs font-semibold px-6 shadow-md transition-all cursor-pointer"
              >
                <Link href="/login" className="flex items-center gap-1.5">
                  <span>Start Preparing Now</span>
                  <Icon icon={ArrowRight01Icon} size={14} />
                </Link>
              </Button>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
}
