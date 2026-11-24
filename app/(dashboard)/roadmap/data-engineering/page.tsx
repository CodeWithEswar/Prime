import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getDataEngineeringDashboardData } from "@/features/data-engineering/server/service";
import { DataEngineeringWorkspace } from "@/features/data-engineering/components/data-engineering-workspace";

export const metadata: Metadata = {
  title: "Data Engineering Roadmap — PRIME Technical Curriculum",
  description:
    "Zero-to-Hero Data Engineering curriculum: Python, SQL window functions, Kimball modeling, Snowflake, Lakehouses (Iceberg/Delta), Spark, Kafka, Airflow, dbt & Cloud DataOps.",
};

function DataEngineeringSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-8 space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]" />

      {/* Tabs strip skeleton */}
      <div className="h-12 border-b border-[#1A1A1A] bg-[#0E0E0E]" />

      {/* 8-Stage rail skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg border border-[#161616] bg-[#0A0A0A]"
          />
        ))}
      </div>

      {/* Focus card skeleton */}
      <div className="h-32 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D]" />

      {/* Workspace skeleton */}
      <div className="h-96 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]" />
    </div>
  );
}

async function DataEngineeringContent() {
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
      "Could not retrieve Supabase client for Data Engineering route; rendering with guest state.",
      err
    );
  }

  const initialData = await getDataEngineeringDashboardData(
    supabase,
    user?.id ?? null
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-8">
      <DataEngineeringWorkspace initialData={initialData} />
    </div>
  );
}

export default function DataEngineeringPage() {
  return (
    <Suspense fallback={<DataEngineeringSkeleton />}>
      <DataEngineeringContent />
    </Suspense>
  );
}
