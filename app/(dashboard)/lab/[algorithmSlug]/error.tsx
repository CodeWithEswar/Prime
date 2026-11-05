"use client";
import { Button } from "@/components/ui/button";
export default function LabError({ reset }: { reset: () => void }) {
  return (
    <section className="p-6" role="alert">
      <h2 className="text-xl mb-3">This visualization couldn’t be loaded.</h2>
      <p className="text-sm text-neutral-400 mb-4">
        Your PRIME progress has not changed.
      </p>
      <Button variant="secondary" size="sm" onClick={reset}>
        Try again
      </Button>
    </section>
  );
}
