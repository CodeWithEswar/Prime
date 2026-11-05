"use client";

import { PageFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";

export default function AnalyticsError({ retry }: { retry: () => void }) {
  return (
    <PageFrame title="Analytics">
      <p role="alert" className="mb-4">
        Preparation analytics could not be loaded.
      </p>
      <Button variant="outline" onClick={retry}>
        Retry
      </Button>
    </PageFrame>
  );
}
