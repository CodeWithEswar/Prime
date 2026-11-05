import { test as base, expect } from "@playwright/test";
import { cityFixture, weatherFixture } from "../../fixtures/weather";
import { normalizeForecast } from "../../../lib/weather/normalize";
export const test = base.extend({
  page: async ({ page, context }, runTest) => {
    const expiry = Math.floor(Date.now() / 1000) + 3600,
      encode = (value: object) =>
        Buffer.from(JSON.stringify(value)).toString("base64url"),
      user = {
        id: "11111111-1111-4111-8111-111111111111",
        email: "alex@example.test",
        aud: "authenticated",
        role: "authenticated",
        app_metadata: { provider: "email" },
        user_metadata: { full_name: "Alex Morgan" },
      };
    const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: expiry, iat: expiry - 3600, aud: user.aud, role: user.role, email: user.email })}.dGVzdC1vbmx5`;
    await context.addCookies([
      {
        name: "sb-127-auth-token",
        value:
          "base64-" +
          encode({
            access_token: token,
            refresh_token: "test-only-refresh",
            expires_at: expiry,
            expires_in: 3600,
            token_type: "bearer",
            user,
          }),
        domain: "127.0.0.1",
        path: "/",
        sameSite: "Lax",
      },
    ]);
    await page.addInitScript(() =>
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          const style = document.createElement("style");
          style.textContent =
            "nextjs-portal,.tsqd-parent-container{display:none!important}";
          document.head.append(style);
        },
        { once: true }
      )
    );
    await page.route("**/api/weather/locations?**", (route) => {
      const query = new URL(route.request().url()).searchParams.get("q") ?? "";
      return route.fulfill({
        json: {
          locations: query.toLowerCase().includes("lon")
            ? [
                {
                  ...cityFixture,
                  id: "2643743",
                  name: "London",
                  admin1: "England",
                  country: "United Kingdom",
                  countryCode: "GB",
                  latitude: 51.51,
                  longitude: -0.13,
                  timezone: "Europe/London",
                },
              ]
            : [cityFixture],
        },
      });
    });
    await page.route("**/api/weather/location-name?**", (route) =>
      route.fulfill({
        json: {
          place: {
            name: "Nellore",
            admin1: "Andhra Pradesh",
            country: "India",
            countryCode: "IN",
          },
        },
      })
    );
    await page.route("**/api/weather?**", (route) => {
      const url = new URL(route.request().url()),
        lat = Number(url.searchParams.get("lat")),
        lon = Number(url.searchParams.get("lon")),
        raw = weatherFixture(lat > 40 ? 0 : 61, 1);
      if (lat > 40) {
        raw.timezone = "Europe/London";
        raw.current.temperature_2m = 13;
        raw.current.apparent_temperature = 13;
        raw.current.precipitation = 0;
        raw.current.cloud_cover = 0;
        raw.hourly.precipitation_probability.fill(0);
        raw.daily.precipitation_probability_max.fill(0);
      }
      return route.fulfill({ json: normalizeForecast(raw, lat, lon) });
    });
    await runTest(page);
  },
});
export { expect, cityFixture };
