"use client";

import * as React from "react";
import { extractText } from "@/features/ai/markdown/utils";
import { getComplexityTier } from "../tables/rich-table-utils";
import { cn } from "@/lib/utils";

export interface RichInlineCodeProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function RichInlineCode({ children, className, ...props }: RichInlineCodeProps) {
  const text = extractText(children).trim();
  const tier = getComplexityTier(text);

  if (tier) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold border select-all align-baseline mx-0.5",
          tier === "constant" && "bg-[#10B981]/12 text-[#6EE7B7] border-[#10B981]/30",
          tier === "log" && "bg-[#3B82F6]/12 text-[#93C5FD] border-[#3B82F6]/30",
          tier === "linear" && "bg-[#F59E0B]/12 text-[#FCD34D] border-[#F59E0B]/30",
          tier === "linearithmic" && "bg-[#F59E0B]/18 text-[#FCD34D] border-[#F59E0B]/35",
          (tier === "quadratic" || tier === "exponential") && "bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/35",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <code
      className={cn(
        "prime-inline-code font-mono text-[12.5px] text-[#EDEDED] bg-[#0E0E0E] border border-white/[0.12] px-1.5 py-0.5 rounded select-all break-words align-baseline",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

