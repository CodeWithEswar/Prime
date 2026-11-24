import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPythonDashboardData } from "@/features/python/server/service";
import { PythonWorkspace } from "@/features/python/components/python-workspace";

export const metadata: Metadata = {
  title: "Python & DSA Roadmap — PRIME Technical Curriculum",
  description:
    "Zero-to-Hero Python & DSA curriculum: Language internals, Big-O, collections, two pointers, sliding window, linked lists, stacks, binary trees, heaps, backtracking, graphs & dynamic programming.",
};

function PythonSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-8 space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 rounded-md border border-zinc-800 bg-zinc-950" />

      {/* Tabs strip skeleton */}
      <div className="h-10 rounded-md border border-zinc-800 bg-zinc-950" />

      {/* 8-Stage rail skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-md border border-zinc-800 bg-zinc-950"
          />
        ))}
      </div>

      {/* Focus card skeleton */}
      <div className="h-32 rounded-md border border-zinc-800 bg-zinc-950" />

      {/* Workspace skeleton */}
      <div className="h-96 rounded-md border border-zinc-800 bg-zinc-950" />
    </div>
  );
}

async function PythonContent() {
  let user = null;
  let supabase = null;

  try {
    supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (err) {
    console.warn(
      "Could not retrieve Supabase client for Python route; rendering with guest state.",
      err
    );
  }

  const initialData = await getPythonDashboardData(
    supabase,
    user?.id ?? null
  );

  return <PythonWorkspace initialData={initialData} />;
}

export default function PythonRoadmapPage() {
  return (
    <Suspense fallback={<PythonSkeleton />}>
      <PythonContent />
    </Suspense>
  );
}
