import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Focus Mode — PRIME",
  description: "Immersive Deep Work & Concentration Workspace",
  robots: { index: false, follow: false },
};

export const instant = false;

export default function FocusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] w-screen bg-[#000000] text-white overflow-hidden select-none">
      {children}
    </div>
  );
}

