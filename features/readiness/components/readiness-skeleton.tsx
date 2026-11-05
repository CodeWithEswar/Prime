import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReadinessSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading interview readiness"
      className="@container min-w-0 space-y-4 motion-safe:animate-pulse"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border-default)] pb-4">
        <div className="min-w-0 flex-[1_1_24rem] space-y-2">
          <Skeleton className="h-7 w-56 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 min-w-0 flex-[1_1_16rem] sm:max-w-72" />
      </div>
      <Card
        elevation="raised"
        className="grid grid-cols-2 gap-4 p-3 @min-[36rem]:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="min-w-0 space-y-2">
            <Skeleton className="h-3 w-24 max-w-full" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </Card>
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
}
