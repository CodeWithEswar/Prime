import { PageFrame } from "@/components/shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <PageFrame>
      <div className="space-y-6" aria-busy="true">
        <p role="status" className="text-xs text-[var(--text-tertiary)]">
          Loading workspace…
        </p>
        <Skeleton className="h-7 w-52 max-w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    </PageFrame>
  );
}
