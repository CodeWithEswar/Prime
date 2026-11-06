"use client";

import { motion } from "motion/react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { CheckmarkCircle02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface FocusCompletionProps {
  elapsedFormatted: string;
  taskTitle: string;
  onFinish: (options: { markComplete: boolean }) => void;
  isPending?: boolean;
}

export function FocusCompletion({
  elapsedFormatted,
  taskTitle,
  onFinish,
  isPending = false,
}: FocusCompletionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-30 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto p-8 rounded-2xl bg-[#090909]/90 border border-white/[0.1] shadow-2xl backdrop-blur-md"
    >
      {/* Central completion beacon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
        <Icon icon={CheckmarkCircle02Icon} size={32} className="stroke-[2.5]" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
          Focus session complete.
        </h2>
        <p className="text-sm text-neutral-400 font-sans">
          One more step forward.
        </p>
      </div>

      {/* Telemetry snippet */}
      <div className="w-full p-4 rounded-lg bg-neutral-950 border border-white/[0.06] flex items-center justify-between font-mono text-xs">
        <span className="text-neutral-400 truncate max-w-[220px]">{taskTitle}</span>
        <span className="text-emerald-400 font-bold text-sm">{elapsedFormatted}</span>
      </div>

      {/* Return to Day Plan button */}
      <div className="w-full pt-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={isPending}
          onClick={() => onFinish({ markComplete: true })}
          className="w-full gap-2 font-mono"
        >
          <span>Return to Day Plan</span>
          <Icon icon={ArrowRight01Icon} size={16} />
        </Button>
      </div>
    </motion.div>
  );
}

