import { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMasteryOverviewData } from "@/features/mastery/server/service";
import { MasteryDiagnosticView } from "@/features/mastery/components/mastery-diagnostic-view";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mastery Intelligence Engine · PRIME",
  description:
    "Evidence-based DSA skill mastery diagnostic. Deterministic measurement of reproducibility and long-term retention.",
};

function MasterySkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="h-24 bg-[#060606] rounded border border-white/5" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-[#060606] rounded border border-white/5" />
        ))}
      </div>
      <div className="h-10 bg-[#060606] rounded border border-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 h-[500px] bg-[#060606] rounded border border-white/5" />
        <div className="hidden lg:block lg:col-span-5 h-[500px] bg-[#060606] rounded border border-white/5" />
      </div>
    </div>
  );
}

interface MasteryPageProps {
  searchParams: Promise<{
    topic?: string;
    filter?: string;
  }>;
}

async function MasteryContent({ searchParams }: MasteryPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const data = await getMasteryOverviewData(supabase, user.id).catch(() => null);
  if (!data)
    return (
      <Card elevation="base" className="m-4">
        <CardContent className="p-5 text-sm" role="alert">
          Mastery evidence is temporarily unavailable. Reload to try again.
        </CardContent>
      </Card>
    );

  return (
    <MasteryDiagnosticView initialData={data} initialTopicSlug={resolvedParams.topic} />
  );
}

export default function MasteryPage(props: MasteryPageProps) {
  return (
    <Suspense fallback={<MasterySkeleton />}>
      <MasteryContent {...props} />
    </Suspense>
  );
}
