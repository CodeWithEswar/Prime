import { test as base, expect } from "@playwright/test";
export const test = base.extend({
  page: async ({ page, context }, runTest) => {
    const expiry = Math.floor(Date.now() / 1000) + 3600;
    const encode = (value: object) =>
      Buffer.from(JSON.stringify(value)).toString("base64url");
    const user = {
      id: "11111111-1111-4111-8111-111111111111",
      email: "alex@example.test",
      aud: "authenticated",
      role: "authenticated",
      app_metadata: { provider: "email" },
      user_metadata: { full_name: "Alex Morgan" },
    };
    const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: expiry, iat: expiry - 3600, aud: "authenticated", role: "authenticated", email: user.email })}.dGVzdC1vbmx5`;
    const value =
      "base64-" +
      encode({
        access_token: token,
        refresh_token: "test-only-refresh",
        expires_at: expiry,
        expires_in: 3600,
        token_type: "bearer",
        user,
      });
    await context.addCookies([
      {
        name: "sb-127-auth-token",
        value,
        domain: "127.0.0.1",
        path: "/",
        sameSite: "Lax",
      },
    ]);
    await page.request.get(`http://127.0.0.1:${process.env.PRIME_TEST_BACKEND_PORT ?? "54339"}/__context?mode=full`);
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal,.tsqd-parent-container{display:none!important}";
      document.addEventListener("DOMContentLoaded", () => document.head.append(style), {
        once: true,
      });
    });
    await runTest(page);
  },
});
export { expect };
