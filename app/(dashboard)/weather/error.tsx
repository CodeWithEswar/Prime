"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Weather is temporarily unavailable</h1>
      <p>Your preparation workspace is still available.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
