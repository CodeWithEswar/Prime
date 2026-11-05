import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "../tests/e2e",
  workers: 1,
  timeout: 90000,
  reporter: "list",
  // Run against an already-started preview without taking over its server.
  use: { baseURL: process.env.PRIME_PREVIEW_URL || "http://localhost:3001" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
