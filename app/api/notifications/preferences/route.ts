import { NextRequest, NextResponse } from "next/server";
import { getNotificationPreferences } from "@/features/notifications/server/get-preferences";
import { updateNotificationPreferencesAction } from "@/features/notifications/server/actions";

export async function GET() {
  try {
    const preferences = await getNotificationPreferences();
    if (!preferences) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ ok: true, preferences });
  } catch (error) {
    console.error("[API Notifications] Preferences GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await updateNotificationPreferencesAction(body);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, preferences: result.data });
  } catch (error) {
    console.error("[API Notifications] Preferences PATCH error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

