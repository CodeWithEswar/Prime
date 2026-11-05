import { createHash } from "node:crypto";
import { companyMap, topicMap, topics } from "./config/taxonomy";

export function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function normalizeTitle(value: string) {
  return slug(value.replace(/\s*[[(](?:leetcode|problem|practice)[\])]\s*$/i, ""));
}
export function stableId(key: string) {
  const b = createHash("sha256").update(`prime:dsa:v1:${key}`).digest().subarray(0, 16);
  b[6] = (b[6] & 15) | 80;
  b[8] = (b[8] & 63) | 128;
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export function normalizeUrl(raw: string) {
  const value = raw.trim();
  if (/^(?:javascript|data|file|ftp):/i.test(value))
    throw new Error("Unsupported URL protocol");
  const u = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (
    !["http:", "https:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    u.port ||
    !u.hostname.includes(".") ||
    !u.hostname
      .split(".")
      .every((label) => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label))
  )
    throw new Error("Invalid practice URL");
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
  u.protocol = "https:";
  u.hash = "";
  const lc =
    ["leetcode.com", "leetcode.cn"].includes(u.hostname) &&
    u.pathname.match(/^\/problems\/([a-z0-9-]+)(?:\/|$)/i);
  if (lc)
    return {
      url: `https://leetcode.com/problems/${lc[1].toLowerCase()}`,
      provider: "leetcode",
      providerId: lc[1].toLowerCase(),
      identity: `leetcode:${lc[1].toLowerCase()}`,
    };
  if (["leetcode.com", "leetcode.cn"].includes(u.hostname))
    throw new Error("Not a LeetCode problem URL");
  for (const key of [...u.searchParams.keys()])
    if (/^(utm_|env|fbclid|gclid|ref$|source$)/i.test(key)) u.searchParams.delete(key);
  u.searchParams.sort();
  u.pathname = u.pathname.replace(/\/+$/, "") || "/";
  const provider =
    u.hostname === "geeksforgeeks.org" || u.hostname.endsWith(".geeksforgeeks.org")
      ? "geeksforgeeks"
      : u.hostname === "takeuforward.org"
        ? "takeuforward"
        : ["codingninjas.com", "naukri.com"].some(
              (h) => u.hostname === h || u.hostname.endsWith(`.${h}`)
            )
          ? "codingninjas"
          : u.hostname === "spoj.com" || u.hostname.endsWith(".spoj.com")
            ? "spoj"
            : u.hostname === "codeforces.com" || u.hostname.endsWith(".codeforces.com")
              ? "codeforces"
              : u.hostname === "hackerrank.com" || u.hostname.endsWith(".hackerrank.com")
                ? "hackerrank"
                : "other";
  return {
    url: u.toString().replace(/\/$/, ""),
    provider,
    providerId: null,
    identity: `url:${u.toString().replace(/\/$/, "")}`,
  };
}
export function normalizeDifficulty(value: string) {
  const key = value.trim().toLowerCase();
  return ["easy", "medium", "hard"].includes(key) ? key : "unknown";
}
export function mapTopics(values: string[]) {
  const known = new Set<string>(topics.map((t) => t[0]));
  const mapped = new Set<string>(),
    unknown: string[] = [];
  for (const value of values) {
    const key = slug(value);
    const entries = known.has(key) ? [key] : topicMap[key];
    if (entries) entries.forEach((t) => mapped.add(t));
    else if (value.trim()) unknown.push(value);
  }
  return { mapped: [...mapped].sort(), unknown };
}
export function normalizeCompany(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  const key = slug(name);
  if (/[+?]/.test(name)) return null;
  if (companyMap[key]) return companyMap[key];
  if (!key || /[+?/]/.test(name) || /^(interview|unknown|others?|na|n-a)$/i.test(key))
    return null;
  return { slug: key, name };
}
export function normalizeWindow(value: string) {
  const key = slug(value.replace(/^\d+\.\s*/, ""));
  const windows: Record<string, string> = {
    "30d": "30d",
    "30-days": "30d",
    "thirty-days": "30d",
    "3m": "3m",
    "3-months": "3m",
    "three-months": "3m",
    "6m": "6m",
    "6-months": "6m",
    "six-months": "6m",
    "6m-plus": "6m_plus",
    "6m_plus": "6m_plus",
    "more-than-6-months": "6m_plus",
    "more-than-six-months": "6m_plus",
    all: "all",
    "all-time": "all",
  };
  return windows[key] ?? null;
}
export function titleSimilarity(a: string, b: string) {
  const left = new Set(normalizeTitle(a).split("-")),
    right = new Set(normalizeTitle(b).split("-"));
  const intersection = [...left].filter((x) => right.has(x)).length;
  return intersection / new Set([...left, ...right]).size;
}
