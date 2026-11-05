import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
export default defineConfig({
  outputDir: "../.generated/weather/test-results",
  testDir: "../tests/e2e",
  testMatch: "weather.spec.ts",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3104", trace: "retain-on-failure" },
  webServer: [
    {
      command: "node tests/e2e/support/shell-backend.mjs",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:54341/health",
      reuseExistingServer: false,
      env: {
        PRIME_TEST_BACKEND_PORT: "54341",
        PRIME_TEST_APP_ORIGIN: "http://127.0.0.1:3104",
      },
    },
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3104",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:3104/login",
      timeout: 180000,
      reuseExistingServer: false,
      env: {
        PRIME_WEATHER_QA: "1",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54341",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "weather-test-public-key",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "weather-test-public-key",
        NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3104",
      },
    },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
