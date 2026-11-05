import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
export default defineConfig({
  testDir: "../tests/e2e",
  testMatch: ["algorithm-lab.spec.ts", "algorithm-lab-input.spec.ts"],
  outputDir: "../.generated/lab/test-results",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3106", trace: "retain-on-failure" },
  webServer: [
    {
      command: "node tests/e2e/support/shell-backend.mjs",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:54343/health",
      reuseExistingServer: false,
      env: {
        PRIME_TEST_BACKEND_PORT: "54343",
        PRIME_TEST_APP_ORIGIN: "http://127.0.0.1:3106",
      },
    },
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3106",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:3106/login",
      timeout: 180000,
      reuseExistingServer: false,
      env: {
        PRIME_LAB_QA: "1",
        PRIME_AI_ENABLED: "true",
        GROQ_API_KEY: "test-only-not-a-real-key",
        GROQ_MODEL: "openai/gpt-oss-120b",
        SUPABASE_SERVICE_ROLE_KEY: "lab-test-server-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54343",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "lab-test-public-key",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "lab-test-public-key",
        NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3106",
      },
    },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
