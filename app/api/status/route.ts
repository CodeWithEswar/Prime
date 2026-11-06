import { NextResponse } from "next/server";
import { getPublicStatusSnapshot } from "@/lib/status/snapshot";

/**
 * Public Status API endpoint.
 * Highly responsive (<1ms from in-memory cache) and resilient to network/Cloudflare latency spikes.
 */
export async function GET() {
  const snapshot = await getPublicStatusSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "X-Cache": "PRIME-STATUS",
    },
  });
}
