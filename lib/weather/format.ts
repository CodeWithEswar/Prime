import type { WeatherForecast, WeatherHour } from "./types";
import type { TemperatureUnit } from "./schema";
export function temperature(
  value: number | null,
  unit: TemperatureUnit = "celsius",
  suffix = true
) {
  return value === null || !Number.isFinite(value)
    ? "—"
    : `${Math.round(unit === "fahrenheit" ? (value * 9) / 5 + 32 : value)}°${suffix ? (unit === "fahrenheit" ? "F" : "C") : ""}`;
}
export function measure(value: number | null, suffix: string, digits = 0) {
  return value === null || !Number.isFinite(value)
    ? "—"
    : `${new Intl.NumberFormat("en", { maximumFractionDigits: digits }).format(value)}${suffix}`;
}
export function weatherTime(
  time: number,
  timezone: string,
  options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" }
) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: timezone }).format(
    new Date(time)
  );
}
export function weatherDateKey(time: number, timezone: string) {
  const p = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).formatToParts(new Date(time));
  return ["year", "month", "day"]
    .map((k) => p.find((v) => v.type === k)?.value)
    .join("-");
}
export function windDirection(degrees: number | null) {
  return degrees === null
    ? "—"
    : [
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
      ][Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16];
}
export function upcomingHours(weather: WeatherForecast): WeatherHour[] {
  const index = weather.hourly.findIndex((h) => h.time > weather.current.time);
  const start =
    index < 0 ? Math.max(0, weather.hourly.length - 1) : Math.max(0, index - 1);
  return weather.hourly.slice(start, start + 24);
}
export function weatherSummary(weather: WeatherForecast) {
  const hours = upcomingHours(weather).slice(0, 12),
    rain = hours.filter((h) => h.rainProbability !== null);
  if (!rain.length)
    return "Precipitation outlook is not available for the next few hours.";
  const peak = rain.reduce((a, b) =>
    (b.rainProbability ?? 0) > (a.rainProbability ?? 0) ? b : a
  );
  if ((peak.rainProbability ?? 0) < 20)
    return hours.length >= 12
      ? "Low precipitation chances over the next 12 hours."
      : "Low precipitation chances in the available hourly forecast.";
  return `Precipitation chances reach ${Math.round(peak.rainProbability!)}% around ${weatherTime(peak.time, weather.timezone)}.`;
}
export function hourIsDay(time: number, weather: WeatherForecast) {
  const date = weatherDateKey(time, weather.timezone),
    day = weather.daily.find((d) => weatherDateKey(d.time, weather.timezone) === date);
  return day?.sunrise != null && day.sunset != null
    ? time >= day.sunrise && time < day.sunset
    : (weather.current.isDay ?? true);
}
