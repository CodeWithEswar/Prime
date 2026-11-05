import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReadinessStatus } from "@/domain/readiness";

const labels: Record<ReadinessStatus, string> = {
  evidence_aligned: "Evidence Aligned",
  developing: "Developing",
  needs_attention: "Needs Attention",
  insufficient_evidence: "Limited Evidence",
  not_assessed: "Not Assessed",
};

export function ReadinessStatusBadge({ status }: { status: ReadinessStatus }) {
  return (
    <span
      className={cn(
        badgeVariants({ variant: status === "evidence_aligned" ? "default" : "outline" }),
        status === "needs_attention" &&
          "border-[var(--accent-border)] bg-[var(--accent-muted)] text-white"
      )}
    >
      {status === "needs_attention" && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]"
        />
      )}
      {labels[status]}
    </span>
  );
}
