import { test, expect, cityFixture } from "./support/weather-session";
import path from "node:path";
async function captureWeather(page: import("@playwright/test").Page, name: string) {
  if (process.env.PRIME_WEATHER_SCREENSHOTS && test.info().project.name === "chromium") {
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.screenshot({
      path: path.join(process.env.PRIME_WEATHER_SCREENSHOTS, `prime-weather-${name}.png`),
      fullPage: true,
    });
  }
}
async function savedCity(page: import("@playwright/test").Page) {
  await page.addInitScript(
    (city) =>
      localStorage.setItem(
        "prime:weather:v1:11111111-1111-4111-8111-111111111111",
        JSON.stringify({ unit: "celsius", location: city })
      ),
    cityFixture
  );
}
async function noOverflow(page: import("@playwright/test").Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
}
test("header opens weather and changing city updates the forecast and scene", async ({
  page,
}) => {
  await savedCity(page);
  await page.goto("/practice/dsa");
  const header = page.locator("header").getByRole("link", { name: /Nellore, 26°C/ });
  await expect(header).toBeVisible();
  await header.click();
  await expect(page).toHaveURL(/\/weather$/, { timeout: 45000 });
  await expect(page.getByRole("heading", { name: "Nellore", exact: true })).toBeVisible();
  await expect(page.locator(".weather-atmosphere")).toHaveAttribute("data-scene", "rain");
  await expect(page.locator(".weather-hourly-rail button")).toHaveCount(24);
  await expect(page.locator(".weather-daily-list button")).toHaveCount(7);
  await expect(
    page.getByRole("link", { name: "Weather data by Open-Meteo" })
  ).toBeVisible();
  await captureWeather(page, "desktop");
  await page.getByRole("button", { name: "Change location" }).click();
  const input = page.getByRole("combobox");
  await input.fill("London");
  await expect(page.getByRole("option", { name: /London/ })).toBeVisible();
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: "London", exact: true })).toBeVisible();
  await expect(page.locator(".weather-atmosphere")).toHaveAttribute(
    "data-scene",
    "clear"
  );
  await expect(page.locator(".weather-temperature")).toContainText("13°");
  await expect(page.locator(".weather-charts .prime-chart")).toHaveCount(1);
});
test("geolocation is explicit and denied permission leaves manual search available", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback
        ) => {
          (window as unknown as { geoCalls: number }).geoCalls =
            ((window as unknown as { geoCalls: number }).geoCalls ?? 0) + 1;
          error({ code: 1 } as GeolocationPositionError);
        },
      },
    });
  });
  await page.goto("/weather");
  await expect(page.getByRole("heading", { name: /Your forecast/ })).toBeVisible();
  expect(
    await page.evaluate(() => (window as unknown as { geoCalls?: number }).geoCalls ?? 0)
  ).toBe(0);
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByRole("alert")).toContainText("permission was denied");
  const input = page.getByRole("combobox");
  await input.fill("Nellore");
  await page.getByRole("option", { name: /Nellore/ }).click();
  await expect(page.getByRole("heading", { name: "Nellore", exact: true })).toBeVisible();
});
test("device location resolves its city and keeps the two header controls equal", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 14.44785678, longitude: 79.98765432 });
  await page.goto("/weather");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByRole("heading", { name: "Nellore", exact: true })).toBeVisible();
  await expect(page.locator(".weather-region")).toContainText("Andhra Pradesh, India");
  await expect(page.locator(".weather-device-label")).toHaveText("Current location");
  const sizes = await page
    .locator(".weather-hero-controls")
    .evaluate((el) => [
      el.querySelector(".weather-unit-switch")!.getBoundingClientRect().height,
      el
        .querySelector("button:last-child")!
        .closest(".weather-hero-controls")!
        .querySelector(":scope > button")!
        .getBoundingClientRect().height,
    ]);
  expect(sizes[0]).toBe(sizes[1]);
  expect(
    JSON.parse(
      (await page.evaluate(() =>
        localStorage.getItem("prime:weather:v1:11111111-1111-4111-8111-111111111111")
      )) ?? "{}"
    ).location
  ).toBeNull();
});
test("units reuse cached data and forecast controls support keyboard navigation", async ({
  page,
}) => {
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/weather?")) requests++;
  });
  await savedCity(page);
  await page.goto("/weather");
  await expect(page.locator(".weather-temperature")).toContainText("26°");
  const before = requests;
  await page.getByRole("button", { name: "Use Fahrenheit" }).click();
  await expect(page.locator(".weather-temperature")).toContainText("79°");
  expect(requests).toBe(before);
  const first = page.locator(".weather-hourly-rail button").first();
  await first.focus();
  await first.press("ArrowRight");
  await expect(page.locator(".weather-hourly-rail button").nth(1)).toBeFocused();
  await expect(page.locator(".weather-hourly-rail button").nth(1)).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await page.locator(".weather-daily-list button").nth(2).click();
  await expect(page.locator(".weather-daily-list button").nth(2)).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});
test("weather remains readable at required widths with static reduced-motion media", async ({
  page,
}) => {
  await savedCity(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/weather");
  await expect(page.getByRole("heading", { name: "Nellore", exact: true })).toBeVisible();
  for (const width of [
    320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1366, 1440, 1600, 1920,
  ]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await noOverflow(page);
    if (width === 390) await captureWeather(page, "mobile");
    if (width === 1440) await captureWeather(page, "static-desktop");
  }
  await expect(page.locator(".weather-atmosphere video")).toHaveCount(0);
  await page.setViewportSize({ width: 1366, height: 650 });
  await noOverflow(page);
  await page.setViewportSize({ width: 683, height: 384 });
  await noOverflow(page);
});
test("forecast failure keeps the selected place and offers retry", async ({ page }) => {
  await savedCity(page);
  await page.route("**/api/weather?**", (route) =>
    route.fulfill({ status: 503, json: { error: "Provider unavailable" } })
  );
  await page.goto("/weather");
  await expect(page.getByRole("heading", { name: "Nellore", exact: true })).toBeVisible();
  await expect(
    page.getByText("Unable to refresh weather. Your selected location is still saved.")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
});
