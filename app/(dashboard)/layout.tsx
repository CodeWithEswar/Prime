import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace — PRIME",
};

/**
 * Dashboard Shell Layout Boundary
 * In Phase 1+, this hosts the responsive sidebar, context rail, and header shell.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
