import "server-only";
import { cacheLife } from "next/cache";
import { fetchForecast, fetchLocations } from "./provider";
export async function getCachedWeather(latitude: number, longitude: number) {
  "use cache";
  cacheLife({ stale: 600, revalidate: 600, expire: 1200 });
  return fetchForecast(latitude, longitude);
}
export async function searchCachedLocations(query: string) {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  return fetchLocations(query);
}
