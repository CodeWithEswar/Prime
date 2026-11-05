"use client";
import Link from "next/link";
import { PageFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
export default function ProblemError({ reset }: { reset: () => void }) {
  return (
    <PageFrame
      variant="focus"
      title="This problem couldn’t be loaded"
      description="Your preparation history is unchanged. Try loading the workspace again."
    >
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/practice/dsa">Back to DSA Practice</Link>
        </Button>
      </div>
    </PageFrame>
  );
}
