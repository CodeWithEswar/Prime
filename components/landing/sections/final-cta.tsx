"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AmbientGlow } from "../backgrounds/ambient-glow";
import { DotGrid } from "../backgrounds/dot-grid";
import { MagneticControl } from "../cards/magnetic-control";
import { TextHighlight } from "../motion/text/text-highlight";
import { ScrambleText } from "../motion/text/scramble-text";
import { usePrimeReducedMotion } from "@/lib/motion";

export function FinalCTA() {
  const reduced = usePrimeReducedMotion();

  return (
    <section
      id="cta"
      className="relative overflow-hidden border-b border-[#1E1E1E] bg-[#000000] py-24 sm:py-32 lg:py-40 text-center"
    >
      <DotGrid mask="radial" className="opacity-25" />
      <AmbientGlow position="center" intensity="medium" />

      <div className="landing-container relative z-20 max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <ScrambleText
            text="09 / TAKE COMMAND"
            className="text-xs uppercase tracking-widest text-[#FF4D4D] block"
          />
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.06]">
            Make your preparation
            <br />
            <TextHighlight>deliberate.</TextHighlight>
          </h2>
          <p className="text-sm sm:text-base text-[#999999] max-w-xl mx-auto leading-relaxed">
            Follow the roadmap. Master each pattern. Revisit what needs attention.
            Step into technical interviews with genuine, verified confidence.
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <MagneticControl intensity={0.25}>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 bg-[#FF0000] hover:bg-[#CC0000] text-white px-8 text-sm font-medium shadow-[0_0_20px_rgba(255,0,0,0.35)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] transition-all cursor-pointer"
            >
              <Link href="/login" className="flex items-center justify-center gap-2">
                <span>Start Your Preparation</span>
                <Icon icon={ArrowRight01Icon} size={15} />
              </Link>
            </Button>
          </MagneticControl>

          <MagneticControl intensity={0.15}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 border-[#262626] bg-[#111111] text-[#CCCCCC] hover:text-white hover:bg-[#1A1A1A] px-6 text-sm cursor-pointer"
            >
              <a href="#features">Explore Modules</a>
            </Button>
          </MagneticControl>
        </motion.div>

        <p className="text-xs font-mono text-[#555555] pt-4">
          Free &amp; Open Access · Zero credit card · Synchronized with Supabase
        </p>
      </div>
    </section>
  );
}
