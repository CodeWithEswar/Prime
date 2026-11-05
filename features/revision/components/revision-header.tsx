"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HowItWorksDialog } from "./how-it-works-dialog";

export function RevisionHeader() {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-[#1A1A1A]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF0000] inline-block shadow-[0_0_8px_#FF0000]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000] font-semibold">
              REVISION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Review what matters before it fades.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Spaced repetition for long-term mastery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setHowItWorksOpen(true)}
          className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 text-xs font-medium text-[#A1A1A1] hover:text-white border border-[#262626] hover:border-[#383838] bg-[#0A0A0A] rounded-md transition-colors shrink-0"
        >
          <Icon icon={InformationCircleIcon} size={15} />
          <span>How it works?</span>
        </button>
      </div>

      <HowItWorksDialog open={howItWorksOpen} onOpenChange={setHowItWorksOpen} />
    </>
  );
}

