"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SettingsError({ reset }: { reset: () => void }) {
  return (
    <Card className="space-y-3 p-4">
      <h2 className="text-base font-semibold">Settings unavailable</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Your settings could not be loaded. Try again shortly.
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </Card>
  );
}
