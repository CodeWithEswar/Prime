import { PageFrame } from "@/components/shell";
import { Skeleton } from "@/components/ui/skeleton";
import "./problem-intelligence.css";
export function ProblemPageLoading() {
  return (
    <PageFrame variant="wide-table" className="problem-page-frame">
      <div aria-busy="true" className="problem-workspace-grid">
        <span role="status" className="sr-only">
          Loading problem workspace
        </span>
        <div className="problem-main">
          <Skeleton className="h-9 w-36" />
          <div className="problem-page-header space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-96 max-w-full" />
            <Skeleton className="h-8 w-72 max-w-full" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="problem-section">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="problem-context-rail">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </PageFrame>
  );
}
