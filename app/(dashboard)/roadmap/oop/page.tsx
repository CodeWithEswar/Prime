import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getOOPDashboardData } from "@/features/oop/server/service";
import { OOPWorkspace } from "@/features/oop/components/oop-workspace";

export const metadata: Metadata = {
  title: "OOP with Java 12-Day Roadmap & Lab — PRIME CS Fundamentals",
  description:
    "Master Object-Oriented Programming in Java with 7 primary Kunal Kushwaha master lectures, 21 timestamp segments, 10 interactive laboratories, dynamic method dispatch, encapsulation boundaries, SOLID refactoring, and 10 low-level design cases.",
};

function OOPSkeleton() {
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

async function OOPContent() {
  let user = null;
  let supabase = null;

  try {
    supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (err) {
    console.warn("Could not retrieve Supabase client for OOP route; rendering with guest state.", err);
  }

  const initialData = await getOOPDashboardData(supabase, user?.id ?? null);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
      <OOPWorkspace initialData={initialData} />
    </div>
  );
}

export default function OOPPage() {
  return (
    <Suspense fallback={<OOPSkeleton />}>
      <OOPContent />
    </Suspense>
  );
}

