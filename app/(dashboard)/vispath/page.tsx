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
    <div className="w-full h-full bg-[#030305] animate-pulse flex flex-col items-center justify-center gap-3">
      <div className="size-10 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      <span className="font-mono text-xs text-[#71717A] tracking-wider">
        INITIALIZING FIGMA CANVAS WORKSPACE...
      </span>
    </div>
  );
}

export default function VisPathPage() {
  return (
    <div className="relative w-full h-[calc(100dvh-var(--shell-topbar-height,64px))] -mb-8 overflow-hidden bg-[#030305]">
      <Suspense fallback={<VisPathSkeleton />}>
        <VisPathWorkspace />
      </Suspense>
    </div>
  );
}
