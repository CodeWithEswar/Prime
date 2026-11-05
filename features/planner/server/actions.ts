"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDays } from "@/domain/planning/capacity";
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
        error: "Choose a date within your planning window.",
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

export async function updatePlanTarget(targetDate: string, newStartDate?: string) {
  return action(async (owner) => {
    const parsedDate = z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .parse(targetDate);
    const parsedStart = newStartDate
      ? z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .parse(newStartDate)
      : undefined;
    const db = createAdminClient();
    const [settings, plan] = await Promise.all([
      db
        .from("user_settings")
        .select("timezone,target_role,daily_study_minutes,start_date")
        .eq("user_id", owner)
        .maybeSingle(),
      db
        .from("preparation_plans")
        .select("id,timezone,target_role,daily_capacity_minutes,start_date")
        .eq("user_id", owner)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .order("id")
        .limit(1)
        .maybeSingle(),
    ]);
    const timezone = settings?.data?.timezone ?? plan?.data?.timezone ?? "UTC";
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (parsedDate < today) {
      throw new Error("Target date must be today or in the future.");
    }
    const targetRole =
      plan?.data?.target_role ?? settings?.data?.target_role ?? "Software Engineer";
    const dailyMinutes =
      settings?.data?.daily_study_minutes ?? plan?.data?.daily_capacity_minutes ?? 90;

    const startDateToUse =
      parsedStart ??
      (plan?.data?.start_date && plan.data.start_date <= today
        ? plan.data.start_date
        : today);

    await db
      .from("user_settings")
      .update({
        target_date: parsedDate,
        start_date: startDateToUse,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", owner);

    if (plan?.data?.id) {
      await db
        .from("preparation_plans")
        .update({
          target_date: parsedDate,
          start_date: startDateToUse,
          updated_at: new Date().toISOString(),
        })
        .eq("id", plan.data.id)
        .eq("user_id", owner);
    } else {
      await db.from("preparation_plans").insert({
        user_id: owner,
        start_date: startDateToUse,
        target_date: parsedDate,
        timezone,
        target_role: targetRole,
        daily_capacity_minutes: dailyMinutes,
        status: "active",
      });
    }
    refresh();
    return { targetDate: parsedDate, startDate: startDateToUse };
  });
}

export async function updatePlanDuration(days: number) {
  return action(async (owner) => {
    const totalDays = z.number().int().min(7).max(365).parse(days);
    const db = createAdminClient();
    const [settings, plan] = await Promise.all([
      db
        .from("user_settings")
        .select("timezone,target_role,daily_study_minutes,start_date")
        .eq("user_id", owner)
        .maybeSingle(),
      db
        .from("preparation_plans")
        .select("id,timezone,target_role,daily_capacity_minutes,start_date")
        .eq("user_id", owner)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .order("id")
        .limit(1)
        .maybeSingle(),
    ]);
    const timezone = settings?.data?.timezone ?? plan?.data?.timezone ?? "UTC";
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const startDate = plan?.data?.start_date ?? settings?.data?.start_date ?? today;
    const targetDate = addDays(startDate, totalDays - 1);
    const targetRole =
      plan?.data?.target_role ?? settings?.data?.target_role ?? "Software Engineer";
    const dailyMinutes =
      settings?.data?.daily_study_minutes ?? plan?.data?.daily_capacity_minutes ?? 90;

    await db
      .from("user_settings")
      .update({ target_date: targetDate, updated_at: new Date().toISOString() })
      .eq("user_id", owner);

    if (plan?.data?.id) {
      await db
        .from("preparation_plans")
        .update({ target_date: targetDate, updated_at: new Date().toISOString() })
        .eq("id", plan.data.id)
        .eq("user_id", owner);
    } else {
      await db.from("preparation_plans").insert({
        user_id: owner,
        start_date: startDate,
        target_date: targetDate,
        timezone,
        target_role: targetRole,
        daily_capacity_minutes: dailyMinutes,
        status: "active",
      });
    }
    refresh();
    return { targetDate, totalDays };
  });
}
