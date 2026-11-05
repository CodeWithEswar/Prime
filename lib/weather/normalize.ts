import { providerForecastSchema, geocodingSchema, normalizeCoordinate } from "./schema";
import type { WeatherForecast } from "./types";
export function normalizeForecast(
  raw: unknown,
  latitude: number,
  longitude: number,
  fetchedAt = Date.now()
): WeatherForecast {
  const p = providerForecastSchema.parse(raw),
    c = p.current;
  const pick = (array: (number | null)[] | undefined, i: number) => array?.[i] ?? null;
  const ms = (n: number | null) => (n === null ? null : n * 1000);
  return {
    latitude: normalizeCoordinate(latitude),
    longitude: normalizeCoordinate(longitude),
    timezone: p.timezone,
    fetchedAt,
    current: {
      time: c.time * 1000,
      temperature: c.temperature_2m ?? null,
      feelsLike: c.apparent_temperature ?? null,
      humidity: c.relative_humidity_2m ?? null,
      precipitation: c.precipitation ?? null,
      code: c.weather_code ?? null,
      cloudCover: c.cloud_cover ?? null,
      pressure: c.pressure_msl ?? null,
      windSpeed: c.wind_speed_10m ?? null,
      windGust: c.wind_gusts_10m ?? null,
      windDirection: c.wind_direction_10m ?? null,
      isDay: c.is_day == null ? null : c.is_day === 1,
    },
    hourly: p.hourly.time
      .map((t, i) => ({
        time: t * 1000,
        temperature: pick(p.hourly.temperature_2m, i),
        feelsLike: pick(p.hourly.apparent_temperature, i),
        rainProbability: pick(p.hourly.precipitation_probability, i),
        precipitation: pick(p.hourly.precipitation, i),
        code: pick(p.hourly.weather_code, i),
        humidity: pick(p.hourly.relative_humidity_2m, i),
        cloudCover: pick(p.hourly.cloud_cover, i),
        windSpeed: pick(p.hourly.wind_speed_10m, i),
        windGust: pick(p.hourly.wind_gusts_10m, i),
        visibility: pick(p.hourly.visibility, i),
        dewPoint: pick(p.hourly.dew_point_2m, i),
      }))
      .sort((a, b) => a.time - b.time),
    daily: p.daily.time.map((t, i) => ({
      time: t * 1000,
      code: pick(p.daily.weather_code, i),
      high: pick(p.daily.temperature_2m_max, i),
      low: pick(p.daily.temperature_2m_min, i),
      sunrise: ms(pick(p.daily.sunrise, i)),
      sunset: ms(pick(p.daily.sunset, i)),
      rainProbability: pick(p.daily.precipitation_probability_max, i),
      precipitation: pick(p.daily.precipitation_sum, i),
      windSpeed: pick(p.daily.wind_speed_10m_max, i),
      windGust: pick(p.daily.wind_gusts_10m_max, i),
    })),
  };
}
export function normalizeLocations(raw: unknown) {
  return (geocodingSchema.parse(raw).results ?? []).map((r) => ({
    id: String(r.id),
    mode: "city" as const,
    name: r.name,
    admin1: r.admin1 ?? "",
    country: r.country ?? "",
    countryCode: r.country_code ?? "",
    latitude: normalizeCoordinate(r.latitude),
    longitude: normalizeCoordinate(r.longitude),
    ...(r.timezone ? { timezone: r.timezone } : {}),
  }));
}
