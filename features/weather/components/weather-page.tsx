"use client";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Location01Icon,
  Navigation03Icon,
  Search01Icon,
  DropletIcon,
  HumidityIcon,
  WindPower01Icon,
  RefreshIcon,
  LoaderIcon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useWeatherPreferences } from "../weather-provider";
import { useForecast } from "../queries";
import { weatherCondition, resolveWeatherScene } from "@/lib/weather/conditions";
import {
  temperature,
  measure,
  weatherTime,
  weatherDateKey,
  upcomingHours,
  weatherSummary,
  hourIsDay,
} from "@/lib/weather/format";
import type { WeatherForecast } from "@/lib/weather/types";
import type { WeatherLocation } from "@/lib/weather/schema";
import { WeatherAtmosphere } from "./weather-atmosphere";
import { WeatherIcon } from "./weather-icon";
import { LocationSelector } from "./location-selector";
import { WeatherMeasurements } from "./weather-measurements";
import "./weather.css";
const Charts = dynamic(() => import("./weather-charts").then((m) => m.WeatherCharts), {
  ssr: false,
  loading: () => (
    <div className="weather-chart-loading" role="status">
      Preparing the forecast charts…
    </div>
  ),
});
function WeatherDashboard({
  weather,
  location,
  onChange,
}: {
  weather: WeatherForecast;
  location: WeatherLocation;
  onChange: (trigger: HTMLElement) => void;
}) {
  const { unit, setUnit } = useWeatherPreferences(),
    c = weather.current,
    hours = upcomingHours(weather);
  const [selectedHour, setSelectedHour] = useState<number | null>(null),
    [selectedDay, setSelectedDay] = useState<number | null>(null);
  const activeHour = hours.find((h) => h.time === selectedHour) ?? hours[0],
    day = weather.daily.find((d) => d.time === selectedDay) ?? weather.daily[0];
  const today = weather.daily.find(
    (d) =>
      weatherDateKey(d.time, weather.timezone) ===
      weatherDateKey(c.time, weather.timezone)
  );
  const limits = weather.daily.flatMap((d) =>
      d.low !== null && d.high !== null ? [d.low, d.high] : []
    ),
    min = limits.length ? Math.min(...limits) : 0,
    max = limits.length ? Math.max(...limits) : 0;
  return (
    <>
      <WeatherAtmosphere scene={resolveWeatherScene(c)} />
      <div className="weather-content">
        <section className="weather-hero" aria-labelledby="weather-location-title">
          <div className="weather-hero-top">
            <div>
              <span className="weather-eyebrow">
                <i />
                Weather intelligence
              </span>
              <h1 id="weather-location-title">{location.name}</h1>
              <p className="weather-region">
                {[location.admin1, location.country].filter(Boolean).join(", ") ||
                  (location.mode === "device"
                    ? "Current device location · approximate weather grid"
                    : "")}
                {location.mode === "device" && location.name !== "Current location" && (
                  <span className="weather-device-label">Current location</span>
                )}
              </p>
            </div>
            <div className="weather-hero-controls">
              <div
                role="group"
                aria-label="Temperature unit"
                className="weather-unit-switch"
              >
                <button
                  aria-pressed={unit === "celsius"}
                  onClick={() => setUnit("celsius")}
                  aria-label="Use Celsius"
                >
                  °C
                </button>
                <button
                  aria-pressed={unit === "fahrenheit"}
                  onClick={() => setUnit("fahrenheit")}
                  aria-label="Use Fahrenheit"
                >
                  °F
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => onChange(event.currentTarget)}
              >
                <Icon icon={Location01Icon} size={15} aria-hidden="true" />
                Change location
              </Button>
            </div>
          </div>
          <div className="weather-current-grid">
            <div>
              <div className="weather-current-main">
                <WeatherIcon code={c.code} isDay={c.isDay ?? true} size={82} />
                <div>
                  <p className="weather-temperature">
                    {temperature(c.temperature, unit, false)}
                    <span>{unit === "celsius" ? "C" : "F"}</span>
                  </p>
                  <h2>{weatherCondition(c.code).label}</h2>
                  <p>Feels like {temperature(c.feelsLike, unit)}</p>
                  {today && (
                    <p className="weather-high-low">
                      H: {temperature(today.high, unit, false)}
                      <i />
                      L: {temperature(today.low, unit, false)}
                    </p>
                  )}
                </div>
              </div>
              <dl className="weather-hero-metrics">
                {[
                  {
                    label: "Precipitation",
                    value: measure(hours[0]?.rainProbability ?? null, "%"),
                    icon: DropletIcon,
                  },
                  {
                    label: "Humidity",
                    value: measure(c.humidity, "%"),
                    icon: HumidityIcon,
                  },
                  {
                    label: "Wind",
                    value: measure(c.windSpeed, " km/h"),
                    icon: WindPower01Icon,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <Icon icon={item.icon} size={22} aria-hidden="true" />
                    <div>
                      <dd>{item.value}</dd>
                      <dt>{item.label}</dt>
                    </div>
                  </div>
                ))}
              </dl>
              <p className="weather-updated">
                Conditions as of{" "}
                <time dateTime={new Date(c.time).toISOString()}>
                  {weatherTime(c.time, weather.timezone)}
                </time>{" "}
                · {weather.timezone}
              </p>
            </div>
            <aside className="weather-outlook">
              <span className="weather-eyebrow">The next few hours</span>
              <h2>Today’s outlook</h2>
              <p>{weatherSummary(weather)}</p>
              <small>Updated {weatherTime(weather.fetchedAt, weather.timezone)}</small>
            </aside>
          </div>
        </section>
        <section
          className="weather-hourly weather-panel"
          aria-labelledby="weather-hourly-title"
        >
          <div className="weather-section-heading">
            <div>
              <span className="weather-eyebrow">Hour by hour</span>
              <h2 id="weather-hourly-title">Next 24 hours</h2>
            </div>
            <span className="weather-caption">Local forecast time</span>
          </div>
          {hours.length ? (
            <>
              <div
                className="weather-hourly-rail"
                data-hourly-rail
                role="group"
                aria-label="Hourly forecast"
              >
                {hours.map((h, i) => (
                  <button
                    key={h.time}
                    aria-label={`${weatherTime(h.time, weather.timezone)}, ${temperature(h.temperature, unit)}, precipitation ${measure(h.rainProbability, "%")}`}
                    aria-pressed={activeHour?.time === h.time}
                    tabIndex={activeHour?.time === h.time ? 0 : -1}
                    onClick={() => setSelectedHour(h.time)}
                    onKeyDown={(e) => {
                      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                        e.preventDefault();
                        const next =
                          e.key === "Home"
                            ? 0
                            : e.key === "End"
                              ? hours.length - 1
                              : (i + (e.key === "ArrowRight" ? 1 : -1) + hours.length) %
                                hours.length;
                        setSelectedHour(hours[next].time);
                        e.currentTarget
                          .closest("[data-hourly-rail]")
                          ?.querySelectorAll<HTMLButtonElement>("button")
                          [next]?.focus();
                      }
                    }}
                  >
                    <span>
                      {i === 0
                        ? "Now"
                        : weatherTime(h.time, weather.timezone, { hour: "numeric" })}
                    </span>
                    <strong>{temperature(h.temperature, unit, false)}</strong>
                    <WeatherIcon
                      code={h.code}
                      isDay={hourIsDay(h.time, weather)}
                      size={25}
                    />
                    <small>{measure(h.rainProbability, "%")}</small>
                  </button>
                ))}
              </div>
              {activeHour && (
                <p className="weather-hour-selection" role="status">
                  {weatherTime(activeHour.time, weather.timezone)} · Feels{" "}
                  {temperature(activeHour.feelsLike, unit)} · Wind{" "}
                  {measure(activeHour.windSpeed, " km/h")}
                </p>
              )}
            </>
          ) : (
            <p className="weather-message">Hourly forecast is unavailable.</p>
          )}
        </section>
        {hours.length > 1 && (
          <Charts
            hours={hours}
            timezone={weather.timezone}
            unit={unit}
            selected={activeHour?.time ?? 0}
            onSelect={setSelectedHour}
          />
        )}
        <section
          className="weather-daily weather-panel"
          aria-labelledby="weather-daily-title"
        >
          <div className="weather-section-heading">
            <div>
              <span className="weather-eyebrow">The week ahead</span>
              <h2 id="weather-daily-title">7-day forecast</h2>
            </div>
            <span className="weather-caption">Low / high</span>
          </div>
          <div className="weather-daily-list">
            {weather.daily.map((d) => (
              <button
                key={d.time}
                aria-pressed={day?.time === d.time}
                onClick={() => setSelectedDay(d.time)}
              >
                <span className="weather-day-label">
                  <strong>
                    {weatherDateKey(d.time, weather.timezone) ===
                    weatherDateKey(c.time, weather.timezone)
                      ? "Today"
                      : weatherTime(d.time, weather.timezone, { weekday: "short" })}
                  </strong>
                  <small>
                    {weatherTime(d.time, weather.timezone, {
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                </span>
                <WeatherIcon code={d.code} />
                <span className="weather-day-condition">
                  {weatherCondition(d.code).label}
                </span>
                <small className="weather-day-rain">
                  {measure(d.rainProbability, "%")}
                </small>
                <span className="weather-day-low">{temperature(d.low, unit, false)}</span>
                <span className="weather-range-track" aria-hidden="true">
                  {d.low !== null && d.high !== null && (
                    <i
                      style={{
                        left: `${max > min ? ((d.low - min) / (max - min)) * 100 : 0}%`,
                        width: `${max > min ? Math.max(2, ((d.high - d.low) / (max - min)) * 100) : 100}%`,
                      }}
                    />
                  )}
                </span>
                <strong className="weather-day-high">
                  {temperature(d.high, unit, false)}
                </strong>
              </button>
            ))}
          </div>
          {!weather.daily.length && (
            <p className="weather-message">Daily forecast is unavailable.</p>
          )}
          {day && (
            <p className="weather-selected-day" role="status">
              <strong>
                {weatherTime(day.time, weather.timezone, { weekday: "long" })}
              </strong>{" "}
              · {weatherCondition(day.code).label} · Precipitation{" "}
              {measure(day.rainProbability, "%")} · Total{" "}
              {measure(day.precipitation, " mm", 1)} · Max wind{" "}
              {measure(day.windSpeed, " km/h")}
            </p>
          )}
        </section>
        <WeatherMeasurements weather={weather} hour={hours[0]} day={day} unit={unit} />
        <footer className="weather-attribution">
          <a
            className="weather-attribution-link"
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Weather data by Open-Meteo"
            title="Weather data by Open-Meteo"
          >
            <Icon icon={Globe02Icon} size={14} aria-hidden="true" />
            <span className="sr-only">Weather data by Open-Meteo</span>
          </a>
          {location.mode === "device" && (
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              Place names © OpenStreetMap contributors
            </a>
          )}
          <span>Forecasts are estimates. All times in {weather.timezone}.</span>
        </footer>
      </div>
    </>
  );
}
export function WeatherPage() {
  const { location, locateDevice, locating } = useWeatherPreferences(),
    query = useForecast(location),
    [selectorOpen, setSelectorOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null),
    root = useRef<HTMLDivElement>(null);
  function openSelector(trigger: HTMLElement) {
    opener.current = trigger;
    setSelectorOpen(true);
  }
  async function locate(trigger: HTMLElement) {
    opener.current = trigger;
    if (!(await locateDevice())) setSelectorOpen(true);
  }
  return (
    <div className="weather-page" ref={root} tabIndex={-1}>
      {!location ? (
        <div className="weather-welcome">
          <div className="weather-welcome-badge">
            <WeatherIcon code={2} size={36} />
          </div>
          <span className="weather-eyebrow">
            <i />
            Weather intelligence
          </span>
          <h1>
            Your forecast.
            <br />
            Your surroundings.
          </h1>
          <p>
            Current conditions, the hours ahead, and a clear view of the week. Choose a
            location to begin.
          </p>
          <div className="weather-welcome-actions">
            <Button
              onClick={(event) => void locate(event.currentTarget)}
              disabled={locating}
              aria-label={locating ? "Finding your location…" : "Use current location"}
            >
              <Icon
                icon={locating ? LoaderIcon : Navigation03Icon}
                size={16}
                aria-hidden="true"
                className={locating ? "animate-spin text-white" : ""}
              />
              <span>{locating ? "Locating…" : "My location"}</span>
            </Button>
            <Button
              variant="secondary"
              onClick={(event) => openSelector(event.currentTarget)}
            >
              <Icon icon={Search01Icon} size={16} aria-hidden="true" />
              <span>Search city</span>
            </Button>
          </div>
          <small className="weather-welcome-note">
            Location access is optional. Device coordinates are never saved.
          </small>
          <a
            className="weather-attribution-link"
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Weather data by Open-Meteo"
            title="Weather data by Open-Meteo"
          >
            <Icon icon={Globe02Icon} size={15} aria-hidden="true" />
            <span className="sr-only">Weather data by Open-Meteo</span>
          </a>
        </div>
      ) : query.data ? (
        <>
          <WeatherDashboard
            key={`${query.data.latitude}:${query.data.longitude}`}
            weather={query.data}
            location={location}
            onChange={openSelector}
          />
          {query.isError && (
            <div className="weather-refresh-notice" role="status">
              Unable to refresh weather. Showing the last update.
              <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
                Retry
              </Button>
            </div>
          )}
        </>
      ) : query.isError ? (
        <div className="weather-welcome">
          <span className="weather-eyebrow">Weather</span>
          <h1>{location.name}</h1>
          <p>Unable to refresh weather. Your selected location is still saved.</p>
          <div className="weather-welcome-actions">
            <Button
              onClick={() => void query.refetch()}
            >
              <Icon icon={RefreshIcon} size={16} aria-hidden="true" />
              <span>Retry</span>
            </Button>
            <Button
              variant="secondary"
              onClick={(event) => openSelector(event.currentTarget)}
            >
              <span>Change location</span>
            </Button>
          </div>
        </div>
      ) : (
        <WeatherLoading location={location.name} />
      )}
      <LocationSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          (opener.current?.isConnected ? opener.current : root.current)?.focus({
            preventScroll: true,
          });
        }}
      />
    </div>
  );
}
export function WeatherLoading({
  location = "Loading your forecast",
}: {
  location?: string;
}) {
  return (
    <div className="weather-loading" role="status" aria-busy="true">
      <span className="weather-eyebrow">Weather intelligence</span>
      <h1>{location}</h1>
      <div className="weather-loading-temperature" />
      <div className="weather-loading-line" />
      <div className="weather-loading-rail">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} />
        ))}
      </div>
      <span className="sr-only">Loading current conditions and forecast.</span>
    </div>
  );
}
