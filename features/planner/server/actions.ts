"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { plannerCommand, sources, workRequest } from "../schema";
import { buildProposal, changePlanner, confirmProposal, plannerChoices } from "./service";

async function action<T>(run: (owner: string) => Promise<T>) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return { ok: false as const, error: "Sign in to update your planner." };
    return { ok: true as const, data: await run(user.id) };
  } catch (error) {
    if (error instanceof z.ZodError)
      return {
        ok: false as const,
        error: error.issues[0]?.message ?? "Check the fields and try again.",
      };
    const message = error instanceof Error ? error.message : "";
    if (/PLANNER_STALE|PLANNER_PROPOSAL_MISSING|deadlock|serialization/i.test(message)) {
      return {
        ok: false as const,
        error:
          "This proposal expired or your schedule changed. Preview the changes again.",
      };
    }
    if (message === "PLANNER_DATE")
      return {
        ok: false as const,
        error: "Choose a date within the 90-day planning window.",
      };
    console.error("Planner action failed", error);
    return {
      ok: false as const,
      error: "Planner is temporarily unavailable. Try again shortly.",
    };
  }
}

function refresh() {
  for (const path of [
    "/plan",
    "/today",
    "/calendar",
    "/analytics",
    "/roadmap",
    "/roadmap/dbms",
    "/roadmap/os",
    "/roadmap/cn",
    "/roadmap/oop",
    "/fundamentals/dbms",
    "/fundamentals/os",
    "/fundamentals/cn",
    "/fundamentals/oop",
  ])
    revalidatePath(path);
}

export async function previewPlanner(input: unknown) {
  return action((owner) => buildProposal(owner, plannerCommand.parse(input)));
}
export async function confirmPlanner(id: string) {
  return action(async (owner) => {
    await confirmProposal(owner, z.uuid().parse(id));
    refresh();
  });
}
export async function savePlannerBacklog(input: unknown, label?: string) {
  return action(async (owner) => {
    const request = workRequest.parse(input);
    const title =
      request.title ||
      z
        .string()
        .trim()
        .max(160)
        .parse(label ?? "") ||
      request.selection ||
      "Core curriculum";
    await changePlanner(owner, { intent: { title, request, status: "backlog" } });
    refresh();
  });
}
export async function editPlannerBacklog(id: string, change: unknown) {
  return action(async (owner) => {
    const selection = z.enum(["P1", "P2", "OPTIONAL", "cancelled"]).parse(change);
    await changePlanner(owner, {
      backlog: {
        id: z.uuid().parse(id),
        ...(selection === "cancelled" ? { status: selection } : { priority: selection }),
      },
    });
    refresh();
  });
}
export async function setPlannerLock(id: string, locked: boolean) {
  return action(async (owner) => {
    await changePlanner(owner, {
      lock: { id: z.uuid().parse(id), locked: z.boolean().parse(locked) },
    });
    refresh();
  });
}
export async function searchPlannerChoices(source: unknown, search: unknown) {
  return action((owner) =>
    plannerChoices(
      owner,
      z.enum(sources).parse(source),
      z.string().trim().max(100).parse(search)
    )
  );
}

export async function scheduleFundamentalsCourse(course: unknown, start?: string) {
  return action(async (owner) => {
    const command = plannerCommand.parse({ kind: "course", course, start });
    const proposal = await buildProposal(owner, command);
    if (proposal.id) {
      await confirmProposal(owner, proposal.id);
      refresh();
    }
    return {
      scheduledDays: proposal.placements.length,
      unplacedDays: proposal.unplaced.length,
    };
  });
}
