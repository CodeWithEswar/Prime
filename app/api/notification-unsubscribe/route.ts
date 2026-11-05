import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Missing unsubscribe token.", { status: 400 });
  }

  const adminClient: SupabaseClient = createAdminClient();
  const { data: pref } = await adminClient
    .from("notification_preferences")
    .select("user_id, email_enabled")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!pref) {
    return new Response("Invalid or expired unsubscribe token.", { status: 404 });
  }

  // Render a minimal, secure confirmation page
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PRIME &middot; Unsubscribe</title>
  <style>
    body { background-color: #000; color: #fff; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background-color: #060606; border: 1px solid #222; border-radius: 8px; padding: 32px; max-width: 420px; text-align: center; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    p { font-size: 13px; color: #888; line-height: 1.5; margin-bottom: 24px; }
    button { background-color: #FF0000; color: #fff; border: none; padding: 12px 24px; font-weight: 700; border-radius: 6px; cursor: pointer; }
    button:hover { background-color: #d90000; }
  </style>
</head>
<body>
  <div class="card">
    <div style="color: #FF0000; font-size: 24px; margin-bottom: 12px;">&#9632; PRIME</div>
    <h1>Confirm Email Unsubscribe</h1>
    <p>You can turn off all non-essential preparation reminders and weekly progress emails with one click.</p>
    <form method="POST">
      <input type="hidden" name="token" value="${token}" />
      <button type="submit">Unsubscribe from Optional Emails</button>
    </form>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  let token: string | null = null;
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => ({}));
    token = json.token;
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData().catch(() => null);
    token = formData?.get("token") as string | null;
  }

  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get("token");
  }

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const adminClient: SupabaseClient = createAdminClient();
  const { data, error } = await adminClient
    .from("notification_preferences")
    .update({
      email_enabled: false,
      revision_email_enabled: false,
      session_email_enabled: false,
      assessment_email_enabled: false,
      missed_task_email_enabled: false,
      daily_digest_enabled: false,
      weekly_report_enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq("unsubscribe_token", token)
    .select("user_id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Invalid token or update failed" },
      { status: 404 }
    );
  }

  const successHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PRIME &middot; Unsubscribed</title>
  <style>
    body { background-color: #000; color: #fff; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background-color: #060606; border: 1px solid #222; border-radius: 8px; padding: 32px; max-width: 420px; text-align: center; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    p { font-size: 13px; color: #888; line-height: 1.5; margin-bottom: 24px; }
    a { color: #FF4D4D; text-decoration: none; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div style="color: #FF0000; font-size: 24px; margin-bottom: 12px;">&#9632; PRIME</div>
    <h1>You have been unsubscribed</h1>
    <p>You will no longer receive optional reminder emails. In-app notifications remain active in your preparation workspace.</p>
    <a href="/settings/notifications">Manage Notification Preferences in App &rarr;</a>
  </div>
</body>
</html>
  `;

  return new Response(successHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
