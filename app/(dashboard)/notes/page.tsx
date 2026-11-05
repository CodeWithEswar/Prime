import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import { SavedNotes } from "@/features/ai/components/saved-notes";

export const metadata: Metadata = {
  title: "Notes — PRIME",
};

function NotesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)] gap-8 animate-pulse">
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 bg-[#0a0a0a] rounded-md border border-white/5 p-3 space-y-2"
          >
            <div className="h-3 w-3/4 bg-white/10 rounded" />
            <div className="h-2 w-1/3 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-4 max-w-[850px]">
        <div className="h-8 w-36 bg-white/10 rounded" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-5/6 bg-white/5 rounded" />
          <div className="h-4 w-4/6 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

async function NotesContent() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  const { data, error } = user
    ? await client
        .from("notes")
        .select("id,body,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20)
    : { data: [], error: null };

  if (error) {
    return <p role="alert">Notes are temporarily unavailable.</p>;
  }

  if (data?.length) {
    return <SavedNotes notes={data} />;
  }

  return (
    <div className="py-12 text-sm text-[var(--text-secondary)]">
      <p>No saved notes yet.</p>
      <p className="mt-2 text-xs">
        Saved recall material and interview reflections will appear here.
      </p>
    </div>
  );
}

export default function NotesPage() {
  return (
    <PageFrame
      category="Workspace"
      title="Engineering Notes"
      description="Personal algorithmic patterns, edge cases, and interview retrospectives."
      variant="workspace"
    >
      <Suspense fallback={<NotesSkeleton />}>
        <NotesContent />
      </Suspense>
    </PageFrame>
  );
}
