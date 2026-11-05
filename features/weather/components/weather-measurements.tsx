"use client";

import { motion } from "motion/react";
import {
  SunriseIcon,
  SunsetIcon,
  GaugeIcon,
  EyeIcon,
  ThermometerColdIcon,
  Compass01Icon,
  WindIcon,
  WindPower01Icon,
  HumidityIcon,
  CloudIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { usePrimeReducedMotion } from "@/lib/motion";
import {
  measure,
  temperature,
  weatherTime,
  windDirection,
  weatherDateKey,
} from "@/lib/weather/format";
import type { WeatherForecast, WeatherDay, WeatherHour } from "@/lib/weather/types";
import type { TemperatureUnit } from "@/lib/weather/schema";

export function WindCompass({ direction }: { direction: number | null }) {
  const reduced = usePrimeReducedMotion();
  const cardinalDirections = [
    { label: "N", x: 60, y: 15 },
    { label: "E", x: 108, y: 64 },
    { label: "S", x: 60, y: 112 },
    { label: "W", x: 12, y: 64 },
  ];
  const activeDirection =
    direction !== null
      ? direction >= 315 || direction < 45
        ? "N"
        : direction < 135
          ? "E"
          : direction < 225
            ? "S"
            : "W"
      : null;

  return (
    <div className="weather-compass-wrap">
      <svg
        className="weather-compass"
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Wind from ${windDirection(direction)}`}
      >
        <defs>
          <radialGradient id="compass-dial-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.04)" />
            <stop offset="85%" stopColor="rgba(255, 255, 255, 0.01)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.4)" />
          </radialGradient>
          <filter id="needle-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ff0000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Dial Background and Outer Ring */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="url(#compass-dial-bg)"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />
        <circle
          cx="60"
          cy="60"
          r="42"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeDasharray="1 3"
        />

        {/* Dynamic Pulse Wave */}
        {!reduced && direction !== null && (
          <motion.circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="rgba(255, 0, 0, 0.3)"
            strokeWidth="1"
            initial={{ r: 20, opacity: 0.6 }}
            animate={{ r: 48, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeOut" }}
          />
        )}

        {/* Dial ticks (8 primary bearing lines) */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const isCardinal = angle % 90 === 0;
          return (
            <line
              key={angle}
              x1="60"
              y1={isCardinal ? "18" : "21"}
              x2="60"
              y2={isCardinal ? "26" : "25"}
              stroke={isCardinal ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.12)"}
              strokeWidth={isCardinal ? 1.5 : 1}
              transform={`rotate(${angle} 60 60)`}
            />
          );
        })}

        {/* Cardinal Points */}
        {cardinalDirections.map((c) => {
          const isActive = activeDirection === c.label;
          return (
            <text
              key={c.label}
              x={c.x}
              y={c.y}
              textAnchor="middle"
              fill={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.45)"}
              fontWeight={isActive ? "700" : "500"}
              fontSize="9"
              letterSpacing="0.05em"
              style={{
                filter: isActive ? "drop-shadow(0 0 4px rgba(255, 0, 0, 0.7))" : "none",
                transition: "fill 0.2s, filter 0.2s",
              }}
            >
              {c.label}
            </text>
          );
        })}

        {/* Animated Precision Compass Needle */}
        {direction !== null ? (
          <motion.g
            initial={false}
            animate={{ rotate: direction }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 140, damping: 16, mass: 0.8 }
            }
            style={{ transformOrigin: "60px 60px" }}
          >
            {/* North-pointing Pointer Head with Red Accent Tip */}
            <polygon points="60,20 64,52 60,48 56,52" fill="#ff2222" filter="url(#needle-glow)" />
            <polygon points="60,20 60,48 56,52" fill="#ff4444" />

            {/* South-pointing Tail */}
            <polygon points="60,98 63,68 60,72 57,68" fill="rgba(255, 255, 255, 0.3)" />
            <polygon points="60,98 60,72 57,68" fill="rgba(255, 255, 255, 0.45)" />

            {/* Pivot Assembly */}
            <circle
              cx="60"
              cy="60"
              r="6"
              fill="#080808"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />
            <circle cx="60" cy="60" r="3.5" fill="#ff0000" />
            <circle cx="60" cy="60" r="1.2" fill="#ffffff" />
          </motion.g>
        ) : (
          <circle cx="60" cy="60" r="4" fill="rgba(255, 255, 255, 0.3)" />
        )}
      </svg>
    </div>
  );
}

export function SolarCycle({
  day,
  weather,
}: {
  day: WeatherDay;
  weather: WeatherForecast;
}) {
  const reduced = usePrimeReducedMotion();
  const valid = day.sunrise !== null && day.sunset !== null && day.sunset > day.sunrise;
  const sameDay =
    weatherDateKey(day.time, weather.timezone) ===
    weatherDateKey(weather.current.time, weather.timezone);

  const currentTime = weather.current.time;
  const isDaytime =
    valid && sameDay && currentTime >= day.sunrise! && currentTime <= day.sunset!;
  const isPastSunset = valid && sameDay && currentTime > day.sunset!;
  const isBeforeSunrise = valid && sameDay && currentTime < day.sunrise!;

  // 24-hour continuous elliptical celestial coordinates
  const rx = 96;
  const ry = 44;
  const cx = 120;
  const cy = 60;

  // Single Sun position calculation
  let sunX: number | null = null;
  let sunY: number | null = null;

  if (valid && sameDay) {
    if (isDaytime) {
      const dayDuration = day.sunset! - day.sunrise!;
      const pDay = Math.max(0, Math.min(1, (currentTime - day.sunrise!) / dayDuration));
      const theta = Math.PI * (1 - pDay);
      sunX = cx + rx * Math.cos(theta);
      sunY = cy - ry * Math.sin(theta);
    } else {
      const nightDuration = 24 * 3600000 - (day.sunset! - day.sunrise!);
      const elapsedNight = isPastSunset
        ? currentTime - day.sunset!
        : currentTime + 24 * 3600000 - day.sunset!;
      const pNight = Math.max(0, Math.min(1, elapsedNight / nightDuration));
      const theta = Math.PI * pNight;
      sunX = cx + rx * Math.cos(theta);
      sunY = cy + ry * Math.sin(theta);
    }
  }

  // Daylight duration and dynamic status badge
  let daylightStr = "";
  let statusBadge = "";
  if (valid) {
    const totalMs = day.sunset! - day.sunrise!;
    const totalHrs = Math.floor(totalMs / 3600000);
    const totalMins = Math.round((totalMs % 3600000) / 60000);
    daylightStr = `${totalHrs}h ${totalMins}m daylight`;

    if (sameDay) {
      if (isDaytime) {
        const remainingMs = day.sunset! - currentTime;
        const remainingMins = Math.round(remainingMs / 60000);
        if (remainingMins <= 60 && remainingMins > 0) {
          statusBadge = `Golden hour · ${remainingMins}m to sunset`;
        } else {
          const remHrs = Math.floor(remainingMs / 3600000);
          const remMins = Math.round((remainingMs % 3600000) / 60000);
          statusBadge = `${remHrs}h ${remMins}m daylight left`;
        }
      } else if (isPastSunset) {
        const untilSunriseMs = day.sunrise! + 24 * 3600000 - currentTime;
        const untilHrs = Math.floor(untilSunriseMs / 3600000);
        const untilMins = Math.round((untilSunriseMs % 3600000) / 60000);
        statusBadge = `Night · Sunrise in ${untilHrs}h ${untilMins}m`;
      } else if (isBeforeSunrise) {
        const untilMs = day.sunrise! - currentTime;
        const untilHrs = Math.floor(untilMs / 3600000);
        const untilMins = Math.round((untilMs % 3600000) / 60000);
        statusBadge = `Dawn in ${untilHrs}h ${untilMins}m`;
      }
    } else {
      statusBadge = daylightStr;
    }
  }

  return (
    <div className="weather-solar">
      <div className="weather-solar-plot">
        <svg viewBox="0 0 240 120" aria-hidden="true" className="weather-solar-svg">
          <defs>
            {/* Daytime Sun Arc Gradient */}
            <linearGradient id="sun-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff5500" />
              <stop offset="50%" stopColor="#ffb700" />
              <stop offset="100%" stopColor="#ff3300" />
            </linearGradient>

            {/* Daytime Sky Fill */}
            <linearGradient id="sun-sky-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 170, 0, 0.22)" />
              <stop offset="70%" stopColor="rgba(255, 70, 0, 0.05)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>

            {/* Subterranean Night Gradient */}
            <linearGradient id="night-sub-grad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4444" />
              <stop offset="50%" stopColor="#ff6633" />
              <stop offset="100%" stopColor="#ffaa33" />
            </linearGradient>

            {/* Subterranean Fill */}
            <linearGradient id="night-sub-fill" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 68, 68, 0.1)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </linearGradient>

            {/* Corona Glow Filter */}
            <filter id="solar-corona" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Daytime Sky Arc (Upper Hemisphere) */}
          <path
            d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`}
            fill="none"
            stroke={isDaytime ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.08)"}
            strokeDasharray="3 4"
            strokeWidth="1.5"
          />

          {/* 2. Subterranean Nocturnal Arc (Lower Hemisphere) */}
          <path
            d={`M ${cx + rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy}`}
            fill="none"
            stroke={!isDaytime ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.05)"}
            strokeDasharray="2 4"
            strokeWidth="1"
          />

          {/* Horizon Line and Zenith Axes */}
          <line
            x1="12"
            y1={cy}
            x2="228"
            y2={cy}
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="1"
          />
          {/* Sunrise horizon marker (East) */}
          <circle cx={cx - rx} cy={cy} r="2.5" fill="#ffaa33" opacity="0.8" />
          {/* Sunset horizon marker (West) */}
          <circle cx={cx + rx} cy={cy} r="2.5" fill="#ff4444" opacity="0.8" />

          {/* ─── DAYTIME: Single Sun Orb Above Horizon ─── */}
          {isDaytime && sunX !== null && sunY !== null && (
            <>
              {/* Daylight Atmosphere Fill */}
              <path
                d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${sunX} ${sunY} L ${sunX} ${cy} Z`}
                fill="url(#sun-sky-fill)"
              />
              {/* Active Daylight Arc */}
              <path
                d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${sunX} ${sunY}`}
                fill="none"
                stroke="url(#sun-arc-grad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="drop-shadow(0 0 6px rgba(255, 85, 0, 0.7))"
              />
              {/* Vertical Sun Ray */}
              <line
                x1={sunX}
                y1={sunY}
                x2={sunX}
                y2={cy}
                stroke="rgba(255, 170, 0, 0.35)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Horizon Anchor */}
              <circle cx={sunX} cy={cy} r="2.5" fill="#ff7700" opacity="0.8" />

              {/* Radiant Sun Orb */}
              <g>
                {!reduced && (
                  <motion.circle
                    cx={sunX}
                    cy={sunY}
                    r="13"
                    fill="rgba(255, 120, 0, 0.3)"
                    filter="url(#solar-corona)"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.15, 0.4] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  />
                )}
                <circle
                  cx={sunX}
                  cy={sunY}
                  r="6"
                  fill="#ffffff"
                  filter="drop-shadow(0 0 8px #ff7700)"
                />
                <circle cx={sunX} cy={sunY} r="3.5" fill="#ffcc00" />
              </g>
            </>
          )}

          {/* ─── NIGHTTIME: Single Sun Orb Below Horizon ─── */}
          {!isDaytime && sunX !== null && sunY !== null && (
            <>
              {/* Subterranean Atmosphere Fill */}
              <path
                d={`M ${cx + rx} ${cy} A ${rx} ${ry} 0 0 1 ${sunX} ${sunY} L ${sunX} ${cy} Z`}
                fill="url(#night-sub-fill)"
              />
              {/* Active Subterranean Arc from Sunset to Sun */}
              <path
                d={`M ${cx + rx} ${cy} A ${rx} ${ry} 0 0 1 ${sunX} ${sunY}`}
                fill="none"
                stroke="url(#night-sub-grad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="drop-shadow(0 0 6px rgba(255, 68, 68, 0.5))"
              />
              {/* Vertical Ray to Horizon */}
              <line
                x1={sunX}
                y1={sunY}
                x2={sunX}
                y2={cy}
                stroke="rgba(255, 68, 68, 0.3)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Horizon Anchor */}
              <circle cx={sunX} cy={cy} r="2.5" fill="#ff4444" opacity="0.8" />

              {/* Glowing Subterranean Sun Orb */}
              <g>
                {!reduced && (
                  <motion.circle
                    cx={sunX}
                    cy={sunY}
                    r="12"
                    fill="rgba(255, 68, 68, 0.25)"
                    filter="url(#solar-corona)"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.15, 0.35] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  />
                )}
                <circle
                  cx={sunX}
                  cy={sunY}
                  r="5.5"
                  fill="#ff4444"
                  filter="drop-shadow(0 0 8px #ff2222)"
                />
                <circle cx={sunX} cy={sunY} r="2.5" fill="#ffffff" />
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Dynamic Status Pill */}
      {statusBadge && (
        <div className="weather-solar-status-row">
          <span className="weather-solar-status-pill">
            <span className={`weather-status-dot ${isDaytime ? "sun" : "moon"}`} />
            {statusBadge}
          </span>
        </div>
      )}

      {/* Sunrise, Duration Divider, Sunset */}
      <dl className="weather-solar-times">
        <div className="weather-solar-node sunrise">
          <span className="weather-solar-icon">
            <Icon icon={SunriseIcon} size={15} aria-hidden="true" />
          </span>
          <div>
            <dt>Sunrise</dt>
            <dd>
              {day.sunrise === null
                ? "Unavailable"
                : weatherTime(day.sunrise, weather.timezone)}
            </dd>
          </div>
        </div>

        <div className="weather-solar-divider">
          <span className="weather-solar-duration">{daylightStr}</span>
        </div>

        <div className="weather-solar-node sunset">
          <span className="weather-solar-icon">
            <Icon icon={SunsetIcon} size={15} aria-hidden="true" />
          </span>
          <div>
            <dt>Sunset</dt>
            <dd>
              {day.sunset === null
                ? "Unavailable"
                : weatherTime(day.sunset, weather.timezone)}
            </dd>
          </div>
        </div>
      </dl>

      {!valid && (
        <p className="weather-caption">Sun times are unavailable for this day.</p>
      )}
    </div>
  );
}

export function WeatherMeasurements({
  weather,
  hour,
  day,
  unit,
}: {
  weather: WeatherForecast;
  hour: WeatherHour | undefined;
  day: WeatherDay | undefined;
  unit: TemperatureUnit;
}) {
  const c = weather.current;
  const atmosphereItems = [
    {
      label: "Humidity",
      value: measure(c.humidity, "%"),
      icon: HumidityIcon,
      tag:
        c.humidity !== null
          ? c.humidity > 70
            ? "Humid"
            : c.humidity < 30
              ? "Dry"
              : "Optimal"
          : null,
    },
    {
      label: "Visibility",
      value: hour?.visibility == null ? "—" : measure(hour.visibility / 1000, " km", 1),
      icon: EyeIcon,
      tag: hour?.visibility != null ? (hour.visibility >= 10000 ? "Clear" : "Misty") : null,
    },
    {
      label: "Pressure",
      value: measure(c.pressure, " hPa"),
      icon: GaugeIcon,
      tag: c.pressure !== null ? (c.pressure >= 1013 ? "Normal" : "Low") : null,
    },
    {
      label: "Cloud cover",
      value: measure(c.cloudCover, "%"),
      icon: CloudIcon,
      tag:
        c.cloudCover !== null
          ? c.cloudCover > 75
            ? "Heavy"
            : c.cloudCover < 25
              ? "Clear"
              : "Scattered"
          : null,
    },
    {
      label: "Dew point",
      value: temperature(hour?.dewPoint ?? null, unit),
      icon: ThermometerColdIcon,
      tag: null,
    },
  ];

  return (
    <section className="weather-measurements" aria-labelledby="weather-details-title">
      <div className="weather-section-heading">
        <div>
          <span className="weather-eyebrow">A closer look</span>
          <h2 id="weather-details-title">Weather details</h2>
        </div>
        <span className="weather-caption">{weather.timezone}</span>
      </div>

      <div className="weather-measurement-grid">
        {/* Panel 1: Atmosphere */}
        <div className="weather-measurement-group">
          <div className="weather-group-header">
            <span className="weather-group-badge">
              <Icon icon={HumidityIcon} size={15} aria-hidden="true" />
            </span>
            <h3>Atmosphere now</h3>
          </div>
          <dl className="weather-detail-list">
            {atmosphereItems.map((item) => (
              <div key={item.label} className="weather-detail-row">
                <span className="weather-detail-icon">
                  <Icon icon={item.icon} size={14} aria-hidden="true" />
                </span>
                <dt>{item.label}</dt>
                <dd>
                  <span className="weather-metric-num">{item.value}</span>
                  {item.tag && <span className="weather-metric-badge">{item.tag}</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="weather-caption">
            Visibility and dew point use the nearest hourly forecast.
          </p>
        </div>

        {/* Panel 2: Wind */}
        <div className="weather-measurement-group">
          <div className="weather-group-header">
            <span className="weather-group-badge">
              <Icon icon={Compass01Icon} size={15} aria-hidden="true" />
            </span>
            <h3>Wind now</h3>
          </div>
          <div className="weather-wind">
            <WindCompass direction={c.windDirection} />
            <dl className="weather-wind-stats">
              <div className="weather-wind-stat-item">
                <span className="weather-wind-stat-icon">
                  <Icon icon={WindIcon} size={14} aria-hidden="true" />
                </span>
                <div>
                  <dt>Speed</dt>
                  <dd>{measure(c.windSpeed, " km/h")}</dd>
                </div>
              </div>
              <div className="weather-wind-stat-item">
                <span className="weather-wind-stat-icon">
                  <Icon icon={WindPower01Icon} size={14} aria-hidden="true" />
                </span>
                <div>
                  <dt>Gusts</dt>
                  <dd>{measure(c.windGust, " km/h")}</dd>
                </div>
              </div>
              <div className="weather-wind-stat-item">
                <span className="weather-wind-stat-icon">
                  <Icon icon={Compass01Icon} size={14} aria-hidden="true" />
                </span>
                <div>
                  <dt>From</dt>
                  <dd>
                    {windDirection(c.windDirection)}
                    {c.windDirection !== null && (
                      <span className="weather-wind-deg">
                        {" "}
                        · {Math.round(c.windDirection)}°
                      </span>
                    )}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* Panel 3: Sun Cycle */}
        <div className="weather-measurement-group">
          <div className="weather-group-header">
            <span className="weather-group-badge">
              <Icon icon={SunriseIcon} size={15} aria-hidden="true" />
            </span>
            <h3>
              {day
                ? weatherTime(day.time, weather.timezone, { weekday: "long" })
                : "Daily"}{" "}
              sun cycle
            </h3>
          </div>
          {day ? (
            <SolarCycle day={day} weather={weather} />
          ) : (
            <p className="weather-caption">Sun times unavailable.</p>
          )}
        </div>
      </div>
    </section>
  );
}
