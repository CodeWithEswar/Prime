import type { Metadata } from "next";
import { LabCatalog } from "@/features/algorithm-lab/components/lab-catalog";
export const metadata: Metadata = {
  title: "Algorithm Lab | PRIME",
  description: "Watch algorithm state, trace Java logic and predict the next move.",
};
export default function AlgorithmLabPage() {
  return <LabCatalog />;
}
