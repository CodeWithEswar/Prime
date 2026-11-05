// Deterministic provider payload; never used by the application's production gateway.
export function weatherFixture(code = 61, isDay = 1) {
  const start = Date.parse("2026-11-01T18:30:00Z") / 1000;
  return {
    timezone: "Asia/Kolkata",
    utc_offset_seconds: 19800,
    current: {
      time: start + 18 * 3600,
      temperature_2m: 26,
      relative_humidity_2m: 82,
      apparent_temperature: 29,
      precipitation: 0.4,
      weather_code: code,
      cloud_cover: 87,
      pressure_msl: 1007,
      wind_speed_10m: 16,
      wind_direction_10m: 225,
      wind_gusts_10m: 23,
      is_day: isDay,
    },
    hourly: {
      time: Array.from({ length: 168 }, (_, i) => start + i * 3600),
      temperature_2m: Array.from({ length: 168 }, (_, i) => 26 - Math.sin(i / 5) * 3),
      apparent_temperature: Array(168).fill(29),
      precipitation_probability: Array.from({ length: 168 }, (_, i): number =>
        i % 24 >= 18 ? 78 : 22
      ),
      precipitation: Array(168).fill(0.4),
      weather_code: Array(168).fill(code),
      relative_humidity_2m: Array(168).fill(82),
      cloud_cover: Array(168).fill(87),
      wind_speed_10m: Array(168).fill(16),
      wind_gusts_10m: Array(168).fill(23),
      visibility: Array(168).fill(10000),
      dew_point_2m: Array(168).fill(24),
    },
    daily: {
      time: Array.from({ length: 7 }, (_, i) => start + i * 86400),
      weather_code: Array(7).fill(code),
      temperature_2m_max: [33, 31, 32, 34, 31, 30, 29],
      temperature_2m_min: [25, 24, 25, 25, 24, 23, 22],
      sunrise: Array.from(
        { length: 7 },
        (_, i) => start + i * 86400 + 6 * 3600 + 12 * 60
      ),
      sunset: Array.from(
        { length: 7 },
        (_, i) => start + i * 86400 + 17 * 3600 + 47 * 60
      ),
      precipitation_probability_max: Array(7).fill(78),
      precipitation_sum: Array(7).fill(3),
      wind_speed_10m_max: Array(7).fill(20),
      wind_gusts_10m_max: Array(7).fill(30),
    },
  };
}
export const cityFixture = {
  id: "1261529",
  mode: "city" as const,
  name: "Nellore",
  admin1: "Andhra Pradesh",
  country: "India",
  countryCode: "IN",
  latitude: 14.45,
  longitude: 79.99,
  timezone: "Asia/Kolkata",
};
