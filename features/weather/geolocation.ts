import { normalizeCoordinate } from "@/lib/weather/coordinates";
import type { WeatherLocation } from "@/lib/weather/schema";
import { z } from "zod";
const devicePlaceSchema = z.object({
  place: z
    .object({
      name: z.string().min(1).max(120),
      admin1: z.string().max(120),
      country: z.string().max(120),
      countryCode: z.string().max(3),
    })
    .nullable(),
});
export async function resolveDevicePlace(position: WeatherLocation, signal: AbortSignal) {
  try {
    const response = await fetch(
      `/api/weather/location-name?lat=${position.latitude}&lon=${position.longitude}`,
      { signal, cache: "no-store", credentials: "same-origin" }
    );
    if (!response.ok) return null;
    return devicePlaceSchema.parse(await response.json()).place;
  } catch {
    return null;
  }
}
export function requestDeviceLocation(
  geo: Pick<Geolocation, "getCurrentPosition"> | undefined
): Promise<WeatherLocation> {
  if (!geo)
    return Promise.reject(
      new Error(
        "This browser does not support location access. Search for a city instead."
      )
    );
  return new Promise((resolve, reject) =>
    geo.getCurrentPosition(
      (position) =>
        resolve({
          id: "device",
          mode: "device",
          name: "Current location",
          admin1: "",
          country: "",
          countryCode: "",
          latitude: normalizeCoordinate(position.coords.latitude),
          longitude: normalizeCoordinate(position.coords.longitude),
        }),
      (error) =>
        reject(
          new Error(
            error.code === 1
              ? "Location permission was denied. Search for a city instead."
              : error.code === 3
                ? "Location access timed out. Try again or search for a city."
                : "Your location is unavailable. Search for a city instead."
          )
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  );
}
