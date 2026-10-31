import Link from "next/link";
import { Compass01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <div className="max-w-md w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-8 text-center flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-elevated)] text-[var(--foreground-muted)] border border-[var(--border)]">
          <Icon icon={Compass01Icon} size={24} />
        </div>
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
            404 — Not Found
          </span>
          <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
            Destination Unreachable
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            The page or preparation resource you requested does not exist.
          </p>
        </div>
        <Link href="/">
          <Button variant="secondary" size="sm">
            Return to Foundation
          </Button>
        </Link>
      </div>
    </div>
  );
}
