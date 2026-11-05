import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFrame } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getTargetReadinessData } from "@/features/readiness/server/service";
import { ReadinessWorkspace } from "@/features/readiness/components/readiness-workspace";
import { ReadinessSkeleton } from "@/features/readiness/components/readiness-skeleton";

export const metadata: Metadata = {
  title: "Interview Readiness · PRIME",
  description:
    "Review your interview practice evidence and see which skills need more work.",
};

interface ReadinessPageProps {
  searchParams: Promise<{
    profile?: string;
    company?: string;
  }>;
}

async function ReadinessContent({ searchParams }: ReadinessPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const profileId = resolvedParams.profile || "general-sde";
  const companyId = resolvedParams.company;

  const data = await getTargetReadinessData(supabase, user.id, profileId, companyId).catch(
    (error) => {
      console.error("Readiness data fetch failed:", error);
      return null;
    }
  );

  if (!data) {
    return (
      <Card elevation="raised">
        <CardContent className="p-6 text-sm text-[var(--text-secondary)]" role="alert">
          Readiness could not load. Reload the page to try again.
        </CardContent>
      </Card>
    );
  }

  return <ReadinessWorkspace initialData={data} />;
}

export default function ReadinessPage({ searchParams }: ReadinessPageProps) {
  return (
    <PageFrame variant="workspace">
      <Suspense fallback={<ReadinessSkeleton />}>
        <ReadinessContent searchParams={searchParams} />
      </Suspense>
    </PageFrame>
  );
}
