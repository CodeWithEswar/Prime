import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendRevisionDigestEmail, type RevisionDigestItem } from "@/lib/email/revision-mailer";
import { categorizeRevisionItem } from "@/domain/revision";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Enforce authorization: In production, CRON_SECRET is strictly required
    if (process.env.NODE_ENV === "production") {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();

    // 1. Fetch all revision items due now or overdue
    const { data: dueItems, error: itemsError } = await admin
      .from("revision_items")
      .select(`
        id,
        user_id,
        entity_id,
        interval_days,
        next_review_at,
        snoozed_until,
        status
      `)
      .eq("status", "active")
      .eq("entity_type", "problem")
      .lte("next_review_at", now.toISOString());

    if (itemsError) {
      return NextResponse.json(
        { error: "Failed to query revision items", details: itemsError },
        { status: 500 }
      );
    }

    if (!dueItems || dueItems.length === 0) {
      return NextResponse.json({ message: "No revisions due at this time", dispatched: 0 });
    }

    // 2. Group due items by user_id
    const userMap = new Map<string, typeof dueItems>();
    for (const item of dueItems) {
      const list = userMap.get(item.user_id) ?? [];
      list.push(item);
      userMap.set(item.user_id, list);
    }

    const problemIds = Array.from(new Set(dueItems.map((i) => i.entity_id)));
    const { data: problems } = await admin
      .from("problems")
      .select("id, title, difficulty")
      .in("id", problemIds);

    const problemMap = new Map((problems ?? []).map((p) => [p.id, p]));

    let dispatchedCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    // 3. For each user, fetch their email and send digest
    for (const [userId, items] of userMap.entries()) {
      // Fetch user profile or auth user
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      const email = authUser?.user?.email;
      const userName =
        authUser?.user?.user_metadata?.display_name ||
        authUser?.user?.email?.split("@")[0] ||
        "Candidate";

      if (!email) continue;

      let overdueCount = 0;
      let dueTodayCount = 0;
      const digestItems: RevisionDigestItem[] = [];

      for (const item of items) {
        const cat = categorizeRevisionItem(item.snoozed_until || item.next_review_at, now);
        if (cat === "overdue") overdueCount++;
        else dueTodayCount++;

        const prob = problemMap.get(item.entity_id);
        if (prob) {
          digestItems.push({
            title: prob.title,
            difficulty: prob.difficulty,
            stageLabel: `Stage ${item.interval_days}-day`,
          });
        }
      }

      const emailResult = await sendRevisionDigestEmail({
        to: email,
        userName,
        overdueCount,
        dueTodayCount,
        items: digestItems,
      });

      if (emailResult.success && !emailResult.skipped) {
        dispatchedCount++;
      } else if (!emailResult.success) {
        errors.push({ userId, error: emailResult.error || "Email failed" });
      }
    }

    return NextResponse.json({
      success: true,
      totalUsersWithDue: userMap.size,
      dispatchedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error("Reminder dispatch endpoint error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error during reminder dispatch", message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Allow health check
  return NextResponse.json({
    status: "healthy",
    endpoint: "/api/reminders/dispatch",
    timestamp: new Date().toISOString(),
  });
}
