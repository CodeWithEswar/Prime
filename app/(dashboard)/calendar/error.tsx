"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Calendar route error:", error);
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto py-16 px-6 text-center space-y-4 rounded-lg border border-[#222222] bg-[#0A0A0A] mt-12">
      <div className="font-mono text-xs uppercase tracking-wider text-[#FF0000] font-semibold">
        CALENDAR SYNC ERROR
      </div>
      <h2 className="text-base font-bold text-white tracking-tight">
        Calendar couldn&apos;t load this preparation range
      </h2>
      <p className="text-xs text-[#888888] leading-relaxed">
        Your preparation plan, revision items, and daily tasks have not been changed.
      </p>
      <div className="pt-2">
        <Button
          onClick={reset}
          variant="outline"
          className="border-[#333333] bg-[#141414] text-white hover:bg-[#1E1E1E] font-mono text-xs"
        >
          Retry Calendar
        </Button>
      </div>
    </div>
  );
}

