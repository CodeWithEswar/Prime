import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { emailSignInSchema, maskAuthEmail, safeAuthReturn } from "@/features/auth/schema";
const auth = vi.hoisted(() => ({
  otp: vi.fn(),
  oauth: vi.fn(),
  exchange: vi.fn(),
  verify: vi.fn(),
  configured: true,
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signInWithOtp: auth.otp,
      signInWithOAuth: auth.oauth,
      exchangeCodeForSession: auth.exchange,
      verifyOtp: auth.verify,
    },
  }),
}));
vi.mock("@/lib/validation/env.server", () => ({
  serverEnv: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
      return auth.configured ? "test-public-key" : "placeholder";
    },
  },
}));
import { POST as emailPost } from "@/app/auth/email/route";
import { POST as googlePost } from "@/app/auth/google/route";
import { GET as callbackGet } from "@/app/auth/callback/route";
function request(
  path: string,
  body: Record<string, string>,
  origin = "http://localhost:3000"
) {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { origin, accept: "application/json" },
    body: new URLSearchParams(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  auth.configured = true;
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
});
describe("authentication boundaries", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/%2fevil.example",
    "/%5cevil.example",
    "/auth/complete",
    "/login",
    "/a/../auth/problem",
    "/%61uth/complete",
    "/%6cogin",
    "/\nmalicious",
    "/%0d%0alocation:https://evil.example",
  ])("rejects unsafe or recursive return path %s", (value) =>
    expect(safeAuthReturn(value)).toBe("/")
  );
  it("preserves a local destination and masks confirmation addresses", () => {
    expect(safeAuthReturn("/design-system?view=all#top")).toBe(
      "/design-system?view=all#top"
    );
    expect(maskAuthEmail("candidate@example.com")).toBe("c••••@example.com");
    expect(emailSignInSchema.parse({ email: " person@example.com " }).email).toBe(
      "person@example.com"
    );
  });
  it("blocks cross-origin and malformed requests before calling auth", async () => {
    expect(
      (
        await emailPost(
          request("/auth/email", { email: "test@example.com" }, "https://evil.example")
        )
      ).status
    ).toBe(400);
    expect((await emailPost(request("/auth/email", { email: "bad" }))).status).toBe(400);
    expect(auth.otp).not.toHaveBeenCalled();
  });
  it("requests a PKCE email link without signing up new users", async () => {
    auth.otp.mockResolvedValue({ error: null });
    const response = await emailPost(
      request("/auth/email", { email: "test@example.com", next: "//evil.example" })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(auth.otp).toHaveBeenCalledWith({
      email: "test@example.com",
      options: {
        shouldCreateUser: false,
        emailRedirectTo: "http://localhost:3000/auth/callback?next=%2F",
      },
    });
  });
  it("does not reveal whether an email has an account", async () => {
    auth.otp
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { code: "user_not_found" } });
    const existing = await emailPost(request("/auth/email", { email: "a@example.com" }));
    const missing = await emailPost(request("/auth/email", { email: "b@example.com" }));
    expect(existing.status).toBe(missing.status);
    expect(await existing.json()).toEqual(await missing.json());
  });
  it("keeps service and rate-limit errors generic", async () => {
    auth.otp.mockResolvedValue({
      error: { code: "internal", status: 429, message: "sensitive detail" },
    });
    const response = await emailPost(
      request("/auth/email", { email: "test@example.com" })
    );
    expect(response.status).toBe(429);
    expect(await response.text()).not.toContain("sensitive");
  });
  it("does not call a service with placeholder credentials", async () => {
    auth.configured = false;
    expect(
      (await emailPost(request("/auth/email", { email: "test@example.com" }))).status
    ).toBe(503);
    expect(auth.otp).not.toHaveBeenCalled();
  });
  it("starts Google sign-in with an internal callback and validates provider origin", async () => {
    auth.oauth.mockResolvedValue({
      data: { url: "http://127.0.0.1:54321/auth/v1/authorize?provider=google" },
      error: null,
    });
    const result = await googlePost(request("/auth/google", { next: "/design-system" }));
    expect(result.status).toBe(200);
    expect(auth.oauth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        skipBrowserRedirect: true,
        redirectTo: "http://localhost:3000/auth/callback?next=%2Fdesign-system",
      },
    });
    auth.oauth.mockResolvedValue({ data: { url: "https://evil.example" }, error: null });
    expect((await googlePost(request("/auth/google", {}))).status).toBe(503);
  });
  it("only reaches completion after a verified code exchange with a session", async () => {
    auth.exchange.mockResolvedValue({
      data: { user: { id: "verified" }, session: { access_token: "test" } },
      error: null,
    });
    const success = await callbackGet(
      new NextRequest(
        "http://localhost:3000/auth/callback?code=valid&next=%2F%2Fevil.example"
      )
    );
    expect(success.headers.get("location")).toBe(
      "http://localhost:3000/auth/complete?next=%2F"
    );
    expect(success.headers.get("referrer-policy")).toBe("no-referrer");
    auth.exchange.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "secret" },
    });
    const failed = await callbackGet(
      new NextRequest("http://localhost:3000/auth/callback?code=bad")
    );
    expect(failed.headers.get("location")).toBe("http://localhost:3000/auth/problem");
  });
  it("supports email-token confirmation and rejects unsupported token types", async () => {
    auth.verify.mockResolvedValue({
      data: { user: { id: "verified" }, session: { access_token: "test" } },
      error: null,
    });
    const success = await callbackGet(
      new NextRequest(
        "http://localhost:3000/auth/confirm?token_hash=test-hash&type=email"
      )
    );
    expect(success.headers.get("location")).toContain("/auth/complete");
    const failure = await callbackGet(
      new NextRequest(
        "http://localhost:3000/auth/confirm?token_hash=test-hash&type=recovery"
      )
    );
    expect(failure.headers.get("location")).toContain("/auth/problem");
    expect(auth.verify).toHaveBeenCalledTimes(1);
  });
  it("redirects native form submissions to a server-rendered confirmation", async () => {
    auth.otp.mockResolvedValue({ error: null });
    const req = new NextRequest("http://localhost:3000/auth/email", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
      body: new URLSearchParams({ email: "test@example.com" }),
    });
    const response = await emailPost(req);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/check-email"
    );
  });
});
