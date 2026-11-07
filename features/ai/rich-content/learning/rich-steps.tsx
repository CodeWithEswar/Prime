"use client";

import * as React from "react";
import { ArrowLeft01Icon, ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StepItem {
  title: string;
  detail?: string;
}

export interface RichStepsProps {
  steps: StepItem[];
  title?: string;
  className?: string;
}

export function RichSteps({ steps, title = "Step-by-Step Procedure", className }: RichStepsProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [viewAll, setViewAll] = React.useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div
      className={cn(
        "my-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] overflow-hidden shadow-md font-mono",
        className
      )}
    >
      {/* Header & Controls */}
      <div className="flex items-center justify-between p-3 sm:p-3.5 border-b border-white/[0.06] bg-[#0D0D0D]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">{title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400">
            {viewAll ? `${steps.length} Steps` : `Step ${currentStep + 1} of ${steps.length}`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setViewAll((v) => !v)}
          className="text-[11px] text-[#FF4D4D] hover:underline"
        >
          {viewAll ? "Stepper View" : "View All"}
        </button>
      </div>

      {viewAll ? (
        /* View All Statically */
        <div className="p-4 divide-y divide-white/[0.04] space-y-3 font-sans">
          {steps.map((step, idx) => (
            <div key={idx} className="pt-3 first:pt-0 space-y-1">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0000]/15 text-[#FF0000] text-[10px]">
                  {idx + 1}
                </span>
                <span>{step.title}</span>
              </div>
              {step.detail && <p className="text-xs text-neutral-300 pl-7 leading-relaxed">{step.detail}</p>}
            </div>
          ))}
        </div>
      ) : (
        /* Interactive Step by Step */
        <div className="p-4 space-y-4">
          {/* Active Step Card */}
          <div className="p-3.5 rounded-lg bg-black border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF0000] text-black font-bold text-xs shrink-0">
                {currentStep + 1}
              </span>
              <span className="break-words">{steps[currentStep].title}</span>
            </div>
            {steps[currentStep].detail && (
              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed pl-8">
                {steps[currentStep].detail}
              </p>
            )}
          </div>

          {/* Stepper Navigation Footer */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
            <Button
              variant="outline"
              size="sm"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              className="h-7 px-2 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white"
            >
              <Icon icon={ArrowLeft01Icon} size={13} className="mr-1" />
              <span>Previous</span>
            </Button>

            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    currentStep === idx ? "w-5 bg-[#FF0000]" : "w-1.5 bg-white/20 hover:bg-white/40"
                  )}
                  aria-label={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentStep === steps.length - 1}
              onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
              className="h-7 px-2 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white"
            >
              <span>Next</span>
              <Icon icon={ArrowRight01Icon} size={13} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

