import { Metadata } from "next";
import { Suspense } from "react";
import { VisPathWorkspace } from "@/features/vispath/components/vispath-workspace";

export const metadata: Metadata = {
  title: "VisPath — Interactive Roadmap Canvas & Neural Hive",
  description:
    "Explore the interconnected PRIME curriculum constellation across Data Engineering, Computer Systems, and Algorithmic Foundations in an interactive particle canvas.",
};

function VisPathSkeleton() {
  return (
    <div className="w-full h-[calc(100dvh-4rem)] rounded-2xl border border-[#222228] bg-[#030305] animate-pulse flex flex-col items-center justify-center gap-3">
      <div className="size-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      <span className="font-mono text-xs text-[#71717A] tracking-wider">
        INITIALIZING CANVAS HIVE...
      </span>
    </div>
  );
}

export default function VisPathPage() {
  return (
    <div className="w-full max-w-[1680px] mx-auto p-2 sm:p-4 lg:p-5">
      <Suspense fallback={<VisPathSkeleton />}>
        <VisPathWorkspace />
      </Suspense>
    </div>
  );
}
