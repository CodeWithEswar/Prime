import type { Metadata } from "next";
import { PageFrame } from "@/components/shell";
import { getStriverSheet } from "@/features/striver-a2z/server/get-striver-sheet";
import { getStriverAnalytics } from "@/features/striver-a2z/server/get-striver-analytics";
import { StriverWorkspace } from "@/features/striver-a2z/components/striver-workspace";

export const metadata: Metadata = {
  title: "Striver A2Z DSA Sheet — Complete Learning Track — PRIME",
  description:
    "Official Striver A2Z DSA Sheet with 18 steps, 299 verified video lectures, 372 practice problems, and independent topic mastery tracking.",
};

interface PageProps {
  searchParams: Promise<{
    topic?: string;
    v?: string;
  }>;
}

export default async function StriverA2ZSheetPage({ searchParams }: PageProps) {
  const { topic, v } = await searchParams;

  const [sheetDetail, analytics] = await Promise.all([
    getStriverSheet(topic, v),
    getStriverAnalytics(),
  ]);

  return (
    <PageFrame variant="wide-table">
      <StriverWorkspace
        initialDetail={sheetDetail}
        analytics={analytics}
      />
    </PageFrame>
  );
}

