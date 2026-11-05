import { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRevisionDashboardData } from "@/features/revision/queries/get-revision-data";
import { RevisionCommandCenter } from "@/features/revision/components/revision-command-center";

export const metadata: Metadata = {
  title: "Revision Command · PRIME",
  description: "Spaced repetition revision command center for deliberate DSA retention.",
};

function RevisionSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="h-20 bg-[#0E0E0E] rounded-md border border-[#1A1A1A]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-[#0A0A0A] rounded-md border border-[#1C1C1C]" />
        ))}
      </div>
      <div className="h-10 bg-[#0A0A0A] rounded-md border border-[#1C1C1C]" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-96 bg-[#0A0A0A] rounded-md border border-[#1C1C1C]" />
        <div className="lg:col-span-4 space-y-4">
          <div className="h-44 bg-[#0A0A0A] rounded-md border border-[#1C1C1C]" />
          <div className="h-44 bg-[#0A0A0A] rounded-md border border-[#1C1C1C]" />
        </div>
      </div>
    </div>
  );
}

async function RevisionContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getRevisionDashboardData(supabase, user.id);

  return <RevisionCommandCenter initialData={data} />;
}

export default function RevisionPage() {
  return (
    <Suspense fallback={<RevisionSkeleton />}>
      <RevisionContent />
    </Suspense>
  );
}
