import type { Metadata } from "next";
import AIWorkspace from "@/features/ai/components/ai-workspace";

export const metadata: Metadata = {
  title: "PRIME AI — Preparation Intelligence",
  robots: { index: false, follow: false },
};

export default function AIPage() {
  return <AIWorkspace />;
}

