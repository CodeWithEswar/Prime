import "server-only";
import { normalizeForecast, normalizeLocations } from "./normalize";
export const WEATHER_VARIABLES = {
  current:
    "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day",
  hourly:
    "temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,relative_humidity_2m,cloud_cover,wind_speed_10m,wind_gusts_10m,visibility,dew_point_2m",
  daily:
    "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max",
} as const;
async function providerJson(url: URL) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error();
    return (await response.json()) as unknown;
  } catch {
    throw new Error("The weather provider is temporarily unavailable.");
  }
}
export function forecastUrl(latitude: number, longitude: number) {
  const key = process.env.OPEN_METEO_API_KEY;
  const url = new URL(
    key
      ? "https://customer-api.open-meteo.com/v1/forecast"
      : "https://api.open-meteo.com/v1/forecast"
  );
  Object.entries({
    latitude: String(latitude),
    longitude: String(longitude),
    ...WEATHER_VARIABLES,
    timezone: "auto",
    timeformat: "unixtime",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    ...(key ? { apikey: key } : {}),
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  return url;
}
export async function fetchForecast(latitude: number, longitude: number) {
  return normalizeForecast(
    await providerJson(forecastUrl(latitude, longitude)),
    latitude,
    longitude
  );
}
export async function fetchLocations(query: string) {
  const key = process.env.OPEN_METEO_API_KEY;
  const url = new URL(
    key
      ? "https://customer-geocoding-api.open-meteo.com/v1/search"
      : "https://geocoding-api.open-meteo.com/v1/search"
  );
  Object.entries({
    name: query,
    count: "8",
    language: "en",
    format: "json",
    ...(key ? { apikey: key } : {}),
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  return normalizeLocations(await providerJson(url));
}
