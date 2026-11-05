"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Task01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

export function EmptyPlanView() {
  return (
    <div className="p-8 sm:p-12 rounded-lg bg-[#0C0C0C] border border-[#222222] text-center space-y-4 max-w-lg mx-auto my-8">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#181818] border border-[#262626] text-white mx-auto">
        <Icon icon={Task01Icon} size={24} />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight text-white">
          No active preparation plan.
        </h2>
        <p className="text-xs text-[#888888] leading-relaxed">
          Create your personalized 90-day plan to convert PRIME Core and spaced retention obligations into a deterministic daily runway.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-xs text-white bg-[#FF0000] hover:bg-[#CC0000] transition-colors shadow-[0_0_16px_rgba(255,0,0,0.3)]"
        >
          <span>Configure Preparation Plan</span>
          <Icon icon={ArrowRight01Icon} size={14} />
        </Link>
      </div>
    </div>
  );
}

