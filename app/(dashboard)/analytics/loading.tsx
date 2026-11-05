import { PageFrame } from "@/components/shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAnalytics() {
  return (
    <PageFrame title="Analytics" className="max-w-[96rem]">
      <div className="space-y-4" role="status" aria-label="Loading analytics">
        <Skeleton className="h-11" />
        <Skeleton className="h-24" />
        <Skeleton className="h-72" />
      </div>
    </PageFrame>
  );
}
