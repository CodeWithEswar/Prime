import { notFound } from "next/navigation";
import { MarkdownLab } from "@/features/ai/markdown/markdown-lab";
export const metadata = {
  title: "AI / Markdown — PRIME Design System",
  robots: { index: false, follow: false },
};
export default function AIMarkdownPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <MarkdownLab />;
}
