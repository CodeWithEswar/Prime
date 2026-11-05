import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProblemDetail } from "./get-problem-detail";
// React cache is request-scoped: metadata and page share one read, never another user's state.
export const getProblemPageData = cache(async (slug: string) => {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  return { problem: await getProblemDetail(client, slug, user.id), userId: user.id };
});
