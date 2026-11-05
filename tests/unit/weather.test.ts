// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import { weatherCondition, resolveWeatherScene } from "@/lib/weather/conditions";
import { normalizeForecast, normalizeLocations } from "@/lib/weather/normalize";
import { forecastInputSchema, locationSearchSchema } from "@/lib/weather/schema";
import {
  temperature,
  measure,
  windDirection,
  weatherTime,
  weatherDateKey,
  upcomingHours,
  weatherSummary,
  hourIsDay,
} from "@/lib/weather/format";
import { requestDeviceLocation } from "@/features/weather/geolocation";
import { forecastOptions, locationOptions } from "@/features/weather/queries";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { weatherFixture, cityFixture } from "../fixtures/weather";
afterEach(() => vi.unstubAllGlobals());
describe("weather meaning and scenes", () => {
  it.each([
    [0, "clear"],
    [1, "mostly-clear"],
    [2, "partly-cloudy"],
    [3, "cloudy"],
    [45, "fog"],
    [48, "fog"],
    [51, "drizzle"],
    [56, "drizzle"],
    [61, "rain"],
    [65, "heavy-rain"],
    [67, "heavy-rain"],
    [75, "snow"],
    [86, "snow"],
    [95, "thunderstorm"],
    [99, "thunderstorm"],
    [999, "unknown"],
  ] as const)("maps WMO %s to %s", (code, kind) =>
    expect(weatherCondition(code).kind).toBe(kind)
  );
  const input = {
    code: 0,
    isDay: true,
    precipitation: 0,
    cloudCover: 0,
    windSpeed: 10,
    windGust: 15,
    feelsLike: 25,
    temperature: 25,
  };
  it("keeps storms, snow, rain and fog ahead of wind", () => {
    expect(resolveWeatherScene({ ...input, code: 95, windSpeed: 70 }).kind).toBe("storm");
    expect(resolveWeatherScene({ ...input, code: 75, windSpeed: 70 }).kind).toBe("snow");
    expect(resolveWeatherScene({ ...input, code: 61, windSpeed: 70 }).kind).toBe("rain");
    expect(resolveWeatherScene({ ...input, code: 45, windGust: 90 }).kind).toBe("fog");
  });
  it("reserves wind for strong winds and cool for measured temperatures", () => {
    expect(resolveWeatherScene({ ...input, windSpeed: 25, windGust: 35 }).kind).toBe(
      "clear"
    );
    expect(resolveWeatherScene({ ...input, windSpeed: 40 }).kind).toBe("wind");
    expect(resolveWeatherScene({ ...input, windGust: 60 }).kind).toBe("wind");
    expect(resolveWeatherScene({ ...input, feelsLike: 8 }).kind).toBe("cool");
    expect(resolveWeatherScene({ ...input, feelsLike: 8, code: 61 }).kind).toBe("rain");
  });
  it("changes media only with semantic scenes, not minor temperature updates", () => {
    expect(resolveWeatherScene({ ...input, temperature: 29.1 }).id).toBe(
      resolveWeatherScene({ ...input, temperature: 29 }).id
    );
    expect(resolveWeatherScene({ ...input, isDay: false }).asset).toBe("clear-night");
    expect(resolveWeatherScene({ ...input, code: 65 }).intensity).toBe("high");
  });
});
describe("provider contract and time zones", () => {
  it("aligns parallel arrays, preserves nulls and does not fabricate missing entries", () => {
    const raw = weatherFixture();
    raw.hourly.temperature_2m = [26];
    const normalized = normalizeForecast(raw, 14.44741, 79.98765, 1234);
    expect(normalized.latitude).toBe(14.45);
    expect(normalized.longitude).toBe(79.99);
    expect(normalized.hourly[0].temperature).toBe(26);
    expect(normalized.hourly[1].temperature).toBeNull();
    expect(normalized.daily).toHaveLength(7);
    expect(normalized.fetchedAt).toBe(1234);
    expect(normalized.current.isDay).toBe(true);
    expect(upcomingHours(normalized)).toHaveLength(24);
  });
  it("rejects invalid provider timezones and malformed values", () => {
    expect(() =>
      normalizeForecast({ ...weatherFixture(), timezone: "not/a-zone" }, 0, 0)
    ).toThrow();
    expect(() =>
      normalizeForecast({ ...weatherFixture(), current: { time: "yesterday" } }, 0, 0)
    ).toThrow();
  });
  it("normalizes real geocoding results without inventing administrative names", () => {
    expect(
      normalizeLocations({
        results: [{ id: 12, name: "Example", latitude: 12.3456, longitude: 23.4567 }],
      })
    ).toEqual([
      {
        id: "12",
        mode: "city",
        name: "Example",
        admin1: "",
        country: "",
        countryCode: "",
        latitude: 12.35,
        longitude: 23.46,
      },
    ]);
    expect(normalizeLocations({})).toEqual([]);
  });
  it("formats in the forecast timezone across date boundaries and DST", () => {
    const time = Date.parse("2026-11-02T00:30:00Z");
    expect(weatherDateKey(time, "America/Los_Angeles")).toBe("2026-11-01");
    expect(weatherDateKey(time, "Asia/Kolkata")).toBe("2026-11-02");
    expect(weatherTime(Date.parse("2026-11-01T05:30:00Z"), "America/New_York")).toBe(
      "1:30 AM"
    );
    expect(weatherTime(Date.parse("2026-11-01T06:30:00Z"), "America/New_York")).toBe(
      "1:30 AM"
    );
  });
  it("uses the correct sunrise and sunset for hours on the following day", () => {
    const w = normalizeForecast(weatherFixture(), 14.45, 79.99),
      day = w.daily[1];
    expect(hourIsDay(day.time + 10 * 3600000, w)).toBe(true);
    expect(hourIsDay(day.time + 2 * 3600000, w)).toBe(false);
  });
  it("provides deterministic supported summaries and safe unit formatting", () => {
    const forecast = normalizeForecast(weatherFixture(), 14.45, 79.99);
    expect(weatherSummary(forecast)).toContain("78%");
    expect(temperature(0, "fahrenheit")).toBe("32°F");
    expect(temperature(null)).toBe("—");
    expect(measure(NaN, " km/h")).toBe("—");
    expect(windDirection(225)).toBe("SW");
    expect(windDirection(360)).toBe("N");
    expect(windDirection(null)).toBe("—");
  });
  it.each([
    { lat: "", lon: "0" },
    { lat: "91", lon: "0" },
    { lat: "0", lon: "181" },
    { lat: "NaN", lon: "0" },
    { lat: "0x23", lon: "0" },
    {},
  ])("rejects bad coordinate input %j", (input) =>
    expect(forecastInputSchema.safeParse(input).success).toBe(false)
  );
  it("accepts bounded coordinates and meaningful place-name queries", () => {
    expect(forecastInputSchema.parse({ lat: "-90", lon: "180" })).toEqual({
      lat: -90,
      lon: 180,
    });
    expect(locationSearchSchema.safeParse("S").success).toBe(false);
    expect(locationSearchSchema.safeParse("<script>").success).toBe(false);
    expect(locationSearchSchema.parse("São Paulo, Brazil")).toBe("São Paulo, Brazil");
  });
});
describe("explicit device permission", () => {
  it("rounds device coordinates immediately and uses a single low-accuracy request", async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) =>
      success({
        coords: { latitude: 14.44785678, longitude: 79.98765432 },
      } as GeolocationPosition)
    );
    const location = await requestDeviceLocation({ getCurrentPosition });
    expect(location).toMatchObject({
      mode: "device",
      name: "Current location",
      latitude: 14.45,
      longitude: 79.99,
    });
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
  it.each([
    [1, "denied"],
    [2, "unavailable"],
    [3, "timed out"],
  ])("offers manual fallback for error %s", async (code, text) => {
    await expect(
      requestDeviceLocation({
        getCurrentPosition: vi.fn((_success, error) =>
          error?.({ code } as GeolocationPositionError)
        ),
      })
    ).rejects.toThrow(text);
  });
  it("handles browsers without geolocation", async () =>
    expect(requestDeviceLocation(undefined)).rejects.toThrow("Search for a city"));
});
describe("shared query caching", () => {
  it("shares normalized cache keys and reuses forecast requests", async () => {
    expect(queryKeys.weather.forecast(14.44781, 79.98781)).toEqual(
      queryKeys.weather.forecast(14.44811, 79.98788)
    );
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify(normalizeForecast(weatherFixture(), 14.45, 79.99)), {
          status: 200,
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new QueryClient();
    await Promise.all([
      client.fetchQuery(forecastOptions(cityFixture)),
      client.fetchQuery(forecastOptions({ ...cityFixture, latitude: 14.451 })),
    ]);
    await client.fetchQuery(forecastOptions(cityFixture));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    client.clear();
  });
  it("separates locations, does not reuse old-city placeholder data, and disables short searches", () => {
    expect(forecastOptions(cityFixture).queryKey).not.toEqual(
      forecastOptions({ ...cityFixture, longitude: 10 }).queryKey
    );
    expect(forecastOptions(null).enabled).toBe(false);
    expect(forecastOptions(cityFixture)).not.toHaveProperty("placeholderData");
    expect(locationOptions("n").enabled).toBe(false);
    expect(locationOptions("Nellore").queryKey).toEqual(
      locationOptions(" nellore ").queryKey
    );
  });
});
