// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const admin = vi.hoisted(() => vi.fn());
const send = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: admin }));
vi.mock("@/server/email/send-email", () => ({ sendNotificationEmail: send }));
import { POST as deliver } from "@/app/api/internal/email-deliveries/route";
import { POST as reconcile } from "@/app/api/internal/notification-reconcile/route";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "");
  vi.stubEnv("EMAIL_DELIVERY_INTERNAL_SECRET", "");
});
afterEach(() => vi.unstubAllEnvs());

describe.each([
  ["delivery", deliver],
  ["reconciliation", reconcile],
] as const)("%s boundary", (_, action) => {
  it("rejects missing configuration before privileged work", async () => {
    const response = await action(
      new Request("http://localhost/api/internal/test", { method: "POST" })
    );
    expect(response.status).toBe(503);
    expect(admin).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
  it("rejects requests without the configured internal secret", async () => {
    vi.stubEnv("CRON_SECRET", "unit-test-only-secret");
    const response = await action(
      new Request("http://localhost/api/internal/test", {
        method: "POST",
        headers: { "x-internal-secret": "wrong-value" },
      })
    );
    expect(response.status).toBe(401);
    expect(admin).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
