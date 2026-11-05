import { notFound } from "next/navigation";
import { RendererLab } from "@/features/algorithm-lab/components/renderer-lab";
export const metadata = {
  title: "Algorithm Lab — PRIME Design System",
  robots: { index: false, follow: false },
};
export default function AlgorithmWorkbench() {
  if (process.env.NODE_ENV === "production") notFound();
  return <RendererLab />;
}
