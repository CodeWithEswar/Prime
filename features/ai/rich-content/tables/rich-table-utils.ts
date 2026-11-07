import { isValidElement, type ReactNode } from "react";
import { extractText } from "@/features/ai/markdown/utils";

export interface TableHeader {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
}

export interface TableRow {
  id: string;
  cells: ReactNode[];
  textCells: string[];
}

export interface ParsedTableData {
  headers: TableHeader[];
  rows: TableRow[];
  isComparison: boolean;
  isKeyValue: boolean;
}

/**
 * Extracts normalized table headers and rows from table React children.
 */
export function parseTableChildren(children: ReactNode): ParsedTableData {
  const headers: TableHeader[] = [];
  const rows: TableRow[] = [];

  const childrenArray = Array.isArray(children) ? children : [children];

  for (const section of childrenArray) {
    if (!isValidElement<{ children?: ReactNode }>(section)) continue;

    // Detect <thead>
    const isThead =
      section.type === "thead" ||
      (typeof section.type === "function" && section.type.name?.toLowerCase().includes("thead"));

    // Detect <tbody>
    const isTbody =
      section.type === "tbody" ||
      (typeof section.type === "function" && section.type.name?.toLowerCase().includes("tbody"));

    if (isThead) {
      const theadChildren = Array.isArray(section.props.children)
        ? section.props.children
        : [section.props.children];

      for (const row of theadChildren) {
        if (!isValidElement<{ children?: ReactNode }>(row)) continue;
        const thArray = Array.isArray(row.props.children)
          ? row.props.children
          : [row.props.children];

        thArray.forEach((th, idx) => {
          if (!isValidElement<{ children?: ReactNode; style?: { textAlign?: string } }>(th)) return;
          const label = extractText(th.props.children).trim();
          const align = th.props.style?.textAlign as "left" | "center" | "right" | undefined;
          headers.push({
            id: `col-${idx}`,
            label: label || `Column ${idx + 1}`,
            align,
          });
        });
      }
    }

    if (isTbody) {
      const tbodyChildren = Array.isArray(section.props.children)
        ? section.props.children
        : [section.props.children];

      tbodyChildren.forEach((row, rowIdx) => {
        if (!isValidElement<{ children?: ReactNode }>(row)) return;
        const tdArray = Array.isArray(row.props.children)
          ? row.props.children
          : [row.props.children];

        const cells: ReactNode[] = [];
        const textCells: string[] = [];

        tdArray.forEach((td) => {
          if (!isValidElement<{ children?: ReactNode }>(td)) return;
          cells.push(td.props.children);
          textCells.push(extractText(td.props.children).trim());
        });

        if (cells.length > 0) {
          rows.push({
            id: `row-${rowIdx}`,
            cells,
            textCells,
          });
        }
      });
    }

    // Direct <tr> without <thead> or <tbody> wrapper
    if (section.type === "tr") {
      const tdArray = Array.isArray(section.props.children)
        ? section.props.children
        : [section.props.children];
      const isHeaderRow = tdArray.some(
        (cell) => isValidElement(cell) && cell.type === "th"
      );

      if (isHeaderRow && headers.length === 0) {
        tdArray.forEach((th, idx) => {
          if (!isValidElement<{ children?: ReactNode; style?: { textAlign?: string } }>(th)) return;
          headers.push({
            id: `col-${idx}`,
            label: extractText(th.props.children).trim() || `Column ${idx + 1}`,
          });
        });
      } else {
        const cells: ReactNode[] = [];
        const textCells: string[] = [];
        tdArray.forEach((td) => {
          if (!isValidElement<{ children?: ReactNode }>(td)) return;
          cells.push(td.props.children);
          textCells.push(extractText(td.props.children).trim());
        });
        if (cells.length > 0) {
          rows.push({
            id: `row-${rows.length}`,
            cells,
            textCells,
          });
        }
      }
    }
  }

  // Detect Key-Value structure (2 columns, e.g. Property | Value)
  const isKeyValue = headers.length === 2 && rows.length >= 2;

  // Detect Comparison structure:
  // e.g. headers compare 2 or 3 entities like "Feature | React | Vue" or rows have "Approach A", "Approach B"
  const isComparison =
    (headers.length === 3 || headers.length === 4) &&
    /versus|vs|compare|comparison|difference/i.test(headers.map((h) => h.label).join(" "));

  return {
    headers,
    rows,
    isComparison,
    isKeyValue,
  };
}

/**
 * Detects algorithmic complexity notation and returns a styling category.
 */
export function getComplexityTier(
  text: string
): "constant" | "log" | "linear" | "linearithmic" | "quadratic" | "exponential" | null {
  const clean = text.replace(/[`$\s]/g, "");
  if (/^O\(1\)$/i.test(clean)) return "constant";
  if (/^O\(log(?:\*|2)?n\)$/i.test(clean)) return "log";
  if (/^O\(n\)$/i.test(clean)) return "linear";
  if (/^O\(n(?:log(?:\*|2)?n|\*logn)\)$/i.test(clean)) return "linearithmic";
  if (/^O\(n\^?2\)$/i.test(clean)) return "quadratic";
  if (/^O\((?:2\^n|n!)\)$/i.test(clean)) return "exponential";
  return null;
}

/**
 * Exports parsed table data as CSV.
 */
export function exportTableToCSV(headers: TableHeader[], rows: TableRow[], filename = "table-export.csv") {
  const escapeCSV = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = headers.map((h) => escapeCSV(h.label)).join(",");
  const rowLines = rows.map((r) => r.textCells.map(escapeCSV).join(","));
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headerLine, ...rowLines].join("\n"));

  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies table data as formatted Markdown or TSV to clipboard.
 */
export async function copyTableToClipboard(headers: TableHeader[], rows: TableRow[]): Promise<boolean> {
  try {
    const headerLine = `| ${headers.map((h) => h.label).join(" | ")} |`;
    const separatorLine = `| ${headers.map(() => "---").join(" | ")} |`;
    const rowLines = rows.map((r) => `| ${r.textCells.join(" | ")} |`);
    const markdown = [headerLine, separatorLine, ...rowLines].join("\n");

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(markdown);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

