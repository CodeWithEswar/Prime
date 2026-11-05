import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
export default defineConfig({
  testDir: "../tests/e2e",
  testMatch: ["shell.spec.ts", "practice.spec.ts", "revision.spec.ts", "roadmap.spec.ts", "calendar.spec.ts"],
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3102", trace: "off" },
  webServer: [
    {
      command: "node tests/e2e/support/shell-backend.mjs",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:54339/health",
      reuseExistingServer: true,
    },
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3102",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:3102/login",
      timeout: 180000,
      reuseExistingServer: true,
      env: {
        PRIME_SHELL_QA: "1",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54339",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "shell-test-public-key",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "shell-test-public-key",
        NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3102",
      },
    },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
