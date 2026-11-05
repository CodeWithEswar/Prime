import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const session = vi.hoisted(() => ({ user: null as null | { id: string } }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: unknown,
    _key: unknown,
    options: { cookies: { setAll: (cookies: unknown[]) => void } }
  ) => ({
    auth: {
      getUser: async () => {
        options.cookies.setAll([
          {
            name: "session-refresh",
            value: "rotated",
            options: { path: "/", httpOnly: true },
          },
        ]);
        return { data: { user: session.user } };
      },
    },
  }),
}));
import { updateSession } from "@/lib/supabase/middleware";
beforeEach(() => {
  session.user = null;
});
describe("auth session redirects", () => {
  it("protects a deep workspace URL and preserves its next destination and cookies", async () => {
    const destination = "/practice/dsa/two-sum?source=revision";
    const response = await updateSession(
      new NextRequest(`http://localhost:3000${destination}`)
    );
    const login = new URL(response.headers.get("location")!);
    expect(login.pathname).toBe("/login");
    expect(login.searchParams.get("next")).toBe(destination);
    expect(response.cookies.get("session-refresh")?.value).toBe("rotated");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("permits verified workspace requests without redirecting", async () => {
    session.user = { id: "verified" };
    const response = await updateSession(
      new NextRequest("http://localhost:3000/settings")
    );
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("cache-control")).toContain("private");
  });
  it("requires a verified user before showing the completion surface", async () => {
    const response = await updateSession(
      new NextRequest("http://localhost:3000/auth/complete?next=/design-system")
    );
    expect(response.headers.get("location")).toBe("http://localhost:3000/auth/problem");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it.each(["/auth/complete/", "/%61uth/complete"])(
    "protects normalized completion path %s",
    async (path) => {
      const response = await updateSession(
        new NextRequest(`http://localhost:3000${path}`)
      );
      expect(response.headers.get("location")).toBe("http://localhost:3000/auth/problem");
    }
  );
  it("redirects an authenticated login and preserves refreshed cookies", async () => {
    session.user = { id: "verified" };
    const response = await updateSession(
      new NextRequest("http://localhost:3000/login?next=%2Fdesign-system")
    );
    expect(response.headers.get("location")).toBe("http://localhost:3000/design-system");
    expect(response.cookies.get("session-refresh")?.value).toBe("rotated");
  });
  it("never redirects a signed-in visitor to an external destination", async () => {
    session.user = { id: "verified" };
    const response = await updateSession(
      new NextRequest("http://localhost:3000/login?next=https://evil.example")
    );
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });
  it("does not redirect public content or block an authenticated completion", async () => {
    expect(
      await updateSession(new NextRequest("http://localhost:3000/"))
    ).not.toHaveProperty("location");
    session.user = { id: "verified" };
    const response = await updateSession(
      new NextRequest("http://localhost:3000/auth/complete")
    );
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
