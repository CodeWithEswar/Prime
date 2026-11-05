import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getNotifications } from "@/features/notifications/server/get-notifications";
import { inboxQuerySchema } from "@/features/notifications/inbox";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getNotifications(
      inboxQuerySchema.parse({
        ...Object.fromEntries(searchParams),
        unreadOnly: searchParams.get("unreadOnly") === "true",
      })
    );
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    const status =
      error instanceof ZodError ||
      (error instanceof Error && error.message === "Invalid notification cursor")
        ? 400
        : error instanceof Error && error.message === "Authentication required"
          ? 401
          : 500;
    return NextResponse.json(
      {
        ok: false,
        error:
          status === 400
            ? "Invalid notification filters"
            : status === 401
              ? "Please sign in again"
              : "Failed to fetch notifications",
      },
      { status }
    );
  }
}
