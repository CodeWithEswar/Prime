import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageFrame } from "@/components/shell";
import { AnalyticsWorkspace } from "@/features/analytics/workspace";
import { readAnalyticsFilters } from "@/features/analytics/metrics";
import { getAnalytics } from "@/features/analytics/service";
import { createClient } from "@/lib/supabase/server";
import "@/features/analytics/analytics.css";

export const metadata: Metadata = { title: "Analytics · PRIME" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const filters = readAnalyticsFilters(await searchParams);
  const data = await getAnalytics(client, user.id, filters);
  return (
    <PageFrame className="max-w-[96rem]">
      <AnalyticsWorkspace data={data} filters={filters} />
    </PageFrame>
  );
}
