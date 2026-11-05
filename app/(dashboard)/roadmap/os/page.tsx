import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getOSDashboardData } from "@/features/os/server/service";
import { OSWorkspace } from "@/features/os/components/os-workspace";

export const metadata: Metadata = {
  title: "Operating Systems 12-Day Roadmap — PRIME CS Fundamentals",
  description:
    "Master Operating Systems with 77 indexed Neso Academy video lectures, CPU scheduling, synchronization, Peterson's algorithm, Banker's deadlock safety, and 6 interactive laboratories.",
};

function OSSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      <div className="h-64 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]" />
      <div className="h-12 border-b border-[#1A1A1A] bg-[#0E0E0E]" />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-[#161616] bg-[#0A0A0A]" />
        ))}
      </div>
      <div className="h-96 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]" />
    </div>
  );
}

async function OSContent() {
  let user = null;
  let supabase = null;

  try {
    supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (err) {
    console.warn("Could not retrieve Supabase client for OS route; rendering with guest state.", err);
  }

  const initialData = await getOSDashboardData(supabase, user?.id ?? null);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
      <OSWorkspace initialData={initialData} />
    </div>
  );
}

export default function OSPage() {
  return (
    <Suspense fallback={<OSSkeleton />}>
      <OSContent />
    </Suspense>
  );
}

