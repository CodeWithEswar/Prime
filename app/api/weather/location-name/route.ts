import type { NextRequest } from "next/server";
import { forecastInputSchema, normalizeCoordinate } from "@/lib/weather/schema";
import { weatherAccess } from "@/lib/weather/gateway";
import { getDevicePlace } from "@/lib/weather/reverse";
export async function GET(request: NextRequest) {
  const denied = await weatherAccess("search");
  if (denied) return denied;
  const input = forecastInputSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!input.success)
    return Response.json(
      { error: "Enter valid coordinates." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } }
    );
  try {
    return Response.json(
      {
        place: await getDevicePlace(
          normalizeCoordinate(input.data.lat),
          normalizeCoordinate(input.data.lon)
        ),
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return Response.json(
      { place: null },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
