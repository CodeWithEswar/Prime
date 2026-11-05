import { defineConfig } from "@playwright/test";
import path from "node:path";

process.env.PRIME_TEST_BACKEND_PORT = "54344";

export default defineConfig({
  testDir: "../tests/e2e",
  testMatch: [
    "planner.spec.ts",
    "mastery-workspace.spec.ts",
    "analytics-workspace.spec.ts",
    "readiness.spec.ts",
    "dbms.spec.ts",
    "settings.spec.ts",
    "notifications.spec.ts",
    "aptitude.spec.ts",
  ],
  outputDir: "../.generated/planner/test-results",
  workers: 1,
  timeout: 90000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3117",
    channel: "msedge",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/e2e/support/shell-backend.mjs",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:54344/health",
      env: {
        PRIME_TEST_BACKEND_PORT: "54344",
        PRIME_PLANNER_QA: "1",
        PRIME_TEST_APP_ORIGIN: "http://127.0.0.1:3117",
      },
    },
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3117",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:3117/login",
      timeout: 180000,
      env: {
        PRIME_PLANNER_QA: "1",
        PRIME_AI_ENABLED: "true",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54344",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "planner-fixture-public",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "planner-fixture-public",
        SUPABASE_SERVICE_ROLE_KEY: "planner-fixture-server",
        NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3117",
      },
    },
  ],
});
