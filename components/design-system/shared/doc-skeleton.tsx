import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function DocPageSkeleton() {
  return (
    <div className="flex gap-8 items-start animate-fade-in">
      {/* Center Skeleton */}
      <div className="min-w-0 flex-1 max-w-4xl space-y-10 pb-16">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24 bg-[rgba(255,255,255,0.06)]" />
            <span className="text-white/20">/</span>
            <Skeleton className="h-4 w-32 bg-[rgba(255,255,255,0.06)]" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-44 bg-[rgba(255,255,255,0.08)]" />
            <Skeleton className="h-5 w-16 bg-[rgba(255,255,255,0.05)] rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4 bg-[rgba(255,255,255,0.05)]" />
        </div>

        {/* Preview Frame Skeleton */}
        <div className="rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.08)] bg-[#030303] overflow-hidden">
          <div className="h-10 border-b border-[rgba(255,255,255,0.06)] bg-[#060606] px-4 flex items-center justify-between">
            <Skeleton className="h-5 w-24 bg-[rgba(255,255,255,0.06)]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 bg-[rgba(255,255,255,0.06)]" />
              <Skeleton className="h-6 w-20 bg-[rgba(255,255,255,0.06)]" />
            </div>
          </div>
          <div className="h-72 flex items-center justify-center p-8">
            <Skeleton className="h-12 w-48 bg-[rgba(255,255,255,0.06)] rounded-[var(--radius-sm)]" />
          </div>
        </div>

        {/* Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-[rgba(255,255,255,0.07)]" />
          <Skeleton className="h-24 w-full bg-[rgba(255,255,255,0.04)] rounded-[var(--radius-sm)]" />
        </div>
      </div>

      {/* Right Context Rail Skeleton */}
      <div className="hidden xl:block w-56 shrink-0 space-y-4">
        <Skeleton className="h-4 w-28 bg-[rgba(255,255,255,0.06)]" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-36 bg-[rgba(255,255,255,0.04)]" />
          <Skeleton className="h-3 w-28 bg-[rgba(255,255,255,0.04)]" />
          <Skeleton className="h-3 w-32 bg-[rgba(255,255,255,0.04)]" />
          <Skeleton className="h-3 w-24 bg-[rgba(255,255,255,0.04)]" />
        </div>
      </div>
    </div>
  );
}
