import { z } from "zod";

export const DEFAULT_AUTH_REDIRECT = "/practice/dsa";

export function isWorkspacePath(path: string) {
  return [
    "/today",
    "/roadmap",
    "/practice",
    "/plan",
    "/revision",
    "/mastery",
    "/analytics",
    "/progress",
    "/notes",
    "/settings",
    "/weather",
    "/ai",
    "/lab",
  ].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export const emailSignInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "Enter a valid email address.")
    .email("Enter a valid email address."),
});
export function safeAuthReturn(value: unknown, fallback: string = "/"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  )
    return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(decoded))
      return fallback;
    const url = new URL(value, "https://prime.invalid");
    if (
      url.origin !== "https://prime.invalid" ||
      /^\/(?:auth|login|register|forgot-password)(?:\/|$)/.test(
        decodeURIComponent(url.pathname)
      )
    )
      return fallback;
    if (url.pathname === "/" && fallback !== "/") {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
export function maskAuthEmail(email: string): string {
  const [local, domain] = email.split("@");
  return domain ? `${local.slice(0, 1)}••••@${domain}` : "your email address";
}
