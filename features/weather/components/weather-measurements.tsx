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
  return (
    <svg
      className="weather-compass"
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Wind from ${windDirection(direction)}`}
    >
      <circle cx="60" cy="60" r="42" fill="none" stroke="#ffffff16" />
      <path d="M60 22v8M60 90v8M22 60h8M90 60h8" stroke="#ffffff55" />
      {[...["N", "E", "S", "W"]].map((n, i) => (
        <text
          key={n}
          x={[60, 109, 60, 11][i]}
          y={[13, 64, 115, 64][i]}
          textAnchor="middle"
          fill="#ffffff80"
          fontSize="10"
        >
          {n}
        </text>
      ))}
      {direction !== null && (
        <g transform={`rotate(${direction} 60 60)`}>
          <path d="M60 32l-5 12h10z" fill="#fff" />
          <path d="M60 42v38" stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
      <circle cx="60" cy="60" r="3" fill="#ff0000" />
    </svg>
  );
}
export function SolarCycle({
  day,
  weather,
}: {
  day: WeatherDay;
  weather: WeatherForecast;
}) {
  const valid = day.sunrise !== null && day.sunset !== null && day.sunset > day.sunrise;
  const sameDay =
    weatherDateKey(day.time, weather.timezone) ===
    weatherDateKey(weather.current.time, weather.timezone);
  const progress =
    valid && sameDay
      ? (weather.current.time - day.sunrise!) / (day.sunset! - day.sunrise!)
      : null;
  const angle =
    progress !== null && progress >= 0 && progress <= 1 ? Math.PI * (1 - progress) : null;
  return (
    <div className="weather-solar">
      <svg viewBox="0 0 240 110" aria-hidden="true">
        <path
          d="M20 95A100 80 0 0 1 220 95"
          fill="none"
          stroke="#ffffff35"
          strokeDasharray="3 5"
        />
        <path d="M15 95h210" stroke="#ffffff16" />
        {angle !== null && (
          <circle
            cx={120 + 100 * Math.cos(angle)}
            cy={95 - 80 * Math.sin(angle)}
            r="5"
            fill="#fff"
          />
        )}
      </svg>
      <dl>
        <div>
          <dt>Sunrise</dt>
          <dd>
            {day.sunrise === null
              ? "Unavailable"
              : weatherTime(day.sunrise, weather.timezone)}
          </dd>
        </div>
        <div>
          <dt>Sunset</dt>
          <dd>
            {day.sunset === null
              ? "Unavailable"
              : weatherTime(day.sunset, weather.timezone)}
          </dd>
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
        <div className="weather-measurement-group">
          <h3>Atmosphere now</h3>
          <dl className="weather-detail-list">
            {[
              ["Humidity", measure(c.humidity, "%")],
              [
                "Visibility",
                hour?.visibility == null
                  ? "—"
                  : measure(hour.visibility / 1000, " km", 1),
              ],
              ["Pressure", measure(c.pressure, " hPa")],
              ["Cloud cover", measure(c.cloudCover, "%")],
              ["Dew point", temperature(hour?.dewPoint ?? null, unit)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="weather-caption">
            Visibility and dew point use the nearest hourly forecast.
          </p>
        </div>
        <div className="weather-measurement-group">
          <h3>Wind now</h3>
          <div className="weather-wind">
            <WindCompass direction={c.windDirection} />
            <dl>
              <div>
                <dt>Speed</dt>
                <dd>{measure(c.windSpeed, " km/h")}</dd>
              </div>
              <div>
                <dt>Gusts</dt>
                <dd>{measure(c.windGust, " km/h")}</dd>
              </div>
              <div>
                <dt>From</dt>
                <dd>{windDirection(c.windDirection)}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="weather-measurement-group">
          <h3>
            {day ? weatherTime(day.time, weather.timezone, { weekday: "long" }) : "Daily"}{" "}
            sun cycle
          </h3>
          {day ? (
            <SolarCycle day={day} weather={weather} />
          ) : (
            <p>Sun times unavailable.</p>
          )}
        </div>
      </div>
    </section>
  );
}
