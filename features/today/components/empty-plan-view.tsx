"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Task01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

export function EmptyPlanView() {
  return (
    <div className="p-8 sm:p-12 rounded-lg bg-[#070707] border border-white/[0.08] text-center space-y-4 max-w-lg mx-auto my-8 shadow-md">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 border border-white/[0.08] text-white mx-auto shadow-[0_0_12px_rgba(255,255,255,0.05)]">
        <Icon icon={Task01Icon} size={22} className="text-[#FF0000]" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          No active preparation plan.
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
          Configure your preparation runway to convert PRIME curriculum and spaced retention obligations into a deterministic daily execution schedule.
        </p>
      </div>

      <div className="pt-2">
        <Button variant="primary" size="default" asChild className="gap-2">
          <Link href="/plan">
            <span>Configure Preparation Runway</span>
            <Icon icon={ArrowRight01Icon} size={15} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
