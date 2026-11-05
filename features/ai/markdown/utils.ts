import { isValidElement, type ReactNode } from "react";
const aliases: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  html: "xml",
  csharp: "text",
  "c++": "cpp",
  plaintext: "text",
  txt: "text",
  plain: "text",
};
const supported = new Set([
  "auto",
  "java",
  "typescript",
  "javascript",
  "python",
  "sql",
  "bash",
  "json",
  "xml",
  "css",
  "cpp",
  "c",
  "markdown",
  "yaml",
  "diff",
  "text",
]);
export function looksLikeCode(source: string) {
  const signals = [
    /^\s*(?:\/\/|\/\*|--\s)/m,
    /[A-Za-z_$][\w$]*\[[\w\s+*\]-]+\]/m,
    /[;{}]\s*$/m,
    /\b(?:for|while|if|else|return|class|public|int|def|SELECT)\b[^\n]*[(:{]/m,
  ];
  return signals.filter((pattern) => pattern.test(source)).length >= 2;
}
export function normalizeLanguage(input: string) {
  const clean = input
    .toLowerCase()
    .replace(/^language-/, "")
    .trim()
    .slice(0, 30);
  const language = aliases[clean] ?? clean;
  return supported.has(language) ? language : "text";
}
export function languageLabel(input: string) {
  const clean = input.toLowerCase().replace(/^language-/, "");
  return clean === "tsx"
    ? "TSX"
    : clean === "jsx"
      ? "JSX"
      : normalizeLanguage(input) === "xml"
        ? "HTML / XML"
        : normalizeLanguage(input).toUpperCase();
}
export function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node))
    return extractText(node.props.children);
  return "";
}
/** Detects an unfinished fence boundary; the actual Markdown parser remains remark. */
export function openFenceOffset(source: string): number | null {
  let open: { character: string; width: number; offset: number } | null = null,
    offset = 0;
  for (const line of source.split("\n")) {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (match) {
      const token = match[1];
      if (!open) {
        open = { character: token[0], width: token.length, offset };
      } else if (
        token[0] === open.character &&
        token.length >= open.width &&
        !match[2].trim()
      )
        open = null;
    }
    offset += line.length + 1;
  }
  return open?.offset ?? null;
}
export function safeAILink(url: string) {
  if (/[\u0000-\u0020\\]/.test(url)) return "";
  if (url.startsWith("/") && !url.startsWith("//")) {
    try {
      const u = new URL(url, "https://prime.invalid");
      if (
        u.origin === "https://prime.invalid" &&
        /^\/(?:practice\/dsa|roadmap|revision|notes|today|plan|lab)(?:\/|$)/.test(
          u.pathname
        )
      )
        return u.pathname + u.search + u.hash;
    } catch {}
    return "";
  }
  try {
    const u = new URL(url);
    if (u.protocol === "https:" && !u.username && !u.password) return u.href;
  } catch {}
  return "";
}
export function headingSlug(value: string) {
  return (
    value
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "section"
  );
}
