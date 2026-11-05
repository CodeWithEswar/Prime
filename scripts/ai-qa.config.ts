import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
export default defineConfig({
  testDir: "../tests/e2e",
  testMatch: "ai.spec.ts",
  outputDir: "../.generated/ai/test-results",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3105", trace: "retain-on-failure" },
  webServer: [
    {
      command: "node tests/e2e/support/shell-backend.mjs",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:54342/health",
      reuseExistingServer: false,
      env: {
        PRIME_TEST_BACKEND_PORT: "54342",
        PRIME_TEST_APP_ORIGIN: "http://127.0.0.1:3105",
      },
    },
    {
      command:
        "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3105",
      cwd: path.resolve(__dirname, ".."),
      url: "http://127.0.0.1:3105/login",
      timeout: 180000,
      reuseExistingServer: false,
      env: {
        PRIME_AI_QA: "1",
        PRIME_AI_ENABLED: "true",
        SUPABASE_SERVICE_ROLE_KEY: "ai-test-service-key",
        GROQ_API_KEY: "test-only-not-a-real-key",
        GROQ_MODEL: "openai/gpt-oss-120b",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54342",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "ai-test-public-key",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "ai-test-public-key",
        NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3105",
      },
    },
  ],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
