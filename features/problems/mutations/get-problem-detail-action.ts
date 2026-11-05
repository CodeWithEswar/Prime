"use server";

import { createClient } from "@/lib/supabase/server";
import { getProblemDetail } from "../queries/get-problem-detail";
import type { ProblemDetail } from "../types";
import { z } from "zod";
import { getProblemAttempts } from "../queries/get-problem-detail";

export async function getProblemDetailAction(
  slug: string
): Promise<ProblemDetail | null> {
  z.string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9-]+$/)
    .parse(slug);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Sign in to view your preparation history.");
  return getProblemDetail(supabase, slug, user.id);
}

export async function getOlderProblemAttemptsAction(input: {
  problemId: string;
  offset: number;
}) {
  const data = z
    .object({ problemId: z.string().uuid(), offset: z.number().int().min(0).max(100000) })
    .parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to view your attempt history.");
  return getProblemAttempts(supabase, data.problemId, user.id, data.offset);
}
