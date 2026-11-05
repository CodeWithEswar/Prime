import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ALGORITHMS,
  algorithmMetadata,
} from "@/features/algorithm-lab/registry/metadata";
import { LabLoader } from "@/features/algorithm-lab/components/lab-workspace";
type Props = { params: Promise<{ algorithmSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const algorithm = algorithmMetadata((await params).algorithmSlug);
  return { title: `${algorithm?.name ?? "Algorithm"} | PRIME Lab` };
}
export function generateStaticParams() {
  return ALGORITHMS.map((algorithm) => ({ algorithmSlug: algorithm.slug }));
}
async function AlgorithmContent({ params }: Props) {
  const { algorithmSlug } = await params,
    algorithm = algorithmMetadata(algorithmSlug);
  if (!algorithm) notFound();
  return <LabLoader key={algorithmSlug} metadata={algorithm} />;
}
export default function AlgorithmPage(props: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-6 text-sm text-neutral-400">
          Loading Algorithm Lab…
        </p>
      }
    >
      <AlgorithmContent {...props} />
    </Suspense>
  );
}
