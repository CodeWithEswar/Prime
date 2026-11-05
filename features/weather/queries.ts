"use client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { normalizeCoordinate } from "@/lib/weather/coordinates";
import type { WeatherForecast } from "@/lib/weather/types";
import type { WeatherLocation } from "@/lib/weather/schema";
export class WeatherRequestError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}
async function gateway<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    signal,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new WeatherRequestError(
      response.status,
      typeof data?.error === "string" ? data.error : "Weather is temporarily unavailable."
    );
  return data as T;
}
export function forecastOptions(location: WeatherLocation | null) {
  const lat = location ? normalizeCoordinate(location.latitude) : null,
    lon = location ? normalizeCoordinate(location.longitude) : null;
  return queryOptions({
    queryKey: queryKeys.weather.forecast(lat, lon),
    enabled: !!location,
    queryFn: ({ signal }) =>
      gateway<WeatherForecast>(`/api/weather?lat=${lat}&lon=${lon}`, signal),
    staleTime: 600000,
    gcTime: 1800000,
    refetchOnWindowFocus: true,
    refetchInterval: 600000,
    refetchIntervalInBackground: false,
    retry: (count, error) =>
      count < 1 &&
      !(error instanceof WeatherRequestError && [400, 401, 429].includes(error.status)),
  });
}
export function useForecast(location: WeatherLocation | null) {
  return useQuery(forecastOptions(location));
}
export function locationOptions(query: string, enabled = true) {
  const clean = query.trim();
  return queryOptions({
    queryKey: queryKeys.weather.locations(clean),
    enabled: enabled && clean.length >= 3,
    queryFn: ({ signal }) =>
      gateway<{ locations: WeatherLocation[] }>(
        `/api/weather/locations?q=${encodeURIComponent(clean)}`,
        signal
      ),
    staleTime: 3600000,
    gcTime: 3600000,
    retry: false,
  });
}
