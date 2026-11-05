import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="min-w-0 space-y-4" role="status" aria-label="Loading settings">
      <Skeleton className="h-6 w-40 max-w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
