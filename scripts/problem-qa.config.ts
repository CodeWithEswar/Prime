import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
export default defineConfig({
  testDir: "../tests/e2e",
  testMatch: "problem-intelligence.spec.ts",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3103", trace: "retain-on-failure" },
  webServer: [
    {
      command: "node tests/e2e/support/problem-backend.mjs",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:54340/health",
      reuseExistingServer: false,
    },
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3103",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:3103/login",
      timeout: 180000,
      reuseExistingServer: false,
      env: {
        PRIME_PROBLEM_QA: "1",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54340",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "problem-test-public-key",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "problem-test-public-key",
        NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3103",
      },
    },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
