// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { weatherFixture } from "../fixtures/weather";
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), cacheLife: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: mocks.cacheLife }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
}));
import { GET as forecast } from "@/app/api/weather/route";
import { GET as locations } from "@/app/api/weather/locations/route";
import { GET as locationName } from "@/app/api/weather/location-name/route";
import { normalizeDevicePlace } from "@/lib/weather/reverse";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: crypto.randomUUID() } } });
  vi.stubEnv("OPEN_METEO_API_KEY", "");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("authenticated weather gateway", () => {
  it("resolves an area name from coarse coordinates without returning address geometry", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            features: [
              {
                properties: {
                  name: "A street",
                  city: "Nellore",
                  state: "Andhra Pradesh",
                  country: "India",
                  countrycode: "in",
                },
                geometry: { coordinates: [79.987654321, 14.44785678] },
              },
            ],
          })
        )
      );
    vi.stubGlobal("fetch", fetch);
    const response = await locationName(
      new NextRequest(
        "http://localhost/api/weather/location-name?lat=14.44785678&lon=79.987654321"
      )
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      place: {
        name: "Nellore",
        admin1: "Andhra Pradesh",
        country: "India",
        countryCode: "IN",
      },
    });
    const url = fetch.mock.calls[0][0] as URL;
    expect(url.hostname).toBe("photon.komoot.io");
    expect(url.searchParams.get("lat")).toBe("14.45");
    expect(url.searchParams.get("lon")).toBe("79.99");
    expect(url.searchParams.getAll("layer")).toEqual(["city", "locality"]);
  });
  it("does not substitute a road or business name for a city", () => {
    expect(
      normalizeDevicePlace({
        features: [{ properties: { name: "A shop", osm_key: "shop" } }],
      })
    ).toBeNull();
    expect(normalizeDevicePlace({ features: [] })).toBeNull();
  });
  it("keeps reverse-lookup failures independent of weather", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const response = await locationName(
      new NextRequest("http://localhost/api/weather/location-name?lat=14.45&lon=79.99")
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ place: null });
  });
  it("rejects anonymous calls without reaching the provider", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(
      (await forecast(new NextRequest("http://localhost/api/weather?lat=0&lon=0"))).status
    ).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("validates coordinates before fetching", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(
      (await forecast(new NextRequest("http://localhost/api/weather?lat=999&lon=0")))
        .status
    ).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("requests verified variables, normalized coordinates, UTC epochs and seven days", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async () => new Response(JSON.stringify(weatherFixture())));
    vi.stubGlobal("fetch", fetch);
    const response = await forecast(
      new NextRequest("http://localhost/api/weather?lat=14.44781&lon=79.98781")
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const url = fetch.mock.calls[0]?.[0] as unknown as URL;
    expect(url.hostname).toBe("api.open-meteo.com");
    expect(url.searchParams.get("latitude")).toBe("14.45");
    expect(url.searchParams.get("timezone")).toBe("auto");
    expect(url.searchParams.get("timeformat")).toBe("unixtime");
    expect(url.searchParams.get("forecast_days")).toBe("7");
    expect(url.searchParams.get("hourly")).toContain("dew_point_2m");
    expect(url.searchParams.get("daily")).toContain("precipitation_probability_max");
    expect(mocks.cacheLife).toHaveBeenCalledWith({
      stale: 600,
      revalidate: 600,
      expire: 1200,
    });
    const data = await response.json();
    expect(data.hourly).toHaveLength(168);
    expect(data).not.toHaveProperty("hourly_units");
  });
  it("returns a controlled provider error without leaking coordinates or provider messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("sensitive upstream text", { status: 500 }))
    );
    const response = await forecast(
      new NextRequest("http://localhost/api/weather?lat=14.44781&lon=79.98781")
    );
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).not.toContain("14.44");
    expect(text).not.toContain("sensitive");
  });
  it("handles malformed provider arrays", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              timezone: "UTC",
              current: { time: 1 },
              hourly: { time: "bad" },
              daily: { time: [] },
            })
          )
      )
    );
    expect(
      (await forecast(new NextRequest("http://localhost/api/weather?lat=0&lon=0"))).status
    ).toBe(503);
  });
  it("normalizes actual geocoding results and handles empty search", async () => {
    const fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            results: [
              {
                id: 5,
                name: "Nellore",
                latitude: 14.4478,
                longitude: 79.9876,
                admin1: "Andhra Pradesh",
                country: "India",
                country_code: "IN",
                timezone: "Asia/Kolkata",
              },
            ],
          })
        )
    );
    vi.stubGlobal("fetch", fetch);
    const response = await locations(
      new NextRequest("http://localhost/api/weather/locations?q=Nellore")
    );
    expect(response.status).toBe(200);
    expect((await response.json()).locations[0]).toMatchObject({
      name: "Nellore",
      latitude: 14.45,
      mode: "city",
    });
    expect(
      (await locations(new NextRequest("http://localhost/api/weather/locations?q=N")))
        .status
    ).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
