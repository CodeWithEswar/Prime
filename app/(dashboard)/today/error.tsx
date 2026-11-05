"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TodayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Today page error:", error);
  }, [error]);

  return (
    <div className="w-full max-w-lg mx-auto my-12 p-8 rounded-lg bg-[#0C0C0C] border border-[#222222] text-center space-y-4">
      <div className="font-mono text-xs uppercase tracking-widest text-[#FF0000]">
        PREPARATION RUNWAY ERROR
      </div>

      <h2 className="text-xl font-bold tracking-tight text-white">
        Today&apos;s plan couldn&apos;t be loaded.
      </h2>

      <p className="text-xs text-[#888888] leading-relaxed">
        Your preparation data has not been changed. This is usually a temporary connection issue.
      </p>

      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => reset()}
          className="text-xs font-semibold"
        >
          Retry Loading Today
        </Button>
      </div>
    </div>
  );
}

