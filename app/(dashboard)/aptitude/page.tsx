import { Metadata } from "next";
import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAptitudeDashboardData } from "@/features/aptitude/server/service";
import { AptitudeWorkspace } from "@/features/aptitude/components/aptitude-workspace";

export const metadata: Metadata = {
  title: "Aptitude & Reasoning 40-Day System — PRIME",
  description:
    "Master Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Data Interpretation with 132 structured topics, formula sheets, worked examples, and placement assessments.",
};

function AptitudeSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]" />

      {/* Tabs strip */}
      <div className="h-12 border-b border-[#1A1A1A] bg-[#0E0E0E]" />

      {/* Progress rail skeleton */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg border border-[#161616] bg-[#0A0A0A]" />
        ))}
      </div>

      {/* Day workspace skeleton */}
      <div className="h-96 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]" />
    </div>
  );
}

async function AptitudeContent() {
  let user = null;
  let supabase = null;

  try {
    supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (err) {
    unstable_rethrow(err);
    console.warn(
      "Could not retrieve Supabase client for Aptitude route; rendering with guest state.",
      err
    );
  }

  const initialData = await getAptitudeDashboardData(supabase, user?.id ?? null);

  return <AptitudeWorkspace initialData={initialData} />;
}

export default function AptitudePage() {
  return (
    <main className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<AptitudeSkeleton />}>
        <AptitudeContent />
      </Suspense>
    </main>
  );
}
