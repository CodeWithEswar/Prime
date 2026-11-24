"use client";

import { VisPathFlow } from "./vispath-flow";

export function VisPathWorkspace() {
  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] rounded-2xl overflow-hidden border border-[#222228] bg-[#030305] shadow-2xl">
      <VisPathFlow />
    </div>
  );
}
