"use client";

import * as React from "react";
import { Alert01Icon, Refresh01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { toSafeUserError } from "@/lib/errors";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const safeError = toSafeUserError(error);

  React.useEffect(() => {
    console.error("PRIME Root Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <div className="max-w-md w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-2xl flex flex-col gap-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-border)]">
          <Icon icon={Alert01Icon} size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Something went wrong
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            {safeError.message}
          </p>
        </div>
        <div className="mt-2 flex justify-center">
          <Button variant="primary" onClick={reset}>
            <Icon icon={Refresh01Icon} size={16} />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
