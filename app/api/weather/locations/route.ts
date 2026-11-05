import type { NextRequest } from "next/server";
import { locationSearchSchema } from "@/lib/weather/schema";
import { searchCachedLocations } from "@/lib/weather/service";
import { weatherAccess } from "@/lib/weather/gateway";
export async function GET(request: NextRequest) {
  const denied = await weatherAccess("search");
  if (denied) return denied;
  const query = locationSearchSchema.safeParse(request.nextUrl.searchParams.get("q"));
  if (!query.success)
    return Response.json(
      { error: "Search with 3–80 letters, numbers, or place-name punctuation." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } }
    );
  try {
    return Response.json(
      { locations: await searchCachedLocations(query.data.toLocaleLowerCase("en")) },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return Response.json(
      { error: "Location search is unavailable. Try again." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
