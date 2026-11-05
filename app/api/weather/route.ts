import type { NextRequest } from "next/server";
import { forecastInputSchema, normalizeCoordinate } from "@/lib/weather/schema";
import { getCachedWeather } from "@/lib/weather/service";
import { weatherAccess } from "@/lib/weather/gateway";
export async function GET(request: NextRequest) {
  const denied = await weatherAccess("forecast");
  if (denied) return denied;
  const parsed = forecastInputSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!parsed.success)
    return Response.json(
      { error: "Enter valid latitude and longitude." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } }
    );
  try {
    const weather = await getCachedWeather(
      normalizeCoordinate(parsed.data.lat),
      normalizeCoordinate(parsed.data.lon)
    );
    return Response.json(weather, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json(
      { error: "Unable to refresh weather. Please try again." },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store", "Retry-After": "60" },
      }
    );
  }
}
