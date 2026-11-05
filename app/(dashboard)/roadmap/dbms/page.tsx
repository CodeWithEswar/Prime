import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getDBMSDashboardData } from "@/features/dbms/server/service";
import { DBMSWorkspace } from "@/features/dbms/components/dbms-workspace";

export const metadata: Metadata = {
  title: "DBMS 12-Day Roadmap — PRIME CS Fundamentals",
  description:
    "Master Database Management Systems with all 91 verified Neso Academy video lectures, SQL practice, functional dependencies, ACID transactions, and B+ tree indexing.",
};

function DBMSSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]" />

      {/* Tabs strip */}
      <div className="h-12 border-b border-[#1A1A1A] bg-[#0E0E0E]" />

      {/* 12-Day rail skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-[#161616] bg-[#0A0A0A]" />
        ))}
      </div>

      {/* Focus card skeleton */}
      <div className="h-32 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]" />

      {/* Workspace skeleton */}
      <div className="h-96 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]" />
    </div>
  );
}

async function DBMSContent() {
  let user = null;
  let supabase = null;

  try {
    supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (err) {
    console.warn("Could not retrieve Supabase client for DBMS route; rendering with guest state.", err);
  }

  const initialData = await getDBMSDashboardData(supabase, user?.id ?? null);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
      <DBMSWorkspace initialData={initialData} />
    </div>
  );
}

export default function DBMSPage() {
  return (
    <Suspense fallback={<DBMSSkeleton />}>
      <DBMSContent />
    </Suspense>
  );
}

