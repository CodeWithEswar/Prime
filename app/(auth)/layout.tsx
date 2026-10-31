import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication — PRIME",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
