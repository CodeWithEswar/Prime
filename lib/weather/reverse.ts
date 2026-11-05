import "server-only";
import { z } from "zod";
import { cacheLife } from "next/cache";
const placeSchema = z.object({
  features: z
    .array(
      z.object({
        properties: z.object({
          name: z.string().max(120).optional(),
          city: z.string().max(120).optional(),
          town: z.string().max(120).optional(),
          village: z.string().max(120).optional(),
          state: z.string().max(120).optional(),
          country: z.string().max(120).optional(),
          countrycode: z.string().max(3).optional(),
          osm_key: z.string().optional(),
          osm_value: z.string().optional(),
        }),
      })
    )
    .max(10),
});
export function normalizeDevicePlace(raw: unknown) {
  const rows = placeSchema.parse(raw).features;
  for (const { properties: p } of rows) {
    const name =
      p.city ?? p.town ?? p.village ?? (p.osm_key === "place" ? p.name : undefined);
    if (name)
      return {
        name,
        admin1: p.state ?? "",
        country: p.country ?? "",
        countryCode: p.countrycode?.toUpperCase() ?? "",
      };
  }
  return null;
}
/** Only coarse coordinates enter this cache. No addresses, streets, geometry or device history are returned. */
export async function getDevicePlace(latitude: number, longitude: number) {
  "use cache";
  cacheLife({ stale: 86400, revalidate: 86400, expire: 604800 });
  const url = new URL(
    process.env.WEATHER_REVERSE_GEOCODER_URL || "https://photon.komoot.io/reverse"
  );
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("Place lookup is unavailable.");
  Object.entries({
    lat: String(latitude),
    lon: String(longitude),
    lang: "en",
    limit: "3",
    radius: "20",
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.append("layer", "city");
  url.searchParams.append("layer", "locality");
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
      headers: { "User-Agent": "PRIME-Weather/1.0", Accept: "application/json" },
    });
    if (!response.ok) throw new Error();
    return normalizeDevicePlace(await response.json());
  } catch {
    throw new Error("Place lookup is temporarily unavailable.");
  }
}
