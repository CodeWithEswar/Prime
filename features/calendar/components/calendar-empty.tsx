"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function CalendarEmpty() {
  return (
    <div className="w-full max-w-lg mx-auto py-16 px-6 text-center space-y-5 rounded-lg border border-[#1E1E1E] bg-[#090909]">
      <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#242424] flex items-center justify-center mx-auto text-white">
        <Icon icon={Calendar02Icon} size={22} />
      </div>

      <div className="space-y-1.5">
        <div className="font-mono text-xs uppercase tracking-wider text-[#FF0000] font-semibold">
          TEMPORAL CANVAS
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          There is no preparation timeline yet
        </h3>
        <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
          Generate your 90-day adaptive preparation plan to map PRIME Core problems and retention reviews across your target dates.
        </p>
      </div>

      <div className="pt-2">
        <Button
          asChild
          variant="primary"
          className="bg-[#FF0000] text-white hover:bg-[#CC0000] font-mono text-xs font-semibold px-5"
        >
          <Link href="/plan">Configure Preparation Plan</Link>
        </Button>
      </div>
    </div>
  );
}

