"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { MagneticControl } from "../cards/magnetic-control";
import { TextHighlight } from "../motion/text/text-highlight";
import { usePrimeReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface CinematicCTAProps {
  className?: string;
}

export function CinematicCTA({ className = "" }: CinematicCTAProps) {
  const reduced = usePrimeReducedMotion();

  return (
    <div
      className={cn(
        "relative z-30 flex flex-col items-center text-center max-w-xl mx-auto px-4",
        className
      )}
    >
      <motion.div
        initial={reduced ? undefined : { opacity: 0, y: 18 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
      >
        <span className="font-mono text-xs uppercase tracking-widest text-[#FF4D4D] block">
          09 / Destination
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Your next chapter <TextHighlight>starts here.</TextHighlight>
        </h2>

        <p className="text-xs sm:text-sm text-[#888888] font-mono max-w-md mx-auto">
          Turn preparation into progress. Deliberate practice, verified recall, repeatable mastery.
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? undefined : { opacity: 0, y: 14 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 flex flex-col sm:flex-row items-center gap-3.5"
      >
        <MagneticControl intensity={0.25}>
          <Button
            asChild
            size="lg"
            className="h-12 px-8 bg-[#FF0000] hover:bg-[#CC0000] text-white font-medium text-sm rounded-lg shadow-[0_0_25px_rgba(255,0,0,0.4)] hover:shadow-[0_0_35px_rgba(255,0,0,0.6)] transition-all cursor-pointer"
          >
            <Link href="/login" className="flex items-center gap-2">
              <span>Start Preparing</span>
              <Icon icon={ArrowRight01Icon} size={15} />
            </Link>
          </Button>
        </MagneticControl>

        <MagneticControl intensity={0.15}>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-6 border-[#262626] bg-[#0E0E0E]/80 backdrop-blur text-[#CCCCCC] hover:text-white hover:bg-[#1A1A1A] text-sm rounded-lg cursor-pointer"
          >
            <a href="#features">Explore Modules</a>
          </Button>
        </MagneticControl>
      </motion.div>
    </div>
  );
}

