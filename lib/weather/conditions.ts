export type WeatherCondition =
  | "clear"
  | "mostly-clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "heavy-rain"
  | "snow"
  | "thunderstorm"
  | "unknown";
export function weatherCondition(code: number | null): {
  kind: WeatherCondition;
  label: string;
} {
  if (code === 0) return { kind: "clear", label: "Clear" };
  if (code === 1) return { kind: "mostly-clear", label: "Mainly clear" };
  if (code === 2) return { kind: "partly-cloudy", label: "Partly cloudy" };
  if (code === 3) return { kind: "cloudy", label: "Overcast" };
  if (code === 45 || code === 48)
    return { kind: "fog", label: code === 48 ? "Depositing rime fog" : "Fog" };
  if ([51, 53, 55, 56, 57].includes(code ?? -1))
    return {
      kind: "drizzle",
      label: [56, 57].includes(code!) ? "Freezing drizzle" : "Drizzle",
    };
  if ([65, 67, 82].includes(code ?? -1))
    return {
      kind: "heavy-rain",
      label: code === 67 ? "Heavy freezing rain" : "Heavy rain",
    };
  if ([61, 63, 66, 80, 81].includes(code ?? -1))
    return {
      kind: "rain",
      label: code === 66 ? "Freezing rain" : code === 61 ? "Light rain" : "Rain",
    };
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1))
    return { kind: "snow", label: "Snow" };
  if ([95, 96, 99].includes(code ?? -1))
    return {
      kind: "thunderstorm",
      label: code === 95 ? "Thunderstorm" : "Thunderstorm with hail",
    };
  return { kind: "unknown", label: "Conditions unavailable" };
}
export interface WeatherScene {
  id: string;
  kind: "clear" | "cloudy" | "rain" | "storm" | "fog" | "wind" | "snow" | "cool";
  asset: string;
  isDay: boolean;
  intensity: "low" | "high";
}
/** Wind scene threshold: sustained >=40 km/h or gusts >=60 km/h; ordinary breezes stay in their observed condition. */
export function resolveWeatherScene(c: {
  code: number | null;
  isDay: boolean | null;
  precipitation: number | null;
  cloudCover: number | null;
  windSpeed: number | null;
  windGust: number | null;
  feelsLike: number | null;
  temperature: number | null;
}): WeatherScene {
  const condition = weatherCondition(c.code).kind,
    day = c.isDay !== false,
    period = day ? "day" : "night";
  const kind =
    condition === "thunderstorm"
      ? "storm"
      : condition === "snow"
        ? "snow"
        : ["rain", "heavy-rain", "drizzle"].includes(condition) ||
            (c.precipitation ?? 0) > 0
          ? "rain"
          : condition === "fog"
            ? "fog"
            : (c.windSpeed ?? 0) >= 40 || (c.windGust ?? 0) >= 60
              ? "wind"
              : ["cloudy", "partly-cloudy", "unknown"].includes(condition) ||
                  (c.cloudCover ?? 0) >= 65
                ? "cloudy"
                : (c.feelsLike ?? c.temperature ?? 100) <= 12
                  ? "cool"
                  : "clear";
  const intensity =
    condition === "heavy-rain" || kind === "storm" || (c.precipitation ?? 0) >= 7.6
      ? "high"
      : "low";
  const asset =
    kind === "rain" && intensity === "high"
      ? "storm"
      : ["clear", "cloudy", "rain"].includes(kind)
        ? `${kind}-${period}`
        : kind === "cool"
          ? `clear-${period}`
          : kind;
  return {
    id: `${kind}-${period}-${intensity}`,
    kind,
    asset,
    isDay: day,
    intensity,
  };
}
