import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PageFrame } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { PlannerWorkspace } from "@/features/planner/components/planner-workspace";
import { isFundamentalsCourse } from "@/domain/fundamentals/courses";
import { workRequest } from "@/features/planner/schema";
import { getPlannerView } from "@/features/planner/server/service";

export const metadata: Metadata = {
  title: "Planner — PRIME",
  description:
    "Plan study commitments, manage availability, and review changes before scheduling.",
};

type Params = Record<string, string | string[] | undefined>;
async function PlannerContent({ searchParams }: { searchParams: Promise<Params> }) {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const [params, view] = await Promise.all([
    searchParams,
    getPlannerView(user.id).catch((error) => {
      console.error("Planner view failed", error);
      return null;
    }),
  ]);
  if (!view)
    return (
      <Card elevation="base">
        <CardHeader>
          <CardTitle>Planner unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--text-secondary)]">
          The planning workspace could not load. Try again shortly.
        </CardContent>
      </Card>
    );
  const date = z.iso.date().safeParse(params.date);
  const initialDate =
    date.success && view.days.some((d) => d.date === date.data) ? date.data : undefined;
  const context = [
    ["problem", params.problem],
    ["core", params.stage ?? (params.optional === "yes" ? "" : undefined)],
    ["revision", params.revision],
    ["lab", params.lab],
  ].find(([, id]) => typeof id === "string");
  const prefill = workRequest.safeParse({
    source: context?.[0],
    selection: context?.[1],
    title: "",
    domain: "Other",
    count: 1,
    priority: params.optional === "yes" ? "OPTIONAL" : "P2",
    when: initialDate ? "date" : "auto",
    date: initialDate,
    locked: false,
    allowOverload: false,
  });
  return (
    <PlannerWorkspace
      view={view}
      initialDate={initialDate}
      initialWork={prefill.success ? prefill.data : undefined}
      newWork={params.work === "new"}
      initialCourse={isFundamentalsCourse(params.course) ? params.course : undefined}
      initialMove={typeof params.move === "string" ? params.move : undefined}
    />
  );
}

export default function PlanPage({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <PageFrame
      category="Preparation"
      title="Planner"
      description="Manage study time, commitments, and the work you’re preparing for."
      variant="workspace"
    >
      <Suspense
        fallback={
          <Card elevation="base">
            <CardContent className="p-5 text-sm text-[var(--text-secondary)]">
              Loading planner…
            </CardContent>
          </Card>
        }
      >
        <PlannerContent searchParams={searchParams} />
      </Suspense>
    </PageFrame>
  );
}
