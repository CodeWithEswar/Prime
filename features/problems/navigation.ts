const base = "/practice/dsa";
const filterKeys = [
  "q",
  "topic",
  "difficulty",
  "company",
  "collection",
  "status",
  "sort",
  "page",
  "pageSize",
  "window",
  "revision",
] as const;
export function cleanCatalogQuery(query: { get: (key: string) => string | null }) {
  const result = new URLSearchParams();
  for (const key of filterKeys) {
    const value = query.get(key);
    if (value && value.length <= 160) result.set(key, value);
  }
  return result.toString();
}
export function safeCatalogReturn(value: string | null | undefined) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  )
    return base;
  try {
    const url = new URL(value, "https://prime.invalid");
    if (url.origin !== "https://prime.invalid" || url.pathname !== base) return base;
    const query = cleanCatalogQuery(url.searchParams);
    return base + (query ? `?${query}` : "");
  } catch {
    return base;
  }
}
export function problemHref(
  slug: string,
  query?: { get: (key: string) => string | null }
) {
  const filters = query ? cleanCatalogQuery(query) : "";
  return `${base}/${encodeURIComponent(slug)}${filters ? `?from=${encodeURIComponent(`${base}?${filters}`)}` : ""}`;
}
const storageKey = (href: string) => `prime:catalog-return:${safeCatalogReturn(href)}`;
export function rememberCatalogPosition(
  href: string,
  slug: string,
  items: { slug: string; title: string }[]
) {
  try {
    sessionStorage.setItem(
      storageKey(href),
      JSON.stringify({
        y: window.scrollY,
        slug,
        items: items.slice(0, 100),
        at: Date.now(),
      })
    );
  } catch {
    /* Navigation remains available when storage is disabled. */
  }
}
export function readCatalogPosition(href: string) {
  try {
    return sessionStorage.getItem(storageKey(href)) ?? "";
  } catch {
    return "";
  }
}
export function parseCatalogPosition(raw: string) {
  try {
    const value = JSON.parse(raw) as {
      y?: unknown;
      slug?: unknown;
      at?: unknown;
      items?: unknown;
    };
    if (
      typeof value.y !== "number" ||
      typeof value.slug !== "string" ||
      typeof value.at !== "number" ||
      Date.now() - value.at > 1800000 ||
      !Array.isArray(value.items)
    )
      return null;
    const items = value.items
      .filter(
        (item): item is { slug: string; title: string } =>
          !!item &&
          typeof item === "object" &&
          "slug" in item &&
          typeof item.slug === "string" &&
          /^[a-z0-9-]+$/.test(item.slug) &&
          "title" in item &&
          typeof item.title === "string"
      )
      .slice(0, 100);
    return { y: Math.max(0, value.y), slug: value.slug, items };
  } catch {
    return null;
  }
}
export function forgetCatalogPosition(href: string) {
  try {
    sessionStorage.removeItem(storageKey(href));
  } catch {}
}
