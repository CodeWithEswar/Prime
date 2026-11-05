"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageFrame } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { safeCatalogReturn } from "@/features/problems/navigation";
export default function ProblemNotFound() {
  const query = useSearchParams();
  return (
    <PageFrame
      variant="focus"
      title="Problem not found"
      description="This problem is unavailable or the link is no longer current."
    >
      <Button asChild variant="outline">
        <Link href={safeCatalogReturn(query.get("from"))}>Back to DSA Practice</Link>
      </Button>
    </PageFrame>
  );
}
