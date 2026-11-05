import { parse } from "csv-parse/sync";
import { z } from "zod";
import { rowSchema, type InputRow, type Issue, type Source } from "./model";

const rawSchema = z.record(z.string(), z.unknown());
function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return typeof value === "string"
    ? value
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
}
function string(value: unknown) {
  return value == null ? "" : String(value);
}
export function parseSource(text: string, source: Source, file: Source["files"][number]) {
  const issues: Issue[] = [],
    rows: InputRow[] = [];
  let input: unknown;
  try {
    input =
      file.format === "company-csv"
        ? parse(text, { columns: true, bom: true, skip_empty_lines: true })
        : JSON.parse(text);
  } catch {
    return {
      rows,
      issues: [
        {
          category: "parse_error",
          source: source.slug,
          detail: `Cannot parse ${file.path}`,
        },
      ],
      rawRows: 0,
    };
  }
  if (!Array.isArray(input))
    return {
      rows,
      issues: [
        { category: "parse_error", source: source.slug, detail: "Expected an array" },
      ],
      rawRows: 0,
    };
  input.forEach((value, index) => {
    const raw = rawSchema.safeParse(value);
    if (!raw.success) {
      issues.push({
        category: "invalid_row",
        source: source.slug,
        record: String(index),
        detail: "Expected an object",
      });
      return;
    }
    const r = raw.data;
    if (file.format === "booleanstack-dsa") {
      const tags = list(r.sheet_tags);
      const flags: Record<string, string> = {
        in_algoprep: "AlgoPrep 151",
        in_shradha: "Shradha Ma'am",
        in_siddharth: "Siddharth Singh",
        in_final450: "FINAL450 (Love Babbar)",
        in_fraz: "Fraz LeetCode",
        in_strivers: "Strivers A2Z",
      };
      if (
        (r.sheet_count !== undefined &&
          (!Number.isInteger(r.sheet_count) || r.sheet_count !== tags.length)) ||
        Object.entries(flags).some(
          ([key, name]) =>
            r[key] !== undefined &&
            ((r[key] !== "Yes" && r[key] !== "No") ||
              (r[key] === "Yes") !== tags.includes(name))
        )
      )
        issues.push({
          category: "source_conflict",
          source: source.slug,
          record: string(r.problem_id),
          detail: "Sheet tags, count, and presence flags disagree",
        });
    }
    let candidate: unknown;
    if (file.format === "fixture") candidate = { ...r, source: source.slug };
    else if (file.format === "booleanstack-dsa")
      candidate = {
        source: source.slug,
        sourceRecordId: string(r.problem_id),
        title: string(r.title),
        url: string(r.problem_url),
        difficulty: string(r.difficulty),
        topics: list(r.topic),
        sheets: list(r.sheet_tags),
        order: index,
        metadata: {
          link_origin: r.in_fraz === "Yes" ? "source_url" : "generated_placeholder",
          source_topic: r.topic,
          source_difficulty: r.difficulty,
          sheet_count: r.sheet_count,
          raw_variations: r.raw_variations,
        },
      };
    else if (file.format === "company-csv") {
      const frequency =
        r.Frequency === "" || r.Frequency == null ? null : Number(r.Frequency);
      candidate = {
        source: source.slug,
        sourceRecordId: `${file.path}:${string(r.Link)}`,
        title: string(r.Title),
        url: string(r.Link),
        difficulty: string(r.Difficulty),
        topics: list(r.Topics),
        company: file.company,
        timeWindow: file.timeWindow,
        frequency,
        rawFrequency: r.Frequency == null ? null : string(r.Frequency),
        rawAcceptanceRate:
          r["Acceptance Rate"] == null ? null : string(r["Acceptance Rate"]),
        metadata: {
          provider_title: true,
          source_topics: r.Topics,
          source_difficulty: r.Difficulty,
          original_time_window: file.timeWindow,
        },
        order: index,
      };
    } else {
      // Master export references can join the catalog; company statistics require CSV evidence.
      candidate = {
        source: source.slug,
        sourceRecordId: string(r.problem_id),
        title: string(r.question),
        url: string(r.leetcode_link),
        difficulty: string(r.difficulty),
        topics: list(r.topics),
        metadata: {
          provider_title: true,
          asked_companies: r.asked_companies,
          company_count: r.company_count,
          timeframe_breakdown: r.timeframe_breakdown,
          company_stats_status: "reference_only_requires_company_csv",
        },
        order: index,
      };
    }
    const result = rowSchema.safeParse(candidate);
    if (result.success) rows.push(result.data);
    else
      issues.push({
        category: "invalid_row",
        source: source.slug,
        record: string(r.problem_id ?? index),
        detail: result.error.issues
          .map((x) => `${x.path.join(".")}: ${x.message}`)
          .join("; "),
      });
  });
  return { rows, issues, rawRows: input.length };
}
