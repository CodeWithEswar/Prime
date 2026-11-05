import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names safely resolving Tailwind CSS class conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Cleans malformed problem titles from catalog scraping artifacts (e.g. escaped quotes, double quotes).
 * Examples:
 *   '""K" Largest Element In An Array' -> 'K Largest Element In An Array'
 *   '""Merge Intervals""' -> 'Merge Intervals'
 *   '\"Two Sum\"' -> 'Two Sum'
 */
export function cleanProblemTitle(title: string | null | undefined): string {
  if (!title) return "";
  let cleaned = title.trim();

  // Strip leading/trailing escaped backslashes e.g. \"Two Sum\"
  cleaned = cleaned.replace(/^\\+|\\+$/g, "");

  // Replace double quotes "" with single "
  cleaned = cleaned.replace(/""+/g, '"');

  // Strip outer quotes if the entire title is wrapped in quotes: "Two Sum", “Two Sum”, 'Two Sum'
  const isOuterQuoted =
    (/^["'“”‘’][^"'“”‘’]+["'“”‘’]$/).test(cleaned) ||
    ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
      (cleaned.startsWith("“") && cleaned.endsWith("”")) ||
      (cleaned.startsWith("‘") && cleaned.endsWith("’")));

  if (isOuterQuoted) {
    const inner = cleaned.slice(1, -1).trim();
    // Only strip if inner doesn't have unbalanced quotes
    const quoteCount = (inner.match(/["'“”‘’]/g) || []).length;
    if (quoteCount === 0 || quoteCount % 2 === 0) {
      cleaned = inner;
    }
  }

  // Strip leading quoted single or short tokens like:
  // "K" Largest Element -> K Largest Element
  // “K” Largest Element -> K Largest Element
  // 'K' Largest Element -> K Largest Element
  // "Kth" Largest Element -> Kth Largest Element
  cleaned = cleaned.replace(/^["'“”‘’]([A-Za-z0-9]+)["'“”‘’]\s+/i, "$1 ");

  // Normalize anomalies like K’Th or K'Th -> Kth
  cleaned = cleaned.replace(/\b([A-Za-z]+)['’]th\b/gi, "$1th");

  return cleaned.trim();
}

