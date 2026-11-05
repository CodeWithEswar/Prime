"use client";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWeatherPreferences } from "../weather-provider";
import { useForecast } from "../queries";
import { WeatherIcon } from "./weather-icon";
import { temperature } from "@/lib/weather/format";
import { weatherCondition } from "@/lib/weather/conditions";
import "./weather-header.css";
export function WeatherHeaderIndicator() {
  const { location, unit } = useWeatherPreferences(),
    weather = useForecast(location),
    current = weather.data?.current;
  const description = !location
    ? "Open Weather. Choose a location."
    : current
      ? `${location.name}, ${temperature(current.temperature, unit)}, ${weatherCondition(current.code).label}. Open Weather.`
      : weather.isError
        ? `Weather unavailable for ${location.name}. Open Weather.`
        : `Loading weather for ${location.name}.`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href="/weather" className="weather-header-link" aria-label={description}>
          <WeatherIcon
            code={current?.code ?? null}
            isDay={current?.isDay ?? true}
            size={20}
          />
          <span className="weather-header-city">{location?.name ?? "Weather"}</span>
          {location && !current && !weather.isError ? (
            <span className="weather-header-loading" aria-hidden="true" />
          ) : current ? (
            <strong>{temperature(current.temperature, unit, false)}</strong>
          ) : null}
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        {weather.isError
          ? "Unable to refresh weather. Open Weather to retry."
          : "Open Weather"}
      </TooltipContent>
    </Tooltip>
  );
}
